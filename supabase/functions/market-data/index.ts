import { withSupabase } from "npm:@supabase/server";

function staleDays(date: string | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - Date.parse(`${date}T00:00:00Z`)) / 86400000);
}

export default {
  fetch: withSupabase({ auth: "publishable" }, async (request, ctx) => {
    const url = new URL(request.url);
    const apmcCode = url.searchParams.get("apmcCode");
    const district = url.searchParams.get("district");
    const commodity = url.searchParams.get("commodity");
    const sector = url.searchParams.get("sector");
    const source = url.searchParams.get("source") ?? "msamb";

    const { data: apmcs, error: apmcError } = await ctx.supabase
      .from("apmc_list")
      .select("code,name,district")
      .eq("active", true)
      .order("name");
    if (apmcError) return Response.json({ error: apmcError.message }, { status: 500 });

    const districts = [...new Set((apmcs ?? []).map((item) => item.district).filter(Boolean))].sort();
    const commoditiesQuery = await ctx.supabase
      .from("market_prices")
      .select("crop")
      .eq("source", source)
      .order("crop");
    if (commoditiesQuery.error) return Response.json({ error: commoditiesQuery.error.message }, { status: 500 });
    const commodities = [...new Set((commoditiesQuery.data ?? []).map((item) => item.crop))].sort();

    const sectorsQuery = await ctx.supabase
      .from("market_prices")
      .select("sector")
      .eq("source", source)
      .order("sector");
    const sectors = [...new Set((sectorsQuery.data ?? []).map((item) => item.sector).filter(Boolean))].sort();

    const selectedCodes = apmcCode
      ? [apmcCode]
      : district
        ? (apmcs ?? []).filter((item) => item.district === district).map((item) => item.code)
        : null;

    let query = ctx.supabase
      .from("market_prices")
      .select("apmc_code,observed_on,crop,market,variety,sector,quantity,minimum_price,maximum_price,average_price,unit")
      .eq("source", source)
      .order("observed_on", { ascending: false })
      .limit(10000);
    if (selectedCodes && selectedCodes.length > 0) query = query.in("apmc_code", selectedCodes);
    if (commodity) query = query.eq("crop", commodity);
    if (sector) query = query.eq("sector", sector);
    const { data: fetchedRows, error: rowError } = await query;
    if (rowError) return Response.json({ error: rowError.message }, { status: 500 });

    const latestKeys = new Set<string>();
    const rows = (fetchedRows ?? []).filter((row) => {
      const key = `${row.apmc_code}:${row.crop}:${row.variety}`;
      if (latestKeys.has(key)) return false;
      latestKeys.add(key);
      return true;
    });
    const latestDateByApmc = Object.fromEntries(
      [...new Set(rows.map((row) => row.apmc_code))].map((code) => [code, rows.find((row) => row.apmc_code === code)?.observed_on ?? null]),
    );

    return Response.json({
      fetchedAt: new Date().toISOString(),
      filters: { apmcCode, district, commodity, sector, source },
      apmcs,
      districts,
      commodities,
      sectors,
      staleAfterDays: 2,
      latestDateByApmc,
      totalRows: rows.length,
      rows,
      staleDaysByApmc: Object.fromEntries(Object.entries(latestDateByApmc).map(([code, date]) => [code, staleDays(date)])),
    });
  }),
};

