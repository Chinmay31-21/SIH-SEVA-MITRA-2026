import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  BatteryCharging,
  CheckCircle2,
  Droplets,
  Gauge,
  Leaf,
  Power,
  Radio,
  Settings2,
  Sun,
  Thermometer,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AIInsightCard,
  CHART,
  PageHeader,
  StatCard,
  StatusPill,
} from "@/components/krishi/widgets";

const tabs = [
  { id: "solar", label: "Solar Dashboard" },
  { id: "irrigation", label: "Smart Irrigation" },
  { id: "soil", label: "Soil Monitoring" },
  { id: "pump", label: "Motor / Pump" },
  { id: "water", label: "Water Consumption" },
  { id: "sensors", label: "Sensor Network" },
] as const;

const energy = [
  { hour: "6 AM", generation: 0.8, consumption: 0.4 },
  { hour: "8 AM", generation: 2.4, consumption: 0.9 },
  { hour: "10 AM", generation: 4.1, consumption: 1.3 },
  { hour: "12 PM", generation: 5.8, consumption: 1.6 },
  { hour: "2 PM", generation: 5.2, consumption: 2.1 },
  { hour: "4 PM", generation: 3.7, consumption: 1.7 },
  { hour: "6 PM", generation: 1.2, consumption: 1.1 },
];

const moisture = [
  { day: "Mon", fieldA: 52, fieldB: 46 },
  { day: "Tue", fieldA: 49, fieldB: 43 },
  { day: "Wed", fieldA: 46, fieldB: 40 },
  { day: "Thu", fieldA: 44, fieldB: 38 },
  { day: "Fri", fieldA: 42, fieldB: 36 },
  { day: "Sat", fieldA: 43, fieldB: 38 },
  { day: "Sun", fieldA: 41, fieldB: 38 },
];

export const Route = createFileRoute("/_app/surya-shakti")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({ meta: [
    { title: "SuryaShakti — Smart Farm Control Centre | Krishi Mitra" },
    { name: "description", content: "Monitor solar energy, smart irrigation, soil sensors and farm water use." },
    { property: "og:title", content: "SuryaShakti — Smart Farm Control Centre" },
    { property: "og:description", content: "Solar energy, soil sensors and irrigation working together." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SuryaShakti,
});

function SuryaShakti() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState(tab ?? "solar");
  return (
    <div>
      <PageHeader
        title="SuryaShakti – Smart Farm Control Centre"
        subtitle="Solar energy, soil sensors and irrigation working together for every litre and leaf."
      />
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-colors ${active === item.id ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-accent"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {active === "solar" && <SolarTab />}
      {active === "irrigation" && <IrrigationTab />}
      {active === "soil" && <SoilTab />}
      {active === "pump" && <PumpTab />}
      {active === "water" && <WaterTab />}
      {active === "sensors" && <SensorTab />}
    </div>
  );
}

function SolarTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Current Generation"
          value="3.8 kW"
          sub="94% panel efficiency"
          icon={<Sun className="h-4 w-4" />}
          tone="sun"
        />
        <StatCard
          label="Today's Generation"
          value="18.7 kWh"
          sub="+12% vs yesterday"
          icon={<Zap className="h-4 w-4" />}
        />
        <StatCard
          label="Energy Consumed"
          value="11.2 kWh"
          sub="60% of generation"
          icon={<Power className="h-4 w-4" />}
        />
        <StatCard
          label="Stored Energy"
          value="6.4 kWh"
          sub="78% battery"
          icon={<BatteryCharging className="h-4 w-4" />}
          tone="leaf"
        />
        <StatCard
          label="Panel Efficiency"
          value="94%"
          sub="All panels online"
          icon={<Gauge className="h-4 w-4" />}
        />
        <StatCard
          label="CO₂ Saved"
          value="8.6 kg"
          sub="This week"
          icon={<Leaf className="h-4 w-4" />}
          tone="sky"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ChartCard title="Energy flow today" subtitle="Generation compared with farm consumption">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={energy}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" kW" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="generation"
                name="Solar generation"
                stroke={CHART.sun}
                fill={CHART.sun}
                fillOpacity={0.25}
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                name="Farm consumption"
                stroke={CHART.green}
                fill={CHART.green}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-sun/25 p-3 text-earth">
              <Sun className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold">Solar is powering the farm</h3>
              <p className="text-sm text-muted-foreground">
                Enough energy for today's irrigation cycle.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <EnergyRow label="Panels" value="3.8 kW" percent={94} color="bg-sun" />
            <EnergyRow label="Battery" value="78%" percent={78} color="bg-leaf" />
            <EnergyRow label="Pump reserve" value="2.1 hours" percent={62} color="bg-sky" />
          </div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 text-sm font-bold text-primary hover:bg-accent">
            <Settings2 className="h-4 w-4" />
            Manage energy priorities
          </button>
        </div>
      </div>
      <AIInsightCard title="SuryaShakti insight">
        Solar generation will peak between 11 AM and 2 PM. Schedule the Field A irrigation cycle in
        that window to use direct solar power and preserve 1.4 kWh of battery energy.
      </AIInsightCard>
    </div>
  );
}

function IrrigationTab() {
  const [auto, setAuto] = useState(true);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Field A Moisture"
          value="38%"
          sub="Below optimal"
          tone="sky"
          icon={<Droplets className="h-4 w-4" />}
        />
        <StatCard
          label="Water Requirement"
          value="1,250 L"
          sub="Recommended today"
          icon={<Waves className="h-4 w-4" />}
        />
        <StatCard
          label="Tank Level"
          value="78%"
          sub="4,680 litres"
          tone="leaf"
          icon={<Droplets className="h-4 w-4" />}
        />
        <StatCard
          label="Pump Status"
          value="Ready"
          sub="Zone A selected"
          tone="sun"
          icon={<Power className="h-4 w-4" />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <AIInsightCard
          title="Irrigation recommendation"
          actions={
            <>
              <button className="rounded-xl bg-sun px-4 py-2 text-sm font-bold text-sun-foreground">
                Start for 22 min
              </button>
              <button className="rounded-xl border border-primary-foreground/40 px-4 py-2 text-sm font-bold">
                Schedule
              </button>
            </>
          }
        >
          <strong>Field A needs water today.</strong> Moisture is 38%, tomato is in flowering stage
          and no significant rainfall is expected for the next 18 hours.
        </AIInsightCard>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold">Smart irrigation</h3>
              <p className="text-xs text-muted-foreground">Let sensors adjust watering</p>
            </div>
            <button
              onClick={() => setAuto(!auto)}
              aria-label="Toggle automatic irrigation"
              className={`relative h-7 w-12 rounded-full transition-colors ${auto ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${auto ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="font-semibold">Mode</span>
            <StatusPill tone={auto ? "green" : "amber"}>{auto ? "Automatic" : "Manual"}</StatusPill>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[38%] rounded-full bg-sky" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>38% current</span>
            <span>55% optimal</span>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ZoneCard name="Zone A · Tomato" moisture="38%" status="Needs irrigation" tone="amber" />
        <ZoneCard name="Zone B · Onion" moisture="51%" status="Scheduled 2 PM" tone="blue" />
        <ZoneCard name="Zone C · Wheat" moisture="64%" status="Moisture sufficient" tone="green" />
      </div>
    </div>
  );
}

function SoilTab() {
  const sensors = [
    ["Soil Moisture", "38", "%", "Low", "35–65%", "blue"],
    ["Soil Temperature", "24.6", "°C", "Optimal", "18–30°C", "green"],
    ["pH Level", "6.7", "", "Good", "6.0–7.5", "green"],
    ["Nitrogen", "42", "kg/acre", "Low", "50–80", "amber"],
    ["Phosphorus", "48", "kg/acre", "Optimal", "35–60", "green"],
    ["Potassium", "61", "kg/acre", "Optimal", "45–75", "green"],
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {sensors.map(([label, value, unit, status, range, tone]) => (
          <div key={label} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-muted-foreground">{label}</span>
              <StatusPill tone={tone === "amber" ? "amber" : tone === "blue" ? "blue" : "green"}>
                {status}
              </StatusPill>
            </div>
            <div className="mt-3 text-2xl font-extrabold">
              {value}
              <span className="ml-1 text-sm font-bold text-muted-foreground">{unit}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${status === "Low" ? "w-[45%] bg-sun" : "w-[78%] bg-leaf"}`}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">Optimal range: {range}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ChartCard title="Soil moisture trend" subtitle="Field A and Field B · last 7 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moisture}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[25, 70]}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="fieldA"
                name="Field A"
                stroke={CHART.sky}
                fill={CHART.sky}
                fillOpacity={0.18}
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="fieldB"
                name="Field B"
                stroke={CHART.earth}
                fill={CHART.earth}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Radio className="h-5 w-5" />
            <h3 className="font-extrabold">Sensor health</h3>
          </div>
          <div className="mt-5 space-y-4">
            <SensorLine name="Moisture probe · Field A" battery="86%" />
            <SensorLine name="NPK sensor · Field A" battery="72%" />
            <SensorLine name="Temperature · Field B" battery="94%" />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            All readings updated less than 5 minutes ago.
          </p>
        </div>
      </div>
    </div>
  );
}

function PumpTab() {
  const [running, setRunning] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full ${running ? "bg-leaf/20 text-primary" : "bg-muted text-muted-foreground"}`}
          >
            <Power className="h-10 w-10" />
          </div>
        </div>
        <h3 className="mt-5 text-xl font-extrabold">Pump {running ? "running" : "ready"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {running ? "Zone A · 22 minutes remaining" : "Last run yesterday at 6:20 AM"}
        </p>
        {confirm ? (
          <div className="mt-6 rounded-xl bg-sun/20 p-4 text-left">
            <p className="text-sm font-bold">Start Zone A for 22 minutes?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This will use approximately 1,250 litres.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setRunning(true);
                  setConfirm(false);
                }}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                Confirm start
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg border px-3 py-2 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => (running ? setRunning(false) : setConfirm(true))}
            className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold ${running ? "border-2 border-destructive text-destructive" : "bg-primary text-primary-foreground"}`}
          >
            {running ? "Stop pump" : "Start pump"}
          </button>
        )}
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Water tank" value="78%" sub="4,680 L available" tone="sky" />
          <StatCard label="Flow rate" value={running ? "56 L/min" : "0 L/min"} sub="Zone A" />
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-extrabold">Pump settings</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Irrigation zone
              <select className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal">
                <option>Zone A · Tomato</option>
                <option>Zone B · Onion</option>
                <option>Zone C · Wheat</option>
              </select>
            </label>
            <label className="text-sm font-bold">
              Duration
              <select className="mt-2 h-11 w-full rounded-xl border bg-background px-3 text-sm font-normal">
                <option>22 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-secondary p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
            Auto-stop is enabled to prevent overwatering.
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterTab() {
  const data = [
    { day: "Mon", used: 3.4, target: 4 },
    { day: "Tue", used: 3.8, target: 4 },
    { day: "Wed", used: 4.2, target: 4 },
    { day: "Thu", used: 2.9, target: 4 },
    { day: "Fri", used: 3.6, target: 4 },
    { day: "Sat", used: 3.1, target: 4 },
    { day: "Sun", used: 2.4, target: 4 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Used today"
          value="2,430 L"
          sub="1,570 L below daily cap"
          icon={<Droplets className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard label="Weekly use" value="23,400 L" sub="87% of target" />
        <StatCard
          label="Saved this month"
          value="18,200 L"
          sub="vs conventional irrigation"
          icon={<Leaf className="h-4 w-4" />}
          tone="leaf"
        />
        <StatCard
          label="Tank refill"
          value="Tomorrow"
          sub="Rainwater forecast"
          icon={<Waves className="h-4 w-4" />}
          tone="sun"
        />
      </div>
      <ChartCard
        title="Water consumption"
        subtitle="Thousands of litres · actual use vs daily target"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="used" name="Used" fill={CHART.sky} radius={[6, 6, 0, 0]} />
            <Bar
              dataKey="target"
              name="Target"
              fill={CHART.leaf}
              fillOpacity={0.3}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <AIInsightCard title="Water saving opportunity">
        Field B is using 12% more water than its crop stage needs. Switch Zone B to automatic mode
        and save an estimated 2,800 litres this week.
      </AIInsightCard>
    </div>
  );
}

function SensorTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold">Connected sensor network</h3>
            <p className="text-sm text-muted-foreground">
              Five devices reporting across three fields
            </p>
          </div>
          <StatusPill tone="green">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />5 online
          </StatusPill>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            ["Moisture probe", "Field A", "38%", "86% battery"],
            ["NPK sensor", "Field A", "Online", "72% battery"],
            ["Temperature probe", "Field B", "24.6°C", "94% battery"],
            ["Tank level sensor", "Water tank", "78%", "81% battery"],
            ["Weather station", "Farm entrance", "Online", "100% battery"],
          ].map(([name, location, value, battery]) => (
            <div key={name} className="flex items-center gap-3 rounded-xl border p-4">
              <span className="rounded-xl bg-secondary p-2.5 text-primary">
                <Radio className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-bold">{name}</h4>
                  <span className="h-2 w-2 rounded-full bg-leaf" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {location} · {battery}
                </p>
              </div>
              <span className="text-sm font-extrabold">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={<Thermometer className="h-5 w-5" />}
          label="Average soil temperature"
          value="24.6°C"
          note="+0.8°C this week"
        />
        <MetricCard
          icon={<Wind className="h-5 w-5" />}
          label="Wind at field edge"
          value="14 km/h"
          note="Safe for spraying"
        />
        <MetricCard
          icon={<Gauge className="h-5 w-5" />}
          label="Network uptime"
          value="99.2%"
          note="Last 30 days"
        />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <h3 className="font-extrabold">{title}</h3>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}
function EnergyRow({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
function ZoneCard({
  name,
  moisture: value,
  status,
  tone,
}: {
  name: string;
  moisture: string;
  status: string;
  tone: "green" | "amber" | "blue";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-extrabold">{name}</h3>
        <StatusPill tone={tone}>{status}</StatusPill>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-3xl font-extrabold">{value}</div>
          <div className="text-xs text-muted-foreground">soil moisture</div>
        </div>
        <Droplets className="h-8 w-8 text-sky" />
      </div>
    </div>
  );
}
function SensorLine({ name, battery }: { name: string; battery: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2 w-2 rounded-full bg-leaf" />
      <span className="flex-1 font-semibold">{name}</span>
      <span className="text-xs text-muted-foreground">{battery}</span>
    </div>
  );
}
function MetricCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
