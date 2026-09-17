import { withSupabase } from "npm:@supabase/server";

type APMC = { code: string; name: string; district: string | null };
type PriceRow = {
  source_id: number;
  source: "msamb";
  apmc_code: string;
  observed_on: string;
  crop: string;
  market: string;
  variety: string;
  sector: string;
  quantity: number | null;
  minimum_price: number | null;
  maximum_price: number | null;
  average_price: number | null;
  unit: string;
  source_url: string;
  raw_payload: Record<string, unknown>;
};

const pageUrl = "https://www.msamb.com/ApmcDetail/APMCPriceInformation";
const dataUrl = "https://www.msamb.com/ApmcDetail/DataGridBind";
const requestHeaders = {
  Referer: pageUrl,
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
};
const PER_APMC_TIMEOUT_MS = 10_000;

function clean(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function numberValue(value: string): number | null {
  const normalized = value.replace(/,/g, "").replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateValue(value: string): string | null {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function sectorFor(commodity: string): string {
  const value = commodity.toLowerCase();
  if (/vegetable|भाजी|पालेभाजी|कांदा|बटाटा|टोमॅटो|मिरची|लसूण|आले|गाजर|मुळा|बीट|कोबी|फ्लॉवर|वांगी|भेंडी|गवार|दोडका|कारली|भोपळा|काकडी|पालक|मेथी|शेपू|कोथिंबीर|चवळी|वाटाणा|घेवडा|शेवगा|तोंडली|हिरवी मिरची/.test(value)) return "Vegetables";
  if (/fruit|फळ|आंबा|केळी|सफरचंद|द्राक्षे|डाळिंब|संत्रे|मोसंबी|पपई|पेरू|चिकू|कलिंगड|खरबूज|अंजीर|अननस|बोर|स्ट्रॉबेरी|सीताफळ|लिंबू|रामफळ/.test(value)) return "Fruits";
  if (/spice|masala|मसाला|हळद|धने|जिरे|मोहरी|मेथी दाणा|वेलची|लवंग|दालचिनी|हिंग|सुंठ|खसखस/.test(value)) return "Spices";
  if (/grain|cereal|pulse|धान्य|कडधान्य|गहू|तांदूळ|भात|ज्वारी|बाजरी|मका|नाचणी|हरभरा|तूर|मूग|उडीद|मसूर|मठ|चवळी|डाळ|रागी|राजगिरा|शाळू/.test(value)) return "Grains";
  if (/flower|फूल|फुले|झेंडू|गुलाब|निशिगंध|गुलछडी|शेवंती|अस्टर|मोगरा|कार्नेशन|जरबेरा|बिजली|कागडा/.test(value)) return "Flowers";
  if (/cotton|soy|oilseed|कापूस|सोयाबीन|तेलबिया|भुईमूग|सूर्यफूल|तीळ|करडई|एरंडी|जवस/.test(value)) return "Oilseeds & Fibre";
  return "Other";
}

async function fetchAPMCList(): Promise<APMC[]> {
  try {
    const [apmcRes, distRes] = await Promise.all([
      fetch("https://www.msamb.com/ApmcDetail/GetApmcForArrivalPriceInfo", { headers: requestHeaders }),
      fetch("https://www.msamb.com/ApmcDetail/GetDistrictCommodityWisePriceInfo", { headers: requestHeaders }),
    ]);
    if (!apmcRes.ok) return [];
    const apmcs = (await apmcRes.json()) as Array<{ ApmcCode: string; ApmcNameM: string }>;
    const districts = distRes.ok ? ((await distRes.json()) as Array<{ DistrictCode: string; DistrictNameM: string }>) : [];
    const districtNames = districts.map((d) => d.DistrictNameM);

    return apmcs.map((a) => ({
      code: a.ApmcCode,
      name: a.ApmcNameM,
      district: districtNames.find((d) => a.ApmcNameM.includes(d)) ?? null,
    }));
  } catch {
    return [];
  }
}

function parsePriceRows(html: string, apmc: APMC, sourceId: number): PriceRow[] {
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
  let observedOn: string | null = null;
  const rows: PriceRow[] = [];
  for (const tr of trMatches) {
    const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) ?? [];
    const cells = tdMatches.map((td) => clean(td.replace(/<[^>]*>/g, "")));
    if (cells.length === 1) {
      observedOn = dateValue(cells[0]) ?? observedOn;
      continue;
    }
    if (!observedOn || cells.length < 7) continue;
    const [crop, variety, unit, quantity, lrate, hrate, modal] = cells;
    if (!crop || !modal) continue;
    rows.push({
      source_id: sourceId,
      source: "msamb",
      apmc_code: apmc.code,
      observed_on: observedOn,
      crop,
      market: apmc.name,
      variety: variety ?? "",
      sector: sectorFor(crop),
      quantity: numberValue(quantity ?? ""),
      minimum_price: numberValue(lrate ?? ""),
      maximum_price: numberValue(hrate ?? ""),
      average_price: numberValue(modal ?? ""),
      unit: unit || "quintal",
      source_url: `${dataUrl}?commodityCode=null&apmcCode=${apmc.code}`,
      raw_payload: { cells, apmc },
    });
  }
  return rows;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const output: R[] = [];
  let cursor = 0;
  async function consume() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return output;
}

export default {
  fetch: withSupabase({ auth: "secret" }, async (request, ctx) => {
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get("limit") ?? 30);
    const offsetParam = Number(url.searchParams.get("offset") ?? 0);
    const codesParam = url.searchParams.get("codes");

    // Fetch and sync APMC reference list
    let apmcs = await fetchAPMCList();
    if (!apmcs.length) {
      const { data: dbApmcs } = await ctx.supabaseAdmin
        .from("apmc_list")
        .select("code,name,district")
        .eq("active", true)
        .order("name");
      apmcs = (dbApmcs ?? []) as APMC[];
    }
    if (!apmcs.length) return Response.json({ error: "No APMCs available" }, { status: 502 });

    const { data: source, error: sourceError } = await ctx.supabaseAdmin
      .from("market_sources")
      .select("id")
      .eq("name", "MSAMB")
      .single();
    if (sourceError) return Response.json({ error: sourceError.message }, { status: 500 });

    await ctx.supabaseAdmin.from("apmc_list").upsert(apmcs, { onConflict: "code" });

    // Filter APMCs to scrape
    let targetApmcs = apmcs;
    if (codesParam) {
      const allowedCodes = new Set(codesParam.split(",").map((c) => c.trim()));
      targetApmcs = apmcs.filter((a) => allowedCodes.has(a.code));
    } else if (limitParam > 0) {
      targetApmcs = apmcs.slice(offsetParam, offsetParam + limitParam);
    }

    const results = await mapWithConcurrency(targetApmcs, 5, async (apmc) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PER_APMC_TIMEOUT_MS);
        const response = await fetch(
          `${dataUrl}?commodityCode=null&apmcCode=${encodeURIComponent(apmc.code)}`,
          { headers: requestHeaders, signal: controller.signal },
        );
        clearTimeout(timeout);
        if (!response.ok) return { code: apmc.code, name: apmc.name, rows: 0, error: `HTTP ${response.status}` };
        const rows = parsePriceRows(await response.text(), apmc, source.id);
        if (!rows.length) return { code: apmc.code, name: apmc.name, rows: 0, error: "No price rows" };
        const { error } = await ctx.supabaseAdmin.from("market_prices").upsert(rows, { onConflict: "source,apmc_code,observed_on,crop,variety" });
        return { code: apmc.code, name: apmc.name, rows: rows.length, error: error?.message ?? null };
      } catch (err) {
        const message = err instanceof Error ? (err.name === "AbortError" ? `Timeout after ${PER_APMC_TIMEOUT_MS}ms` : err.message) : "Unknown error";
        return { code: apmc.code, name: apmc.name, rows: 0, error: message };
      }
    });

    const totalRows = results.reduce((sum, r) => sum + r.rows, 0);
    const failedCount = results.filter((r) => r.error && r.rows === 0).length;

    return Response.json({
      fetchedAt: new Date().toISOString(),
      apmcsTotal: apmcs.length,
      apmcsScraped: targetApmcs.length,
      totalRows,
      failedCount,
      results,
    });
  }),
};

