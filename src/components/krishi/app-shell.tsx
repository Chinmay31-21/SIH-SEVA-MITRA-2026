import { useState, useRef, type ReactNode } from "react";
import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, Sprout, CloudSun, Sun, Store, Users, HandHeart,
  Bot, Bell, Tractor, CircleUserRound, Settings, Search, Mic, MapPin,
  ChevronDown, Menu, X, Leaf, Send, CloudRain, Thermometer,
  Volume2, VolumeX, Square, CircleStop,
} from "lucide-react";
import { KrishiLogo } from "./logo";
import { cn } from "@/lib/utils";
import { farmer, languages, notifications } from "@/lib/krishi-data";
import { useLanguage, type Language, LANGUAGE_CODES } from "@/lib/i18n";

type NavItem = { label: string; to: string; icon: ReactNode; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
  {
    label: "NutriGrow", to: "/nutri-grow", icon: <Sprout className="h-4.5 w-4.5" />,
    children: [
      { label: "Crop & Plant Health", to: "/nutri-grow?tab=health" },
      { label: "Soil & Land Conditions", to: "/nutri-grow?tab=soil" },
      { label: "AI Crop Suggestions", to: "/nutri-grow?tab=ai" },
      { label: "Fertilizer Recommendations", to: "/nutri-grow?tab=fertilizer" },
      { label: "Pest & Disease Detection", to: "/nutri-grow?tab=pest" },
      { label: "Demand-Based Crops", to: "/nutri-grow?tab=demand" },
    ],
  },
  {
    label: "WeatherCast", to: "/weather", icon: <CloudSun className="h-4.5 w-4.5" />,
    children: [
      { label: "Current Weather", to: "/weather?tab=current" },
      { label: "Hourly Forecast", to: "/weather?tab=hourly" },
      { label: "Weekly Forecast", to: "/weather?tab=weekly" },
      { label: "Weather Alerts", to: "/weather?tab=alerts" },
      { label: "AQI & Environment", to: "/weather?tab=aqi" },
    ],
  },
  {
    label: "SuryaShakti", to: "/surya-shakti", icon: <Sun className="h-4.5 w-4.5" />,
    children: [
      { label: "Solar Dashboard", to: "/surya-shakti?tab=solar" },
      { label: "Smart Irrigation", to: "/surya-shakti?tab=irrigation" },
      { label: "Soil Monitoring", to: "/surya-shakti?tab=soil" },
      { label: "Motor / Pump Control", to: "/surya-shakti?tab=pump" },
      { label: "Sensor Network", to: "/surya-shakti?tab=sensors" },
    ],
  },
  {
    label: "Marketplace", to: "/market", icon: <Store className="h-4.5 w-4.5" />,
    children: [
      { label: "Live Market Prices", to: "/market?tab=prices" },
      { label: "Demand Intelligence", to: "/market?tab=intelligence" },
      { label: "Buy Produce", to: "/market?tab=buy" },
      { label: "Storage / Godown", to: "/market?tab=storage" },
      { label: "Surplus Management", to: "/market?tab=surplus" },
      { label: "My Listings & Orders", to: "/market?tab=orders" },
    ],
  },
  {
    label: "Community", to: "/community", icon: <Users className="h-4.5 w-4.5" />,
    children: [
      { label: "Community Feed", to: "/community?tab=feed" },
      { label: "Farmer Groups", to: "/community?tab=groups" },
      { label: "Messages", to: "/community?tab=messages" },
      { label: "Ask an Expert", to: "/community?tab=experts" },
    ],
  },
  {
    label: "Farmer Empowerment", to: "/empowerment", icon: <HandHeart className="h-4.5 w-4.5" />,
    children: [
      { label: "Government Schemes", to: "/empowerment?tab=schemes" },
      { label: "Shared Resources", to: "/empowerment?tab=resources" },
      { label: "FPO Connect", to: "/empowerment?tab=fpo" },
      { label: "Training & Knowledge", to: "/empowerment?tab=training" },
    ],
  },
  { label: "Krishi AI Assistant", to: "/ai-assistant", icon: <Bot className="h-4.5 w-4.5" /> },
  { label: "Notifications", to: "/notifications", icon: <Bell className="h-4.5 w-4.5" /> },
  { label: "My Farm", to: "/my-farm", icon: <Tractor className="h-4.5 w-4.5" /> },
  { label: "Profile & Verification", to: "/profile", icon: <CircleUserRound className="h-4.5 w-4.5" /> },
  { label: "Settings", to: "/settings", icon: <Settings className="h-4.5 w-4.5" /> },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState<string | null>(() => NAV.find((n) => pathname.startsWith(n.to) && n.children)?.label ?? null);

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        const hasKids = !!item.children;
        const expanded = open === item.label;
        return (
          <div key={item.label}>
            <div className="flex items-center">
              <Link
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {item.icon}
                <span className="flex-1">{t(item.label)}</span>
              </Link>
              {hasKids && (
                <button
                  aria-label={`Expand ${item.label}`}
                  onClick={() => setOpen(expanded ? null : item.label)}
                  className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent/60"
                >
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                </button>
              )}
            </div>
            {hasKids && expanded && (
              <div className="ml-9 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                {item.children!.map((c) => (
                  <a
                    key={c.label}
                    href={c.to}
                    className="block rounded-lg px-2 py-1.5 text-xs font-medium text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  >
                    {t(c.label)}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Mobile Drawer Language Selector */}
      <div className="mt-4 border-t border-sidebar-border pt-4 lg:hidden">
        <label className="mb-2 block px-2 text-[11px] font-bold uppercase tracking-wider text-sidebar-foreground/60">
          {t("App language")}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-xs font-semibold text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-primary"
        >
          {languages.map((l) => (
            <option key={l} value={l} className="bg-card text-foreground">
              {l}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}

export function KrishiAIChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState([
    { from: "ai", text: "नमस्ते रमेश जी! 🙏 I'm Krishi AI. Ask me about weather, crops, prices or schemes — in any language." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const suggestions = ["Should I irrigate today?", "आज क्या बुवाई करूं?", "What is today's onion price?", "Which schemes am I eligible for?"];

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingTTS(false);
  };

  const playTTS = async (text: string) => {
    try {
      setIsPlayingTTS(true);
      const sarvamCode = (LANGUAGE_CODES[language] || "en") + "-IN";
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language_code: sarvamCode }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const data = await res.json();
      if (data.audio && audioRef.current) {
        audioRef.current.src = "data:audio/wav;base64," + data.audio;
        audioRef.current.onended = () => setIsPlayingTTS(false);
        audioRef.current.play().catch(e => {
          console.error(e);
          setIsPlayingTTS(false);
        });
      } else {
        setIsPlayingTTS(false);
      }
    } catch (err) {
      console.error(err);
      setIsPlayingTTS(false);
    }
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading || isCooldown || isPlayingTTS) return;
    
    // Unlock audio element on user gesture with silence to prevent playing previous audio
    if (isVoiceMode && audioRef.current) {
      audioRef.current.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audioRef.current.play().catch(() => {});
    }

    const newMessages = [...messages, { from: "user", text: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 3000);

    try {
      // Send ONLY the latest message to avoid cross-contamination in stateless UI
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          language: language,
          messages: [{ role: "user", content: text.trim() }] 
        }),
      });

      if (!res.ok) throw new Error("API response was not ok");
      const data = await res.json();
      const reply = data.response;

      setMessages((current) => [...current, { from: "ai", text: reply }]);
      
      if (isVoiceMode) {
        playTTS(reply);
      }
    } catch (err) {
      console.error(err);
      setMessages((current) => [
        ...current,
        { from: "ai", text: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((track) => track.stop());
        
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.wav");
          
          const res = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) throw new Error("STT failed");
          const data = await res.json();
          if (data.transcript) {
            setInput(data.transcript);
            send(data.transcript);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed bottom-24 right-4 z-50 flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl md:bottom-6 md:right-6" style={{ height: "min(560px, 70vh)" }}>
      <audio ref={audioRef} className="hidden" />
      <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun/25"><Leaf className="h-5 w-5 text-sun" /></span>
        <div className="flex-1">
          <div className="text-sm font-bold">Krishi AI</div>
          <div className="text-[11px] opacity-80">Voice + text · 9 languages</div>
        </div>
        <div className="flex items-center gap-1.5">
          {isPlayingTTS && (
            <button
              onClick={stopTTS}
              className="flex items-center gap-1 rounded-full bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <CircleStop className="h-3 w-3" />
              {t("Stop", "Stop")}
            </button>
          )}
          <button 
            aria-label="Voice mode" 
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`rounded-full p-1.5 transition-colors ${isVoiceMode ? "bg-sun text-earth" : "hover:bg-white/10"}`}
          >
            {isVoiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
        <button onClick={onClose} aria-label="Close assistant" className="rounded-lg p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed", m.from === "ai" ? "bg-secondary text-secondary-foreground" : "ml-auto bg-primary text-primary-foreground")}>
            {m.text}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2">
            <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <div className="max-w-[80%] rounded-2xl bg-secondary px-3.5 py-2 text-sm leading-relaxed">
              <div className="flex items-center gap-1 h-4">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50 [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={isLoading || isPlayingTTS || isCooldown} className="rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t p-3">
        <button 
          aria-label="Voice input" 
          onClick={handleMicClick}
          disabled={isLoading || isPlayingTTS || isCooldown && !isRecording}
          className={`rounded-full p-2.5 transition-colors ${isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-sun/25 text-earth disabled:opacity-50"}`}
        >
          {isRecording ? <Square className="h-4 w-4 fill-current animate-pulse" /> : <Mic className="h-4 w-4" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={isPlayingTTS ? t("Audio playing...") : isCooldown ? t("Please wait...") : t("Ask in any language…")}
          disabled={isLoading || isRecording || isPlayingTTS || isCooldown}
          className="h-10 flex-1 rounded-full border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button onClick={() => send(input)} disabled={isLoading || isRecording || isPlayingTTS || isCooldown || !input.trim()} aria-label="Send" className="rounded-full bg-primary p-2.5 text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

export function AppShell() {
  const [drawer, setDrawer] = useState(false);
  const [chat, setChat] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-sidebar lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
          <KrishiLogo size={34} />
          <div>
            <div className="text-sm font-extrabold text-sidebar-foreground">Krishi Mitra</div>
            <div className="text-[10px] text-sidebar-foreground/60">किसान का डिजिटल साथी</div>
          </div>
        </Link>
        <div className="flex-1 overflow-hidden">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-sidebar">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
              <div className="flex items-center gap-2.5">
                <KrishiLogo size={32} />
                <span className="text-sm font-extrabold text-sidebar-foreground">Krishi Mitra</span>
              </div>
              <button onClick={() => setDrawer(false)} aria-label="Close menu" className="text-sidebar-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="h-[calc(100%-65px)]">
              <SidebarContent onNavigate={() => setDrawer(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur lg:pl-64">
        <div className="flex h-16 items-center gap-3 px-4">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="rounded-lg p-2 hover:bg-accent lg:hidden"><Menu className="h-5 w-5" /></button>
          <Link to="/dashboard" className="flex items-center gap-2 lg:hidden"><KrishiLogo size={30} /></Link>
          <div className="hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{farmer.farmName}</span> · {farmer.location}
          </div>
          <div className="ml-auto flex items-center gap-1.5 md:gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input placeholder={t("Search crops, mandis, schemes…")} className="h-9 w-56 rounded-full border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="h-9 rounded-full border border-primary/30 bg-background px-3 text-xs font-semibold text-foreground shadow-xs hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <button onClick={() => setChat(true)} aria-label="Voice assistant" className="rounded-full bg-sun/25 p-2 text-earth hover:bg-sun/40"><Mic className="h-4 w-4" /></button>
            <div className="hidden items-center gap-1.5 rounded-full bg-sky/15 px-3 py-1.5 text-xs font-bold sm:flex">
              <CloudRain className="h-3.5 w-3.5 text-sky" /> 29°C · 72%
            </div>
            <Link to="/notifications" aria-label="Notifications" className="relative rounded-full p-2 hover:bg-accent">
              <Bell className="h-4.5 w-4.5" />
              {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">{unread}</span>}
            </Link>
            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {farmer.initials}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pb-28 pt-6 md:px-8 lg:pb-10 lg:pl-72 lg:pr-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
        {[
          { label: t("Home"), to: "/dashboard", icon: LayoutDashboard },
          { label: t("Farm"), to: "/my-farm", icon: Tractor },
          { label: t("Market"), to: "/market", icon: Store },
          { label: t("Community"), to: "/community", icon: Users },
          { label: t("Menu"), to: "#", icon: Menu },
        ].map((i) =>
          i.to === "#" ? (
            <button key={i.label} onClick={() => setDrawer(true)} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted-foreground">
              <i.icon className="h-5 w-5" /><span className="text-[10px] font-bold">{i.label}</span>
            </button>
          ) : (
            <Link key={i.label} to={i.to} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted-foreground [&.active]:text-primary">
              <i.icon className="h-5 w-5" /><span className="text-[10px] font-bold">{i.label}</span>
            </Link>
          ),
        )}
      </nav>

      {/* Floating Krishi AI */}
      {!chat && (
        <button
          onClick={() => setChat(true)}
          aria-label="Open Krishi AI assistant"
          className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 md:bottom-6 md:right-6"
        >
          <span className="relative">
            <Leaf className="h-6 w-6 text-sun" />
            <SparkleDot />
          </span>
        </button>
      )}
      <KrishiAIChat open={chat} onClose={() => setChat(false)} />
    </div>
  );
}

function SparkleDot() {
  return <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 animate-pulse-soft rounded-full bg-sun" />;
}
