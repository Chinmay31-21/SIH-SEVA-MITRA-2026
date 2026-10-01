import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Leaf, Mic, Send, Sparkles, Volume2 } from "lucide-react";
import { PageHeader } from "@/components/krishi/widgets";
import { useLanguage, type Language } from "@/lib/i18n";

export const Route = createFileRoute("/_app/ai-assistant")({
  head: () => ({
    meta: [
      { title: "Krishi AI Assistant — Farm Guidance | Krishi Mitra" },
      {
        name: "description",
        content:
          "Ask a voice-friendly farming assistant about cooperative governance, PMFBY, and schemes.",
      },
      { property: "og:title", content: "Krishi AI Assistant — Farm Guidance" },
      {
        property: "og:description",
        content: "Guidance on cooperative laws, schemes, and financial literacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AIAssistant,
});

function AIAssistant() {
  const { language, setLanguage, languages, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! I am the Krishi Mitra AI Assistant. I can help you with cooperative laws, Ministry of Cooperation schemes, PMFBY (crop insurance), financial literacy, and cooperative grievance redressal. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    t("What are the benefits under PMFBY crop insurance?", "What are the benefits under PMFBY crop insurance?"),
    t("How can I register a grievance with my cooperative society?", "How can I register a grievance with my cooperative society?"),
    t("Can you explain the new Ministry of Cooperation schemes?", "Can you explain the new Ministry of Cooperation schemes?"),
    t("What are the rules for PACS membership?", "What are the rules for PACS membership?"),
  ];

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", content: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("API response was not ok");
      const data = await res.json();

      setMessages((current) => [...current, { role: "assistant", content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while trying to respond. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Krishi AI Assistant"
        subtitle="Multilingual Cooperative Governance & Legal Assistance Chatbot"
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-140 flex-col rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b bg-primary p-4 text-primary-foreground">
            <span className="rounded-full bg-sun/25 p-2.5 text-sun">
              <Leaf className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-extrabold">{t("Krishi AI Assistant")}</h2>
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
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
              >
                {message.role === "assistant" && (
                  <Bot className="mt-2 h-4 w-4 shrink-0 text-primary" />
                )}
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <Bot className="mt-2 h-4 w-4 shrink-0 text-primary" />
                <div className="max-w-[80%] rounded-2xl bg-secondary px-4 py-3 text-sm leading-relaxed">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
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
                placeholder={t("Ask in any language...")}
                disabled={isLoading}
                className="h-11 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={isLoading || !input.trim()}
                aria-label="Send question"
                className="rounded-xl bg-primary p-3 text-primary-foreground disabled:opacity-50"
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
              <h3 className="font-extrabold">{t("Try asking", "Try asking")}</h3>
            </div>
            <div className="mt-4 space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  disabled={isLoading}
                  className="w-full rounded-xl border p-3 text-left text-xs font-semibold hover:bg-accent disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border bg-sky/15 p-5">
            <h3 className="font-extrabold">{t("Voice support", "Voice support")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Tap the microphone and speak naturally. Krishi AI will respond in your selected language.",
                "Tap the microphone and speak naturally. Krishi AI will respond in your selected language.",
              )}
            </p>
            <select
              className="mt-4 h-10 w-full rounded-xl border bg-background px-3 text-sm font-semibold"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

