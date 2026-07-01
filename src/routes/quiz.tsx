import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, ClipboardList, Phone } from "lucide-react";
import QuizTakeover from "@/components/quiz/QuizTakeover";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import heroMobileC from "@/assets/landing/quiz-hero-image-mobile.png";
import heroDesktopC from "@/assets/landing/quiz-hero-image-desktop.png";
import jjPortrait from "@/assets/landing/jj-selfie-sun.jpg";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import tTammi from "@/assets/landing/transformation-tammi.jpg";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "12 Weeks to Sexy — Get Your Personalized Plan with JJ Smith" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks with JJ Smith as your personal coach. Take the quick quiz and get the plan she builds just for you. Free.",
      },
      { property: "og:title", content: "12 Weeks to Sexy — Get Your Personalized Plan with JJ Smith" },
      {
        property: "og:description",
        content: "For 12 weeks, it's just you and JJ. A personalized plan, a weekly call, and a check in every day.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const PINK = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";
const BLUSH = "#fdebeb";

// Every CTA on this page opens the full-screen quiz. One door, one action.
const QuizContext = createContext<() => void>(() => {});
function useOpenQuiz() {
  return useContext(QuizContext);
}

const PRESS = [
  { src: partnerNyTimes, alt: "The New York Times" },
  { src: partnerDrOz, alt: "The Dr. Oz Show" },
  { src: partnerSteveHarvey, alt: "Steve Harvey" },
  { src: partnerTheView, alt: "The View" },
  { src: partnerNbc, alt: "NBC" },
  { src: partnerFox, alt: "FOX" },
  { src: partnerEssence, alt: "Essence" },
  { src: partnerWomansWorld, alt: "Woman's World" },
];

// Quotes only. Never pounds, never names. Leads on a different image than the
// one the quiz opens on (the quiz opens on transformation 1).
const PROOF = [
  { src: t10, quote: "I feel like the woman I forgot I was." },
  { src: t8, quote: "I'm dressing up again. I'm smiling in pictures again." },
  { src: t12, quote: "I'm back to the size I never thought I'd see again." },
  { src: t9, quote: "I'm not the one hiding behind the camera anymore." },
  { src: t7, quote: "My doctor's visits sound completely different now." },
  { src: t4, quote: "I'm in family photos again, front and center." },
  { src: tTammi, quote: "I lost the baby weight." },
  { src: t1, quote: "I'm not hiding in baggy clothes anymore." },
];

function Landing() {
  const [quizOpen, setQuizOpen] = useState(false);
  return (
    <QuizContext.Provider value={() => setQuizOpen(true)}>
      <div className="overflow-x-hidden bg-background text-foreground">
        <Header />
        <main>
          <Hero />
          <WhatThisIs />
          <Proof />
          <HowItWorks />
          <MeetJJ />
          <FinalCta />
        </main>
        <Footer />
        <StickyCta />
      </div>
      <QuizTakeover open={quizOpen} onClose={() => setQuizOpen(false)} />
    </QuizContext.Provider>
  );
}

// ── Reusable CTA ─────────────────────────────────────────────────────────────
function PrimaryCta({ subline, className = "" }: { subline?: string; className?: string }) {
  const openQuiz = useOpenQuiz();
  return (
    <div className={`w-full ${className}`}>
      <button
        onClick={openQuiz}
        data-cta="take-quiz"
        className="block w-full rounded-2xl px-6 py-5 text-center text-[18px] sm:text-[20px] font-bold uppercase tracking-wide text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
        style={{ background: PINK }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          Take the quiz <span aria-hidden>→</span>
        </span>
      </button>
      {subline && <p className="mt-3 text-center text-[15px] sm:text-[16px] font-semibold" style={{ color: "#8c114a" }}>{subline}</p>}
    </div>
  );
}

// Soft highlight behind key phrases (matches the reference hero treatment).
function Hi({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-sm px-1 text-ink" style={{ backgroundColor: "#f6dedb" }}>
      {children}
    </mark>
  );
}

function Wordmark({ className = "h-9 sm:h-10" }: { className?: string }) {
  return (
    <img
      src={jjSmithLogo}
      alt="JJ Smith"
      className={`${className} w-auto`}
      width={132}
      height={25}
    />
  );
}

// ── 1. Header ────────────────────────────────────────────────────────────────
function Header() {
  const openQuiz = useOpenQuiz();
  return (
    <header style={{ backgroundColor: BLUSH }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-center px-5 py-4 sm:justify-between">
        <Wordmark className="h-6 sm:h-7" />
        <button
          onClick={openQuiz}
          data-cta="take-quiz"
          className="hidden rounded-full border-2 border-[#d62a7a] px-5 py-2.5 text-[14px] font-bold uppercase tracking-wide text-[#b81860] transition-colors hover:bg-[#d62a7a] hover:text-white sm:inline-flex"
        >
          Take the quiz →
        </button>
      </div>
    </header>
  );
}

// ── 2. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="px-5 pb-14 pt-4 sm:pb-16 lg:pb-20" style={{ backgroundColor: BLUSH }}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1200px]">
        <div className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
          <div className="lg:order-1">
            <h1 className="text-left font-serif font-medium text-[34px] leading-[1.1] tracking-[-0.02em] sm:text-[44px] lg:text-[52px]">
              <span style={{ color: "#15102a" }}>Why losing the belly after 40 feels impossible</span>{" "}
              <em className="not-italic" style={{ color: "#c41e6a" }}>(and the one shift that changes everything).</em>
            </h1>
            <p className="mt-6 max-w-[560px] text-left text-[18px] font-medium leading-[1.5] text-ink sm:text-[21px]">
              Take this 1-minute quiz to reveal what's really going on, and what finally turns it around.
            </p>

            {/* Desktop CTA + trust live in the left column */}
            <div className="mt-8 hidden max-w-[420px] lg:block">
              <PrimaryCta subline="Get your personal belly-fat diagnosis in 60 seconds" />
            </div>
            <p className="mt-5 hidden text-[13px] font-semibold tracking-wide lg:block" style={{ color: "#8c114a" }}>
              NYT bestselling author · 5 million pounds lost · 800,000 women helped
            </p>
          </div>

          {/* Desktop image (right column) */}
          <div className="hidden lg:order-2 lg:block">
            <img src={heroDesktopC} alt="JJ Smith, your personal coach for 12 weeks" className="h-auto w-full" width={2000} height={2000} />
          </div>

          {/* Mobile: image sits flush on top of the CTA */}
          <div className="mx-auto mt-8 w-full max-w-[440px] lg:hidden">
            <img src={heroMobileC} alt="JJ Smith, your personal coach for 12 weeks" className="block h-auto w-full" width={2000} height={2000} />
            <PrimaryCta subline="Get your personal belly-fat diagnosis in 60 seconds" className="relative z-10" />
            <p className="mt-5 text-center text-[13px] font-semibold tracking-wide" style={{ color: "#8c114a" }}>
              NYT bestselling author · 5 million pounds lost · 800,000 women helped
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-ink-faint">As seen on</p>
          <div className="mt-5">
            <PressMarquee />
          </div>
        </div>
      </div>
    </section>
  );
}

function PressMarquee() {
  const track = [...PRESS, ...PRESS];
  return (
    <div className="relative overflow-hidden">
      <div className="flex w-max items-center gap-12 animate-marquee sm:gap-16">
        {track.map((p, i) => (
          <img key={i} src={p.src} alt={p.alt} className="h-12 w-auto shrink-0 object-contain opacity-80 sm:h-16" loading="eager" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#fdebeb] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fdebeb] to-transparent" />
    </div>
  );
}

// ── 3. What this is ──────────────────────────────────────────────────────────
function WhatThisIs() {
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="font-serif text-[30px] leading-[1.15] tracking-[-0.01em] text-ink sm:text-[40px] lg:text-[46px]">
          First, find out what's really going on.
        </h2>
        <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-[1.6] text-ink-soft sm:text-[20px]">
          Most plans hand you the same rules and never ask why it stopped working for you. This quiz reads your real answers and shows you the actual reason the weight isn't moving, and the one shift that turns it around. It takes about a minute, it's free, and what you learn is yours to keep.
        </p>
      </div>
    </section>
  );
}

// ── 4. Proof ─────────────────────────────────────────────────────────────────
function Proof() {
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px]">
        <h2 className="text-center font-serif text-[30px] leading-[1.15] tracking-[-0.01em] text-ink sm:text-[40px] lg:text-[46px]">
          This is what happens with JJ in your corner.
        </h2>
        <div className="mt-10">
          <TransformationCarousel items={PROOF} />
        </div>
      </div>
    </section>
  );
}

function TransformationCarousel({ items }: { items: { src: string; quote: string }[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [paused, items.length]);

  return (
    <div
      className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-32px_rgba(140,17,74,0.6)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        startX.current = null;
        setPaused(false);
      }}
    >
      <div className="relative">
        <img src={items[i].src} alt="Sister transformation" className="block max-h-[460px] w-full bg-[#fbe3ea] object-contain" loading="lazy" />
        <button
          onClick={() => go(-1)}
          aria-label="Previous"
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6">
        <p className="font-serif italic text-[20px] leading-snug text-ink sm:text-[22px]">"{items[i].quote}"</p>
        <div className="mt-5 flex justify-center gap-2">
          {items.map((_, k) => (
            <button
              key={k}
              onClick={() => setI(k)}
              aria-label={`Slide ${k + 1}`}
              className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-[#d62a7a]" : "w-2 bg-[#d62a7a]/30"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 5. How it works ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { Icon: HelpCircle, title: "Take the 1-minute quiz", text: "Answer a few honest questions about you and what you've already tried." },
    { Icon: ClipboardList, title: "Get your real diagnosis", text: "See the actual reason the weight won't move, read from your answers, not a generic guess." },
    { Icon: Phone, title: "Discover what turns it around", text: "Learn the one shift that finally works for your situation, and exactly what to do next." },
  ];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1000px]">
        <h2 className="text-center font-serif text-[30px] leading-[1.15] text-ink sm:text-[40px] lg:text-[46px]">How it works</h2>
        <div className="mt-10 space-y-5 lg:mt-14 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {steps.map(({ Icon, title, text }, idx) => (
            <div key={title} className="relative rounded-2xl bg-bg-soft p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="text-[14px] font-bold uppercase tracking-[0.16em] text-brand">Step {idx + 1}</span>
              </div>
              <h3 className="mt-4 text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">{title}</h3>
              <p className="mt-2 text-[16px] leading-[1.6] text-ink-soft sm:text-[17px]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[420px]">
          <PrimaryCta />
        </div>
      </div>
    </section>
  );
}

// ── 6. Meet JJ ───────────────────────────────────────────────────────────────
function MeetJJ() {
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1000px]">
        <div className="lg:grid lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-12">
          <div className="mb-8 lg:mb-0">
            <div className="overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgba(140,17,74,0.5)]">
              <img src={jjPortrait} alt="JJ Smith" className="block h-auto w-full object-cover" loading="lazy" />
            </div>
          </div>
          <div>
            <h2 className="font-serif text-[30px] leading-[1.15] text-ink sm:text-[40px] lg:text-[46px]">Meet JJ</h2>
            <p className="mt-5 text-[18px] leading-[1.6] text-ink-soft sm:text-[19px]">
              JJ Smith is a New York Times bestselling author and one of the most trusted names in transformation for women. Her books and challenges have helped over 800,000 women lose more than 5 million pounds. Now, for the first time, she is coaching women one on one.
            </p>
            <p className="mt-7 font-serif italic text-[26px] leading-snug text-ink sm:text-[32px]">
              "I've got you, sis. Let's go get her."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 7. Final CTA ─────────────────────────────────────────────────────────────
function FinalCta() {
  return (
    <section className="px-5 py-20 text-center lg:py-28">
      <div className="mx-auto max-w-[640px]">
        <h2 className="font-serif text-[34px] leading-[1.1] text-ink sm:text-[44px] lg:text-[52px]">Ready to find out what's really going on?</h2>
        <p className="mx-auto mt-6 max-w-[540px] text-[18px] leading-[1.6] text-ink-soft sm:text-[20px]">
          Take the 1-minute quiz and get your personal belly-fat diagnosis, free. What you learn is yours to keep.
        </p>
        <div className="mx-auto mt-9 max-w-[420px]">
          <PrimaryCta />
        </div>
      </div>
    </section>
  );
}

// ── 8. Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <Wordmark className="h-5" />
        <p className="text-[13px] text-ink-faint">
          © {new Date().getFullYear()} JJ Smith. All rights reserved. ·{" "}
          <a href="#" className="underline">Privacy</a> · <a href="#" className="underline">Terms</a>
        </p>
      </div>
    </footer>
  );
}

// ── Sticky mobile CTA ────────────────────────────────────────────────────────
function StickyCta() {
  const openQuiz = useOpenQuiz();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background px-4 pt-3 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.18)] transition-opacity duration-200 sm:hidden ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <button
        onClick={openQuiz}
        data-cta="take-quiz"
        className="block w-full rounded-xl px-5 py-4 text-center text-[16px] font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(184,24,96,0.6)]"
        style={{ background: PINK }}
      >
        Take the quiz →
      </button>
    </div>
  );
}
