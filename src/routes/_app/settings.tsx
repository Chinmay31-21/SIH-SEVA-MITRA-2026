import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Accessibility,
  Bell,
  Globe2,
  LockKeyhole,
  Mic,
  Moon,
  Ruler,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { PageHeader } from "@/components/krishi/widgets";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [
    { title: "Settings — Krishi Mitra" },
    { name: "description", content: "Set your language, voice, alert, unit and privacy preferences for Krishi Mitra." },
    { property: "og:title", content: "Settings — Krishi Mitra" },
    { property: "og:description", content: "Make Krishi Mitra fit the way you work on your farm." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Settings,
});
function Settings() {
  const [voice, setVoice] = useState(true);
  const [alerts, setAlerts] = useState(true);
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Make Krishi Mitra fit the way you work on your farm."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingSection
          title="Language & accessibility"
          icon={<Globe2 className="h-5 w-5" />}
          rows={
            <>
              <SettingRow
                icon={<Globe2 className="h-4 w-4" />}
                title="App language"
                description="Choose the language for labels and guidance"
                control={
                  <select className="h-9 rounded-lg border bg-background px-2 text-xs">
                    <option>English</option>
                    <option>मराठी</option>
                    <option>हिंदी</option>
                    <option>ਪੰਜਾਬੀ</option>
                  </select>
                }
              />
              <SettingRow
                icon={<Mic className="h-4 w-4" />}
                title="Voice assistant"
                description="Listen and speak with Krishi AI"
                control={<Toggle checked={voice} onChange={() => setVoice(!voice)} />}
              />
              <SettingRow
                icon={<Accessibility className="h-4 w-4" />}
                title="Readable text"
                description="Use larger labels and touch targets"
                control={<Toggle checked={true} onChange={() => undefined} />}
              />
            </>
          }
        />
        <SettingSection
          title="Notifications"
          icon={<Bell className="h-5 w-5" />}
          rows={
            <>
              <SettingRow
                icon={<Bell className="h-4 w-4" />}
                title="Farm alerts"
                description="Weather, crop health and irrigation changes"
                control={<Toggle checked={alerts} onChange={() => setAlerts(!alerts)} />}
              />
              <SettingRow
                icon={<Volume2 className="h-4 w-4" />}
                title="Voice notifications"
                description="Read urgent alerts aloud"
                control={<Toggle checked={false} onChange={() => undefined} />}
              />
            </>
          }
        />
        <SettingSection
          title="Farm preferences"
          icon={<Ruler className="h-5 w-5" />}
          rows={
            <>
              <SettingRow
                icon={<Ruler className="h-4 w-4" />}
                title="Units"
                description="Use local units across charts and recommendations"
                control={
                  <select className="h-9 rounded-lg border bg-background px-2 text-xs">
                    <option>Acres · kg · litres</option>
                    <option>Hectares · tonnes · litres</option>
                  </select>
                }
              />
              <SettingRow
                icon={<Moon className="h-4 w-4" />}
                title="Theme"
                description="Choose a comfortable display for field conditions"
                control={
                  <select className="h-9 rounded-lg border bg-background px-2 text-xs">
                    <option>Light</option>
                    <option>System</option>
                  </select>
                }
              />
            </>
          }
        />
        <SettingSection
          title="Privacy & security"
          icon={<ShieldCheck className="h-5 w-5" />}
          rows={
            <>
              <SettingRow
                icon={<LockKeyhole className="h-4 w-4" />}
                title="Privacy controls"
                description="Manage data sharing with buyers and schemes"
                control={<button className="text-xs font-bold text-primary">Review →</button>}
              />
              <SettingRow
                icon={<ShieldCheck className="h-4 w-4" />}
                title="Account security"
                description="Password, devices and sign-in activity"
                control={<button className="text-xs font-bold text-primary">Manage →</button>}
              />
            </>
          }
        />
      </div>
    </div>
  );
}
function SettingSection({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <span className="rounded-lg bg-secondary p-2">{icon}</span>
        <h2 className="font-extrabold">{title}</h2>
      </div>
      <div className="mt-3 divide-y">{rows}</div>
    </section>
  );
}
function SettingRow({
  icon,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      {control}
    </div>
  );
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-label="Toggle setting"
      className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
