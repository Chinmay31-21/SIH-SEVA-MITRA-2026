import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  AirVent,
  CloudRain,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  Moon,
  Sprout,
  Sun,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
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
  { id: "current", label: "Current Weather" },
  { id: "hourly", label: "Hourly Forecast" },
  { id: "weekly", label: "7-Day Forecast" },
  { id: "alerts", label: "Weather Alerts" },
  { id: "aqi", label: "AQI & Environment" },
] as const;

const hourly = [
  { time: "Now", temp: 29, rain: 12, humidity: 68 },
  { time: "11 AM", temp: 30, rain: 16, humidity: 64 },
  { time: "12 PM", temp: 31, rain: 18, humidity: 61 },
  { time: "1 PM", temp: 32, rain: 22, humidity: 58 },
  { time: "2 PM", temp: 31, rain: 28, humidity: 60 },
  { time: "3 PM", temp: 30, rain: 35, humidity: 65 },
  { time: "4 PM", temp: 29, rain: 72, humidity: 71 },
  { time: "5 PM", temp: 27, rain: 78, humidity: 78 },
  { time: "6 PM", temp: 26, rain: 64, humidity: 82 },
  { time: "7 PM", temp: 25, rain: 42, humidity: 84 },
  { time: "8 PM", temp: 24, rain: 28, humidity: 86 },
  { time: "9 PM", temp: 24, rain: 20, humidity: 87 },
];

const weekly = [
  ["Today", "Partly cloudy", "29°", "22°", "72%", "14 km/h"],
  ["Tue, 6 Sep", "Heavy rain", "27°", "21°", "86%", "18 km/h"],
  ["Wed, 7 Sep", "Cloudy", "28°", "21°", "44%", "12 km/h"],
  ["Thu, 8 Sep", "Sunny", "30°", "20°", "18%", "10 km/h"],
  ["Fri, 9 Sep", "Sunny", "31°", "21°", "12%", "11 km/h"],
  ["Sat, 10 Sep", "Partly cloudy", "30°", "22°", "24%", "13 km/h"],
  ["Sun, 11 Sep", "Light rain", "28°", "21°", "58%", "16 km/h"],
];

export const Route = createFileRoute("/_app/weather")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "WeatherCast — Farm Weather Intelligence | Krishi Mitra" },
      { name: "description", content: "Turn farm weather signals into clear, timely actions." },
      { property: "og:title", content: "WeatherCast — Farm Weather Intelligence" },
      { property: "og:description", content: "Turn farm weather signals into clear, timely actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherCast,
});

function WeatherCast() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState(tab ?? "current");

  return (
    <div>
      <PageHeader
        title="WeatherCast – Farm Weather Intelligence"
        subtitle="Know what the sky means for your fields, before it changes."
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
      {active === "current" && <CurrentTab />}
      {active === "hourly" && <HourlyTab />}
      {active === "weekly" && <WeeklyTab />}
      {active === "alerts" && <AlertsTab />}
      {active === "aqi" && <EnvironmentTab />}
    </div>
  );
}

function WeatherSummary() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="relative overflow-hidden rounded-2xl border bg-sky/15 p-6 shadow-sm">
        <div className="absolute -right-4 -top-7 text-sky/20">
          <CloudSun className="h-44 w-44" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-bold text-sky">
            <CloudSun className="h-4 w-4" /> Nashik, Maharashtra · Updated 10:32 AM
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-6xl font-extrabold tracking-tight">29°</span>
            <span className="pb-2 text-sm font-semibold text-muted-foreground">Partly cloudy</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Feels like 32°C · Good conditions for crop inspection
          </p>
          <div className="mt-6 flex flex-wrap gap-5 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sunrise className="h-4 w-4 text-earth" /> Sunrise 6:12 AM
            </span>
            <span className="flex items-center gap-1.5">
              <Sunset className="h-4 w-4 text-earth" /> Sunset 6:42 PM
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Humidity"
          value="68%"
          sub="Comfortable"
          icon={<Droplets className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Rain Probability"
          value="72%"
          sub="Tomorrow evening"
          icon={<Umbrella className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Wind Speed"
          value="14 km/h"
          sub="From the west"
          icon={<Wind className="h-4 w-4" />}
        />
        <StatCard
          label="UV Index"
          value="6 / 10"
          sub="High at noon"
          icon={<Sun className="h-4 w-4" />}
          tone="sun"
        />
      </div>
    </div>
  );
}

function CurrentTab() {
  return (
    <div className="space-y-6">
      <WeatherSummary />
      <AIInsightCard
        title="What should I do today?"
        actions={
          <button className="rounded-xl bg-sun px-4 py-2 text-sm font-bold text-sun-foreground">
            Plan farm work
          </button>
        }
      >
        Conditions are good for crop inspection and harvesting this morning. Rain is likely tomorrow
        between 4–9 PM, so delay irrigation, avoid pesticide spraying after noon, and move harvested
        produce under cover.
      </AIInsightCard>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricPanel
          icon={<Gauge className="h-5 w-5 text-earth" />}
          title="Atmospheric pressure"
          value="1,012 hPa"
          note="Stable · no storm signal"
        />
        <MetricPanel
          icon={<AirVent className="h-5 w-5 text-sky" />}
          title="Visibility"
          value="8.4 km"
          note="Clear enough for field work"
        />
        <MetricPanel
          icon={<Leaf className="h-5 w-5 text-primary" />}
          title="Spray window"
          value="Before 12 PM"
          note="Low wind and dry leaves"
        />
      </div>
    </div>
  );
}

function HourlyTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold">Next 12 hours</h3>
            <p className="text-xs text-muted-foreground">Rain probability rises after 4 PM</p>
          </div>
          <StatusPill tone="blue">Live forecast</StatusPill>
        </div>
        <div className="h-64 min-w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={560}>
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.sun} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={CHART.sun} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="temp"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="°"
              />
              <YAxis
                yAxisId="rain"
                orientation="right"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip />
              <Area
                yAxisId="temp"
                type="monotone"
                dataKey="temp"
                name="Temperature"
                stroke={CHART.earth}
                fill="url(#tempFill)"
                strokeWidth={2.5}
              />
              <Area
                yAxisId="rain"
                type="monotone"
                dataKey="rain"
                name="Rain chance"
                stroke={CHART.sky}
                fill="none"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-12">
        {hourly.map((item) => (
          <div key={item.time} className="rounded-xl border bg-card p-3 text-center shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground">{item.time}</div>
            <CloudSun className="mx-auto my-2 h-5 w-5 text-sky" />
            <div className="text-sm font-extrabold">{item.temp}°</div>
            <div className="mt-1 text-[10px] font-bold text-sky">{item.rain}% rain</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card shadow-sm">
        {weekly.map(([day, condition, high, low, rain, wind], index) => (
          <div
            key={day}
            className="grid grid-cols-[1.1fr_1.5fr_repeat(4,1fr)] items-center gap-2 border-b p-4 last:border-0 max-sm:grid-cols-2"
          >
            <div className="font-extrabold">
              {day}
              {index === 0 && (
                <div className="text-[10px] font-semibold text-primary">NASHIK FARM</div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudSun className="h-5 w-5 text-sky" />
              {condition}
            </div>
            <div>
              <span className="text-xs text-muted-foreground">High</span>
              <div className="font-bold">{high}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="font-bold">{low}</div>
            </div>
            <div className="text-sm font-bold text-sky">{rain} rain</div>
            <div className="text-sm text-muted-foreground">
              <Wind className="mr-1 inline h-3.5 w-3.5" />
              {wind}
            </div>
          </div>
        ))}
      </div>
      <AIInsightCard title="Plan around the weather">
        Use the dry window on Thursday and Friday for spraying and soil work. Rainfall on Tuesday
        should refill your tank, so keep irrigation off unless Field B moisture falls below 35%.
      </AIInsightCard>
    </div>
  );
}

function AlertsTab() {
  const alerts = [
    {
      title: "Heavy rainfall expected",
      time: "Tomorrow · 4 PM – 9 PM",
      tone: "blue" as const,
      text: "72% chance of 18–24 mm rain near Nashik.",
    },
    {
      title: "High humidity disease risk",
      time: "Tomorrow night",
      tone: "amber" as const,
      text: "Humidity may cross 85%. Inspect tomato leaves for early fungal spots.",
    },
    {
      title: "Wind remains safe for spraying",
      time: "Today · Until noon",
      tone: "green" as const,
      text: "Wind is below 15 km/h. Finish planned applications before the rain window.",
    },
  ];
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <span
            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${alert.tone === "blue" ? "bg-sky/15 text-sky" : alert.tone === "amber" ? "bg-sun/25 text-earth" : "bg-leaf/15 text-primary"}`}
          >
            <CloudRain className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold">{alert.title}</h3>
              <StatusPill tone={alert.tone}>
                {alert.tone === "blue"
                  ? "Plan ahead"
                  : alert.tone === "amber"
                    ? "Watch"
                    : "Favourable"}
              </StatusPill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{alert.text}</p>
            <p className="mt-2 text-xs font-bold text-primary">{alert.time}</p>
          </div>
        </div>
      ))}
      <AIInsightCard title="Farm impact">
        Protect harvested produce, clear drainage around Field A, and postpone pesticide spraying
        until the next dry window. Your soil moisture should improve naturally after this rain.
      </AIInsightCard>
    </div>
  );
}

function EnvironmentTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Air Quality"
          value="42 AQI"
          sub="Good for outdoor work"
          icon={<AirVent className="h-4 w-4" />}
          tone="leaf"
        />
        <StatCard label="PM2.5" value="18 µg/m³" sub="Within safe range" />
        <StatCard
          label="UV Index"
          value="6"
          sub="Use sun protection"
          icon={<Sun className="h-4 w-4" />}
          tone="sun"
        />
        <StatCard
          label="Dew Point"
          value="22°C"
          sub="High moisture tonight"
          icon={<Droplets className="h-4 w-4" />}
          tone="sky"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-leaf/15 p-3 text-primary">
              <Sprout className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-extrabold">Environment is crop-friendly</h3>
              <p className="text-sm text-muted-foreground">
                AQI and temperature support field activity today.
              </p>
            </div>
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[42%] rounded-full bg-leaf" />
          </div>
          <div className="mt-2 flex justify-between text-xs font-bold text-muted-foreground">
            <span>Good</span>
            <span>Moderate</span>
            <span>Poor</span>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-extrabold">Night-time note</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Humidity will stay high overnight. Give tomato foliage room to dry in the morning and
            avoid dense canopy watering.
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold">
            <Moon className="h-4 w-4 text-earth" /> Low visibility after 8:30 PM
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricPanel({
  icon,
  title,
  value,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-2xl font-extrabold">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
