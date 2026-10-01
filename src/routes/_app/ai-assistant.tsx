import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Bot, Leaf, Mic, Send, Sparkles, Volume2, VolumeX, Loader2, Square, CircleStop } from "lucide-react";
import { PageHeader } from "@/components/krishi/widgets";
import { useLanguage, type Language, LANGUAGE_CODES } from "@/lib/i18n";

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
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  const suggestions = [
    t("What are the benefits under PMFBY crop insurance?", "What are the benefits under PMFBY crop insurance?"),
    t("How can I register a grievance with my cooperative society?", "How can I register a grievance with my cooperative society?"),
    t("Can you explain the new Ministry of Cooperation schemes?", "Can you explain the new Ministry of Cooperation schemes?"),
    t("What are the rules for PACS membership?", "What are the rules for PACS membership?"),
  ];

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

    const newMessages = [...messages, { role: "user", content: text.trim() }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), 3000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          messages: [{ role: "user", content: text.trim() }],
        }),
      });

      if (!res.ok) throw new Error("API response was not ok");
      const data = await res.json();
      const reply = data.response;

      setMessages((current) => [...current, { role: "assistant", content: reply }]);
      
      if (isVoiceMode) {
        playTTS(reply);
      }
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

  return (
    <div>
      <audio ref={audioRef} className="hidden" />
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
            <div className="ml-auto flex items-center gap-2">
              {isPlayingTTS && (
                <button
                  onClick={stopTTS}
                  className="flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  <CircleStop className="h-3.5 w-3.5" />
                  {t("Stop Audio", "Stop Audio")}
                </button>
              )}
              <button 
                aria-label="Voice mode" 
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={`rounded-full p-2 transition-colors ${isVoiceMode ? "bg-sun text-earth" : "bg-white/10 text-primary-foreground"}`}
              >
                {isVoiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
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
              <button 
                aria-label="Voice input" 
                onClick={handleMicClick}
                disabled={isLoading || isPlayingTTS || isCooldown && !isRecording}
                className={`rounded-xl p-3 transition-colors ${isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-sun/25 text-earth disabled:opacity-50"}`}
              >
                {isRecording ? <Square className="h-4 w-4 animate-pulse fill-current" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && send(input)}
                placeholder={isPlayingTTS ? t("Audio playing...") : isCooldown ? t("Please wait...") : t("Ask in any language...")}
                disabled={isLoading || isRecording || isPlayingTTS || isCooldown}
                className="h-11 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={isLoading || isRecording || isPlayingTTS || isCooldown || !input.trim()}
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
                  disabled={isLoading || isPlayingTTS || isCooldown}
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

