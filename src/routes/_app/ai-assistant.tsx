import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Leaf, Mic, Send, Sparkles, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/krishi/widgets";

export const Route = createFileRoute("/_app/ai-assistant")({
  head: () => ({ meta: [
    { title: "Krishi AI Assistant — Farm Guidance | Krishi Mitra" },
    { name: "description", content: "Ask a voice-friendly farming assistant about crops, weather, market prices and schemes." },
    { property: "og:title", content: "Krishi AI Assistant — Farm Guidance" },
    { property: "og:description", content: "Simple crop, weather, market and scheme guidance in your language." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AIAssistant,
});

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Namaste Ramesh ji. I know your Nashik farm, tomato crop and today's weather. What would you like to decide?",
    },
  ]);
  const [input, setInput] = useState("");
  const suggestions = [
    "What should I grow next?",
    "Should I irrigate today?",
    "What is today's onion price?",
    "Why are my tomato leaves yellow?",
  ];
  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((current) => [
      ...current,
      { from: "user", text: text.trim() },
      {
        from: "ai",
        text: "Based on your farm data, rain is likely tomorrow evening. Keep irrigation 30% lower today and inspect tomato leaves after 4 PM.",
      },
    ]);
    setInput("");
  };
  return (
    <div>
      <PageHeader
        title="Krishi AI"
        subtitle="A simple farming assistant that understands your crops, weather and market."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-140 flex-col rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b bg-primary p-4 text-primary-foreground">
            <span className="rounded-full bg-sun/25 p-2.5 text-sun">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-extrabold">Krishi AI Assistant</h2>
              <p className="text-xs text-primary-foreground/70">
                Online · English + Hindi + Marathi
              </p>
            </div>
            <button aria-label="Voice mode" className="ml-auto rounded-full bg-white/10 p-2">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${message.from === "user" ? "justify-end" : ""}`}
              >
                {message.from === "ai" && <Bot className="mt-2 h-4 w-4 shrink-0 text-primary" />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="flex gap-2">
              <button aria-label="Voice input" className="rounded-xl bg-sun/25 p-3 text-earth">
                <Mic className="h-4 w-4" />
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send(input)}
                placeholder="Ask in any language..."
                className="h-11 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => send(input)}
                aria-label="Send question"
                className="rounded-xl bg-primary p-3 text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <h3 className="font-extrabold">Try asking</h3>
            </div>
            <div className="mt-4 space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="w-full rounded-xl border p-3 text-left text-xs font-semibold hover:bg-accent"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-sky/15 p-5">
            <h3 className="font-extrabold">Voice support</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tap the microphone and speak naturally. Krishi AI can respond with voice in your
              preferred language.
            </p>
            <select className="mt-4 h-10 w-full rounded-xl border bg-background px-3 text-sm">
              <option>English</option>
              <option>हिंदी</option>
              <option>मराठी</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
