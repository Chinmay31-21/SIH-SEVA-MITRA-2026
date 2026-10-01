import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { PageHeader, StatusPill } from "@/components/krishi/widgets";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [
    { title: "Profile & Verification — Krishi Mitra" },
    { name: "description", content: "Review your verified farmer identity, land details and protected payment information." },
    { property: "og:title", content: "Profile & Verification — Krishi Mitra" },
    { property: "og:description", content: "Your identity and farm details, protected and ready for trusted services." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Profile,
});
function Profile() {
  return (
    <div>
      <PageHeader
        title="Profile & Government Verification"
        subtitle="Your identity and farm details, protected and ready for trusted services."
      />
      <div className="rounded-2xl border bg-primary p-6 text-primary-foreground shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sun text-xl font-extrabold text-sun-foreground">
            RP
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Ramesh Patil</h2>
            <p className="text-sm text-primary-foreground/75">
              Farmer ID: KM-NK-28471 · Nashik, Maharashtra
            </p>
          </div>
          <StatusPill tone="green">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Farmer
          </StatusPill>
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-primary-foreground/75">
          <LockKeyhole className="h-4 w-4" />
          Your personal data is encrypted and only shared with services you approve.
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ProfileCard
          title="Personal details"
          icon={<UserRound className="h-5 w-5" />}
          rows={[
            ["Full name", "Ramesh Patil"],
            ["Mobile number", "+91 98XXXXXX42"],
            ["Preferred language", "English · मराठी"],
          ]}
        />
        <ProfileCard
          title="Farmer verification"
          icon={<FileCheck2 className="h-5 w-5" />}
          rows={[
            ["Aadhaar", "XXXX XXXX 4821"],
            ["Verification status", "Verified on 12 Aug 2026"],
            ["Farmer category", "Small farmer"],
          ]}
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ProfileCard
          title="Land details"
          icon={<MapPin className="h-5 w-5" />}
          rows={[
            ["Farm location", "Nashik, Maharashtra"],
            ["Total land", "7.3 acres"],
            ["Land record", "Verified · 7/12 extract"],
          ]}
        />
        <ProfileCard
          title="Bank details"
          icon={<LockKeyhole className="h-5 w-5" />}
          rows={[
            ["Account", "XXXX XXXX 0914"],
            ["Bank", "State Bank of India"],
            ["Status", "Verified for scheme payments"],
          ]}
        />
      </div>
    </div>
  );
}
function ProfileCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: string[][];
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-extrabold">{title}</h3>
      </div>
      <dl className="mt-4 divide-y">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-1 text-right font-bold">
              {value}
              {(label === "Verification status" ||
                label === "Land record" ||
                label === "Status") && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </dd>
          </div>
        ))}
      </dl>
      <button className="mt-3 text-xs font-bold text-primary">Update details →</button>
    </div>
  );
}
