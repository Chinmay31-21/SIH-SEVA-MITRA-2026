import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  const filtered = useMemo(
    () =>
      prices.filter(([crop, market]) =>
        `${crop} ${market}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Your best opportunity"
          value="Tomato"
          sub="₹2,350 / quintal"
          tone="leaf"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard label="Highest demand" value="Onion" sub="+14% next 2 weeks" tone="sun" />
        <StatCard
          label="Markets tracked"
          value="18"
          sub="Across Maharashtra"
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard label="Last updated" value="10:32 AM" sub="Today, 5 Sep" />
      </div>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold">Live mandi prices</h3>
            <p className="text-xs text-muted-foreground">
              Minimum, maximum and average prices in ₹ / quintal
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crop or market"
              className="h-10 w-56 rounded-xl border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
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
              {filtered.map(([crop, market, avg, min, max, change, demand, stock]) => (
                <tr key={crop} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-3 py-4">
                    <div className="font-extrabold">{crop}</div>
                    <div className="text-xs text-muted-foreground">{market}</div>
                  </td>
                  <td className="px-3 py-4 font-extrabold">
                    {avg}
                    <div className="text-[10px] font-normal text-muted-foreground">/ quintal</div>
                  </td>
                  <td className="px-3 py-4 text-xs text-muted-foreground">
                    {min} – {max}
                  </td>
                  <td
                     className={`px-3 py-4 font-bold ${(change ?? "").startsWith("+") ? "text-primary" : "text-destructive"}`}
                  >
                    {change}
                  </td>
                  <td className="px-3 py-4">
                    <StatusPill
                      tone={demand === "High" ? "green" : demand === "Medium" ? "amber" : "red"}
                    >
                      {demand}
                    </StatusPill>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
