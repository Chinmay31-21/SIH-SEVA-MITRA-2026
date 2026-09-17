import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileCheck2,
  IndianRupee,
  Landmark,
  MapPin,
  PlayCircle,
  Tractor,
  Users,
  Warehouse,
  WalletCards,
} from "lucide-react";
import { AIInsightCard, PageHeader, StatCard, StatusPill } from "@/components/krishi/widgets";

const tabs = [
  ["schemes", "Government Schemes"],
  ["subsidies", "Subsidies & Finance"],
  ["resources", "Shared Resources"],
  ["fpo", "FPO Connect"],
  ["training", "Training & Knowledge"],
  ["opportunities", "Opportunities"],
] as const;
const schemes = [
  [
    "PM-KISAN",
    "Income support of ₹6,000 per year in three instalments.",
    "Small and marginal farmers with cultivable land",
    "31 Dec 2026",
    "Aadhaar · Land record · Bank account",
    "High match",
  ],
  [
    "PM Fasal Bima Yojana",
    "Crop insurance against weather, pests and disease losses.",
    "Farmers growing notified crops",
    "15 Sep 2026",
    "Aadhaar · Sowing certificate · Bank details",
    "Eligible",
  ],
  [
    "Micro Irrigation Subsidy",
    "Up to 55% support for drip and sprinkler systems.",
    "Small / marginal farmers and FPOs",
    "30 Nov 2026",
    "Land record · Quotation · Water source proof",
    "Apply soon",
  ],
  [
    "Kisan Credit Card",
    "Flexible credit for crop inputs at supported interest rates.",
    "Land-owning and tenant farmers",
    "Open all year",
    "Identity · Land / lease record · Bank details",
    "Eligible",
  ],
];
const resources = [
  ["Tractor rental", "Mahindra 575 DI", "₹1,400 / hour", "6.2 km", "Available tomorrow", "Tractor"],
  ["Drone spraying", "Sahyadri AgriTech", "₹450 / acre", "11 km", "3 slots this week", "Drone"],
  [
    "Cold storage",
    "Krishi Warehouse",
    "₹24 / quintal / day",
    "4.3 km",
    "38 tonnes open",
    "Storage",
  ],
  ["Soil testing", "District Soil Lab", "₹180 / sample", "8.8 km", "Appointments open", "Soil"],
];
const trainings = [
  [
    "Crop Management",
    "Tomato flowering stage: the 5 decisions that protect yield",
    "Video",
    "18 min",
    "4.9",
  ],
  [
    "Financial Literacy",
    "Understand mandi prices, offers and payment terms",
    "Guide",
    "8 min",
    "4.8",
  ],
  [
    "Government Schemes",
    "How to prepare documents for subsidy applications",
    "Audio",
    "12 min",
    "4.7",
  ],
  ["Post-Harvest", "Reduce tomato waste with grading and storage", "Course", "4 lessons", "4.9"],
];

export const Route = createFileRoute("/_app/empowerment")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Farmer Empowerment — Schemes & Resources | Krishi Mitra" },
    { name: "description", content: "Find government schemes, subsidies, shared resources, FPOs and practical farm training." },
    { property: "og:title", content: "Farmer Empowerment — Schemes & Resources" },
    { property: "og:description", content: "Technology, opportunities and resources for every farmer." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Empowerment,
});

function Empowerment() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState(tab ?? "schemes");
  return (
    <div>
      <PageHeader
        title="Farmer Empowerment"
        subtitle="Technology, opportunities and resources for every farmer."
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
      {active === "schemes" && <SchemesTab />}
      {active === "subsidies" && <SubsidiesTab />}
      {active === "resources" && <ResourcesTab />}
      {active === "fpo" && <FpoTab />}
      {active === "training" && <TrainingTab />}
      {active === "opportunities" && <OpportunitiesTab />}
    </div>
  );
}

function SchemesTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Matched schemes"
          value="7"
          sub="Based on your farm profile"
          tone="leaf"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
        <StatCard
          label="Potential support"
          value="₹86,400"
          sub="Across available schemes"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Next deadline"
          value="15 Sep"
          sub="Crop insurance"
          tone="sun"
          icon={<Clock3 className="h-4 w-4" />}
        />
        <StatCard label="Documents ready" value="4 / 5" sub="One upload remaining" tone="sky" />
      </div>
      <AIInsightCard
        title="Krishi AI scheme matcher"
        actions={
          <button className="rounded-xl bg-sun px-4 py-2 text-sm font-bold text-sun-foreground">
            Check my eligibility
          </button>
        }
      >
        Based on your 6.3-acre farm, tomato and onion crops, and Nashik location, you may qualify
        for 7 schemes. Crop insurance and micro irrigation support have the nearest deadlines.
      </AIInsightCard>
      <div className="grid gap-4 md:grid-cols-2">
        {schemes.map(([name, benefit, eligibility, deadline, documents, match]) => (
          <div key={name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-xl bg-secondary p-3 text-primary">
                <Landmark className="h-5 w-5" />
              </span>
              <StatusPill tone={match === "Apply soon" ? "amber" : "green"}>{match}</StatusPill>
            </div>
            <h3 className="mt-4 text-lg font-extrabold">{name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{benefit}</p>
            <div className="mt-4 space-y-2 text-xs">
              <div>
                <span className="font-bold">Eligibility: </span>
                {eligibility}
              </div>
              <div>
                <span className="font-bold">Deadline: </span>
                <span className={match === "Apply soon" ? "font-bold text-destructive" : ""}>
                  {deadline}
                </span>
              </div>
              <div className="text-muted-foreground">
                <span className="font-bold text-foreground">Documents: </span>
                {documents}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">
                Check eligibility
              </button>
              <button className="rounded-xl border px-3 py-2.5 text-xs font-bold text-primary">
                View scheme
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubsidiesTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-primary p-6 text-primary-foreground shadow-sm">
          <WalletCards className="h-7 w-7 text-sun" />
          <h2 className="mt-4 text-2xl font-extrabold">Finance made easier</h2>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">
            Compare assistance for inputs, irrigation, insurance and farm equipment in one place.
          </p>
          <button className="mt-5 rounded-xl bg-sun px-4 py-3 text-xs font-bold text-sun-foreground">
            Start finance check
          </button>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="font-extrabold">Your application checklist</h3>
          {[
            ["Aadhaar linked", true],
            ["Land record uploaded", true],
            ["Bank account verified", true],
            ["Latest crop declaration", false],
          ].map(([label, done]) => (
            <div key={label as string} className="mt-4 flex items-center gap-3 text-sm">
              <CheckCircle2
                className={`h-5 w-5 ${done ? "text-primary" : "text-muted-foreground"}`}
              />
              <span className={done ? "font-semibold" : "text-muted-foreground"}>
                {label as string}
              </span>
              {!done && <StatusPill tone="amber">Needed</StatusPill>}
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FinanceCard
          title="Input assistance"
          amount="Up to ₹25,000"
          text="Support for certified seed, fertilizer and crop protection."
        />
        <FinanceCard
          title="Solar pump subsidy"
          amount="Up to 60%"
          text="For eligible small and marginal farmers installing solar pumps."
        />
        <FinanceCard
          title="Crop insurance"
          amount="From ₹380 / acre"
          text="Protect your seasonal investment against weather risks."
        />
      </div>
    </div>
  );
}

function ResourcesTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold">Shared resources near you</h2>
        <p className="text-sm text-muted-foreground">
          Access good equipment and services without carrying the full cost alone.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {resources.map(([name, provider, price, distance, availability, icon]) => (
          <div key={name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-secondary p-3 text-primary">
                {icon === "Storage" ? (
                  <Warehouse className="h-5 w-5" />
                ) : icon === "Tractor" ? (
                  <Tractor className="h-5 w-5" />
                ) : icon === "Soil" ? (
                  <Landmark className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </span>
              <StatusPill tone="green">{availability}</StatusPill>
            </div>
            <h3 className="mt-4 font-extrabold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{provider}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-extrabold text-primary">{price}</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {distance}
              </span>
            </div>
            <button className="mt-4 w-full rounded-xl border-2 border-primary px-3 py-2.5 text-xs font-bold text-primary hover:bg-accent">
              View and reserve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FpoTab() {
  const fpos = [
    [
      "Sahyadri Farmer Producer Company",
      "1,840 members",
      "Tomato · Grapes",
      "12 km",
      "Collective selling · Storage · Processing",
    ],
    [
      "Nashik Valley FPO",
      "920 members",
      "Onion · Wheat",
      "18 km",
      "Market access · Input buying · Credit",
    ],
    [
      "Godavari Small Farmers FPO",
      "640 members",
      "Vegetables · Maize",
      "23 km",
      "Machinery · Training · Transport",
    ],
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-leaf/15 p-5">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-extrabold">Stronger together</h3>
            <p className="text-sm text-muted-foreground">
              FPOs help small farmers buy, store and sell with more bargaining power.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {fpos.map(([name, members, crops, distance, benefits]) => (
          <div key={name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
              <Users className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-extrabold">{name}</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {members} · {distance}
            </p>
            <p className="mt-3 text-xs font-bold text-primary">{crops}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{benefits}</p>
            <button className="mt-5 w-full rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">
              Learn more
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingTab() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Training & knowledge</h2>
          <p className="text-sm text-muted-foreground">
            Short, practical learning for the next decision on your farm.
          </p>
        </div>
        <button className="rounded-xl border-2 border-primary px-4 py-3 text-xs font-bold text-primary">
          Browse all lessons
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {trainings.map(([title, description, type, duration, rating]) => (
          <div key={title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              {type === "Video" ? (
                <PlayCircle className="h-6 w-6" />
              ) : type === "Guide" ? (
                <BookOpen className="h-6 w-6" />
              ) : (
                <Clock3 className="h-6 w-6" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <StatusPill tone="blue">{type}</StatusPill>
                <span className="text-xs font-bold text-earth">★ {rating}</span>
              </div>
              <h3 className="mt-2 font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{duration}</span>
                <button className="font-bold text-primary">Start lesson →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunitiesTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Nearby opportunities" value="12" sub="Matching your crops" tone="leaf" />
        <StatCard label="Open this week" value="5" sub="Markets and training" tone="sun" />
        <StatCard
          label="Potential income"
          value="₹38,000"
          sub="From current matches"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <StatCard
          label="Travel range"
          value="25 km"
          sub="From Nashik farm"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Opportunity
          title="Sell tomato surplus to Rahul Foods"
          type="Market linkage"
          detail="Buyer needs 2 tonnes of Grade A tomato by 22 September."
          value="₹28/kg"
          deadline="Respond in 2 days"
          tone="green"
        />
        <Opportunity
          title="Free drip irrigation training"
          type="Training"
          detail="District agriculture office · 2-day practical session."
          value="Free"
          deadline="Starts 12 Sep"
          tone="blue"
        />
        <Opportunity
          title="Shared cold-chain transport"
          type="Shared resource"
          detail="Nashik to Pune route with 6 farmers already booked."
          value="₹3.20/kg"
          deadline="Booking closes Friday"
          tone="amber"
        />
        <Opportunity
          title="FPO quality grading role"
          type="Community"
          detail="Sahyadri FPO is looking for seasonal crop graders."
          value="₹900/day"
          deadline="Apply by 18 Sep"
          tone="green"
        />
      </div>
    </div>
  );
}

function FinanceCard({ title, amount, text }: { title: string; amount: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <WalletCards className="h-5 w-5 text-primary" />
      <h3 className="mt-4 font-extrabold">{title}</h3>
      <div className="mt-2 text-2xl font-extrabold text-primary">{amount}</div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <button className="mt-4 text-xs font-bold text-primary">Check details →</button>
    </div>
  );
}
function Opportunity({
  title,
  type,
  detail,
  value,
  deadline,
  tone,
}: {
  title: string;
  type: string;
  detail: string;
  value: string;
  deadline: string;
  tone: "green" | "blue" | "amber";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <StatusPill tone={tone}>{type}</StatusPill>
        <span className="text-lg font-extrabold text-primary">{value}</span>
      </div>
      <h3 className="mt-4 font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {deadline}
        </span>
        <button className="font-bold text-primary">View opportunity →</button>
      </div>
    </div>
  );
}
