import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  BarChart3,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AIInsightCard,
  CHART,
  PageHeader,
  StatCard,
  StatusPill,
} from "@/components/krishi/widgets";

type LiveMarketRow = {
  crop: string;
  market: string;
  apmcCode: string;
  variety: string;
  sector: string;
  observedOn: string;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  unit: string;
  change: number | null;
  demand: "High" | "Medium" | "Low" | "Stable" | "Insufficient history";
};

type MarketResponse = {
  fetchedAt: string;
  sources: Array<{ source: string; url: string; date: string | null; rows: LiveMarketRow[]; error?: string }>;
};

type SupabaseSource = { id: number; name: string; url: string; active: boolean };
type SupabasePrice = {
  source_id: number;
  observed_on: string;
  crop: string;
  market: string;
  sector: string;
  minimum_price: number | null;
  maximum_price: number | null;
  average_price: number | null;
  unit: string;
};

type MarketLookupResponse = {
  fetchedAt: string;
  apmcs: Array<{ code: string; name: string; district: string | null }>;
  districts: string[];
  commodities: string[];
  sectors: string[];
  staleAfterDays: number;
  latestDateByApmc: Record<string, string | null>;
  totalRows: number;
  staleDaysByApmc: Record<string, number | null>;
  rows: Array<{
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
  }>;
};

const tabs = [
  ["prices", "Live Market Prices"],
  ["intelligence", "Demand Intelligence"],
  ["buy", "Buy Produce"],
  ["storage", "Storage / Godown"],
  ["surplus", "Surplus Management"],
  ["orders", "My Listings & Orders"],
] as const;
const prices = [
  ["Tomato", "Pune APMC", "₹2,350", "₹1,980", "₹2,480", "+8.4%", "High", "42 t"],
  ["Onion", "Nashik", "₹1,980", "₹1,650", "₹2,180", "+3.2%", "High", "86 t"],
  ["Wheat", "Nagpur", "₹2,410", "₹2,280", "₹2,520", "-1.5%", "Medium", "190 t"],
  ["Cotton", "Akola", "₹7,120", "₹6,900", "₹7,350", "+4.8%", "High", "64 t"],
  ["Soybean", "Indore", "₹4,680", "₹4,520", "₹4,790", "+1.1%", "Medium", "118 t"],
  ["Grapes", "Nashik", "₹5,800", "₹5,200", "₹6,400", "+6.7%", "High", "28 t"],
  ["Potato", "Pune", "₹1,720", "₹1,480", "₹1,900", "-2.4%", "Low", "210 t"],
];
const priceTrend = [
  { day: "1 Sep", price: 1980 },
  { day: "2 Sep", price: 2020 },
  { day: "3 Sep", price: 2110 },
  { day: "4 Sep", price: 2180 },
  { day: "5 Sep", price: 2280 },
  { day: "6 Sep", price: 2350 },
];
const listings = [
  [
    "Premium Nashik Onion",
    "Ramesh Patil",
    "Nashik · 4.2 km",
    "850 kg",
    "₹32/kg",
    "Grade A",
    "Harvested today",
  ],
  [
    "Field-fresh Tomato",
    "Savitri More",
    "Pune · 18 km",
    "480 kg",
    "₹28/kg",
    "Grade A",
    "Harvested yesterday",
  ],
  [
    "Organic Wheat",
    "Mohan Jadhav",
    "Satara · 34 km",
    "2.4 tonnes",
    "₹34/kg",
    "Organic",
    "Harvested 3 days ago",
  ],
  [
    "Thompson Seedless Grapes",
    "Anil Shinde",
    "Nashik · 9 km",
    "620 kg",
    "₹96/kg",
    "Export grade",
    "Harvested today",
  ],
];

async function fetchSupabaseMarketPrices(): Promise<MarketResponse> {
  const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!supabaseUrl || !publishableKey) throw new Error("Supabase public configuration is missing");

  const headers = { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` };
  const [sourceResponse, priceResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/market_sources?select=id,name,url,active&active=eq.true&order=name`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/market_prices?select=source_id,observed_on,crop,market,sector,minimum_price,maximum_price,average_price,unit&order=observed_on.desc&limit=10000`, { headers }),
  ]);
  if (!sourceResponse.ok || !priceResponse.ok) throw new Error("Unable to load Supabase market data");

  const sources = (await sourceResponse.json()) as SupabaseSource[];
  const prices = (await priceResponse.json()) as SupabasePrice[];
  const results = sources.map((source) => {
    const sourcePrices = prices.filter((price) => price.source_id === source.id);
    const date = sourcePrices[0]?.observed_on ?? null;
    const latest = sourcePrices.filter((price) => price.observed_on === date);
    return {
      source: source.name,
      url: source.url,
      date,
      rows: latest.map((price) => {
        const previous = sourcePrices.find(
          (item) => item.crop === price.crop && item.sector === price.sector && item.observed_on < price.observed_on,
        );
        const change = price.average_price !== null && previous?.average_price
          ? Number((((price.average_price - previous.average_price) / previous.average_price) * 100).toFixed(1))
          : null;
        return {
          crop: price.crop,
          market: price.market,
          sector: price.sector,
          average: price.average_price,
          minimum: price.minimum_price,
          maximum: price.maximum_price,
          unit: price.unit,
          change,
          demand: change === null ? "Insufficient history" : change >= 5 ? "High" : change >= 1 ? "Medium" : change <= -5 ? "Low" : "Stable",
        } as LiveMarketRow;
      }),
    };
  });
  return { fetchedAt: new Date().toISOString(), sources: results };
}

export const Route = createFileRoute("/_app/market")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Krishi Market — Sell Smarter | Krishi Mitra" },
    { name: "description", content: "Compare live mandi prices, find buyers, storage and better ways to sell farm produce." },
    { property: "og:title", content: "Krishi Market — Sell Smarter" },
    { property: "og:description", content: "Live mandi prices, trusted buyers and better decisions for farm produce." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: MarketPage,
});

function MarketPage() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState(tab ?? "prices");
  return (
    <div>
      <PageHeader
        title="Krishi Market – Sell Smarter. Earn Better."
        subtitle="Market prices, trusted buyers and clear decisions for your produce."
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${active === id ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-accent"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {active === "prices" && <PricesTab />}
      {active === "intelligence" && <IntelligenceTab />}
      {active === "buy" && <BuyTab />}
      {active === "storage" && <StorageTab />}
      {active === "surplus" && <SurplusTab />}
      {active === "orders" && <OrdersTab />}
    </div>
  );
}

function PricesTab() {
  const [query, setQuery] = useState("");
  const [lookupMode, setLookupMode] = useState<"market" | "crop">("market");
  const [dataSource, setDataSource] = useState<"msamb" | "apmc">("msamb");
  const [selectedApmc, setSelectedApmc] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const [lookupData, setLookupData] = useState<MarketLookupResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [liveData, setLiveData] = useState<MarketResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);

  // Fetch APMC scraper data (fallback / "APMC" source tab)
  useEffect(() => {
    fetchSupabaseMarketPrices()
      .then(setLiveData)
      .catch(() => setLiveData(null))
      .finally(() => setLiveLoading(false));
  }, []);

  // Fetch MSAMB market-data from Edge Function
  useEffect(() => {
    if (dataSource !== "msamb") return;
    setLookupLoading(true);
    const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
    if (!supabaseUrl) {
      setLookupLoading(false);
      return;
    }
    const params = new URLSearchParams();
    params.set("source", "msamb");
    if (lookupMode === "market") {
      if (selectedApmc) params.set("apmcCode", selectedApmc);
      else if (selectedDistrict) params.set("district", selectedDistrict);
    }
    if (lookupMode === "crop" && selectedCommodity) params.set("commodity", selectedCommodity);
    if (selectedSector) params.set("sector", selectedSector);

    const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
    fetch(`${supabaseUrl}/functions/v1/market-data?${params}`, {
      headers: publishableKey ? { apikey: publishableKey } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLookupData(d as MarketLookupResponse | null))
      .catch(() => setLookupData(null))
      .finally(() => setLookupLoading(false));
  }, [dataSource, lookupMode, selectedApmc, selectedDistrict, selectedCommodity, selectedSector]);

  // Available APMCs filtered by district
  const availableApmcs = useMemo(() => {
    const list = lookupData?.apmcs ?? [];
    if (!selectedDistrict) return list;
    return list.filter((a) => a.district === selectedDistrict);
  }, [lookupData?.apmcs, selectedDistrict]);

  // MSAMB rows
  const msamRows = useMemo(() => {
    if (!lookupData?.rows) return [];
    const apmcMap = new Map((lookupData.apmcs ?? []).map((a) => [a.code, a]));
    return lookupData.rows.map((row) => {
      const apmcInfo = row.apmc_code ? apmcMap.get(row.apmc_code) : undefined;
      return {
        crop: row.crop,
        market: row.market,
        apmcCode: row.apmc_code,
        variety: row.variety,
        district: apmcInfo?.district ?? null,
        sector: row.sector,
        observedOn: row.observed_on,
        quantity: row.quantity,
        average: row.average_price,
        minimum: row.minimum_price,
        maximum: row.maximum_price,
        unit: row.unit || "quintal",
        change: null as number | null,
        demand: "Insufficient history" as const,
      };
    });
  }, [lookupData]);

  // APMC fallback rows
  const apmcRows = useMemo(() => {
    return (liveData?.sources.flatMap((source) => source.rows) ?? []).map((row) => ({
      crop: row.crop,
      market: row.market,
      apmcCode: null as string | null,
      variety: "",
      district: null as string | null,
      sector: row.sector,
      observedOn: null as string | null,
      quantity: null as number | null,
      average: row.average,
      minimum: row.minimum,
      maximum: row.maximum,
      unit: row.unit,
      change: row.change,
      demand: row.demand,
    }));
  }, [liveData]);

  const activeRows = dataSource === "msamb" ? msamRows : apmcRows;
  const isLoading = dataSource === "msamb" ? lookupLoading : liveLoading;

  const filtered = useMemo(() => {
    if (!query.trim()) return activeRows;
    const q = query.toLowerCase();
    return activeRows.filter(
      (row) =>
        row.crop.toLowerCase().includes(q) ||
        row.market.toLowerCase().includes(q) ||
        (row.variety && row.variety.toLowerCase().includes(q)) ||
        (row.district && row.district.toLowerCase().includes(q)) ||
        (row.sector && row.sector.toLowerCase().includes(q)),
    );
  }, [activeRows, query]);

  // Top rate opportunity
  const topOpportunity = useMemo(() => {
    if (!activeRows.length) return null;
    return [...activeRows].sort((a, b) => (b.average ?? 0) - (a.average ?? 0))[0];
  }, [activeRows]);

  // Stale detection
  const latestDates = lookupData?.latestDateByApmc ?? {};
  const staleDaysByApmc = lookupData?.staleDaysByApmc ?? {};
  const staleThreshold = lookupData?.staleAfterDays ?? 2;
  const hasStaleData = Object.values(staleDaysByApmc).some((d) => d !== null && d > staleThreshold);

  const totalApmcs = lookupData?.apmcs?.length ?? 0;
  const totalMsamRows = lookupData?.totalRows ?? 0;

  return (
    <div className="space-y-6">
      {/* ─── Data source toggle ─── */}
      <div className="flex gap-2">
        <button
          onClick={() => setDataSource("msamb")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${dataSource === "msamb" ? "bg-primary text-primary-foreground shadow-sm" : "border bg-card text-muted-foreground hover:bg-accent"}`}
        >
          MSAMB (All Maharashtra)
        </button>
        <button
          onClick={() => setDataSource("apmc")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${dataSource === "apmc" ? "bg-primary text-primary-foreground shadow-sm" : "border bg-card text-muted-foreground hover:bg-accent"}`}
        >
          APMC (Mumbai / Pune / Nagpur)
        </button>
      </div>

      {/* ─── Status banner ─── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-bold text-foreground">
              {isLoading
                ? "Fetching market prices…"
                : activeRows.length
                  ? dataSource === "msamb"
                    ? `${totalMsamRows} commodities from ${totalApmcs} APMCs across Maharashtra`
                    : "Live APMC market prices"
                  : "Market data unavailable"}
            </p>
            {hasStaleData && (
              <p className="mt-1 text-xs font-semibold text-amber-600">
                ⚠ Some APMCs have data older than {staleThreshold} days — prices may not reflect today's market.
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {lookupData?.fetchedAt
              ? `Loaded ${new Date(lookupData.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
              : ""}
          </span>
        </div>
      </div>

      {/* ─── MSAMB selectors ─── */}
      {dataSource === "msamb" && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          {/* Lookup mode toggle */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => { setLookupMode("market"); setSelectedCommodity(""); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${lookupMode === "market" ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:bg-accent"}`}
            >
              🏪 By my market / district
            </button>
            <button
              onClick={() => { setLookupMode("crop"); setSelectedApmc(""); setSelectedDistrict(""); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${lookupMode === "crop" ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:bg-accent"}`}
            >
              🌾 By my crop
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {lookupMode === "market" && (
              <>
                <label className="text-xs font-bold text-muted-foreground">
                  District
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setSelectedDistrict(newDist);
                      if (selectedApmc) {
                        const cur = (lookupData?.apmcs ?? []).find((a) => a.code === selectedApmc);
                        if (newDist && cur && cur.district !== newDist) setSelectedApmc("");
                      }
                    }}
                    className="ml-2 h-9 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All districts (सर्व जिल्हे)</option>
                    {(lookupData?.districts ?? []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-muted-foreground">
                  APMC (बाजार समिती)
                  <select
                    value={selectedApmc}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setSelectedApmc(newCode);
                      if (newCode && !selectedDistrict) {
                        const found = (lookupData?.apmcs ?? []).find((a) => a.code === newCode);
                        if (found?.district) setSelectedDistrict(found.district);
                      }
                    }}
                    className="ml-2 h-9 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">
                      {selectedDistrict ? `All APMCs in ${selectedDistrict}` : "All APMCs (सर्व बाजार समित्या)"}
                    </option>
                    {availableApmcs.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.name}{a.district && !selectedDistrict ? ` (${a.district})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {lookupMode === "crop" && (
              <label className="text-xs font-bold text-muted-foreground">
                Commodity (शेतमाल)
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="ml-2 h-9 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All commodities (सर्व शेतमाल)</option>
                  {(lookupData?.commodities ?? []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-xs font-bold text-muted-foreground">
              Sector (विभाग)
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="ml-2 h-9 rounded-lg border bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All sectors (सर्व विभाग)</option>
                {(lookupData?.sectors ?? []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Last updated per selected APMC */}
          {selectedApmc && latestDates[selectedApmc] && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Last reported:</span>
              <span className="font-bold text-foreground">{latestDates[selectedApmc]}</span>
              {(staleDaysByApmc[selectedApmc] ?? 0) > staleThreshold && (
                <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 font-bold">
                  {staleDaysByApmc[selectedApmc]} days old
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label={lookupMode === "crop" && selectedCommodity ? `Top Market for ${selectedCommodity}` : "Your best opportunity"}
          value={topOpportunity?.crop ? `${topOpportunity.crop} · ${topOpportunity.market}` : "Tomato"}
          sub={topOpportunity?.average != null ? `₹${topOpportunity.average.toLocaleString("en-IN")} / ${topOpportunity.unit}` : "₹2,350 / quintal"}
          tone="leaf"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          label="Top crop in state"
          value={activeRows[0]?.crop ?? "कांदा"}
          sub={activeRows[0]?.average != null ? `₹${activeRows[0].average.toLocaleString("en-IN")} modal` : "+14% trend"}
          tone="sun"
        />
        <StatCard
          label="Markets tracked"
          value={dataSource === "msamb" ? String(totalApmcs || 278) : "3"}
          sub={dataSource === "msamb" ? "Across Maharashtra" : "Mumbai · Pune · Nagpur"}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Last updated"
          value={lookupData?.fetchedAt ? new Date(lookupData.fetchedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
          sub={lookupData?.fetchedAt ? new Date(lookupData.fetchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
        />
      </div>

      {/* ─── Price table ─── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base">
              {dataSource === "msamb" ? "MSAMB Mandi Prices (कृषि उत्पन्न बाजार समिती भाव)" : "Live APMC Mandi Prices"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {dataSource === "msamb"
                ? "Official daily wholesale arrival prices from Maharashtra State Agricultural Marketing Board"
                : "Minimum, maximum and average prices in ₹ / quintal"}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crop, variety, market..."
              className="h-10 w-64 rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-3 text-sm">Loading market data…</span>
            </div>
          ) : dataSource === "msamb" ? (
            <table className="w-full min-w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-bold">Commodity & Variety (शेतमाल / जात)</th>
                  <th className="px-3 py-3 font-bold">Mandi & District (बाजार समिती)</th>
                  <th className="px-3 py-3 font-bold">Modal Rate (सर्वसाधारण भाव)</th>
                  <th className="px-3 py-3 font-bold">Min – Max Range (कमी – जास्त)</th>
                  <th className="px-3 py-3 font-bold">Arrivals (आवक)</th>
                  <th className="px-3 py-3 font-bold">Reported (दिनांक)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const isTopRate = topOpportunity && row.crop === topOpportunity.crop && row.average === topOpportunity.average && lookupMode === "crop";
                  return (
                    <tr
                      key={`${row.apmcCode || row.market}-${row.crop}-${row.variety || ''}-${row.observedOn || idx}`}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-foreground text-sm">{row.crop}</span>
                          {row.variety && row.variety !== "---" && (
                            <span className="rounded bg-accent/80 px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground border border-accent">
                              {row.variety}
                            </span>
                          )}
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {row.sector}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="font-bold text-foreground">{row.market}</div>
                        {row.district && (
                          <div className="text-xs text-muted-foreground">{row.district}</div>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-foreground">
                            {row.average !== null ? `₹${row.average.toLocaleString("en-IN")}` : "—"}
                          </span>
                          {isTopRate && (
                            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                              ★ Top Mandi
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">/ {row.unit}</div>
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground font-medium">
                        {row.minimum !== null ? `₹${row.minimum.toLocaleString("en-IN")}` : "—"} – {row.maximum !== null ? `₹${row.maximum.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-xs font-semibold text-foreground">
                        {row.quantity !== null && row.quantity > 0 ? `${row.quantity.toLocaleString("en-IN")} ${row.unit}` : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground">
                        {row.observedOn
                          ? new Date(row.observedOn).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                      {query ? "No commodities match your search query." : "No market data available for the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Crop / Market", "Average", "Min–Max", "Change", "Demand", "Stock"].map((h) => (
                    <th key={h} className="px-3 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={`${row.market}-${row.crop}-${idx}`} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-3 py-4">
                      <div className="font-extrabold">{row.crop}</div>
                      <div className="text-xs text-muted-foreground">{row.market}</div>
                    </td>
                    <td className="px-3 py-4 font-extrabold">
                      {row.average !== null ? `₹${row.average.toLocaleString("en-IN")}` : "—"}
                      <div className="text-[10px] font-normal text-muted-foreground">/ quintal</div>
                    </td>
                    <td className="px-3 py-4 text-xs text-muted-foreground">
                      {row.minimum !== null ? `₹${row.minimum.toLocaleString("en-IN")}` : "—"} – {row.maximum !== null ? `₹${row.maximum.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td
                      className={`px-3 py-4 font-bold ${typeof row.change === "number" && row.change >= 0 ? "text-primary" : typeof row.change === "number" && row.change < 0 ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {row.change !== null ? `${row.change >= 0 ? "+" : ""}${row.change}%` : "—"}
                    </td>
                    <td className="px-3 py-4">
                      <StatusPill
                        tone={row.demand === "High" ? "green" : row.demand === "Medium" ? "amber" : row.demand === "Low" ? "red" : "blue"}
                      >
                        {row.demand}
                      </StatusPill>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{row.unit}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      {query ? "No crops match your search." : "No market data available for the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── Chart + AI insight ─── */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <h3 className="font-extrabold">Onion price trend · Nashik</h3>
          <p className="text-xs text-muted-foreground">
            Average price / quintal over the last 6 days
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={CHART.green}
                  fill={CHART.green}
                  fillOpacity={0.16}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <AIInsightCard title="Price intelligence">
          Tomato prices are 8.4% higher at Pune APMC today. Your Field A harvest in 18 days is
          entering a strong demand window.
        </AIInsightCard>
      </div>
    </div>
  );
}


function IntelligenceTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          title="Onion"
          value="₹2,100–₹2,450"
          label="Expected price"
          badge="Rising"
          tone="green"
          detail="Demand is projected to rise 14% over the next two weeks in nearby markets."
        />
        <InsightCard
          title="Tomato"
          value="₹2,200–₹2,600"
          label="Expected price"
          badge="High demand"
          tone="green"
          detail="Hotels and processors are actively buying Grade A produce."
        />
        <InsightCard
          title="Potato"
          value="₹1,400–₹1,750"
          label="Expected price"
          badge="Oversupply risk"
          tone="amber"
          detail="Consider storage or processing instead of selling the entire harvest now."
        />
      </div>
      <AIInsightCard title="Why does this matter?">
        Market demand helps you choose when and where to sell. Onion demand is rising while nearby
        stock remains limited, so storing a small part of your harvest for 10–14 days may improve
        your price. Keep the rest ready for today's buyers.
      </AIInsightCard>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-extrabold">Market signals near Nashik</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Signal
            icon={<TrendingUp className="h-4 w-4" />}
            title="Price rising"
            text="Onion · Tomato · Grapes"
            tone="green"
          />
          <Signal
            icon={<TrendingDown className="h-4 w-4" />}
            title="Price falling"
            text="Potato · Wheat"
            tone="red"
          />
          <Signal
            icon={<ShoppingBag className="h-4 w-4" />}
            title="Buyers active"
            text="Restaurants · Processors"
            tone="blue"
          />
        </div>
      </div>
    </div>
  );
}
function BuyTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-extrabold">Direct farmer-to-buyer marketplace</h3>
          <p className="text-sm text-muted-foreground">Verified produce from nearby farms</p>
        </div>
        <button className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
          + Sell your produce
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {listings.map(([name, farmer, location, quantity, price, grade, harvest]) => (
          <div key={name} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Package className="h-7 w-7" />
              </div>
              <StatusPill tone="green">
                <ShieldCheck className="h-3 w-3" />
                Verified farmer
              </StatusPill>
            </div>
            <h3 className="mt-4 font-extrabold">{name}</h3>
            <p className="mt-1 text-sm font-semibold">
              {farmer} · <span className="font-normal text-muted-foreground">{location}</span>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-muted p-3">
                <b className="block text-sm">{quantity}</b>Quantity
              </div>
              <div className="rounded-xl bg-muted p-3">
                <b className="block text-sm">{price}</b>Price
              </div>
              <div className="rounded-xl bg-muted p-3">
                <b className="block text-sm">{grade}</b>Quality
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{harvest}</p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">
                Contact farmer
              </button>
              <button className="rounded-xl border-2 border-primary px-3 py-2.5 text-xs font-bold text-primary">
                Make offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function StorageTab() {
  const facilities = [
    ["Krishi Warehouse", "4.3 km", "Cold storage", "38 tonnes", "₹24 / quintal / day", "Available"],
    ["Sahyadri Godown", "8.1 km", "Ventilated", "120 tonnes", "₹12 / quintal / day", "Available"],
    [
      "Nashik Agri Hub",
      "12.6 km",
      "Controlled atmosphere",
      "12 tonnes",
      "₹38 / quintal / day",
      "Limited",
    ],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-sky/15 p-5">
        <div className="flex items-center gap-3">
          <Warehouse className="h-6 w-6 text-sky" />
          <div>
            <h3 className="font-extrabold">Storage near your farm</h3>
            <p className="text-sm text-muted-foreground">
              Compare facilities before harvest day and protect your price.
            </p>
          </div>
        </div>
      </div>
      {facilities.map(([name, distance, type, capacity, price, availability]) => (
        <div
          key={name}
          className="grid gap-4 rounded-2xl border bg-card p-5 shadow-sm md:grid-cols-[1.4fr_repeat(4,1fr)_auto] md:items-center"
        >
          <div>
            <h3 className="font-extrabold">{name}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {distance} from Field A
            </p>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Type</div>
            <div className="text-sm font-bold">{type}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Capacity</div>
            <div className="text-sm font-bold">{capacity}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Rate</div>
            <div className="text-sm font-bold">{price}</div>
          </div>
          <StatusPill tone={availability === "Limited" ? "amber" : "green"}>
            {availability}
          </StatusPill>
          <button className="rounded-xl border px-4 py-2 text-xs font-bold text-primary hover:bg-accent">
            View details
          </button>
        </div>
      ))}
    </div>
  );
}
function SurplusTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-sun/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <StatusPill tone="amber">Action recommended</StatusPill>
            <h3 className="mt-3 text-2xl font-extrabold">480 kg tomatoes may remain unsold</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Field A harvest peaks in 18 days. Choose an option now to protect your income and
              reduce waste.
            </p>
          </div>
          <Package className="h-16 w-16 text-earth/50" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SurplusCard
          title="Sell to processor"
          revenue="₹14,400"
          cost="₹800"
          profit="₹13,600"
          shelf="Immediate"
        />
        <SurplusCard
          title="Cold storage"
          revenue="₹17,280"
          cost="₹2,880"
          profit="₹14,400"
          shelf="14 days"
        />
        <SurplusCard
          title="Tomato puree"
          revenue="₹25,600"
          cost="₹8,400"
          profit="₹17,200"
          shelf="6 months"
        />
        <SurplusCard
          title="Dried produce"
          revenue="₹31,200"
          cost="₹10,800"
          profit="₹20,400"
          shelf="10 months"
        />
      </div>
      <AIInsightCard title="Krishi AI recommendation">
        Processing into puree offers the best balance of profit and shelf life for your expected
        volume. A nearby processor in Nashik can collect within 48 hours.
      </AIInsightCard>
    </div>
  );
}
function OrdersTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active listings" value="3" sub="₹48,200 value" />
        <StatCard label="Open offers" value="5" sub="Awaiting response" tone="sun" />
        <StatCard label="Orders fulfilled" value="18" sub="This season" tone="leaf" />
        <StatCard label="Farmer rating" value="4.8 / 5" sub="From 24 buyers" />
      </div>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="font-extrabold">Recent orders</h3>
        {[
          ["Rahul Foods", "240 kg Tomato", "₹6,720", "Pickup tomorrow", "green"],
          ["Nashik Fresh Retail", "420 kg Onion", "₹13,440", "Offer received", "amber"],
          ["Sahyadri Processors", "1.2 t Wheat", "₹40,800", "Delivered · 2 Sep", "blue"],
        ].map(([buyer, product, amount, status, tone]) => (
          <div
            key={buyer}
            className="flex flex-wrap items-center gap-3 border-b py-4 last:border-0"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <div className="font-bold">{buyer}</div>
              <div className="text-xs text-muted-foreground">{product}</div>
            </div>
            <div className="font-extrabold">{amount}</div>
            <StatusPill tone={tone as "green" | "amber" | "blue"}>{status}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}
function InsightCard({
  title,
  value,
  label,
  badge,
  tone,
  detail,
}: {
  title: string;
  value: string;
  label: string;
  badge: string;
  tone: "green" | "amber";
  detail: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold">{title}</h3>
        <StatusPill tone={tone}>{badge}</StatusPill>
      </div>
      <div className="mt-4 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}
function Signal({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: "green" | "red" | "blue";
}) {
  return (
    <div className="rounded-xl bg-muted p-4">
      <div
        className={`flex items-center gap-2 text-sm font-bold ${tone === "red" ? "text-destructive" : tone === "blue" ? "text-sky" : "text-primary"}`}
      >
        {icon}
        {title}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
function SurplusCard({
  title,
  revenue,
  cost,
  profit,
  shelf,
}: {
  title: string;
  revenue: string;
  cost: string;
  profit: string;
  shelf: string;
}) {
  return (
    <div className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-extrabold">{title}</h3>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Revenue</span>
          <b>{revenue}</b>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cost</span>
          <b className="text-destructive">{cost}</b>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-bold">Potential profit</span>
          <b className="text-primary">{profit}</b>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        Shelf life: {shelf}
      </div>
    </div>
  );
}
