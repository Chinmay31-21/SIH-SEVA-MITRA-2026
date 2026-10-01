import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { PageHeader, StatCard, StatusPill, AIInsightCard, CHART } from "@/components/krishi/widgets";
import { fields, soilMetrics, aiSuggestions, fertilizerPlan, diseaseResult, cropRecommendations } from "@/lib/krishi-data";
import { Sprout, FlaskConical, Bug, TrendingUp, UploadCloud, Info, CheckCircle2 } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const tabs = [
  { id: "health", label: "Crop & Plant Health" },
  { id: "soil", label: "Soil & Land" },
  { id: "ai", label: "AI Suggestions" },
  { id: "fertilizer", label: "Fertilizer" },
  { id: "pest", label: "Pest & Disease" },
  { id: "demand", label: "What to Grow Next" },
] as const;

export const Route = createFileRoute("/_app/nutri-grow")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "NutriGrow — Intelligent Crop Health | Krishi Mitra" },
      { name: "description", content: "Understand what your crops need before they show stress: soil, nutrients, pests and AI crop planning." },
      { property: "og:title", content: "NutriGrow — Intelligent Crop Health" },
      { property: "og:description", content: "AI crop health, soil intelligence and fertilizer planning." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NutriGrow,
});

function NutriGrow() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState<string>(tab ?? "health");

  return (
    <div>
      <PageHeader title="NutriGrow – Intelligent Crop Health" subtitle="Understand what your crops need, before they show signs of stress." />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${active === t.id ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-accent"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "health" && <HealthTab />}
      {active === "soil" && <SoilTab />}
      {active === "ai" && <AITab />}
      {active === "fertilizer" && <FertilizerTab />}
      {active === "pest" && <PestTab />}
      {active === "demand" && <DemandTab />}
    </div>
  );
}

function HealthTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Crop Health" value="82%" sub="Across 3 fields" icon={<Sprout className="h-4 w-4" />} />
        <StatCard label="Soil Fertility" value="74%" sub="N low" icon={<FlaskConical className="h-4 w-4" />} />
        <StatCard label="Growth Stage" value="Flower" sub="Tomato" />
        <StatCard label="Expected Yield" value="9.2 t" sub="This season" />
        <StatCard label="Disease Risk" value="Low" sub="Watch humidity" icon={<Bug className="h-4 w-4" />} />
        <StatCard label="Water Need" value="1,250 L" sub="Field A today" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {fields.map((f) => (
          <div key={f.id} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold">{f.name} — {f.crop}</h3>
              <StatusPill tone={f.status === "Healthy" ? "green" : "amber"}>{f.status}</StatusPill>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="flex justify-between text-xs font-semibold text-muted-foreground"><span>Health</span><span>{f.health}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${f.health}%` }} /></div>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stage</span><span className="font-bold">{f.stage}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Moisture</span><span className="font-bold">{f.moisture}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Harvest in</span><span className="font-bold">{f.harvestDays} days</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="mb-5 text-sm font-bold uppercase tracking-wide text-muted-foreground">Tomato — Growth Timeline (Field A)</h3>
        <div className="flex items-center gap-0 overflow-x-auto">
          {["Sowing", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvest"].map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${i <= 3 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}>
                  {i <= 3 ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </span>
                <span className={`whitespace-nowrap text-[11px] font-bold ${i <= 3 ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < 5 && <div className={`mx-1 h-0.5 flex-1 ${i < 3 ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoilTab() {
  const gaugeData = soilMetrics.slice(0, 4).map((m, i) => ({ ...m, fill: [CHART.green, CHART.sky, CHART.sun, CHART.earth][i] }));
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {soilMetrics.map((m) => (
          <div key={m.label} className="card-hover rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">{m.label}</span>
              <StatusPill tone={m.status === "Low" ? "red" : m.status === "Medium" ? "amber" : "green"}>{m.status}</StatusPill>
            </div>
            <div className="mt-2 text-xl font-extrabold">{m.value}{m.unit}</div>
            <div className="mt-2 h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${m.status === "Low" ? "bg-destructive" : m.status === "Medium" ? "bg-sun" : "bg-leaf"}`}
                style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{m.note}</p>
          </div>
        ))}
      </div>
      <AIInsightCard>
        Your soil condition is generally healthy. Nitrogen levels are approximately 18% below the recommended range for the flowering stage — apply Urea within 3 days for best fruit set.
      </AIInsightCard>
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Field Comparison — NPK Levels</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="25%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" background cornerRadius={8} />
              <Tooltip formatter={(v: number, n: string, p: { payload?: { label?: string; unit?: string } }) => [`${v}${p?.payload?.unit ?? ""}`, p?.payload?.label]} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AITab() {
  return (
    <div className="space-y-4">
      {aiSuggestions.map((s) => (
        <div key={s.title} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-extrabold">{s.title}</h3>
            <StatusPill tone={s.priority === "High" ? "red" : s.priority === "Medium" ? "amber" : "blue"}>{s.priority} Priority</StatusPill>
          </div>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-xl bg-muted p-3"><span className="text-xs font-bold uppercase text-muted-foreground">Why</span><p className="mt-1">{s.reason}</p></div>
            <div className="rounded-xl bg-accent p-3"><span className="text-xs font-bold uppercase text-primary">What to do</span><p className="mt-1">{s.action}</p></div>
            <div className="rounded-xl bg-sun/20 p-3"><span className="text-xs font-bold uppercase text-earth">Benefit</span><p className="mt-1">{s.benefit}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FertilizerTab() {
  const rows = [
    ["Detected Deficiency", fertilizerPlan.deficiency],
    ["Recommended Fertilizer", fertilizerPlan.fertilizer],
    ["Quantity", fertilizerPlan.quantity],
    ["Application Method", fertilizerPlan.method],
    ["Best Application Date", fertilizerPlan.bestDate],
    ["Safety", fertilizerPlan.safety],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="font-extrabold">Fertilizer Plan — Field A (Tomato)</h3>
        </div>
        <dl className="mt-4 divide-y">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-2 gap-3 py-3 text-sm">
              <dt className="font-semibold text-muted-foreground">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <button className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          Mark as Applied
        </button>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h3 className="font-extrabold">Nutrient Gap</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { n: "Nitrogen", current: 38, ideal: 55 },
              { n: "Phosphorus", current: 52, ideal: 50 },
              { n: "Potassium", current: 61, ideal: 60 },
            ]}>
              <XAxis dataKey="n" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="current" name="Current" fill={CHART.leaf} radius={[6, 6, 0, 0]} />
              <Bar dataKey="ideal" name="Ideal" fill={CHART.sun} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground">kg/acre — green is your soil, gold is the target.</p>
      </div>
    </div>
  );
}

function PestTab() {
  const [analyzed, setAnalyzed] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <button
          onClick={() => setAnalyzed(true)}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary/40 bg-accent/50 p-12 text-center transition-colors hover:bg-accent"
        >
          <UploadCloud className="h-10 w-10 text-primary" />
          <span className="font-extrabold">Upload Crop Image</span>
          <span className="text-xs text-muted-foreground">Tap to take a photo or drag & drop — AI will check for pests and disease</span>
          {analyzed && <StatusPill tone="green">Image analyzed ✓</StatusPill>}
        </button>
      </div>
      {analyzed ? (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">AI Analysis Result</h3>
            <StatusPill tone="amber">{diseaseResult.severity}</StatusPill>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-destructive/10 p-3"><div className="text-xs font-bold text-destructive">Disease Detected</div><div className="text-lg font-extrabold">{diseaseResult.disease}</div></div>
            <div className="rounded-xl bg-secondary p-3"><div className="text-xs font-bold text-muted-foreground">Confidence</div><div className="text-lg font-extrabold">{diseaseResult.confidence}%</div></div>
          </div>
          <h4 className="mt-5 text-sm font-bold">Treatment</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{diseaseResult.treatment.map((t) => <li key={t}>{t}</li>)}</ul>
          <h4 className="mt-4 text-sm font-bold">Prevention</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{diseaseResult.prevention.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          <Bug className="mb-3 h-8 w-8" />
          <p className="text-sm font-semibold">Upload a leaf photo to see AI diagnosis here.</p>
        </div>
      )}
    </div>
  );
}

function DemandTab() {
  const [why, setWhy] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <AIInsightCard title="What Should I Grow Next?">
        Based on your soil, season, water availability and live mandi demand — here are your best next crops.
      </AIInsightCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cropRecommendations.map((c) => (
          <div key={c.crop} className="card-hover flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{c.crop}</h3>
              <StatusPill tone={c.risk === "Low" ? "green" : "amber"}>{c.risk} Risk</StatusPill>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground"><span>Suitability</span><span>{c.suitability}%</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-leaf" style={{ width: `${c.suitability}%` }} /></div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Demand</dt><dd className="font-bold">{c.demand}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Water</dt><dd className="font-bold">{c.water}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Investment</dt><dd className="font-bold">{c.investment}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Revenue</dt><dd className="font-bold">{c.revenue}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Profit</dt><dd className="font-bold text-primary">{c.profit}</dd></div>
            </dl>
            <button
              onClick={() => setWhy(why === c.crop ? null : c.crop)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-primary px-3 py-2 text-xs font-bold text-primary hover:bg-accent"
            >
              <Info className="h-3.5 w-3.5" /> Why is this recommended?
            </button>
            {why === c.crop && <p className="mt-3 rounded-xl bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">{c.why}</p>}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Prices and demand updated daily from 40+ mandis across Maharashtra, MP and Punjab.</div>
    </div>
  );
}
