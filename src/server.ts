import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | undefined>;
      all: <T>() => Promise<{ results: T[] }>;
    };
  };
};

type RuntimeEnv = {
  DB?: D1Database;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type SupabaseConfig = { url: string; key: string };

const marketSources = [
  {
    name: "Mumbai APMC",
    url: "https://www.mumbaiapmc.org/en/market-price-en/daily-market-price-en",
  },
  {
    name: "Pune APMC",
    url: "https://apmcpune.in/en/market-price-en/daily-market-price-en",
  },
  {
    name: "Nashik APMC",
    url: "https://apmcnashik.com/",
  },
];

type MarketRow = {
  crop: string;
  market: string;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  unit: string;
  change: number | null;
  demand: "High" | "Medium" | "Low" | "Stable" | "Insufficient history";
};

type MarketSourceResult = {
  source: string;
  url: string;
  date: string | null;
  rows: MarketRow[];
  error?: string;
};

function cleanTableCell(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/\s+/g, " ").trim();
}

function parseMarketRows(html: string, sourceName: string): MarketRow[] {
  const rows: MarketRow[] = [];
  const tableRows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];

  for (const row of tableRows) {
    const cells = (row.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? [])
      .map(cleanTableCell)
      .filter(Boolean);
    if (cells.length < 3 || /commodity|variety|minimum|maximum|average|date/i.test(cells.join(" "))) continue;

    const prices = cells
      .map((cell) => cell.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0])
      .filter((value): value is string => Boolean(value))
      .map(Number)
      .filter((value) => value > 0);
    const crop = cells[0];
    if (!crop || prices.length < 3) continue;
    const quotedPrices = prices.slice(-3);

    rows.push({
      crop,
      market: sourceName,
      average: quotedPrices[2] ?? null,
      minimum: quotedPrices[0] ?? null,
      maximum: quotedPrices[1] ?? null,
      unit: /kg/i.test(cells.join(" ")) ? "kg" : "quintal",
      change: null,
      demand: "Insufficient history",
    });
  }

  return rows.slice(0, 100);
}

function findPublishedDate(html: string): string | null {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  return text.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/)?.[0] ?? null;
}

function findDailyPriceLinks(html: string, sourceUrl: string): string[] {
  const links = html.match(/href\s*=\s*["'][^"']+["']/gi) ?? [];
  return [...new Set(links
    .map((link) => link.match(/["']([^"']+)["']/)?.[1])
    .filter((href): href is string => Boolean(href))
    .filter((href) => /daily-bajarbhav-dates|view-daily-bajarbhav/i.test(href))
    .map((href) => new URL(href, sourceUrl).href))];
}

function findUrlDate(url: string): string | null {
  return url.match(/\/(\d{4}-\d{2}-\d{2})(?:$|[?#])/i)?.[1] ?? null;
}

async function persistMarketPrices(env: RuntimeEnv, results: Awaited<ReturnType<typeof fetchMarketSources>>) {
  if (!env.DB) return;

  for (const result of results) {
    if (result.error || !result.rows.length) continue;
    const observedOn = result.date ?? new Date().toISOString().slice(0, 10);
    const source = await env.DB
      .prepare("SELECT id FROM market_sources WHERE name = ? LIMIT 1")
      .bind(result.source)
      .first<{ id: number }>();
    if (!source) continue;

    for (const row of result.rows) {
      await env.DB
        .prepare(
          `INSERT INTO market_prices
            (source_id, observed_on, crop, market, minimum_price, maximum_price, average_price, unit, raw_payload)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(source_id, observed_on, crop, market) DO UPDATE SET
             minimum_price = excluded.minimum_price,
             maximum_price = excluded.maximum_price,
             average_price = excluded.average_price,
             unit = excluded.unit,
             raw_payload = excluded.raw_payload`,
        )
        .bind(
          source.id,
          observedOn,
          row.crop,
          row.market,
          row.minimum,
          row.maximum,
          row.average,
          row.unit,
          JSON.stringify(row),
        )
        .run();
    }
  }
}

async function readStoredMarketPrices(env: RuntimeEnv) {
  if (!env.DB) return [];

  const stored = await env.DB
    .prepare(
      `SELECT ms.name AS source, ms.url, mp.observed_on AS date, mp.crop, mp.market,
              mp.average_price AS average, mp.minimum_price AS minimum,
              mp.maximum_price AS maximum, mp.unit
       FROM market_prices mp
       JOIN market_sources ms ON ms.id = mp.source_id
       WHERE mp.observed_on = (
         SELECT MAX(latest.observed_on)
         FROM market_prices latest
         WHERE latest.source_id = mp.source_id
       )
       ORDER BY ms.name, mp.crop`,
    )
    .bind()
    .all<MarketRow & { source: string; url: string; date: string }>();

  return marketSources.map((source) => ({
    source: source.name,
    url: source.url,
    date: stored.results.find((row) => row.source === source.name)?.date ?? null,
    rows: stored.results
      .filter((row) => row.source === source.name)
      .map((row) => ({
        crop: row.crop,
        market: row.market,
        average: row.average,
        minimum: row.minimum,
        maximum: row.maximum,
        unit: row.unit,
        change: null,
        demand: "Insufficient history" as const,
      })),
  }));
}

function getSupabaseConfig(env: RuntimeEnv): SupabaseConfig | null {
  const processEnv = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env;
  const url = env.SUPABASE_URL ?? processEnv?.["SUPABASE_URL"] ?? processEnv?.["VITE_SUPABASE_URL"];
  const key =
    env.SUPABASE_SECRET_KEY ??
    env.SUPABASE_SERVICE_ROLE_KEY ??
    processEnv?.["SUPABASE_SECRET_KEY"] ??
    processEnv?.["SUPABASE_SERVICE_ROLE_KEY"];
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function supabaseRequest(config: SupabaseConfig, path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function persistSupabaseMarketPrices(config: SupabaseConfig, results: Awaited<ReturnType<typeof fetchMarketSources>>) {
  for (const result of results) {
    if (result.error || !result.rows.length) continue;
    const sourceResponse = await supabaseRequest(
      config,
      `market_sources?name=eq.${encodeURIComponent(result.source)}&select=id&limit=1`,
    );
    if (!sourceResponse.ok) throw new Error(`Supabase source lookup failed (${sourceResponse.status})`);
    const sources = (await sourceResponse.json()) as Array<{ id: number }>;
    const sourceId = sources[0]?.id;
    if (!sourceId) continue;

    const observedOn = result.date ?? new Date().toISOString().slice(0, 10);
    const rows = result.rows.map((row) => ({
      source_id: sourceId,
      observed_on: observedOn,
      crop: row.crop,
      market: row.market,
      minimum_price: row.minimum,
      maximum_price: row.maximum,
      average_price: row.average,
      unit: row.unit,
      raw_payload: row,
    }));
    const response = await supabaseRequest(config, "market_prices?on_conflict=source_id,observed_on,crop,market", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows),
    });
    if (!response.ok) throw new Error(`Supabase market upsert failed (${response.status})`);
  }
}

async function addSupabaseMarketSignals(config: SupabaseConfig, results: Awaited<ReturnType<typeof fetchMarketSources>>) {
  const sourceResponse = await supabaseRequest(config, "market_sources?select=id,name");
  if (!sourceResponse.ok) throw new Error(`Supabase source read failed (${sourceResponse.status})`);
  const sources = (await sourceResponse.json()) as Array<{ id: number; name: string }>;
  const sourceIds = new Map(sources.map((source) => [source.name, source.id]));
  const historyResponse = await supabaseRequest(
    config,
    "market_prices?select=source_id,observed_on,crop,market,average_price&order=observed_on.desc&limit=5000",
  );
  if (!historyResponse.ok) throw new Error(`Supabase market history read failed (${historyResponse.status})`);
  const history = (await historyResponse.json()) as Array<{
    source_id: number;
    observed_on: string;
    crop: string;
    market: string;
    average_price: number | null;
  }>;

  for (const result of results) {
    const sourceId = sourceIds.get(result.source);
    if (!sourceId) continue;
    for (const row of result.rows) {
      if (row.average === null) continue;
      const previous = history.find(
        (item) =>
          item.source_id === sourceId &&
          item.crop === row.crop &&
          item.market === row.market &&
          item.observed_on < (result.date ?? "9999-12-31") &&
          item.average_price !== null,
      );
      const previousAverage = previous?.average_price;
      if (previousAverage === null || previousAverage === undefined || previousAverage === 0) continue;
      const change = ((row.average - previousAverage) / previousAverage) * 100;
      row.change = Number(change.toFixed(1));
      row.demand = change >= 5 ? "High" : change >= 1 ? "Medium" : change <= -5 ? "Low" : "Stable";
    }
  }
}

async function readSupabaseMarketPrices(config: SupabaseConfig) {
  const sourceResponse = await supabaseRequest(config, "market_sources?select=id,name,url&order=id.asc");
  if (!sourceResponse.ok) throw new Error(`Supabase source read failed (${sourceResponse.status})`);
  const sources = (await sourceResponse.json()) as Array<{ id: number; name: string; url: string }>;
  const response = await supabaseRequest(
    config,
    "market_prices?select=source_id,observed_on,crop,market,average_price,minimum_price,maximum_price,unit&order=observed_on.desc&limit=1000",
  );
  if (!response.ok) throw new Error(`Supabase market read failed (${response.status})`);
  const stored = (await response.json()) as Array<{
    source_id: number;
    observed_on: string;
    crop: string;
    market: string;
    average_price: number | null;
    minimum_price: number | null;
    maximum_price: number | null;
    unit: string;
  }>;
  const latestBySource = new Map<number, string>();
  for (const row of stored) {
    if (!latestBySource.has(row.source_id)) latestBySource.set(row.source_id, row.observed_on);
  }

  return marketSources.map((source) => {
    const sourceRecord = sources.find((item) => item.name === source.name);
    const sourceId = sourceRecord?.id;
    const date = sourceId === undefined ? null : latestBySource.get(sourceId) ?? null;
    return {
      source: source.name,
      url: source.url,
      date,
      error: undefined,
      rows: stored
        .filter((row) => row.source_id === sourceId && row.observed_on === date)
        .map((row) => ({
          crop: row.crop,
          market: row.market,
          average: row.average_price,
          minimum: row.minimum_price,
          maximum: row.maximum_price,
          unit: row.unit,
          change: null,
          demand: "Insufficient history" as const,
        })),
    };
  });
}

async function fetchMarketSources(): Promise<MarketSourceResult[]> {
  const results = await Promise.all(
    marketSources.map(async (source) => {
      try {
        const response = await fetch(source.url, {
          headers: { "user-agent": "Krishi-Mitra-market-reader/1.0" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        const discoveredLinks = findDailyPriceLinks(html, source.url);
        const pages = await Promise.all(
          [source.url, ...discoveredLinks].slice(0, 12).map(async (pageUrl) => {
            if (pageUrl === source.url) return { url: pageUrl, html };
            const pageResponse = await fetch(pageUrl, {
              headers: { "user-agent": "Krishi-Mitra-market-reader/1.0" },
            });
            if (!pageResponse.ok) return { url: pageUrl, html: "" };
            return { url: pageUrl, html: await pageResponse.text() };
          }),
        );
        const rows = pages.flatMap((page) => parseMarketRows(page.html, source.name));
        const uniqueRows = [...new Map(rows.map((row) => [`${row.crop}:${row.market}`, row])).values()];
        return {
          source: source.name,
          url: source.url,
          date: pages.map((page) => findUrlDate(page.url) ?? findPublishedDate(page.html)).find(Boolean) ?? null,
          rows: uniqueRows.slice(0, 500),
        };
      } catch (error) {
        return {
          source: source.name,
          url: source.url,
          date: null,
          rows: [],
          error: error instanceof Error ? error.message : "Unable to fetch source",
        };
      }
    }),
  );

  return results;
}

async function getMarketPrices(env: RuntimeEnv): Promise<Response> {
  let results = await fetchMarketSources();
  const supabase = getSupabaseConfig(env);
  try {
    if (supabase) {
      await persistSupabaseMarketPrices(supabase, results);
      await addSupabaseMarketSignals(supabase, results);
    } else {
      await persistMarketPrices(env, results);
    }
    if (!results.some((result) => result.rows.length)) {
      const storedResults = supabase
        ? await readSupabaseMarketPrices(supabase)
        : await readStoredMarketPrices(env);
      if (storedResults.some((result) => result.rows.length)) results = storedResults;
    }
  } catch (error) {
    console.error("Market snapshot persistence failed:", error);
  }

  return new Response(JSON.stringify({ fetchedAt: new Date().toISOString(), sources: results }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=900" },
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/api/market-prices") {
        return await getMarketPrices((env ?? {}) as RuntimeEnv);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
