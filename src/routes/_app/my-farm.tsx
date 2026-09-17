import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { MapPin, Plus, Sprout, Tractor, Waves } from "lucide-react";
import { PageHeader, StatCard, StatusPill } from "@/components/krishi/widgets";

export const Route = createFileRoute("/_app/my-farm")({
  head: () => ({ meta: [
    { title: "My Farm — Fields & Crops | Krishi Mitra" },
    { name: "description", content: "Manage your fields, crops, land details, water source and upcoming farm work." },
    { property: "og:title", content: "My Farm — Fields & Crops" },
    { property: "og:description", content: "One clear view of your land, crops and the decisions ahead." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: MyFarm,
});
const fieldData = [
  ["Field A", "2.5 acres", "Tomato", "Flowering", "91%", "Healthy", "38%"],
  ["Field B", "1.8 acres", "Onion", "Bulb formation", "76%", "Attention", "51%"],
  ["Field C", "3.0 acres", "Wheat", "Grain filling", "88%", "Healthy", "64%"],
];
function MyFarm() {
  return (
    <div>
      <PageHeader
        title="My Farm"
        subtitle="One clear view of your land, crops and the decisions ahead."
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Farm name" value="Patil Farm" sub="Ramesh Patil" />
        <StatCard
          label="Total area"
          value="7.3 acres"
          sub="3 active fields"
          icon={<Tractor className="h-4 w-4" />}
        />
        <StatCard
          label="Water source"
          value="Borewell"
          sub="Solar pump connected"
          icon={<Waves className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Soil type"
          value="Black soil"
          sub="pH 6.7 · healthy"
          icon={<Sprout className="h-4 w-4" />}
          tone="leaf"
        />
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Your fields</h2>
          <p className="text-sm text-muted-foreground">
            Each field connects to crop health, weather and irrigation.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground">
          <Plus className="h-4 w-4" />
          Add field
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {fieldData.map(([name, area, crop, stage, health, status, moisture]) => (
          <div key={name} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">{name}</h3>
              <StatusPill tone={status === "Healthy" ? "green" : "amber"}>{status}</StatusPill>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              Nashik · {area}
            </div>
            <div className="mt-5 rounded-xl bg-secondary p-4">
              <div className="flex items-center gap-2 text-primary">
                <Sprout className="h-4 w-4" />
                <span className="font-extrabold">{crop}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{stage}</p>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crop health</span>
                <b>{health}</b>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-leaf" style={{ width: health }} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soil moisture</span>
                <b>{moisture}</b>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Link
                to="/nutri-grow"
                className="flex-1 rounded-xl border px-2 py-2 text-center text-xs font-bold text-primary"
              >
                Crop health
              </Link>
              <Link
                to="/surya-shakti"
                search={{ tab: "irrigation" }}
                className="flex-1 rounded-xl bg-primary px-2 py-2 text-center text-xs font-bold text-primary-foreground"
              >
                Irrigation
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
