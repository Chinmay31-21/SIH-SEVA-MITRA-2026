import { withSupabase } from "npm:@supabase/server";

type Source = { id: number; name: string; url: string };
type PriceRow = {
  source_id: number;
  source: "apmc";
  apmc_code: null;
  observed_on: string;
  crop: string;
  market: string;
  variety: string;
  sector: string;
  minimum_price: number | null;
  maximum_price: number | null;
  average_price: number | null;
  unit: string;
  source_url: string;
  raw_payload: Record<string, unknown>;
};

const headers = { "user-agent": "Krishi-Mitra-market-ingest/1.0" };

function cleanCell(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectorFromUrl(url: string): string {
  const slug = url.split("/").pop()?.toLowerCase() ?? "";
  if (/veg|vegetable|leafy|kanda|onion|fruit-veg/.test(slug)) return "Vegetables";
  if (/fruit/.test(slug)) return "Fruits";
  if (/spice|masala|chilli/.test(slug)) return "Spices";
  if (/grain|dhanya|cereal|gul-bhusar/.test(slug)) return "Grains";
  if (/flower|ful/.test(slug)) return "Flowers";
  if (/cotton|soy|oilseed|kapus/.test(slug)) return "Oilseeds & Fibre";
  return "Other";
}

function sectorFromPage(html: string, url: string): string {
  const urlSector = sectorFromUrl(url);
  if (urlSector !== "Other") return urlSector;

  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").toLowerCase();
  if (/vegetable|भाजी|पालेभाजी|भाजीपाला/.test(text)) return "Vegetables";
  if (/fruit|फळ बाजार|फळभाजी|फळे/.test(text)) return "Fruits";
  if (/spice|masala|मसाला|मिरची/.test(text)) return "Spices";
  if (/grain|cereal|धान्य|कडधान्य|गहू|तांदूळ/.test(text)) return "Grains";
  if (/flower|फूल|फुले/.test(text)) return "Flowers";
  if (/cotton|oilseed|कापूस|सोयाबीन|तेलबिया/.test(text)) return "Oilseeds & Fibre";
  return "Other";
}

function sectorForCrop(crop: string): string {
  const value = crop.toLowerCase();
  if (/vegetable|भाजी|पालेभाजी|कांदा|बटाटा|टोमॅटो|मिरची|लसूण|आले|गाजर|मुळा|बीट|कोबी|फ्लॉवर|वांगी|भेंडी|गवार|दोडका|कारली|भोपळा|काकडी|पालक|मेथी|शेपू|कोथिंबीर|चवळी|वाटाणा|घेवडा|शेवगा|तोंडली|हिरवी मिरची|आरवी/.test(value)) return "Vegetables";
  if (/fruit|फळ|आंबा|केळी|सफरचंद|द्राक्षे|डाळिंब|संत्रे|मोसंबी|पपई|पेरू|चिकू|कलिंगड|खरबूज|अंजीर|अननस|बोर|स्ट्रॉबेरी|सीताफळ|लिंबू|रामफळ|आवळा/.test(value)) return "Fruits";
  if (/spice|masala|मसाला|हळद|धने|जिरे|मोहरी|मेथी दाणा|वेलची|लवंग|दालचिनी|हिंग|सुंठ|खसखस/.test(value)) return "Spices";
  if (/grain|cereal|pulse|धान्य|कडधान्य|गहू|तांदूळ|भात|ज्वारी|बाजरी|मका|नाचणी|हरभरा|तूर|मूग|उडीद|मसूर|मठ|चवळी|डाळ|रागी|राजगिरा|शाळू/.test(value)) return "Grains";
  if (/flower|फूल|फुले|झेंडू|गुलाब|निशिगंध|गुलछडी|शेवंती|अस्टर|मोगरा|कार्नेशन|जरबेरा|बिजली|कागडा/.test(value)) return "Flowers";
  if (/cotton|soy|oilseed|कापूस|सोयाबीन|तेलबिया|भुईमूग|सूर्यफूल|तीळ|करडई|एरंडी|जवस/.test(value)) return "Oilseeds & Fibre";
  return "Other";
}

function findDate(html: string, url: string): string | null {
  const urlDate = url.match(/\/(\d{4}-\d{2}-\d{2})(?:$|[?#])/i)?.[1];
  if (urlDate) return urlDate;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const match = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (!match) return null;
  const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
  return `${year.toString().padStart(4, "0")}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function categoryLinks(html: string, sourceUrl: string): string[] {
  const links = html.match(/href\s*=\s*["'][^"']+["']/gi) ?? [];
  return [...new Set(
    links
      .map((link) => link.match(/["']([^"']+)["']/)?.[1])
      .filter((href): href is string => Boolean(href))
      .filter((href) => /daily-bajarbhav-dates|view-daily-bajarbhav/i.test(href))
      .map((href) => new URL(href, sourceUrl).href),
  )];
}

function parseRows(html: string, source: Source, sector: string, observedOn: string, pageUrl: string): PriceRow[] {
  const rows: PriceRow[] = [];
  const tableRows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  for (const tableRow of tableRows) {
    const cells = (tableRow.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? [])
      .map(cleanCell)
      .filter(Boolean);
    if (cells.length < 3) continue;
    if (/commodity|variety|minimum|maximum|average|modal|date/i.test(cells.join(" "))) continue;

    const numbers = cells
      .map((cell) => cell.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0])
      .filter((value): value is string => Boolean(value))
      .map(Number)
      .filter((value) => value > 0);
    const crop = cells[0];
    if (!crop || numbers.length < 3) continue;
    const prices = numbers.slice(-3);
    rows.push({
      source_id: source.id,
      source: "apmc",
      apmc_code: null,
      observed_on: observedOn,
      crop,
      market: source.name,
      variety: "",
      sector: sector !== "Other" ? sector : sectorForCrop(crop),
      minimum_price: prices[0] ?? null,
      maximum_price: prices[1] ?? null,
      average_price: prices[2] ?? null,
      unit: /kg/i.test(cells.join(" ")) ? "kg" : "quintal",
      source_url: pageUrl,
      raw_payload: { cells, source_url: source.url },
    });
  }
  return rows;
}

async function fetchSource(source: Source): Promise<{ source: Source; rows: PriceRow[]; date: string | null; error?: string }> {
  try {
    const landing = await fetch(source.url, { headers });
    if (!landing.ok) throw new Error(`HTTP ${landing.status}`);
    const landingHtml = await landing.text();
    const links = categoryLinks(landingHtml, source.url).slice(0, 20);
    const pages = await Promise.all([
      Promise.resolve({ url: source.url, html: landingHtml }),
      ...links.map(async (url) => {
        const response = await fetch(url, { headers });
        return { url, html: response.ok ? await response.text() : "" };
      }),
    ]);
    const date = pages.map((page) => findDate(page.html, page.url)).find(Boolean) ?? new Date().toISOString().slice(0, 10);
    const rows = pages.flatMap((page) => parseRows(page.html, source, sectorFromPage(page.html, page.url), date, page.url));
    const unique = [...new Map(rows.map((row) => [`${row.crop}:${row.sector}`, row])).values()];
    return { source, date, rows: unique.slice(0, 1000) };
  } catch (error) {
    return { source, date: null, rows: [], error: error instanceof Error ? error.message : "Source fetch failed" };
  }
}

export default {
  fetch: withSupabase({ auth: "secret" }, async (request, ctx) => {
    if (request.method !== "POST") return Response.json({ error: "Use POST" }, { status: 405 });

    const { data: sources, error: sourceError } = await ctx.supabaseAdmin
      .from("market_sources")
      .select("id,name,url")
      .eq("active", true)
      .neq("name", "MSAMB");
    if (sourceError) return Response.json({ error: sourceError.message }, { status: 500 });

    const results = await Promise.all((sources as Source[]).map(fetchSource));
    const rows = results.flatMap((result) => result.rows);
    if (rows.length) {
      const { error } = await ctx.supabaseAdmin
        .from("market_prices")
        .upsert(rows, { onConflict: "source,apmc_code,observed_on,crop,variety" });
      if (error) return Response.json({ error: error.message, sources: results }, { status: 500 });
    }

    return Response.json({
      fetchedAt: new Date().toISOString(),
      rowsInserted: rows.length,
      sources: results.map((result) => ({
        source: result.source.name,
        date: result.date,
        rows: result.rows.length,
        error: result.error ?? null,
      })),
    });
  }),
};
