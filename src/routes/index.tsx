import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KrishiLogo } from "@/components/krishi/logo";
import {
  Sprout, CloudSun, Sun, Store, Users, HandHeart, Bot, ArrowRight, X, Volume2, VolumeX,
  Droplets, TrendingUp, Satellite, Leaf, IndianRupee, Thermometer,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krishi Mitra — Technology that grows with the farmer" },
      { name: "description", content: "AI-powered crop intelligence, weather forecasting, smart irrigation, market access and farmer collaboration — all in one platform for Indian farmers." },
      { property: "og:title", content: "Krishi Mitra — Technology that grows with the farmer" },
      { property: "og:description", content: "AI-powered crop intelligence, smart irrigation, market access and farmer collaboration for Indian farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sprout, name: "NutriGrow", desc: "Crop health, soil intelligence and AI-driven nutrient planning." },
  { icon: CloudSun, name: "WeatherCast", desc: "Hyperlocal forecasts and actionable farm weather alerts." },
  { icon: Sun, name: "SuryaShakti", desc: "Solar-powered smart irrigation and sensor-based automation." },
  { icon: Store, name: "Krishi Market", desc: "Live mandi prices and direct farmer-to-buyer selling." },
  { icon: Users, name: "Farmer Community", desc: "Groups, experts and a network of 10 lakh+ farmers." },
  { icon: HandHeart, name: "Empowerment", desc: "Schemes, subsidies, FPOs and shared machinery access." },
  { icon: Bot, name: "Krishi AI", desc: "Voice-first assistant that speaks 9 Indian languages." },
];

const ecosystem = [
  { icon: Leaf, label: "Soil" },
  { icon: Sprout, label: "Crop" },
  { icon: CloudSun, label: "Weather" },
  { icon: Droplets, label: "Irrigation" },
  { icon: Store, label: "Market" },
  { icon: IndianRupee, label: "Farmer Income" },
];

const stats = [
  { icon: Satellite, label: "Real-Time Farm Monitoring" },
  { icon: Bot, label: "AI-Powered Recommendations" },
  { icon: Droplets, label: "Smart Resource Management" },
  { icon: TrendingUp, label: "Market Intelligence" },
  { icon: Thermometer, label: "Multilingual Accessibility" },
];

const krishiVideoUrl = "/Krishi%20Mitra%20Hindi%20Dub.mp4";

function Landing() {
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const popupVideoRef = useRef<HTMLVideoElement>(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowVideoPopup(window.scrollY > window.innerHeight * 0.65);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showVideoPopup || !popupVideoRef.current || !heroVideoRef.current) return;

    popupVideoRef.current.currentTime = heroVideoRef.current.currentTime;
    void popupVideoRef.current.play();
  }, [showVideoPopup]);

  useEffect(() => {
    if (heroVideoRef.current) heroVideoRef.current.muted = isVideoMuted || showVideoPopup;
    if (popupVideoRef.current) popupVideoRef.current.muted = isVideoMuted || !showVideoPopup;
  }, [isVideoMuted, showVideoPopup]);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <KrishiLogo size={34} />
            <span className="text-lg font-extrabold text-foreground">Krishi Mitra</span>
          </div>
          <Link to="/dashboard" className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-earth text-earth-foreground">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          ref={heroVideoRef}
          src={krishiVideoUrl}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,38,24,0.86)_0%,rgba(18,38,24,0.58)_48%,rgba(18,38,24,0.3)_100%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(18,38,24,0.8)] via-transparent to-[rgba(18,38,24,0.2)]" />
        <button
          type="button"
          onClick={() => setIsVideoMuted((muted) => !muted)}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/60"
          aria-label={isVideoMuted ? "Turn video sound on" : "Turn video sound off"}
        >
          {isVideoMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 md:pt-24">
          <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" /> Student Innovation · For India's Farmers
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Technology that grows <span className="text-sun">with the farmer.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            AI-powered crop intelligence, weather forecasting, smart irrigation, market access and farmer collaboration — all in one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:opacity-90">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/10 px-7 py-3 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20">
              Explore Platform
            </a>
          </div>
          </div>

          {/* Floating farm telemetry mock */}
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="rounded-3xl border bg-card p-6 shadow-2xl md:p-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { icon: Thermometer, label: "Nashik · Today", value: "29°C", sub: "Rain 72%" },
                  { icon: Droplets, label: "Soil Moisture", value: "64%", sub: "Optimal" },
                  { icon: Sun, label: "Solar Today", value: "18.7 kWh", sub: "94% efficiency" },
                  { icon: IndianRupee, label: "Tomato · Pune", value: "₹2,350", sub: "▲ 8.4% /quintal" },
                ].map((s) => (
                  <div key={s.label} className="animate-float-slow rounded-2xl bg-secondary p-4 text-left" style={{ animationDelay: `${s.label.length * 120}ms` }}>
                    <s.icon className="h-5 w-5 text-primary" />
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</div>
                    <div className="text-xl font-extrabold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={`fixed bottom-5 right-5 z-50 w-[min(22rem,calc(100vw-2rem))] origin-bottom-right transition-all duration-500 ${
          showVideoPopup ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-95 opacity-0"
        }`}
        aria-hidden={!showVideoPopup}
      >
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl shadow-black/30">
          <div className="relative aspect-video">
            <video
              ref={popupVideoRef}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Krishi Mitra introduction video"
              src={krishiVideoUrl}
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent px-4 pb-3 pt-8">
              <p className="text-xs font-bold text-white">Krishi Mitra in action</p>
            </div>
            <button
              type="button"
              onClick={() => setShowVideoPopup(false)}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              aria-label="Close video"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsVideoMuted((muted) => !muted)}
              className="absolute right-12 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/80"
              aria-label={isVideoMuted ? "Turn video sound on" : "Turn video sound off"}
            >
              {isVideoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-foreground">One Platform. Every Farming Decision.</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Seven connected modules that understand your farm end to end.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.name} className="card-hover rounded-2xl border bg-card p-6 shadow-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                <f.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{f.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Ecosystem flow */}
        <div className="mt-16 rounded-3xl border bg-card p-8 shadow-sm">
          <h3 className="text-center text-xl font-extrabold text-foreground">The Connected Farming Ecosystem</h3>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {ecosystem.map((e, i) => (
              <div key={e.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <e.icon className="h-6 w-6" />
                  </span>
                  <span className="text-xs font-bold text-foreground">{e.label}</span>
                </div>
                {i < ecosystem.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-secondary px-4 py-3">
                <s.icon className="h-4.5 w-4.5 shrink-0 text-primary" />
                <span className="text-xs font-bold text-secondary-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-center text-primary-foreground">
        <h2 className="mx-auto max-w-2xl px-4 text-3xl font-extrabold md:text-4xl">
          Smarter Farming. Stronger Farmers. Stronger India.
        </h2>
        <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-full bg-sun px-8 py-3.5 text-sm font-extrabold text-sun-foreground shadow-lg hover:opacity-90">
          Join Krishi Mitra <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t bg-card py-8 text-center text-xs text-muted-foreground">
        Krishi Mitra — किसान का डिजिटल साथी · Built for Indian agriculture
      </footer>
    </div>
  );
}
