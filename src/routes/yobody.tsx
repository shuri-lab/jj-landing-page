import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Timer, TrendingUp, Users, ShieldCheck,
  ArrowRight, Check, Mic, MicOff, Loader2, ChevronDown, ChevronLeft, ChevronRight,
  Smartphone, UserPlus, LineChart, Wallet,
} from "lucide-react";
import ybLogoDark from "@/assets/yobody/yobody-logo-dark.png";
import ybLogoWhite from "@/assets/yobody/yobody-logo-white.png";
import tjPhoto from "@/assets/yobody/tj.jpg";
import logoPfizer from "@/assets/yobody/logo-pfizer.png";
import logoExxon from "@/assets/yobody/logo-exxon.png";
import logoCaterpillar from "@/assets/yobody/logo-caterpillar.png";
import logoBofa from "@/assets/yobody/logo-bofa.png";
import logoIbm from "@/assets/yobody/logo-ibm.png";
import logoEy from "@/assets/yobody/logo-ey.png";
import logoShell from "@/assets/yobody/logo-shell.png";
import logoPwc from "@/assets/yobody/logo-pwc.png";
import logoJhancock from "@/assets/yobody/logo-jhancock.png";
import logoLiberty from "@/assets/yobody/logo-liberty.png";
import ybHero from "@/assets/yobody/yobody-web-hero-image-v2.png";
import typesOfCoaches from "@/assets/yobody/types-of-coaches-v2.png";
import jjCoach from "@/assets/yobody/jj-smith-coach-v2.png";
import ybHeroMobile from "@/assets/yobody/yobody-web-hero-image-mobile.png";
import screenOnboarding from "@/assets/yobody/screens-onboarding-call.png";
import screenPlans from "@/assets/yobody/screens-plans.png";
import screenCheckins from "@/assets/yobody/screens-checkins.png";
import screenWeekly from "@/assets/yobody/screens-weekly-calls.png";
import screenApp from "@/assets/yobody/screens-app.png";
import growCoaching from "@/assets/yobody/grow-coaching.png";
import growSales from "@/assets/yobody/grow-sales.png";
import growApp from "@/assets/yobody/grow-app.png";
import growResults from "@/assets/yobody/grow-results.png";
import growClients from "@/assets/yobody/grow-clients.png";
import growPaid from "@/assets/yobody/grow-paid.png";
import growYours from "@/assets/yobody/grow-yours.png";
import jjPortrait from "@/assets/landing/clarity-image.png";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

export const Route = createFileRoute("/yobody")({
  head: () => ({
    meta: [
      { title: "Yobody — 1 on 1 coaching at scale" },
      { name: "description", content: "Yobody clones coaches and runs their entire coaching business as them. Every client gets 1 on 1 coaching from the coach they came for." },
    ],
  }),
  component: Yobody,
});

const PRESS_LOGOS = [partnerNyTimes, partnerDrOz, partnerTheView, partnerSteveHarvey, partnerNbc, partnerFox, partnerEssence, partnerWomansWorld];

// ── JJ voice agent (Vapi) — talk to her twin live, in-page ────────────────────
const VAPI_ASSISTANT_ID = "e5d3b63a-0c2b-4fac-b37d-dcc00ede102d";
type VoiceStatus = "idle" | "initializing" | "ready" | "requesting-permission" | "connecting" | "connected" | "error";
type VapiClient = {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeAllListeners?: () => void;
  start: (assistantId: string) => Promise<unknown> | unknown;
  stop: () => Promise<unknown> | unknown;
};

class VoiceErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.error("Voice widget crashed:", error); }
  render() {
    if (this.state.hasError) return <div className="yb-voice"><p className="yb-voice-status">Voice demo could not load.</p></div>;
    return this.props.children;
  }
}

function JJVoiceDemo() {
  return <VoiceErrorBoundary><JJVoiceDemoInner /></VoiceErrorBoundary>;
}

function JJVoiceDemoInner() {
  const vapiRef = useRef<VapiClient | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const statusRef = useRef<VoiceStatus>("idle");
  const micStreamRef = useRef<MediaStream | null>(null);
  const barsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const gainRef = useRef(0);
  const isSpeakingRef = useRef(false);

  const [status, setStatusState] = useState<VoiceStatus>("idle");
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = VAPI_ASSISTANT_ID;

  function setStatus(next: VoiceStatus) { statusRef.current = next; if (mountedRef.current) setStatusState(next); }
  function clearConnectionTimeout() { if (timeoutRef.current !== null && typeof window !== "undefined") { window.clearTimeout(timeoutRef.current); timeoutRef.current = null; } }
  function releaseMic() { micStreamRef.current?.getTracks().forEach((t) => t.stop()); micStreamRef.current = null; }

  useEffect(() => {
    mountedRef.current = true;
    async function init() {
      try {
        if (typeof window === "undefined") return;
        if (!publicKey || !assistantId) { setError("Voice demo is not configured."); setStatus("error"); return; }
        setStatus("initializing");
        const eventsModule = await import("events");
        const EE = eventsModule.EventEmitter || eventsModule.default;
        if (typeof EE !== "function") throw new Error("Events polyfill unavailable.");
        const VapiModule = await import("@vapi-ai/web");
        const Vapi = VapiModule.default;
        if (typeof Vapi !== "function") throw new Error("@vapi-ai/web default export is not a constructor.");
        if (!mountedRef.current) return;
        const vapi = new Vapi(publicKey) as VapiClient;
        vapiRef.current = vapi;
        vapi.on("call-start", () => { clearConnectionTimeout(); setError(""); setStatus("connected"); });
        vapi.on("call-end", () => { clearConnectionTimeout(); isSpeakingRef.current = false; setIsSpeaking(false); releaseMic(); setStatus("ready"); });
        vapi.on("speech-start", () => { isSpeakingRef.current = true; setIsSpeaking(true); });
        vapi.on("speech-end", () => { isSpeakingRef.current = false; setIsSpeaking(false); });
        vapi.on("error", (err: unknown) => { console.error("Vapi error", err); clearConnectionTimeout(); isSpeakingRef.current = false; setIsSpeaking(false); releaseMic(); setError("Could not connect. Please try again."); setStatus("ready"); });
        setStatus("ready");
      } catch (err) {
        console.error("Vapi init failed:", err);
        setError("Voice demo could not initialize.");
        setStatus("error");
      }
    }
    init();
    return () => {
      mountedRef.current = false;
      clearConnectionTimeout(); releaseMic();
      try { vapiRef.current?.removeAllListeners?.(); vapiRef.current?.stop?.(); } catch (err) { console.error(err); } finally { vapiRef.current = null; }
    };
  }, [publicKey, assistantId]);

  useEffect(() => {
    let raf = 0; const N = 48;
    const loop = (t: number) => {
      const connected = statusRef.current === "connected";
      const target = !connected || isSpeakingRef.current ? 1 : 0;
      gainRef.current += (target - gainRef.current) * 0.05;
      const g = gainRef.current; const time = t / 1000; const bars = barsRef.current;
      for (let i = 0; i < N; i++) {
        const el = bars[i]; if (!el) continue;
        const a = (i / N) * Math.PI * 2;
        const w = 0.55 * Math.sin(a * 3 + time * 1.1) + 0.45 * Math.sin(a * 2 - time * 0.7 + 1.3);
        const norm = (w + 1) / 2;
        const h = 0.28 + g * (0.14 + norm * 1.5);
        el.style.transform = `scaleY(${h.toFixed(3)})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  async function startCall() {
    if (statusRef.current === "connecting" || statusRef.current === "connected") return;
    try {
      setError("");
      if (!vapiRef.current) { setError("Still loading. Please try again."); setStatus("ready"); return; }
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) { setError("Microphone is not available. Use HTTPS and a supported browser."); setStatus("ready"); return; }
      setStatus("requesting-permission");
      try { releaseMic(); micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (micErr) { console.error("Mic denied", micErr); setError("Microphone permission is required."); setStatus("ready"); return; }
      setStatus("connecting");
      timeoutRef.current = window.setTimeout(() => { try { vapiRef.current?.stop?.(); } catch (err) { console.error(err); } clearConnectionTimeout(); releaseMic(); setIsSpeaking(false); setError("Connection timed out. Please try again."); setStatus("ready"); }, 15000);
      await vapiRef.current.start(assistantId);
    } catch (err) { console.error("startCall failed:", err); clearConnectionTimeout(); releaseMic(); setIsSpeaking(false); setError("Could not start. Please try again."); setStatus("ready"); }
  }
  function endCall() {
    try { clearConnectionTimeout(); releaseMic(); vapiRef.current?.stop?.(); setIsSpeaking(false); setStatus("ready"); }
    catch (err) { console.error("endCall failed:", err); setStatus("ready"); }
  }

  const isConnected = status === "connected";
  const isBusy = status === "initializing" || status === "requesting-permission" || status === "connecting";
  const speaking = isConnected && isSpeaking;

  return (
    <div className="yb-voice">
      <div className="yb-voice-orb">
        <span className={`yb-voice-ring ${isConnected ? "is-live" : ""}`} aria-hidden />
        <div className="yb-vwring" aria-hidden>
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} className="yb-vwbar" style={{ transform: `rotate(${(i * 7.5).toFixed(1)}deg)` }}>
              <span className="yb-vwtick" ref={(el) => { barsRef.current[i] = el; }} />
            </span>
          ))}
        </div>
        <button type="button" onClick={isConnected ? endCall : startCall} disabled={isBusy} className="yb-voice-mic" aria-label={isConnected ? "End conversation" : "Talk to JJ's twin"}>
          {isBusy ? <Loader2 className="yb-spin" /> : isConnected ? <MicOff /> : <Mic />}
        </button>
      </div>
      <div className="yb-voice-text">
        <p className="yb-voice-status">
          {status === "initializing" ? "Loading…"
            : status === "requesting-permission" ? "Requesting microphone…"
            : status === "connecting" ? "Connecting with JJ…"
            : isConnected ? (speaking ? "JJ is speaking…" : "Listening…")
            : "Talk to JJ Smith’s Twin"}
        </p>
        <p className="yb-voice-hint">{error || (isConnected ? "Tap the mic again to end the call." : "Tap the mic and allow access")}</p>
      </div>
    </div>
  );
}

// ── "How Yobody works" — accordion + phone screenshots ───────────────────────
const HIW_FEATURES = [
  { n: "01", title: "Onboarding call", screen: screenOnboarding, text: "Every client starts with a 1 on 1 call with your twin. Goals, history, food, and what gets in the way." },
  { n: "02", title: "Personalized plans", screen: screenPlans, text: "Meals and training built from your programs, around their body and their week." },
  { n: "03", title: "Daily check-ins", screen: screenCheckins, text: "A text every morning in your voice. Weight, food, training, sleep, energy." },
  { n: "04", title: "Weekly calls", screen: screenWeekly, text: "Your twin knows their week before they pick up. Reviews it, finds the blocker, gets a commitment. Travel, injury, plateau: the plan changes on the call, the way you would change it." },
  { n: "05", title: "The app", screen: screenApp, text: "Progress, photo journal, community and leaderboard, under your brand." },
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how" className="yb-band">
      <div className="yb-wrap">
        {/* desktop — interactive accordion + phone that updates */}
        <div className="yb-hiw">
          <div className="yb-hiw-l">
            <div className="yb-hiw-intro">
              <h2 className="yb-h2">How Yobody works <span className="yb-h2-mut">for your clients</span></h2>
            </div>
            <div className="yb-hiw-acc">
              {HIW_FEATURES.map((f, i) => {
                const on = active === i;
                return (
                  <button
                    key={f.n}
                    type="button"
                    className={`yb-hiw-card ${on ? "is-active" : ""}`}
                    onClick={() => setActive(i)}
                    aria-expanded={on}
                  >
                    <span className="yb-hiw-head">
                      <span className="yb-hiw-num">{f.n}</span>
                      <span className="yb-hiw-title">{f.title}</span>
                      <span className="yb-hiw-chev"><ChevronDown className="yb-ico-18" /></span>
                    </span>
                    <span className="yb-hiw-body">
                      <span className="yb-hiw-body-in">
                        <span className="yb-hiw-text">{f.text}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="yb-hiw-media">
            <div className="yb-hiw-phone">
              {HIW_FEATURES.map((f, i) => (
                <img
                  key={f.n}
                  src={f.screen}
                  alt={`${f.title} — Yobody app screen`}
                  className={`yb-hiw-screen ${active === i ? "is-on" : ""}`}
                  loading="lazy"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* mobile — everything stacked, static */}
        <div className="yb-hiw-stack">
          <div className="yb-hiw-intro">
            <h2 className="yb-h2">How Yobody works <span className="yb-h2-mut">for your clients</span></h2>
          </div>
          {HIW_FEATURES.map((f) => (
            <article className="yb-hiw-item" key={f.n}>
              <div className="yb-hiw-item-card">
                <div className="yb-hiw-item-head">
                  <span className="yb-hiw-item-num">{f.n}</span>
                  <h3 className="yb-hiw-item-title">{f.title}</h3>
                </div>
                <p className="yb-hiw-item-text">{f.text}</p>
              </div>
              <div className="yb-hiw-item-phone">
                <img src={f.screen} alt={`${f.title} — Yobody app screen`} loading="lazy" draggable={false} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── "You grow the brand" — auto-advancing value slider ──
// img: final photo (else a branded placeholder). pos: object-position focal point.
const GROW_SLIDES: { label: string; caption: string; Icon: typeof Users; img?: string; pos?: string }[] = [
  { label: "1 on 1 coaching", caption: "Your twin runs every client, in your voice, on your method.", Icon: Users, img: growCoaching, pos: "34% 50%" },
  { label: "More sales", caption: "Funnels, pages and creative, built and run for you.", Icon: TrendingUp, img: growSales },
  { label: "Your own app", caption: "Where your clients live, stay and get results.", Icon: Smartphone, img: growApp },
  { label: "More clients", caption: "Every enquiry answered, every lead followed up.", Icon: UserPlus, img: growClients },
  { label: "Better results", caption: "Every client checked on daily, not just the ones who ask.", Icon: LineChart, img: growResults },
  { label: "Paid on time", caption: "Sign-ups, payments and renewals, all handled.", Icon: Wallet, img: growPaid },
  { label: "Still yours", caption: "Your brand, your clients, your list. Always.", Icon: ShieldCheck, img: growYours },
];

function GrowSlider() {
  const n = GROW_SLIDES.length;
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((v) => (v + 1) % n), 7000);
    return () => window.clearInterval(id);
  }, [n]);
  const go = (d: number) => setI((v) => (((v + d) % n) + n) % n);
  return (
    <div className="yb-grow-slider">
      <div className="yb-grow-stage">
        <div className="yb-grow-viewport">
          {GROW_SLIDES.map((s, idx) => (
            <div className={`yb-grow-slide ${i === idx ? "is-on" : ""}`} key={idx} aria-hidden={i !== idx || undefined}>
              <div className="yb-grow-ph">
                {s.img ? <img src={s.img} alt="" style={{ objectPosition: s.pos }} /> : <s.Icon className="yb-grow-ico" strokeWidth={1.5} />}
              </div>
              <span className="yb-grow-scrim" aria-hidden />
              <div className="yb-grow-meta">
                <span className="yb-grow-badge">{s.label}</span>
                <p className="yb-grow-cap">{s.caption}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="yb-grow-arrow yb-grow-arrow-l" onClick={() => go(-1)} aria-label="Previous"><ChevronLeft className="yb-ico-20" /></button>
        <button type="button" className="yb-grow-arrow yb-grow-arrow-r" onClick={() => go(1)} aria-label="Next"><ChevronRight className="yb-ico-20" /></button>
      </div>
      <div className="yb-grow-dots">
        {GROW_SLIDES.map((s, idx) => (
          <button key={idx} type="button" className={`yb-grow-dot ${i === idx ? "is-on" : ""}`} onClick={() => setI(idx)} aria-label={`Show ${s.label}`} />
        ))}
      </div>
    </div>
  );
}

const TILES = [
  { Icon: Timer, t: "Spend your time growing the brand" },
  { Icon: TrendingUp, t: <>Get paid without<br />adding an hour</> },
  { Icon: Users, t: <>Every client gets<br />you 1 on 1</> },
  { Icon: ShieldCheck, t: "Your brand and your clients, yours to keep, forever" },
];

// s = optical scale so compact/square marks aren't dwarfed by wide wordmarks
const TJ_LOGOS = [
  { src: logoPfizer, alt: "Pfizer", s: 1.03 },
  { src: logoExxon, alt: "Exxon", s: 1 },
  { src: logoCaterpillar, alt: "Caterpillar", s: 0.62 },
  { src: logoBofa, alt: "Bank of America", s: 0.95 },
  { src: logoIbm, alt: "IBM", s: 1 },
  { src: logoEy, alt: "EY", s: 1.22 },
  { src: logoShell, alt: "Shell", s: 1.26 },
  { src: logoPwc, alt: "PwC", s: 1.12 },
  { src: logoJhancock, alt: "John Hancock", s: 1 },
  { src: logoLiberty, alt: "Liberty Mutual", s: 0.95 },
];
// path-to-launch steps: cx/cy/labelY are SVG coords for the desktop wave diagram
const LAUNCH = [
  { n: "1", cx: 160, cy: 205, labelY: 273, lines: ["Book a call"] },
  { n: "2", cx: 410, cy: 100, labelY: 168, lines: ["We build", "your twin"] },
  { n: "3", cx: 650, cy: 205, labelY: 273, lines: ["Set up your app", "and offer"] },
  { n: "4", cx: 890, cy: 100, labelY: 168, lines: ["Launch"] },
];

function PartnerForm() {
  const [sent, setSent] = useState(false);
  if (sent) return <div className="yb-form-done"><Check className="yb-ico-22" /> Got it. We will come back within two business days.</div>;
  return (
    <form className="yb-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
      <input className="yb-input" type="email" placeholder="Email address" required />
      <input className="yb-input" placeholder="Instagram handle" required />
      <button className="yb-btn yb-btn-primary yb-btn-lg" type="submit">Become a partner <ArrowRight className="yb-ico-20" /></button>
      <p className="yb-form-note">No upfront cost for coaches who qualify.</p>
    </form>
  );
}

// Smooth-scroll to a target, re-running a few times so lazy-loaded images above
// the target (which grow the page mid-scroll) can't leave the anchor short — the
// classic "click jumps to the wrong section" bug. Cancels on manual scroll so it
// never hijacks the user.
function smoothScrollTo(el: HTMLElement) {
  const go = () => el.scrollIntoView({ behavior: "smooth", block: "start" });
  go();
  let cancelled = false;
  const cancel = () => { cancelled = true; off(); };
  const off = () => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchmove", cancel);
    window.removeEventListener("keydown", cancel);
    window.removeEventListener("pointerdown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchmove", cancel, { passive: true });
  window.addEventListener("keydown", cancel);
  window.addEventListener("pointerdown", cancel);
  [300, 650, 1050, 1600].forEach((d) => window.setTimeout(() => { if (!cancelled) go(); }, d));
  window.setTimeout(off, 1700);
}

function Yobody() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.length < 2 || href === "#top") return;
      const el = document.getElementById(href.slice(1));
      if (!el) return;
      e.preventDefault();
      smoothScrollTo(el);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return (
    <div className="yb">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" />
      <style>{CSS}</style>

      {/* NAV */}
      <header className="yb-nav">
        <div className="yb-nav-in">
          <a href="#top" className="yb-brand"><img src={ybLogoDark} alt="Yobody" /></a>
          <nav className="yb-nav-links">
            <a href="#how">How it works</a>
            <a href="#about">About</a>
            <a href="#partner" className="yb-btn yb-btn-outline yb-btn-sm">Become a partner</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="yb-fold">
        {/* 01 · HERO */}
        <section className="yb-hero">
          <div className="yb-hero-stage">
            <div className="yb-hero-bg" aria-hidden>
              <img src={ybHero} alt="" fetchPriority="high" />
              <span className="yb-hero-fade" />
            </div>
            <div className="yb-wrap yb-hero-inner">
              <div className="yb-hero-copy">
                <h1 className="yb-h1">The new era of<br /><span className="yb-hl">online coaching</span></h1>
                <p className="yb-hero-sub">Yobody is the first <span className="yb-hero-nw">1 on 1</span> coaching at scale platform, built for coaches and creators. We launch, run and grow your coaching business.</p>
                <div className="yb-hero-cta">
                  <a href="#partner" className="yb-btn yb-btn-primary yb-btn-lg">Become a partner <ArrowRight className="yb-ico-20" /></a>
                  <a href="#try-live" className="yb-btn yb-btn-ghost yb-btn-lg">Try it live</a>
                </div>
              </div>
              <div className="yb-hero-mob-img">
                <img src={ybHeroMobile} alt="A Yobody coach" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* 02 · BENEFITS STRIP */}
        <section className="yb-strip">
          <div className="yb-wrap">
            <div className="yb-strip-row">
              <div className="yb-strip-track">
                {[...TILES, ...TILES].map(({ Icon, t }, i) => (
                  <div className="yb-strip-item" key={i} aria-hidden={i >= TILES.length ? true : undefined}>
                    <span className="yb-strip-ico"><Icon className="yb-strip-svg" strokeWidth={1.6} /></span>
                    <p className="yb-strip-t">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* 03 · THE CLAIM */}
        <section className="yb-band yb-dark yb-claimsec">
          <div className="yb-claim-stage">
            <div className="yb-claim-copy">
              <img src={ybLogoWhite} alt="Yobody" className="yb-claim-logo" />
              <h2 className="yb-h2">We are the first <span className="yb-accent">done-as-you</span> coaching company</h2>
              <p className="yb-lead">We clone your voice, your personality, your method and everything you know about coaching. Then we run the entire business as you.</p>
              <a href="#partner" className="yb-btn yb-btn-primary yb-btn-lg">Become a partner <ArrowRight className="yb-ico-20" /></a>
            </div>
            <div className="yb-claim-media">
              <img src={typesOfCoaches} alt="The many kinds of coaches Yobody runs, as them" loading="lazy" />
            </div>
          </div>
        </section>

        {/* 04 · SEE IT LIVE */}
        <section id="live" className="yb-band">
          <div className="yb-wrap yb-live">
            <div className="yb-live-l">
              <div className="yb-jjcard">
                <div className="yb-jjcard-bg" aria-hidden />
                <div className="yb-jjcard-fig"><img src={jjCoach} alt="JJ Smith, your coach's twin" /></div>
                <div className="yb-jjcard-plate">
                  <p className="yb-jjcard-cred">New York Times bestselling author</p>
                  <p className="yb-jjcard-name">JJ Smith</p>
                </div>
              </div>
              <div className="yb-press">
                <p className="yb-press-lbl">Featured on</p>
                <div className="yb-marquee"><div className="yb-marquee-track">{[...PRESS_LOGOS, ...PRESS_LOGOS].map((l, i) => <img key={i} src={l} alt="" loading="lazy" />)}</div></div>
              </div>
            </div>
            <div className="yb-live-r">
              <div className="yb-live-head" id="try-live">
                <h2 className="yb-h2">JJ Smith&rsquo;s Twin <span className="yb-h2-mut">coaches thousands of women every week</span></h2>
              </div>
              <div className="yb-live-body">
                <p className="yb-lead yb-soft">Her twin runs every one of those calls in her voice, with her personality and her method. Her coaching, at infinite scale.</p>
                <JJVoiceDemo />
              </div>
            </div>
          </div>
        </section>

        {/* 05 · YOU GROW THE BRAND, WE RUN THE BUSINESS */}
        <section className="yb-band yb-cream">
          <div className="yb-wrap yb-grow">
            <div className="yb-grow-copy">
              <h2 className="yb-h2 yb-grow-h2"><span className="yb-nw">You grow the brand,</span><br /><span className="yb-nw">we run the business,</span><br /><span className="yb-nw yb-h2-mut">as you</span></h2>
              <p className="yb-grow-body">Yobody runs your entire coaching business. The coaching, the marketing, the app, the payments, the follow-up.</p>
              <p className="yb-grow-body">Every part of it in your voice, your personality and your method.</p>
              <div className="yb-grow-cta">
                <a href="#partner" className="yb-btn yb-btn-primary yb-btn-lg">Become a partner <ArrowRight className="yb-ico-20" /></a>
                <a href="#try-live" className="yb-btn yb-btn-ghost yb-btn-lg">Try it live</a>
              </div>
            </div>
            <GrowSlider />
          </div>
        </section>

        {/* 06 · HOW IT WORKS */}
        <HowItWorks />

        {/* 07 · THE LAUNCH */}
        <section className="yb-band yb-cream">
          <div className="yb-wrap">
            <div className="yb-path">
              <div className="yb-path-head">
                <h2 className="yb-h2 yb-path-title">Your Path to <span className="yb-accent">Launch</span></h2>
              </div>

              {/* desktop — winding wave */}
              <svg className="yb-path-svg" viewBox="0 0 1040 320" role="img" aria-label="Your path to launch, in four steps">
                <defs>
                  <marker id="ybPathArrow" markerUnits="userSpaceOnUse" markerWidth="24" markerHeight="24" refX="15" refY="11" orient="auto">
                    <path d="M4 4 L17 11 L4 18 Z" fill="#E16D4D" />
                  </marker>
                </defs>
                <path
                  d="M60 72 C 88 152 122 205 160 205 C 250 205 330 100 410 100 C 500 100 570 205 650 205 C 740 205 812 100 890 100 C 935 100 965 152 985 180"
                  fill="none" stroke="#E16D4D" strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray="9 12" markerStart="url(#ybPathArrow)" markerEnd="url(#ybPathArrow)"
                />
                {LAUNCH.map((s) => (
                  <g key={s.n}>
                    <circle cx={s.cx} cy={s.cy} r="46" fill="#FBE7DE" />
                    <text x={s.cx} y={s.cy} textAnchor="middle" dominantBaseline="central" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="43" fill="#1C1815">{s.n}</text>
                    <text x={s.cx} y={s.labelY} textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="19" fill="#FFFFFF">
                      {s.lines.map((ln, li) => (
                        <tspan key={li} x={s.cx} dy={li === 0 ? 0 : 24}>{ln}</tspan>
                      ))}
                    </text>
                  </g>
                ))}
              </svg>

              {/* mobile — vertical timeline */}
              <div className="yb-path-vert">
                {LAUNCH.map((s) => (
                  <div className="yb-path-vstep" key={s.n}>
                    <span className="yb-path-vcircle">{s.n}</span>
                    <span className="yb-path-vlabel">{s.lines.join(" ")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 08 · ABOUT */}
        <section id="about" className="yb-band yb-dark yb-aboutsec">
          <div className="yb-wrap">
            <div className="yb-center">
              <h2 className="yb-h2">About us</h2>
              <p className="yb-lead yb-soft yb-narrow">Yobody was founded to give coaches something no team of people can give them: themselves, everywhere at once.</p>
            </div>
            <div className="yb-about">
              <div className="yb-about-media">
                <img src={tjPhoto} alt="Todd Johnson, Founder and CEO of Yobody" />
                <div className="yb-about-plate">
                  <span className="yb-about-plate-name">Todd Johnson</span>
                  <span className="yb-about-plate-role">Founder &amp; CEO</span>
                </div>
              </div>
              <div className="yb-logos">
                <span className="yb-logos-lbl">Worked with the world&rsquo;s top companies</span>
                <div className="yb-logos-grid">
                  {TJ_LOGOS.map((l) => (
                    <div className="yb-logos-cell" key={l.alt}><img src={l.src} alt={l.alt} loading="lazy" style={{ ["--s" as string]: l.s }} /></div>
                  ))}
                </div>
                <div className="yb-logos-marquee" aria-hidden>
                  <div className="yb-logos-track">
                    {[...TJ_LOGOS, ...TJ_LOGOS].map((l, i) => (
                      <img key={i} src={l.src} alt="" style={{ ["--s" as string]: l.s }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="yb-about-copy">
                <p className="yb-about-x">Todd has spent decades building companies alongside some of the largest in the world, and just as long coaching people one at a time. Both taught him the same thing.</p>
                <blockquote className="yb-about-quote">People don&rsquo;t fail for lack of information. They fail because nobody follows through with them.</blockquote>
                <p className="yb-about-x">Yobody exists so a coach can be that person for every client, and not only for the ones the calendar fits.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 09 · BECOME A PARTNER */}
        <section id="partner" className="yb-band yb-cream">
          <div className="yb-wrap">
            <div className="yb-partner">
              <div className="yb-partner-copy">
                <h2 className="yb-h2 yb-partner-h">Become a partner</h2>
                <p className="yb-lead yb-soft">Don&rsquo;t wait to take your brand to the next level. With Yobody, launching your own coaching business has never been easier, faster, or more affordable.</p>
              </div>
              <div className="yb-partner-form">
                <PartnerForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="yb-footer">
        <div className="yb-footer-mark" aria-hidden><img src={ybLogoWhite} alt="" /></div>
        <div className="yb-wrap yb-footer-in">
          <div className="yb-footer-main">
            <a href="#top" className="yb-footer-brand"><img src={ybLogoWhite} alt="Yobody" /></a>
            <nav className="yb-footer-links">
              <a href="#how">How it works</a>
              <a href="#about">About</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="#partner">Privacy</a>
              <a href="#partner">Terms</a>
            </nav>
          </div>
          <div className="yb-footer-base">
            <p className="yb-footer-note">Yobody is a Next8i company.</p>
            <p className="yb-footer-note">&copy; 2026 Yobody</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
html,body{overflow-x:hidden;max-width:100%;scroll-behavior:smooth}
body{padding-bottom:0}
.yb{
  --orange:#E16D4D; --orange-deep:#D65F3C; --orange-soft:#FBE7DE;
  --sage:#8FA596; --terra:#A9604A;
  --cream:#FAF5F0; --cream-2:#F4ECE4; --white:#FFFFFF;
  --ink:#211D1A; --ink-2:#3A342F; --ink-soft:#7A716A; --hair:#ECE2D8;
  --dark:#1C1815;
  --sans:'Inter',-apple-system,'Segoe UI',sans-serif;
  --head:'Poppins',var(--sans);
  --shadow:0 40px 80px -48px rgba(60,35,20,.4);
  --shadow-sm:0 20px 44px -30px rgba(60,35,20,.4);
  font-family:var(--sans);color:var(--ink);background:var(--white);
  -webkit-font-smoothing:antialiased;line-height:1.5;overflow-x:hidden;width:100%;max-width:100vw;
}
.yb *{box-sizing:border-box}
.yb img{max-width:100%;display:block}
.yb a{text-decoration:none;color:inherit}
.yb [id]{scroll-margin-top:74px}
#try-live{scroll-margin-top:96px}
.yb :focus-visible{outline:3px solid var(--orange);outline-offset:3px}
.yb-wrap{max-width:1200px;margin:0 auto;padding:0 40px;width:100%}
.yb-center{text-align:center}
.yb-narrow{max-width:760px;margin-left:auto;margin-right:auto}
.yb-ico-14{width:14px;height:14px}.yb-ico-16{width:16px;height:16px}.yb-ico-18{width:18px;height:18px}.yb-ico-20{width:20px;height:20px}.yb-ico-22{width:22px;height:22px}.yb-ico-24{width:24px;height:24px}.yb-ico-26{width:26px;height:26px}

/* type */
.yb-eyebrow{display:inline-block;font-family:var(--head);font-weight:700;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--orange)}
.yb-h1{font-family:var(--head);font-weight:800;font-size:clamp(42px,5.4vw,66px);line-height:1.04;letter-spacing:-.03em;margin:16px 0 0}
.yb-hl{color:var(--orange)}
.yb-h2{font-family:var(--head);font-weight:700;font-size:clamp(34px,5.2vw,66px);line-height:1.03;letter-spacing:-.03em;margin:0}
.yb-lead{font-size:clamp(18px,2vw,23px);line-height:1.5;font-weight:400;margin:22px auto 0;max-width:min(720px,100%)}
.yb-soft{color:var(--ink-soft)}
.yb-accent{color:var(--orange)}

/* buttons */
.yb-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-family:var(--head);font-weight:700;border:2px solid transparent;border-radius:999px;transition:transform .15s,box-shadow .15s,background .15s,color .15s;white-space:nowrap;cursor:pointer}
.yb-btn-sm{font-size:15px;padding:11px 20px}
.yb-btn-lg{font-size:18px;padding:18px 30px}
.yb-btn-primary{background:var(--orange);color:#fff;box-shadow:0 18px 34px -14px rgba(225,109,77,.6)}
.yb a.yb-btn-primary{color:#fff}
.yb-btn-primary:hover{background:var(--orange-deep);transform:translateY(-2px)}
.yb-btn-ghost{background:transparent;color:var(--ink);border-color:var(--ink);}
.yb-btn-ghost:hover{background:var(--ink);color:#fff;transform:translateY(-2px)}
.yb-btn-outline{background:transparent;border-color:var(--orange)}
.yb a.yb-btn-outline{color:var(--orange-deep)}
.yb-btn-outline:hover{background:var(--orange)}
.yb a.yb-btn-outline:hover{color:#fff}

/* nav */
.yb-nav{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(14px);border-bottom:1px solid var(--hair)}
.yb-nav-in{max-width:1200px;margin:0 auto;padding:3px 40px;display:flex;align-items:center;justify-content:space-between}
.yb-brand img{height:54px;width:auto;display:block}
.yb-nav-links{display:flex;align-items:center;gap:30px}
.yb-nav-links>a:not(.yb-btn){font-family:var(--head);font-weight:600;font-size:15.5px;color:var(--ink-2)}
.yb-nav-links>a:not(.yb-btn):hover{color:var(--orange)}

/* band base */
.yb-band{position:relative;padding:clamp(86px,10vw,140px) 0;overflow:hidden}
.yb-cream{background:var(--cream)}
.yb-dark{background:var(--dark);color:#fff}
.yb-dark .yb-lead{color:rgba(255,255,255,.72)}

/* hero */
.yb-hero{position:relative;background:linear-gradient(180deg,#FDF9F5 0%,var(--cream) 100%);padding:0;overflow:hidden}
.yb-hero-stage{position:relative;overflow:hidden;display:flex;align-items:center;padding:clamp(34px,6vw,54px) 0 clamp(40px,7vw,64px)}
.yb-hero-bg{display:none;position:absolute;inset:0;z-index:0}
.yb-hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center 32%}
.yb-hero-fade{position:absolute;inset:0}
.yb-hero-inner{position:relative;z-index:1;width:100%}
.yb-hero-copy{text-align:left;min-width:0}
.yb-hero-sub{font-size:clamp(18px,2.1vw,23px);line-height:1.5;color:var(--ink-soft);margin:24px 0 0;max-width:min(560px,100%)}
.yb-hero-nw{white-space:normal}
.yb-hero-cta{display:flex;gap:14px;flex-wrap:wrap;justify-content:flex-start;margin-top:34px}
.yb-hero-mob-img{margin:clamp(24px,5vw,36px) -24px 0;width:auto;max-width:none;border-radius:0;box-shadow:none;aspect-ratio:1.12;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 4%,#000 94%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 4%,#000 94%,transparent 100%)}
.yb-hero-mob-img img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.yb-mark{background:linear-gradient(180deg,transparent 58%, rgba(225,109,77,.30) 58%);padding:0 .04em;border-radius:2px}

/* tiles */
.yb-strip{background:var(--white);padding:clamp(30px,3.6vw,50px) 0}
.yb-strip-track{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(18px,3vw,44px)}
.yb-strip-item{display:flex;flex-direction:column;align-items:center;text-align:center;gap:15px}
.yb-strip-item:nth-child(n+5){display:none}
.yb-strip-ico{display:flex;color:var(--orange)}
.yb-strip-svg{width:46px;height:46px}
.yb-strip-t{font-family:var(--head);font-weight:700;font-size:clamp(16px,1.35vw,20px);line-height:1.32;letter-spacing:-.01em;color:var(--ink);margin:0;max-width:19ch}

/* claim */
.yb-claimsec{padding:0;background:#000}
.yb-claim-stage{display:flex;flex-direction:column;align-items:center;text-align:center;gap:34px;padding:clamp(74px,12vw,92px) 24px clamp(64px,10vw,84px)}
.yb-claim-copy{max-width:560px}
.yb-claim-copy .yb-h2{line-height:1.16}
.yb-claim-copy .yb-accent{white-space:nowrap}
.yb-claim-logo{display:block;height:42px;width:auto;margin:0 auto 18px}
.yb-claim-copy .yb-lead{margin:22px auto 0}
.yb-claim-copy .yb-btn{margin-top:28px}
.yb-claim-media{width:100%;max-width:440px}
.yb-claim-media img{display:block;width:100%;height:auto;border-radius:22px}

/* see it live */
#live{padding-top:clamp(72px,10vw,112px)}
.yb-live{display:grid;grid-template-columns:minmax(0,0.86fr) minmax(0,1.14fr);gap:58px;align-items:start}
.yb-live-l{display:flex;flex-direction:column;gap:26px}
.yb-live-r{display:flex;flex-direction:column;gap:24px}
.yb-jjcard{position:relative;width:100%;max-width:400px;margin:0 auto;aspect-ratio:0.84}
.yb-jjcard-bg{position:absolute;inset:0;border-radius:28px;background:linear-gradient(160deg,#F3A87E 0%,#E97C57 100%)}
.yb-jjcard-fig{position:absolute;left:0;right:0;bottom:0;top:-26%;overflow:hidden;border-radius:0 0 28px 28px}
.yb-jjcard-fig img{position:absolute;left:50%;top:0;transform:translateX(-50%);width:106%;height:auto}
.yb-jjcard-plate{position:absolute;left:14px;right:14px;bottom:14px;z-index:2;background:#141110;border-radius:20px;padding:15px 18px 17px;text-align:center}
.yb-jjcard-cred{margin:0 0 4px;font-family:var(--head);font-weight:700;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.66)}
.yb-jjcard-name{margin:0;font-family:'Dancing Script',cursive;font-weight:700;font-size:34px;line-height:1;color:#fff}
.yb-live-l,.yb-live-r,.yb-live-head,.yb-live-body,.yb-jjcard,.yb-press,.yb-about-copy,.yb-about-media,.yb-hiw-l,.yb-grow-copy,.yb-grow-slider{min-width:0}
.yb-live-head .yb-eyebrow{margin-bottom:14px;display:inline-block}
.yb-live-body .yb-lead{margin:0}
.yb-live-head .yb-h2{font-size:clamp(35px,4.6vw,56px);line-height:1.08}
.yb-h2-mut{color:var(--ink-soft)}
.yb-nw{white-space:nowrap}

/* in-page JJ voice demo */
.yb-voice{display:flex;align-items:center;gap:20px;margin-top:30px;background:linear-gradient(135deg,#FCEBE1 0%,#FADFCE 100%);border:1.5px solid rgba(225,109,77,.42);border-radius:24px;padding:18px 22px;box-shadow:0 24px 46px -26px rgba(213,98,60,.5);min-width:0}
.yb-voice-orb{position:relative;width:120px;height:120px;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
.yb-voice-ring{position:absolute;left:50%;top:50%;width:140px;height:140px;margin:-70px 0 0 -70px;border-radius:999px;background:radial-gradient(circle,rgba(225,109,77,.22) 0%,rgba(225,109,77,0) 68%);pointer-events:none;animation:yb-vpulse-idle 2.8s ease-out infinite}
.yb-voice-ring.is-live{animation:yb-vpulse 1.7s ease-out infinite}
@keyframes yb-vpulse{0%{box-shadow:0 0 0 0 rgba(225,109,77,.42)}100%{box-shadow:0 0 0 22px rgba(225,109,77,0)}}
@keyframes yb-vpulse-idle{0%{box-shadow:0 0 0 0 rgba(225,109,77,.32)}70%,100%{box-shadow:0 0 0 15px rgba(225,109,77,0)}}
.yb-vwring{position:absolute;left:50%;top:50%;width:0;height:0;z-index:1}
.yb-vwbar{position:absolute;left:0;top:0;width:0;height:0}
.yb-vwtick{position:absolute;left:-1.5px;top:-48px;width:3px;height:12px;border-radius:3px;background:linear-gradient(180deg,#EE8A6C,#D5623C);transform-origin:center;transform:scaleY(.28);will-change:transform}
.yb-voice-mic{position:relative;z-index:2;width:82px;height:82px;border-radius:999px;background:linear-gradient(135deg,#EE8A6C,#D5623C);color:#fff;display:flex;align-items:center;justify-content:center;border:0;cursor:pointer;box-shadow:0 16px 30px -12px rgba(213,98,60,.6),0 0 0 6px rgba(255,255,255,.72);transition:transform .15s,filter .15s}
.yb-voice-mic:hover{filter:brightness(1.05)}
.yb-voice-mic:active{transform:scale(.95)}
.yb-voice-mic:disabled{opacity:.7;cursor:default}
.yb-voice-mic svg{width:32px;height:32px}
.yb-voice-text{min-width:0}
.yb-voice-status{font-family:var(--head);font-weight:800;font-size:19px;color:var(--ink);margin:0 0 4px}
.yb-voice-hint{font-size:14px;line-height:1.5;color:var(--ink-soft);margin:0}
.yb-spin{animation:yb-spin 1s linear infinite}
@keyframes yb-spin{to{transform:rotate(360deg)}}

/* press marquee */
.yb-press{text-align:center;margin:0}
.yb-press-lbl{font-family:var(--head);font-weight:700;font-size:12.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 18px}
.yb-marquee{overflow:hidden;min-width:0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
.yb-marquee-track{display:flex;align-items:center;gap:54px;width:max-content;animation:yb-scroll 32s linear infinite}
.yb-marquee-track img{height:46px;width:auto;opacity:.62;filter:grayscale(1)}
@keyframes yb-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* how it works — desktop: interactive accordion + updating phone (mobile block below) */
.yb-hiw{display:none}
.yb-hiw-l{display:flex;flex-direction:column;gap:clamp(28px,3vw,40px)}
.yb-hiw-acc{display:flex;flex-direction:column;gap:13px}
.yb-hiw-card{width:100%;text-align:left;font:inherit;color:var(--ink);background:var(--white);border:1px solid var(--hair);border-radius:20px;padding:0 clamp(18px,2vw,24px);cursor:pointer;overflow:hidden;-webkit-tap-highlight-color:transparent;transition:background .34s cubic-bezier(.4,0,.2,1),border-color .34s ease,box-shadow .34s ease}
.yb-hiw-card:hover{border-color:rgba(225,109,77,.55)}
.yb-hiw-card.is-active{background:var(--dark);border-color:var(--dark);box-shadow:0 32px 60px -34px rgba(28,24,21,.68)}
.yb-hiw-head{display:flex;align-items:center;gap:clamp(13px,1.4vw,18px);padding:clamp(19px,2vw,23px) 0}
.yb-hiw-num{flex:0 0 auto;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.08em;color:var(--orange)}
.yb-hiw-title{flex:1 1 auto;min-width:0;font-family:var(--head);font-weight:700;font-size:clamp(17px,1.5vw,21px);letter-spacing:-.01em;color:inherit;transition:color .34s ease}
.yb-hiw-card.is-active .yb-hiw-title{color:#fff}
.yb-hiw-chev{flex:0 0 auto;display:inline-flex;color:var(--ink-soft);transition:transform .38s cubic-bezier(.4,0,.2,1),color .34s ease}
.yb-hiw-card.is-active .yb-hiw-chev{color:var(--orange);transform:rotate(180deg)}
.yb-hiw-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .42s cubic-bezier(.4,0,.2,1)}
.yb-hiw-card.is-active .yb-hiw-body{grid-template-rows:1fr}
.yb-hiw-body-in{overflow:hidden;min-height:0}
.yb-hiw-text{display:block;font-size:clamp(16px,1.3vw,18px);font-weight:500;line-height:1.56;color:rgba(255,255,255,.82);padding-bottom:clamp(19px,2vw,23px);max-width:46ch;opacity:0;transform:translateY(6px);transition:opacity .36s ease .08s,transform .36s ease .08s}
.yb-hiw-card.is-active .yb-hiw-text{opacity:1;transform:none}
.yb-hiw-phone{position:relative;width:100%;max-width:404px;margin:0 auto;aspect-ratio:1024/1536}
.yb-hiw-screen{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;transform:scale(.97) translateY(8px);transition:opacity .5s ease,transform .5s cubic-bezier(.4,0,.2,1);pointer-events:none;filter:drop-shadow(0 44px 60px rgba(28,24,21,.18))}
.yb-hiw-screen.is-on{opacity:1;transform:none}

/* how it works — mobile: static stacked cards + phone */
.yb-hiw-stack{display:flex;flex-direction:column;gap:clamp(40px,9vw,52px)}
.yb-hiw-stack .yb-hiw-intro{text-align:center;margin-bottom:4px}
.yb-hiw-stack .yb-hiw-intro .yb-h2{font-size:clamp(40px,11vw,50px);line-height:1.04;max-width:12ch;margin:0 auto}
.yb-hiw-item{display:flex;flex-direction:column;gap:20px}
.yb-hiw-item-card{background:var(--white);border:1px solid var(--hair);border-radius:22px;padding:clamp(22px,5.5vw,28px);box-shadow:var(--shadow-sm)}
.yb-hiw-item-head{display:flex;align-items:baseline;gap:12px;margin-bottom:11px}
.yb-hiw-item-num{flex:0 0 auto;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.08em;color:var(--orange)}
.yb-hiw-item-title{font-family:var(--head);font-weight:700;font-size:clamp(23px,6.2vw,29px);letter-spacing:-.015em;line-height:1.08;margin:0}
.yb-hiw-item-text{font-size:clamp(17px,4.7vw,19.5px);font-weight:500;line-height:1.5;color:var(--ink-2);margin:0}
.yb-hiw-item-phone img{display:block;width:100%;max-width:288px;margin:0 auto;filter:drop-shadow(0 40px 56px rgba(28,24,21,.17))}

/* business columns */
/* you grow the brand — copy + auto-advancing value slider */
.yb-grow{display:flex;flex-direction:column;gap:clamp(34px,8vw,48px)}
.yb-grow-copy{min-width:0}
.yb-grow-copy .yb-h2{max-width:none}
.yb-grow-body{font-size:clamp(18px,1.85vw,22px);line-height:1.56;color:var(--ink-soft);margin:clamp(18px,2.4vw,26px) 0 0;max-width:52ch}
.yb-grow-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:clamp(26px,3vw,34px)}
.yb-grow-slider{min-width:0}
.yb-grow-stage{position:relative}
.yb-grow-viewport{position:relative;aspect-ratio:4/5;border-radius:24px;overflow:hidden;box-shadow:0 34px 62px -36px rgba(60,35,20,.55)}
.yb-grow-slide{position:absolute;inset:0;opacity:0;transition:opacity .6s ease;pointer-events:none}
.yb-grow-slide.is-on{opacity:1;pointer-events:auto}
.yb-grow-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#F3B79C 0%,#E16D4D 52%,#BF4A30 100%)}
.yb-grow-ph img{width:100%;height:100%;object-fit:cover}
.yb-grow-ico{width:clamp(54px,7vw,76px);height:clamp(54px,7vw,76px);color:rgba(255,255,255,.9)}
.yb-grow-scrim{position:absolute;left:0;right:0;bottom:0;height:66%;background:linear-gradient(to top,rgba(22,15,12,.88),rgba(22,15,12,.4) 48%,transparent);pointer-events:none}
.yb-grow-meta{position:absolute;left:clamp(20px,3vw,28px);right:clamp(20px,3vw,28px);bottom:clamp(20px,3vw,28px);display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.yb-grow-badge{font-family:var(--head);font-weight:700;font-size:13px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink);background:rgba(255,255,255,.94);padding:9px 16px;border-radius:999px}
.yb-grow-cap{margin:0;font-family:var(--head);font-weight:600;font-size:clamp(20.5px,1.9vw,25px);line-height:1.3;color:#fff;text-shadow:0 1px 14px rgba(0,0,0,.45)}
.yb-grow-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:3;width:44px;height:44px;border-radius:999px;border:none;background:rgba(255,255,255,.92);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 22px -10px rgba(0,0,0,.5);transition:background .2s,color .2s}
.yb-grow-arrow:hover{background:#fff;color:var(--orange-deep)}
.yb-grow-arrow:active{transform:translateY(-50%) scale(.92)}
.yb-grow-arrow-l{left:-20px}
.yb-grow-arrow-r{right:-20px}
.yb-grow-dots{display:flex;gap:9px;justify-content:center;margin-top:clamp(18px,2vw,24px)}
.yb-grow-dot{width:9px;height:9px;border-radius:999px;border:none;padding:0;cursor:pointer;background:rgba(28,24,21,.2);transition:background .25s,width .25s}
.yb-grow-dot.is-on{width:26px;background:var(--orange)}

/* launch — path-to-launch diagram */
.yb-path{background:var(--dark);border-radius:clamp(24px,3vw,38px);padding:clamp(48px,4.8vw,62px) clamp(28px,4vw,56px) clamp(46px,4.4vw,56px);overflow:hidden}
.yb-path-head{text-align:center}
.yb-path-title{color:#fff;margin:0}
.yb-path-svg{display:none}
/* mobile vertical timeline */
.yb-path-vert{display:flex;flex-direction:column;gap:clamp(30px,8vw,38px);position:relative;width:fit-content;max-width:100%;margin:clamp(28px,7vw,38px) auto 6px;padding-left:4px}
.yb-path-vert::before{content:"";position:absolute;left:33px;top:31px;bottom:31px;border-left:2.5px dashed var(--orange);opacity:.75}
.yb-path-vstep{position:relative;z-index:1;display:flex;align-items:center;gap:20px}
.yb-path-vcircle{flex:0 0 auto;width:62px;height:62px;border-radius:50%;background:var(--orange-soft);color:var(--dark);font-family:var(--head);font-weight:700;font-size:27px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
.yb-path-vlabel{font-family:var(--head);font-weight:600;font-size:clamp(18px,4.8vw,21px);color:#fff;line-height:1.18}

/* about */
/* about — founder */
.yb-about{display:flex;flex-direction:column;gap:clamp(44px,11vw,56px);margin-top:clamp(42px,7vw,58px)}
.yb-about-media{position:relative;border-radius:28px;overflow:hidden;box-shadow:var(--shadow);aspect-ratio:4/3;background:var(--cream-2)}
.yb-about-media img{width:100%;height:100%;object-fit:cover}
.yb-about-plate{position:absolute;left:clamp(14px,1.6vw,20px);bottom:clamp(14px,1.6vw,20px);background:rgba(18,15,14,.88);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);border-radius:15px;padding:12px 18px;display:flex;flex-direction:column;gap:1px;box-shadow:0 16px 30px -18px rgba(0,0,0,.6)}
.yb-about-plate-name{font-family:var(--head);font-weight:700;font-size:clamp(16px,1.5vw,19px);color:#fff;letter-spacing:-.01em}
.yb-about-plate-role{font-family:var(--head);font-weight:600;font-size:12.5px;letter-spacing:.02em;color:var(--orange)}
.yb-about-x{font-size:clamp(16px,1.55vw,19px);line-height:1.6;color:var(--ink-soft);margin:0 0 16px}
.yb-about-x:last-child{margin-bottom:0}
.yb-about-quote{font-family:var(--head);font-weight:600;font-size:clamp(20px,2.1vw,26px);line-height:1.32;letter-spacing:-.01em;color:var(--ink);border-left:3px solid var(--orange);padding-left:clamp(18px,1.8vw,24px);margin:0 0 20px}
.yb-aboutsec{background:#0D0B0A}
.yb-aboutsec .yb-about-x{color:rgba(255,255,255,.68)}
.yb-aboutsec .yb-about-quote{color:#fff}
.yb-aboutsec .yb-about-media{box-shadow:0 40px 80px -44px rgba(0,0,0,.9)}
/* about — worked-with logos */
.yb-logos{text-align:center}
.yb-logos-lbl{display:block;font-family:var(--head);font-weight:700;font-size:12.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:clamp(26px,3.2vw,40px)}
.yb-logos-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:clamp(24px,3vw,44px) clamp(24px,3vw,48px);align-items:center;justify-items:center}
.yb-logos-cell{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(44px,4.4vw,58px)}
.yb-logos-cell img{max-width:100%;max-height:calc(var(--s,1) * clamp(28px,3vw,39px));width:auto;height:auto;object-fit:contain;opacity:.85}
.yb-logos-marquee{display:none;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.yb-logos-track{display:flex;align-items:center;gap:42px;width:max-content;animation:yb-scroll 26s linear infinite}
.yb-logos-track img{height:calc(var(--s,1) * 26px);width:auto;opacity:.82}
@media (max-width:680px){.yb-logos-grid{display:none}.yb-logos-marquee{display:flex;width:100vw;margin-left:calc(50% - 50vw)}}

/* become a partner */
.yb-partner{max-width:1000px;margin:0 auto;background:var(--white);border:1px solid var(--hair);border-radius:clamp(22px,3.4vw,34px);box-shadow:var(--shadow-sm);padding:clamp(30px,6vw,58px);display:flex;flex-direction:column;gap:clamp(26px,5vw,38px)}
.yb-partner-copy{text-align:center}
.yb-partner-h{font-size:clamp(30px,7vw,42px);margin:0}
.yb-partner-copy .yb-lead{margin-top:16px;max-width:none}
.yb-partner-form{width:100%}
.yb-form{margin-top:0;width:100%;max-width:none;display:flex;flex-direction:column;gap:14px;text-align:left}
.yb-input{width:100%;background:var(--cream-2);border:1.6px solid var(--hair);border-radius:16px;padding:19px 20px;font-family:var(--sans);font-size:17px;color:var(--ink);transition:border-color .18s,box-shadow .18s,background .18s}
.yb-input::placeholder{color:var(--ink-soft)}
.yb-input:focus{outline:none;background:var(--white);border-color:var(--orange);box-shadow:0 0 0 4px rgba(225,109,77,.16)}
.yb-form .yb-btn{margin-top:6px;width:100%}
.yb-form-note{font-size:14px;color:var(--ink-soft);margin:4px 0 0;text-align:center}
.yb-form-done{margin:0;display:inline-flex;align-items:center;gap:10px;background:var(--orange);color:#fff;font-family:var(--head);font-weight:700;font-size:18px;padding:20px 30px;border-radius:16px}

/* footer */
.yb-footer{position:relative;overflow:hidden;background:#141110;color:rgba(255,255,255,.7);padding:clamp(56px,7vw,90px) 0 clamp(30px,3.5vw,42px)}
.yb-footer-mark{position:absolute;left:50%;bottom:clamp(-46px,-3.5vw,-22px);transform:translateX(-50%);width:min(1500px,126%);opacity:.05;pointer-events:none;z-index:0}
.yb-footer-mark img{display:block;width:100%;height:auto}
.yb-footer-in{position:relative;z-index:1;display:flex;flex-direction:column;gap:clamp(30px,4vw,46px)}
.yb-footer-main{display:flex;align-items:center;justify-content:space-between;gap:clamp(26px,4vw,48px);flex-wrap:wrap}
.yb-footer-brand{display:inline-flex}
.yb-footer-brand img{display:block;height:clamp(50px,5vw,64px);width:auto}
.yb-footer-links{display:flex;flex-wrap:wrap;gap:clamp(18px,2.4vw,34px)}
.yb-footer-links a{font-family:var(--head);font-weight:600;font-size:16px;color:rgba(255,255,255,.72)}
.yb-footer-links a:hover{color:var(--orange)}
.yb-footer-base{display:flex;align-items:center;justify-content:space-between;gap:12px 24px;flex-wrap:wrap;padding-top:clamp(22px,3vw,30px);border-top:1px solid rgba(255,255,255,.1)}
.yb-footer-note{font-size:14px;color:rgba(255,255,255,.45);margin:0}

/* responsive */
@media (min-width:820px){
  .yb-fold{min-height:calc(100vh - 61px);display:flex;flex-direction:column}
  .yb-fold .yb-hero{flex:1 1 auto;display:flex;flex-direction:column}
  .yb-fold .yb-hero-stage{flex:1 1 auto}
  .yb-fold .yb-strip{flex:0 0 auto}
  .yb-hero-stage{min-height:480px;padding:0}
  .yb-hero-mob-img{display:none}
  .yb-hero-bg{display:block;left:auto;right:0;width:58%}
  .yb-hero-bg img{object-position:center 30%}
  .yb-hero-nw{white-space:nowrap}
  .yb-hero-fade{background:linear-gradient(90deg,#FBF6F1 0%,#FBF6F1 13%,rgba(251,246,241,.55) 30%,transparent 52%)}
  .yb-hero-copy{max-width:580px;text-align:left}
  .yb-hero-cta{justify-content:flex-start}
  #live{padding-top:clamp(150px,15vw,216px)}
  .yb-live-r{margin-top:-78px}
  .yb-claim-stage{flex-direction:row;align-items:center;justify-content:space-between;text-align:left;max-width:none;margin:0;gap:clamp(28px,4vw,72px);padding:clamp(20px,2vw,30px) 0}
  .yb-claim-copy{flex:0 1 auto;max-width:500px;text-align:left;margin-left:max(40px, calc((100% - 1200px) / 2 + 40px))}
  .yb-claim-copy .yb-claim-logo{margin:0 0 22px;height:48px}
  .yb-claim-copy .yb-h2{font-size:clamp(34px,4.6vw,56px)}
  .yb-claim-copy .yb-lead{margin:22px 0 0;max-width:440px}
  .yb-claim-media{flex:0 0 auto;width:clamp(360px,44vw,620px);max-width:none;margin-right:clamp(24px,2.6vw,44px)}
  .yb-hiw{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,0.95fr);gap:clamp(48px,5.5vw,88px);align-items:center}
  .yb-hiw-stack{display:none}
  .yb-hiw-intro .yb-h2{font-size:clamp(38px,4.4vw,58px);line-height:1.06}
  .yb-path-svg{display:block;width:100%;height:auto;margin-top:clamp(18px,2.2vw,32px)}
  .yb-path-vert{display:none}
  .yb-about{display:grid;grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr);grid-template-areas:"media copy" "logos logos";column-gap:clamp(40px,5vw,66px);row-gap:0;align-items:center}
  .yb-about-media{grid-area:media}
  .yb-about-copy{grid-area:copy}
  .yb-logos{grid-area:logos;margin-top:clamp(28px,3vw,40px);padding-top:clamp(26px,2.8vw,36px);border-top:1px solid rgba(255,255,255,.11)}
  .yb-partner{display:grid;grid-template-columns:1.05fr 0.95fr;gap:clamp(40px,5vw,68px);align-items:center;padding:clamp(40px,4vw,60px)}
  .yb-partner-copy{text-align:left}
  .yb-partner-h{font-size:clamp(34px,3.4vw,48px);white-space:nowrap}
  .yb-partner-copy .yb-lead{margin-top:18px}
  .yb-grow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,0.95fr);gap:clamp(48px,5vw,80px);align-items:center}
  .yb-grow-copy .yb-h2{font-size:clamp(30px,3.4vw,50px);line-height:1.08}
  .yb-grow-slider{width:100%;max-width:470px;margin:0 auto}
  .yb-grow-arrow-l{left:-28px}
  .yb-grow-arrow-r{right:-28px}
}
@media (max-width:820px){
  .yb-wrap{padding:0 24px}
  .yb-nav-links{gap:18px}
  .yb-strip-track{grid-template-columns:1fr 1fr;gap:32px 20px}
  .yb-live{display:flex;flex-direction:column;gap:28px}
  .yb-live-l,.yb-live-r{display:contents}
  .yb-live-head{order:1}
  .yb-jjcard{order:2}
  .yb-press{order:3}
  .yb-live-body{order:4}
  .yb-about-media{max-width:520px;width:100%;margin:0 auto;aspect-ratio:5/4}
}
@media (max-width:560px){
  .yb-nav-in{padding:9px 18px}
  .yb-brand img{height:58px}
  .yb-nav-links>a:not(.yb-btn){display:none}
  .yb-nav-links .yb-btn-sm{font-size:14px;padding:9px 16px}
  .yb-h1{font-size:clamp(39px,10.2vw,53px)}
  .yb-hero-sub{font-size:22px;line-height:1.5;margin-top:20px}
  .yb-strip-row{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
  .yb-strip-track{display:flex;grid-template-columns:none;width:max-content;gap:34px;animation:yb-scroll 24s linear infinite}
  .yb-strip-item{width:150px}
  .yb-strip-item:nth-child(n+5){display:flex}
  .yb-btn-lg{padding:17px 22px;font-size:17px}
  .yb-hero-cta{flex-direction:column;align-items:flex-start;gap:12px}
  .yb-hero-cta .yb-btn{width:auto}
  .yb-voice{flex-direction:column;text-align:center;gap:14px}
  .yb-claim-copy .yb-h2{font-size:clamp(38px,9vw,44px)}
  .yb-claim-copy .yb-lead{font-size:20px}
  .yb-claim-stage{padding-left:14px;padding-right:14px}
  .yb-claim-media{max-width:none}
  .yb-live-body .yb-lead{font-size:19.5px}
  .yb-grow-body{font-size:19.5px;line-height:1.55}
  .yb-about-x{font-size:18px;line-height:1.64;margin-bottom:22px}
  .yb-about-quote{font-size:22px;line-height:1.38;margin:6px 0 26px;padding-left:20px}
  .yb-about-copy{margin-top:2px}
  .yb-aboutsec .yb-lead{font-size:19px;line-height:1.58;margin-top:18px}
  .yb-aboutsec .yb-center{padding:0 4px}
  .yb-hero-stage{padding-bottom:0}
  .yb-strip{padding-top:44px;padding-bottom:52px}
  .yb-jjcard{margin-top:66px}
}
`;
