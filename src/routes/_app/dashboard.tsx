import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, StatCard, Gauge, AIInsightCard, StatusPill } from "@/components/krishi/widgets";
import { farmer, fields, moistureTrend } from "@/lib/krishi-data";
import { CHART } from "@/components/krishi/widgets";
import {
  CloudRain, Droplets, Sun, TrendingUp, AlertTriangle, CloudSun,
  Sprout, IndianRupee, Sparkles, Leaf,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Krishi Mitra" },
      { name: "description", content: "Your farm command centre: health score, weather, soil, irrigation, markets and AI recommendations." },
      { property: "og:title", content: "Krishi Mitra Dashboard" },
      { property: "og:description", content: "Your farm command centre with AI insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const alerts = [
  { icon: <AlertTriangle className="h-4 w-4 text-earth" />, text: "Low nitrogen detected in Field A", tone: "amber" as const },
  { icon: <CloudRain className="h-4 w-4 text-sky" />, text: "Heavy rainfall expected tomorrow", tone: "blue" as const },
  { icon: <TrendingUp className="h-4 w-4 text-primary" />, text: "Onion prices increased 11%", tone: "green" as const },
  { icon: <Droplets className="h-4 w-4 text-destructive" />, text: "Field B requires irrigation", tone: "red" as const },
  { icon: <Sun className="h-4 w-4 text-earth" />, text: "Solar generation above average", tone: "amber" as const },
];

function Dashboard() {
  return (
    <div>
      <PageHeader
        title={`Namaste, ${farmer.name.split(" ")[0]} 👋`}
        subtitle="Your farm is looking healthy today — it needs attention in 2 areas."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Weather" value="29°C" sub="Feels 32°C" icon={<CloudSun className="h-4 w-4" />} />
        <StatCard label="Soil Moisture" value="64%" sub="Optimal" icon={<Droplets className="h-4 w-4" />} />
        <StatCard label="Expected Rain" value="72%" sub="Tomorrow eve" icon={<CloudRain className="h-4 w-4" />} />
        <StatCard label="Solar" value="4.8 kWh" sub="Right now" icon={<Sun className="h-4 w-4" />} />
        <StatCard label="Crop" value="Tomato" sub="Flowering" icon={<Sprout className="h-4 w-4" />} />
        <StatCard label="Harvest In" value="18 days" sub="Field A" icon={<Leaf className="h-4 w-4" />} />
        <StatCard label="Est. Revenue" value="₹82,500" sub="This season" icon={<IndianRupee className="h-4 w-4" />} />
        <StatCard label="Mandi" value="₹2,350" sub="▲ 8.4% /qtl" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Farm health */}
        <div className="card-hover rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Farm Health Score</h3>
          <div className="mt-4 flex justify-center"><Gauge value={87} label="/ 100" sub="Healthy" /></div>
          <div className="mt-3 flex justify-center gap-2">
            {fields.map((f) => (
              <StatusPill key={f.id} tone={f.status === "Healthy" ? "green" : "amber"}>
                {f.id}: {f.crop}
              </StatusPill>
            ))}
          </div>
        </div>

        {/* Weather */}
        <div className="card-hover rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Today's Weather — Nashik</h3>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-5xl font-extrabold">29°C</span>
            <span className="pb-1.5 text-sm text-muted-foreground">Partly Cloudy</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["Humidity", "68%"], ["Rain", "72%"], ["Wind", "14 km/h"]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-sky/15 p-3">
                <div className="text-base font-extrabold">{v}</div>
                <div className="text-[11px] font-semibold text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
          <Link to="/weather" className="mt-4 block text-center text-xs font-bold text-primary hover:underline">Full forecast →</Link>
        </div>

        {/* Irrigation */}
        <div className="card-hover flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Irrigation</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Next irrigation recommended in <span className="font-bold text-foreground">3 hours</span>.
            Field B moisture is 38% — your field needs water soon.
          </p>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[38%] rounded-full bg-sky transition-all" />
          </div>
          <div className="mt-auto flex gap-2 pt-5">
            <Link to="/surya-shakti" search={{ tab: "irrigation" }} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground hover:opacity-90">
              Start Irrigation
            </Link>
            <Link to="/surya-shakti" search={{ tab: "irrigation" }} className="rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-accent">
              Schedule
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* AI recommendation */}
        <div className="lg:col-span-2">
          <AIInsightCard
            actions={
              <>
                <Link to="/nutri-grow" search={{ tab: "ai" }} className="rounded-xl bg-sun px-4 py-2 text-sm font-bold text-sun-foreground">View Analysis</Link>
                <Link to="/ai-assistant" className="rounded-xl border border-primary-foreground/40 px-4 py-2 text-sm font-bold">Ask Krishi AI</Link>
              </>
            }
          >
            Rainfall is expected tomorrow evening. Delay irrigation and reduce today's watering by approximately 30%. Nitrogen in Field A is 18% below target — apply Urea within 3 days.
          </AIInsightCard>

          {/* Moisture trend */}
          <div className="card-hover mt-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Soil Moisture Trend (7 days)</h3>
              <StatusPill tone="blue">Field A vs B</StatusPill>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moistureTrend}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="a" name="Field A" stroke={CHART.green} fill={CHART.green} fillOpacity={0.15} strokeWidth={2.5} />
                  <Area type="monotone" dataKey="b" name="Field B" stroke={CHART.sky} fill={CHART.sky} fillOpacity={0.15} strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Alerts</h3>
            <Link to="/notifications" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>
          <ul className="space-y-2.5">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border bg-background p-3 text-sm font-medium">
                <span className="mt-0.5 shrink-0">{a.icon}</span>
                {a.text}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-secondary p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Market Opportunity</div>
            <p className="mt-1.5 text-sm font-semibold">Tomato ↑ 8.4% today — ₹2,350/quintal at Pune APMC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
