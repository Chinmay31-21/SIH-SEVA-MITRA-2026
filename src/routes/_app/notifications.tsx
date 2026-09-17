import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Check,
  CloudRain,
  Droplets,
  Landmark,
  MessageCircle,
  TrendingUp,
  Sprout,
  Trash2,
} from "lucide-react";
import { PageHeader, StatusPill } from "@/components/krishi/widgets";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — Farm Updates | Krishi Mitra" },
    { name: "description", content: "Stay ahead of weather, crop health, irrigation, market and scheme updates." },
    { property: "og:title", content: "Notifications — Farm Updates" },
    { property: "og:description", content: "Timely alerts for the decisions that matter on your farm." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Notifications,
});
const initial = [
  [
    "Weather",
    "Heavy rain expected tomorrow from 4 PM",
    "Delay irrigation and protect harvested produce.",
    "10 min ago",
    "blue",
  ],
  [
    "Crop Health",
    "Nitrogen is low in Field A",
    "Apply the recommended urea plan within 3 days.",
    "1 hr ago",
    "green",
  ],
  [
    "Irrigation",
    "Field B moisture has fallen below 40%",
    "A 22-minute irrigation cycle is recommended.",
    "3 hrs ago",
    "sky",
  ],
  [
    "Market",
    "Tomato price increased by 8.4%",
    "Pune APMC is now showing ₹2,350 / quintal.",
    "Yesterday",
    "amber",
  ],
  [
    "Orders",
    "Rahul Foods sent you an offer",
    "Review the offer for 240 kg of tomato.",
    "Yesterday",
    "green",
  ],
  [
    "Government Schemes",
    "You may qualify for irrigation subsidy",
    "Your scheme matcher found a strong match.",
    "2 days ago",
    "amber",
  ],
] as const;
function Notifications() {
  const [items, setItems] = useState(initial.map((item, index) => ({ ...item, read: index > 2 })));
  const [filter, setFilter] = useState("All");
  const categories = [
    "All",
    "Weather",
    "Crop Health",
    "Irrigation",
    "Market",
    "Orders",
    "Government Schemes",
  ];
  const visible = items.filter((item) => filter === "All" || item[0] === filter);
  const markRead = (index: number) =>
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, read: true } : item)),
    );
  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay ahead of weather, crop, market and community changes."
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-bold ${filter === category ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          onClick={() => setItems((current) => current.map((item) => ({ ...item, read: true })))}
          className="flex items-center gap-1.5 text-xs font-bold text-primary"
        >
          <Check className="h-4 w-4" />
          Mark all read
        </button>
      </div>
      <div className="mt-5 rounded-2xl border bg-card shadow-sm">
        {visible.map((item) => {
          const [category, title, text, time, tone] = item;
          const originalIndex = items.indexOf(item);
          return (
            <div
              key={title}
              className={`flex gap-4 border-b p-5 last:border-0 ${item.read ? "" : "bg-secondary/40"}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone === "blue" ? "bg-sky/15 text-sky" : tone === "amber" ? "bg-sun/25 text-earth" : tone === "sky" ? "bg-sky/15 text-sky" : "bg-leaf/15 text-primary"}`}
              >
                {category === "Weather" ? (
                  <CloudRain className="h-5 w-5" />
                ) : category === "Crop Health" ? (
                  <Sprout className="h-5 w-5" />
                ) : category === "Irrigation" ? (
                  <Droplets className="h-5 w-5" />
                ) : category === "Market" ? (
                  <TrendingUp className="h-5 w-5" />
                ) : category === "Government Schemes" ? (
                  <Landmark className="h-5 w-5" />
                ) : (
                  <MessageCircle className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-extrabold">{title}</h3>
                  {!item.read && <StatusPill tone="green">New</StatusPill>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {category} · {time}
                </p>
              </div>
              {!item.read && (
                <button
                  onClick={() => markRead(originalIndex)}
                  aria-label="Mark notification as read"
                  className="self-center rounded-lg p-2 text-primary hover:bg-accent"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button className="mt-4 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-destructive">
        <Trash2 className="h-4 w-4" />
        Clear notifications
      </button>
    </div>
  );
}
