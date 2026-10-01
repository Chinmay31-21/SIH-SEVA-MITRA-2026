import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export const CHART = {
  green: "oklch(0.45 0.1 150)",
  leaf: "oklch(0.62 0.14 145)",
  sun: "oklch(0.78 0.15 85)",
  sky: "oklch(0.68 0.1 220)",
  earth: "oklch(0.55 0.07 60)",
};

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useLanguage();
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{t(title)}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground md:text-base">{t(subtitle)}</p>}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = "default",
  className,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "primary" | "sun" | "sky" | "leaf";
  className?: string;
}) {
  const { t } = useLanguage();
  const tones: Record<string, string> = {
    default: "bg-card",
    primary: "bg-primary text-primary-foreground",
    sun: "bg-sun/25",
    sky: "bg-sky/15",
    leaf: "bg-leaf/15",
  };
  return (
    <div className={cn("card-hover rounded-2xl border p-4 shadow-sm md:p-5", tones[tone], className)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-semibold uppercase tracking-wide", tone === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {t(label)}
        </span>
        {icon && <span className={cn(tone === "primary" ? "text-sun" : "text-primary")}>{icon}</span>}
      </div>
      <div className="mt-2 text-2xl font-extrabold md:text-3xl">{value}</div>
      {sub && <div className={cn("mt-1 text-xs", tone === "primary" ? "text-primary-foreground/70" : "text-muted-foreground")}>{t(sub)}</div>}
    </div>
  );
}

export function Gauge({ value, size = 132, label, sub }: { value: number; size?: number; label?: string; sub?: string }) {
  const { t } = useLanguage();
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="oklch(0.92 0.02 130)" strokeWidth="11" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="oklch(0.45 0.1 150)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-foreground">{value}</span>
        {label && <span className="text-[10px] font-semibold uppercase text-muted-foreground">{t(label)}</span>}
        {sub && <span className="text-[10px] text-muted-foreground">{t(sub)}</span>}
      </div>
    </div>
  );
}

export function StatusPill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "blue" }) {
  const { t } = useLanguage();
  const map = {
    green: "bg-leaf/15 text-primary",
    amber: "bg-sun/30 text-earth",
    red: "bg-destructive/10 text-destructive",
    blue: "bg-sky/15 text-sky",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", map[tone])}>
      {typeof children === "string" ? t(children) : children}
    </span>
  );
}

export function AIInsightCard({ title = "Krishi AI Insight", children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-primary p-5 text-primary-foreground shadow-md">
      <div className="field-pattern absolute inset-0 opacity-30" />
      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sun">
          <Sparkles className="h-4 w-4" /> {t(title)}
        </div>
        <div className="mt-2 text-sm leading-relaxed text-primary-foreground/90">{children}</div>
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function SimpleList({ items }: { items: { icon: ReactNode; text: string }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 rounded-xl border bg-card p-3 text-sm">
          <span className="mt-0.5 shrink-0">{it.icon}</span>
          <span className="font-medium">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}
