import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  Camera,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
} from "lucide-react";
import { PageHeader, StatusPill } from "@/components/krishi/widgets";

const tabs = [
  ["feed", "Community Feed"],
  ["groups", "Farmer Groups"],
  ["nearby", "Nearby Farmers"],
  ["messages", "Messages"],
  ["experts", "Ask an Expert"],
] as const;

const initialPosts = [
  {
    id: 1,
    author: "Savitri More",
    initials: "SM",
    location: "Pune · Tomato farmer",
    category: "Crop Advice",
    text: "Has anyone observed leaf curl in tomatoes after recent rainfall? I noticed it in Field B this morning and would appreciate advice on an early treatment.",
    likes: 24,
    comments: 12,
    time: "18 min ago",
    liked: false,
  },
  {
    id: 2,
    author: "Gurpreet Singh",
    initials: "GS",
    location: "Ludhiana · Wheat farmer",
    category: "Machinery",
    text: "Sharing my harvester for rent next week. DM if anyone near Ludhiana needs it. ₹1,400/hour, operator included.",
    likes: 15,
    comments: 8,
    time: "8 hrs ago",
    liked: false,
  },
  {
    id: 3,
    author: "Anil Shinde",
    initials: "AS",
    location: "Nashik · Grapes farmer",
    category: "Success Stories",
    text: "Used the new irrigation schedule from Krishi AI for two weeks. Water use dropped by 18% and the vines look stronger. Happy to share my settings.",
    likes: 41,
    comments: 16,
    time: "Yesterday",
    liked: false,
  },
];

export const Route = createFileRoute("/_app/community")({
  validateSearch: z.object({ tab: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Krishi Community — Farmers Connected | Krishi Mitra" },
    { name: "description", content: "Ask questions, share field knowledge and connect with farmers and experts across India." },
    { property: "og:title", content: "Krishi Community — Farmers Connected" },
    { property: "og:description", content: "Practical knowledge, farmer groups and trusted experts for Indian agriculture." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Community,
});

function Community() {
  const { tab } = Route.useSearch();
  const [active, setActive] = useState(tab ?? "feed");
  return (
    <div>
      <PageHeader
        title="Krishi Community"
        subtitle="India's farming community, connected by practical knowledge."
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
      {active === "feed" && <FeedTab />}
      {active === "groups" && <GroupsTab />}
      {active === "nearby" && <NearbyTab />}
      {active === "messages" && <MessagesTab />}
      {active === "experts" && <ExpertsTab />}
    </div>
  );
}

function FeedTab() {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState("");
  const publish = () => {
    if (!draft.trim()) return;
    setPosts((current) => [
      {
        id: Date.now(),
        author: "Ramesh Patil",
        initials: "RP",
        location: "Nashik · Tomato farmer",
        category: "General Discussion",
        text: draft.trim(),
        likes: 0,
        comments: 0,
        time: "Just now",
        liked: false,
      },
      ...current,
    ]);
    setDraft("");
  };
  const toggleLike = (id: number) =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
          : post,
      ),
    );
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              RP
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Share a question, observation or farming tip..."
              className="min-h-20 flex-1 resize-none rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent">
                <Camera className="h-4 w-4 text-primary" />
                Add crop photo
              </button>
              <button className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent">
                Choose category
              </button>
            </div>
            <button
              onClick={publish}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Post to community
            </button>
          </div>
        </div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
        ))}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Explore topics</h3>
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Crop Advice",
              "Market Discussion",
              "Machinery",
              "Weather",
              "Government Policies",
              "Success Stories",
            ].map((topic) => (
              <button
                key={topic}
                className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-primary hover:bg-accent"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-primary p-5 text-primary-foreground shadow-sm">
          <div className="flex items-center gap-2 text-sun">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Ask the community</span>
          </div>
          <h3 className="mt-3 text-lg font-extrabold">Every field question has a neighbour.</h3>
          <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75">
            Connect with farmers who grow the same crops in similar conditions.
          </p>
          <button className="mt-4 rounded-xl bg-sun px-4 py-2 text-xs font-bold text-sun-foreground">
            Find nearby farmers
          </button>
        </div>
      </aside>
    </div>
  );
}

function PostCard({ post, onLike }: { post: (typeof initialPosts)[number]; onLike: () => void }) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-extrabold text-primary">
          {post.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold">
                {post.author} <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-primary" />
              </h3>
              <p className="text-xs text-muted-foreground">
                {post.location} · {post.time}
              </p>
            </div>
            <button
              aria-label="Post options"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <StatusPill tone="green">{post.category}</StatusPill>
          <p className="mt-3 text-sm leading-relaxed">{post.text}</p>
          <div className="mt-4 flex items-center gap-5 border-t pt-3 text-xs font-bold text-muted-foreground">
            <button
              onClick={onLike}
              className={`flex items-center gap-1.5 hover:text-destructive ${post.liked ? "text-destructive" : ""}`}
            >
              <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
              {post.likes}
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary">
              <MessageCircle className="h-4 w-4" />
              {post.comments} comments
            </button>
            <button className="ml-auto hover:text-primary">Share</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function GroupsTab() {
  const groups = [
    ["Maharashtra Vegetable Growers", "8,420 members", "Tomato · Onion · Potato", "Active now"],
    ["Smart Irrigation India", "3,180 members", "Water · Sensors · Solar", "24 new posts"],
    ["Women in Farming", "2,640 members", "Peer support · Markets", "12 new posts"],
    ["Organic & Natural Farming", "6,970 members", "Soil health · Certification", "Active now"],
  ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Find your farming circle</h2>
          <p className="text-sm text-muted-foreground">
            Learn with farmers who share your crops and goals.
          </p>
        </div>
        <button className="rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground">
          + Create a group
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(([name, members, focus, activity]) => (
          <div key={name} className="card-hover rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="rounded-xl bg-secondary p-3 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <StatusPill tone={activity === "Active now" ? "green" : "blue"}>
                {activity}
              </StatusPill>
            </div>
            <h3 className="mt-4 font-extrabold">{name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {members} · {focus}
            </p>
            <div className="mt-5 flex gap-2">
              <button className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">
                Join group
              </button>
              <button className="rounded-xl border px-3 py-2.5 text-xs font-bold text-primary">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NearbyTab() {
  const farmers = [
    ["Meena Pawar", "2.8 km", "Tomato · Onion", "Pune"],
    ["Anil Shinde", "9.4 km", "Grapes · Tomato", "Nashik"],
    ["Prakash Jadhav", "11.2 km", "Wheat · Soybean", "Nashik"],
    ["Savitri More", "18.0 km", "Tomato · Chilli", "Pune"],
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-sky/15 p-5">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-sky" />
          <div>
            <h3 className="font-extrabold">Farmers around Nashik</h3>
            <p className="text-sm text-muted-foreground">
              Connect locally for shared machinery, transport and advice.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {farmers.map(([name, distance, crops, city]) => (
          <div
            key={name}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground">
              {name
                .split(" ")
                 .map((part) => part?.[0] ?? "")
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
               <h3 className="font-extrabold">
                 {name ?? "Farmer"} <ShieldCheck className="ml-1 inline h-4 w-4 text-primary" />
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {distance} · {city}
              </p>
              <p className="mt-1 text-xs font-semibold text-primary">{crops}</p>
            </div>
            <button
              aria-label={`Connect with ${name}`}
              className="rounded-xl border-2 border-primary p-2.5 text-primary hover:bg-accent"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesTab() {
  const conversations = [
    ["Rahul Foods", "Can you share 240 kg tomato details?", "10:24 AM"],
    ["Anil Shinde", "The irrigation settings worked well.", "Yesterday"],
    ["Maharashtra Vegetable Growers", "New group announcement", "Yesterday"],
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold">Messages</h3>
          <button className="rounded-lg p-2 text-primary hover:bg-accent">
            <Search className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          {conversations.map(([name, message, time], index) => (
            <button
              key={name}
              className={`flex w-full items-start gap-3 rounded-xl p-3 text-left ${index === 0 ? "bg-secondary" : "hover:bg-muted"}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {name
                  .split(" ")
                   .map((part) => part?.[0] ?? "")
                  .join("")}
              </span>
              <span className="min-w-0 flex-1">
                 <span className="block text-sm font-bold">{name ?? "Conversation"}</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">{message}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{time}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-107.5 flex-col rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
            RF
          </span>
          <div>
            <h3 className="font-extrabold">Rahul Foods</h3>
            <p className="text-xs text-primary">Online · Verified buyer</p>
          </div>
        </div>
        <div className="flex-1 space-y-3 p-5">
          <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">
            Hello Ramesh, we are interested in your Field A tomatoes. Is the Grade A quantity still
            available?
          </div>
          <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-primary p-3 text-sm text-primary-foreground">
            Yes, 480 kg will be ready in 18 days. I can share a sample and expected price.
          </div>
        </div>
        <div className="flex gap-2 border-t p-3">
          <input
            placeholder="Write a message..."
            className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            aria-label="Send message"
            className="rounded-xl bg-primary p-2.5 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpertsTab() {
  const experts = [
    [
      "Dr. Kavita Deshmukh",
      "Plant Pathologist",
      "Tomato · Grapes · Disease",
      "4.9",
      "Available today",
    ],
    [
      "Mr. Suresh Kulkarni",
      "Agricultural Extension Officer",
      "Schemes · Soil · FPOs",
      "4.8",
      "Replies within 2 hrs",
    ],
    [
      "Dr. Meera Shah",
      "Soil & Water Specialist",
      "Irrigation · Soil health",
      "4.9",
      "Available tomorrow",
    ],
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-primary p-6 text-primary-foreground shadow-sm">
        <div className="flex items-center gap-3 text-sun">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Ask an expert</span>
        </div>
        <h2 className="mt-3 text-2xl font-extrabold">Get a trusted answer for your field.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary-foreground/75">
          Share a crop photo, soil reading or clear question. Experts help you make the next
          decision with confidence.
        </p>
        <button className="mt-5 rounded-xl bg-sun px-4 py-3 text-xs font-bold text-sun-foreground">
          Ask your question
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {experts.map(([name, role, focus, rating, availability]) => (
          <div key={name} className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-extrabold text-primary">
                {name
                  .split(" ")
                  .filter(Boolean)
                  .slice(-2)
                   .map((part) => part?.[0] ?? "")
                  .join("")}
              </div>
              <StatusPill tone="green">{availability}</StatusPill>
            </div>
             <h3 className="mt-4 font-extrabold">{name ?? "Agriculture expert"}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{role}</p>
            <p className="mt-3 text-xs font-semibold text-primary">{focus}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-bold">
              <Heart className="h-4 w-4 fill-current text-destructive" />
              {rating}{" "}
              <span className="text-xs font-normal text-muted-foreground">expert rating</span>
            </div>
            <button className="mt-4 w-full rounded-xl border-2 border-primary px-3 py-2.5 text-xs font-bold text-primary hover:bg-accent">
              View profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
