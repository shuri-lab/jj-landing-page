import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Check,
  Lock,
  ShieldCheck,
  ArrowRight,
  Phone,
  MessageCircle,
  UtensilsCrossed,
  UserCheck,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Smartphone,
  Dumbbell,
  Clock,
  GlassWater,
  ClipboardList,
  Droplet,
  Shuffle,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCoachPrograms } from "@/lib/coach-programs";
import { buildLandingOfferUrl } from "@/lib/signup/attribution";
import jjAvatar from "@/assets/landing/jj-selfie-sun.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import tTammi from "@/assets/landing/transformation-tammi.jpg";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";
import {
  type State,
  type QuestionDef,
  initialState,
  QUESTIONS,
  scoreAnswer,
  nextKey,
  resolve,
  track,
  DISC_MIDLIFE,
  SLIDER_INTRO,
  SLIDER_PROMPT,
  SLIDER_REVEAL,
  discHistory,
  discDay,
  DISC_UNIVERSAL,
  TRUST_LINES,
} from "./quiz01";

const PINK = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";
const STEP_DELAY = 0.45; // seconds between reveal lines

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

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  leaf: Leaf, smartphone: Smartphone, dumbbell: Dumbbell, clock: Clock,
  glass: GlassWater, clipboard: ClipboardList, droplet: Droplet, shuffle: Shuffle,
};

// Goal -> 12-week projection metadata (mapped to this quiz's goal answers).
const GOAL_META: Record<string, { target: number; chapterOne: boolean }> = {
  under_15: { target: 12, chapterOne: false },
  "15_30": { target: 22, chapterOne: false },
  "30_50": { target: 30, chapterOne: true },
  more_50: { target: 30, chapterOne: true },
  not_sure: { target: 20, chapterOne: false },
};
const goalMeta = (s: State) => GOAL_META[s.goal ?? "15_30"] ?? GOAL_META["15_30"];

const AGE_DISPLAY: Record<string, string> = {
  "30s": "your 30s",
  "40s": "your 40s",
  "50s": "your 50s",
  "60plus": "60 and beyond",
};

const TRANSF_PLAN = [
  { src: t12, quote: "I'm back to the size I never thought I'd see again." },
  { src: t9, quote: "I'm not the one hiding behind the camera anymore." },
  { src: tTammi, quote: "I lost the baby weight." },
];

const VALUE_STACK = [
  { label: "Weekly 1 on 1 coaching with JJ", value: 1200 },
  { label: "Daily check ins from JJ", value: 400 },
  { label: "Your done for you meal plan", value: 300 },
  { label: "A plan for your body and your life", value: 200 },
  { label: "The eating out and family meals playbook", value: 150 },
  { label: "Your jumpstart", value: 97 },
  { label: "The recipe vault", value: 97 },
  { label: "The circle of sisters", value: 200 },
];
const VALUE_TOTAL = 2650;

const FAQ_ITEMS = [
  { q: "I'm in my 50s and nothing's worked. Will this?", a: "Sister, this is who I built it for. Most of the women I work with are 40+ navigating perimenopause, menopause, and hormone shifts. Your plan is built around all of that, and I'm right there with you the whole way." },
  { q: "I work full-time and have kids. Do I have time?", a: "Yes. Personalizing your plan means it fits your life, not the other way around. And I'm meeting you right where you are, every day. Most sisters spend 20 to 30 minutes a day on this." },
  { q: "Do I have to drink green smoothies?", a: "Only if you want to. This isn't the cleanse. Your plan is built around foods you actually love." },
  { q: "What makes this different from your other programs?", a: "My books and challenges gave you the information. This one gives you me, every step of the way. The information was never the problem. Being alone on the hard days was." },
  { q: "What if I miss this cohort?", a: "I keep enrollment small so every sister gets the real attention she deserves. Once these limited spots are gone, you'll have to wait until I open the next round." },
];

const fillName = (t: string, s: State) => t.replace(/\{name\}/g, s.name?.trim() || "sis");

function fmtDate(weeksAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeksAhead * 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Pricing = { monthly: number; full: number; remaining: number; loading: boolean };

// ── Main ─────────────────────────────────────────────────────────────────────
export default function QuizTakeover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { basic } = useCoachPrograms();
  const [state, setState] = useState<State>(initialState);
  const [stepKey, setStepKey] = useState<string>("S1");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      track("quiz_start");
    } else {
      const t = setTimeout(() => {
        setState(initialState());
        setStepKey("S1");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [stepKey]);

  useEffect(() => {
    if (typeof document === "undefined" || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pricing = useMemo<Pricing>(() => {
    const monthly = basic?.monthlyPriceAmount ?? basic?.priceAmount ?? 77;
    const full = basic?.fullProgramPriceAmount ?? 197;
    const months = basic?.durationWeeks ? Math.max(1, Math.round(basic.durationWeeks / 4)) : 3;
    return { monthly, full, remaining: Math.max(1, months - 1), loading: !basic };
  }, [basic]);

  const answer = (q: QuestionDef, value: string | string[]) => {
    const ns = scoreAnswer(state, q.qid, value);
    track("question_answered", { q: q.qid, value });
    setState(ns);
    setStepKey(nextKey(q.key, ns));
  };
  const advance = (from: string) => setStepKey(nextKey(from, state));
  const setName = (name: string) => {
    setState((s) => ({ ...s, name }));
    setStepKey(nextKey("NAME", state));
  };
  const setEmail = (email: string) => {
    setState((s) => ({ ...s, email }));
    track("email_captured", { email });
    setStepKey(nextKey("EMAIL", state));
  };

  const goToCheckout = (billing: "MONTHLY" | "FULL_PROGRAM" = "MONTHLY") => {
    const r = resolve(state);
    track("checkout_start", { primary: r.primary });
    if (typeof window !== "undefined") {
      window.location.href = buildLandingOfferUrl({
        email: state.email ?? undefined,
        firstName: state.name ?? undefined,
        plan: billing === "FULL_PROGRAM" ? "quarter" : "monthly",
        extras: {
          goal: state.goal ?? undefined,
          why: state.why ?? undefined,
          primary: r.primary,
          paymentOption: billing === "FULL_PROGRAM" ? "pay_in_full" : "monthly",
          utm_source: "quiz-belly-after-40",
          version: "quiz01",
        },
      });
    }
  };

  if (!open) return null;

  const progressKeys = ["S1", "S2", "S3", "S5", "S7", "S8", "S10", "S12", "S13", "S14", "S15", "S16"];
  const answeredCount = progressKeys.filter((k) => {
    const q = QUESTIONS[k];
    return q && state.answers[q.qid] !== undefined;
  }).length;
  const progress = Math.min(100, Math.round((answeredCount / progressKeys.length) * 100));
  const showProgress = !["BUILD", "EMAIL", "PLAN", "OFFER"].includes(stepKey);

  return (
    <div className="q-mesh fixed inset-0 z-[100] flex flex-col" role="dialog" aria-modal="true">
      <div className="shrink-0">
        <div className="mx-4 mt-3 h-2 overflow-hidden rounded-full bg-[#f0cdd9]/70 shadow-[inset_0_1px_2px_rgba(140,17,74,0.25)]">
          {showProgress && (
            <div className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ width: `${progress}%`, background: PINK }} />
          )}
        </div>
        <div className="flex justify-end px-4 pt-3">
          <button onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#8c114a] transition-colors hover:bg-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-[540px] flex-col px-6 pt-2">
          <Screen
            key={stepKey}
            stepKey={stepKey}
            state={state}
            pricing={pricing}
            onAnswer={answer}
            onAdvance={advance}
            onName={setName}
            onEmail={setEmail}
            onCheckout={goToCheckout}
          />
        </div>
      </div>
    </div>
  );
}

// ── Screen router ────────────────────────────────────────────────────────────
function Screen({
  stepKey, state, pricing, onAnswer, onAdvance, onName, onEmail, onCheckout,
}: {
  stepKey: string;
  state: State;
  pricing: Pricing;
  onAnswer: (q: QuestionDef, value: string | string[]) => void;
  onAdvance: (from: string) => void;
  onName: (name: string) => void;
  onEmail: (email: string) => void;
  onCheckout: (billing?: "MONTHLY" | "FULL_PROGRAM") => void;
}) {
  const q = QUESTIONS[stepKey];
  if (q) {
    return q.type === "single" ? (
      <SingleScreen q={q} onPick={(v) => onAnswer(q, v)} />
    ) : (
      <MultiScreen q={q} onSubmit={(v) => onAnswer(q, v)} />
    );
  }

  switch (stepKey) {
    case "S4":
      return <DiscoveryScreen lines={DISC_MIDLIFE} flip="F3" visual={<BodyShiftGraphic age={state.answers["F1q"] as string} />} onContinue={() => onAdvance("S4")} />;
    case "S6":
      return <SliderScreen onContinue={() => onAdvance("S6")} />;
    case "S9": {
      const c2 = state.answers["C2"] as string;
      return <DiscoveryScreen lines={discHistory(c2)} flip="history" visual={c2 === "regained" ? <TwoPathGraphic /> : <FlipBadge />} onContinue={() => onAdvance("S9")} />;
    }
    case "S11": {
      const d1 = state.answers["D1"] as string;
      return <DiscoveryScreen lines={discDay(d1, state.flags.FLAG_ED_watch)} flip="day" visual={<FlipBadge />} onContinue={() => onAdvance("S11")} />;
    }
    case "UNIV":
      return <DiscoveryScreen lines={DISC_UNIVERSAL} flip="F8" visual={<FlipBadge />} onContinue={() => onAdvance("UNIV")} />;
    case "S17":
      return <TrustScreen onContinue={() => onAdvance("S17")} />;
    case "NAME":
      return <NameScreen onSubmit={onName} />;
    case "BUILD":
      return <BuildScreen state={state} onDone={() => onAdvance("BUILD")} />;
    case "EMAIL":
      return <EmailScreen state={state} onSubmit={onEmail} />;
    case "PLAN":
      return <PlanScreen state={state} onContinue={() => onAdvance("PLAN")} />;
    case "OFFER":
      return <OfferScreen state={state} pricing={pricing} onCheckout={onCheckout} />;
    default:
      return null;
  }
}

// ── Primitives ───────────────────────────────────────────────────────────────
function Content({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "top" }) {
  return <div className={`flex flex-1 flex-col ${align === "center" ? "justify-center" : "justify-start pt-3"} pb-6`}>{children}</div>;
}

function StickyAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-2 bg-gradient-to-t from-[#fdebeb] via-[#fdebeb] to-transparent px-6 pt-6" style={{ paddingBottom: "calc(1.1rem + env(safe-area-inset-bottom, 0px))" }}>
      {children}
    </div>
  );
}

function Question({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <>
      <h2 className="font-sans font-bold text-[26px] sm:text-[31px] leading-[1.16] tracking-[-0.02em] text-[#15102a]">{children}</h2>
      {sub && <p className="mt-2 text-[16px] text-[#6b5b6e]">{sub}</p>}
    </>
  );
}

function PrimaryButton({ children, disabled, onClick, type = "button" }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="group relative block w-full overflow-hidden rounded-[1.35rem] px-7 py-5 text-center text-[18px] sm:text-[19px] font-bold tracking-wide text-white shadow-[0_20px_40px_-14px_rgba(184,24,96,0.65),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{ background: PINK }}
    >
      <span className="block pr-9">{children}</span>
      <span className="absolute right-2.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/18 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-active:scale-95">
        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
      </span>
    </button>
  );
}

function CoachHeader() {
  return (
    <div className="q-fadeline flex items-center gap-3">
      <img src={jjAvatar} alt="JJ Smith" className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-[0_6px_16px_-6px_rgba(140,17,74,0.6)]" />
      <div>
        <p className="text-[15px] font-bold leading-none text-[#15102a]">JJ</p>
        <p className="mt-1 text-[12px] font-semibold leading-none text-[#c41e6a]">your coach</p>
      </div>
    </div>
  );
}

function FadeLines({ lines, startAt = 0 }: { lines: string[]; startAt?: number }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => (
        <p key={i} className="q-fadeline text-[20px] sm:text-[22px] leading-[1.4] font-medium text-[#15102a]" style={{ animationDelay: `${(startAt + i) * STEP_DELAY}s` }}>
          {line}
        </p>
      ))}
    </div>
  );
}

function OptionButton({ label, onClick, selected, Icon }: { label: string; onClick: () => void; selected?: boolean; Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3.5 rounded-[1.35rem] border bg-white px-4 py-3.5 text-left text-[18px] sm:text-[19px] font-semibold leading-snug text-[#15102a] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.985] ${
        selected
          ? "border-[#d62a7a]/70 shadow-[0_22px_44px_-22px_rgba(184,24,96,0.65),inset_0_1px_0_rgba(255,255,255,0.9)]"
          : "border-[#f2d6e0] shadow-[0_16px_34px_-26px_rgba(140,17,74,0.55),inset_0_1px_0_rgba(255,255,255,0.9)] hover:border-[#e79bbb]"
      }`}
      style={{ minHeight: 62 }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          selected ? "scale-105 text-white shadow-[0_8px_18px_-8px_rgba(184,24,96,0.7)]" : Icon ? "text-[#c41e6a]" : "text-transparent ring-1 ring-inset ring-[#eec2d4]"
        }`}
        style={selected ? { background: PINK } : { backgroundColor: "#fbe6ee" }}
        aria-hidden
      >
        {selected ? <Check className="h-5 w-5" strokeWidth={3} /> : Icon ? <Icon className="h-5 w-5" strokeWidth={1.9} /> : <Check className="h-[18px] w-[18px]" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

function SingleScreen({ q, onPick }: { q: QuestionDef; onPick: (v: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (v: string) => {
    if (picked) return;
    setPicked(v);
    setTimeout(() => onPick(v), 200);
  };
  return (
    <Content align={q.options.length > 4 ? "top" : "center"}>
      <div className="q-rise">
        <Question sub={q.sub}>{q.prompt}</Question>
        <div className="mt-7 space-y-3">
          {q.options.map((o) => (
            <OptionButton key={o.value} label={o.label} selected={picked === o.value} Icon={o.icon ? ICONS[o.icon] : undefined} onClick={() => choose(o.value)} />
          ))}
        </div>
      </div>
    </Content>
  );
}

function MultiScreen({ q, onSubmit }: { q: QuestionDef; onSubmit: (v: string[]) => void }) {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (v: string) => setSel((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  return (
    <>
      <Content align="top">
        <div className="q-rise">
          <Question sub={q.sub}>{q.prompt}</Question>
          <div className="mt-6 space-y-3">
            {q.options.map((o) => (
              <OptionButton key={o.value} label={o.label} selected={sel.includes(o.value)} Icon={o.icon ? ICONS[o.icon] : undefined} onClick={() => toggle(o.value)} />
            ))}
          </div>
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={() => onSubmit(sel)} disabled={sel.length === 0}>Continue</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Discovery reveal ─────────────────────────────────────────────────────────
function DiscoveryScreen({ lines, visual, flip, onContinue }: { lines: string[]; visual: React.ReactNode; flip: string; onContinue: () => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    track("belief_flip_shown", { flip });
    const t = window.setTimeout(() => setDone(true), lines.length * STEP_DELAY * 1000 + 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <Content align="center">
        <CoachHeader />
        <div className="mt-6"><FadeLines lines={lines} /></div>
        <div className="q-fadeline mt-7" style={{ animationDelay: `${lines.length * STEP_DELAY}s` }}>{visual}</div>
      </Content>
      {done && (
        <StickyAction>
          <div className="q-fadeline"><PrimaryButton onClick={onContinue}>Continue</PrimaryButton></div>
        </StickyAction>
      )}
    </>
  );
}

function FlipBadge() {
  return (
    <div className="flex items-center gap-3 rounded-[1.35rem] border-2 border-[#d62a7a] bg-white p-4 shadow-[0_18px_40px_-28px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
        <Check className="h-5 w-5" strokeWidth={3} />
      </span>
      <p className="text-[15px] font-semibold leading-snug text-[#8c114a]">A real shift most plans never tell you.</p>
    </div>
  );
}

// ── Slider discovery (S6) ────────────────────────────────────────────────────
function SliderScreen({ onContinue }: { onContinue: () => void }) {
  const [guess, setGuess] = useState(50);
  const [locked, setLocked] = useState(false);
  const lock = () => {
    if (locked) return;
    setLocked(true);
    track("discovery_interaction", { flip: "F1", guess });
  };
  return (
    <>
      <Content align="center">
        <CoachHeader />
        <p className="q-fadeline mt-6 text-[20px] sm:text-[22px] font-medium leading-[1.4] text-[#15102a]">{SLIDER_INTRO}</p>
        <p className="mt-5 text-[17px] font-semibold text-[#6b5b6e]">{SLIDER_PROMPT}</p>

        <div className="mt-5 rounded-[1.9rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="flex justify-between text-[13px] font-bold uppercase tracking-wide text-[#c41e6a]">
            <span>Food {guess}%</span>
            <span>Exercise {100 - guess}%</span>
          </div>
          <input type="range" min={0} max={100} value={guess} disabled={locked} onChange={(e) => setGuess(Number(e.target.value))} className="mt-3 w-full accent-[#d62a7a]" style={{ height: 28 }} />

          {!locked ? (
            <button onClick={lock} className="mt-4 block w-full rounded-2xl px-6 py-4 text-center text-[16px] font-bold text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-all hover:-translate-y-0.5" style={{ background: PINK }}>
              Lock in my guess
            </button>
          ) : (
            <div className="mt-5 q-rise">
              <div className="flex items-center justify-between text-[14px] font-semibold text-[#6b5b6e]">
                <span>Your guess: {guess}% food</span>
                <span className="text-[#8c114a]">The truth: 80% food</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#f3d3d3]">
                <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: "80%", background: PINK }} />
              </div>
            </div>
          )}
        </div>

        {locked && <div className="mt-6"><FadeLines lines={SLIDER_REVEAL} /></div>}
      </Content>
      {locked && (
        <StickyAction>
          <div className="q-fadeline" style={{ animationDelay: `${SLIDER_REVEAL.length * STEP_DELAY}s` }}>
            <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
          </div>
        </StickyAction>
      )}
    </>
  );
}

// ── Discovery visuals ────────────────────────────────────────────────────────
function BodyShiftGraphic({ age }: { age?: string }) {
  const decade = { "30s": "30s", "40s": "40s", "50s": "50s", "60plus": "60+" }[age ?? "40s"] ?? "40s";
  return (
    <div className="rounded-[1.9rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="mb-3 text-center text-[13px] font-bold uppercase tracking-[0.12em] text-[#6b5b6e]">Where the weight moves</p>
      <div className="flex items-end justify-center gap-8">
        {[{ d: "30s", belly: 10 }, { d: decade, belly: 30, active: true }].map((b, i) => (
          <div key={i} className="flex flex-col items-center">
            <svg viewBox="0 0 60 110" className="h-28 w-16" aria-hidden>
              <circle cx="30" cy="14" r="9" fill={b.active ? "#b81860" : "#e7b9cb"} />
              <path d="M18 26 Q30 22 42 26 L40 70 Q30 76 20 70 Z" fill={b.active ? "#d62a7a" : "#eccdd8"} />
              <ellipse cx="30" cy="52" rx={b.belly / 2 + 8} ry={b.belly / 3 + 6} fill={b.active ? "#8c114a" : "#dca9bd"} opacity={b.active ? 0.55 : 0.4} />
              <rect x="22" y="74" width="6" height="30" rx="3" fill={b.active ? "#d62a7a" : "#eccdd8"} />
              <rect x="32" y="74" width="6" height="30" rx="3" fill={b.active ? "#d62a7a" : "#eccdd8"} />
            </svg>
            <span className={`mt-1 text-[13px] font-bold ${b.active ? "text-[#8c114a]" : "text-[#9a7f8a]"}`}>{b.d}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-[14px] font-semibold text-[#15102a]">Same habits. The fat just moves to the middle.</p>
    </div>
  );
}

function TwoPathGraphic() {
  return (
    <div className="rounded-[1.9rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="mb-2 text-center text-[13px] font-bold uppercase tracking-[0.12em] text-[#6b5b6e]">Two paths</p>
      <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label="Crash and regain vs steady">
        <path d="M16 40 Q150 70 284 96" fill="none" stroke="#d9b8c6" strokeWidth="3" strokeLinecap="round" />
        <text x="284" y="90" fontSize="10" fontWeight="700" fill="#9a7f8a" textAnchor="end">steady</text>
        <path d="M16 70 L60 110 L100 60 L140 115 L180 55 L220 120 L260 45 L284 125" fill="none" stroke="#b81860" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="16" y="60" fontSize="10" fontWeight="800" fill="#8c114a">crash and regain</text>
      </svg>
      <p className="mt-1 text-center text-[14px] font-semibold text-[#15102a]">Each crash leaves you a little heavier than before.</p>
    </div>
  );
}

function AgeCurveGraphic({ age }: { age: string }) {
  const decades = ["20s", "30s", "40s", "50s", "60+"];
  const idxByAge: Record<string, number> = { "30s": 1, "40s": 2, "50s": 3, "60plus": 4 };
  const active = idxByAge[age] ?? 2;
  const ys = [40, 56, 78, 100, 116];
  const W = 300;
  const xAt = (i: number) => 30 + (i / (decades.length - 1)) * (W - 60);
  const path = `M ${decades.map((_, i) => `${xAt(i)},${ys[i]}`).join(" L ")}`;
  return (
    <div className="rounded-[1.9rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
      <p className="mb-2 text-[14px] font-bold uppercase tracking-[0.12em] text-[#6b5b6e]">How metabolism shifts</p>
      <svg viewBox={`0 0 ${W} 150`} className="w-full" role="img" aria-label="Metabolism declining by decade">
        <defs>
          <linearGradient id="ageFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d62a7a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#d62a7a" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${xAt(4)},135 L ${xAt(0)},135 Z`} fill="url(#ageFill)" />
        <path d={path} fill="none" stroke="#d62a7a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {decades.map((d, i) => (
          <g key={d}>
            <circle cx={xAt(i)} cy={ys[i]} r={i === active ? 7 : 4} fill={i === active ? "#b81860" : "#e7b9cb"} stroke="#fff" strokeWidth="2" />
            <text x={xAt(i)} y={146} fontSize="12" fontWeight={i === active ? 800 : 600} fill={i === active ? "#8c114a" : "#9a7f8a"} textAnchor="middle">{d}</text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-[14px] font-semibold text-[#15102a]">Your plan is built for the body you have now.</p>
    </div>
  );
}

// ── Transformation carousel ──────────────────────────────────────────────────
function TransformationCarousel({ items }: { items: { src: string; quote: string }[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const go = (d: number) => setI((p) => (p + d + items.length) % items.length);
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [paused, items.length]);
  return (
    <div
      className="overflow-hidden rounded-[1.9rem] bg-white shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        startX.current = null;
        setPaused(false);
      }}
    >
      <div className="relative">
        <img src={items[i].src} alt="Sister transformation" className="block max-h-[420px] w-full bg-[#fbe3ea] object-contain" loading="lazy" />
        {items.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
      <div className="p-5">
        <p className="font-serif italic text-[19px] leading-snug text-[#15102a]">"{items[i].quote}"</p>
        {items.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {items.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-[#d62a7a]" : "w-2 bg-[#d62a7a]/30"}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trust beat (S17) ─────────────────────────────────────────────────────────
function TrustScreen({ onContinue }: { onContinue: () => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    track("trust_beat_shown");
    const t = window.setTimeout(() => setDone(true), TRUST_LINES.length * STEP_DELAY * 1000 + 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <Content align="center">
        <CoachHeader />
        <div className="mt-6"><FadeLines lines={TRUST_LINES} /></div>
        <div className="q-fadeline mt-7 rounded-[1.9rem] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]" style={{ animationDelay: `${TRUST_LINES.length * STEP_DELAY}s` }}>
          <p className="mb-3 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-[#9a7f8a]">As seen on</p>
          <div className="grid grid-cols-4 items-center gap-3 opacity-80">
            {PRESS.map((p) => (<img key={p.alt} src={p.src} alt={p.alt} className="h-7 w-full object-contain" loading="lazy" />))}
          </div>
        </div>
      </Content>
      {done && (
        <StickyAction>
          <div className="q-fadeline"><PrimaryButton onClick={onContinue}>Continue</PrimaryButton></div>
        </StickyAction>
      )}
    </>
  );
}

// ── Name (before the plan) ───────────────────────────────────────────────────
function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => { if (val.trim()) onSubmit(val.trim()); };
  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>What do I call you, sis?</Question>
          <p className="mt-3 text-[18px] sm:text-[20px] text-[#6b5b6e]">I like to know who I'm talking to.</p>
          <input ref={ref} type="text" autoComplete="given-name" placeholder="Your name" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-7 w-full rounded-[1.35rem] border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]" />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!val.trim()}>Continue</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Build beat ───────────────────────────────────────────────────────────────
function BuildScreen({ state, onDone }: { state: State; onDone: () => void }) {
  const lines = [
    "Reading what's tripped you up before",
    "Building it for the body you have now",
    "Mapping your meals around the food you love",
    "Setting your jumpstart",
  ];
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    lines.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 500 + i * 800)));
    timers.push(window.setTimeout(onDone, 500 + lines.length * 800 + 800));
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pct = Math.round((shown / lines.length) * 100);
  return (
    <Content align="center">
      <div className="q-rise">
        <Question>{fillName("Building your plan, {name}.", state)}</Question>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#f3d3d3]">
          <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: PINK }} />
        </div>
        <ul className="mt-7 space-y-4">
          {lines.map((line, i) => (
            <li key={line} className={`flex items-center gap-3 text-[18px] sm:text-[20px] leading-snug transition-all duration-500 ${i < shown ? "translate-y-0 text-[#15102a] opacity-100" : "translate-y-1 text-[#b79aa6] opacity-50"}`}>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-transform ${i < shown ? "scale-100" : "scale-0"}`} style={{ background: PINK }}>
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </Content>
  );
}

// ── Email gate ("Your plan is ready") ────────────────────────────────────────
function EmailScreen({ state, onSubmit }: { state: State; onSubmit: (email: string) => void }) {
  const [val, setVal] = useState("");
  const valid = /.+@.+\..+/.test(val.trim());
  const submit = () => { if (valid) onSubmit(val.trim()); };
  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>{fillName("Your plan is ready, {name}.", state)}</Question>
          <p className="mt-3 text-[18px] sm:text-[20px] leading-snug text-[#6b5b6e]">
            Tell me where to send it, and I'll show you everything I put together for you.
          </p>
          <LockedPlanPreview state={state} />
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-5 w-full rounded-[1.35rem] border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]" />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!valid}>Show Me My Plan</PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]"><Lock className="h-4 w-4" /> No spam, ever. Just your plan and a note from me.</p>
      </StickyAction>
    </>
  );
}

function LockedPlanPreview({ state }: { state: State }) {
  const meta = goalMeta(state);
  return (
    <div className="relative mt-6 overflow-hidden rounded-[1.9rem] shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      <div className="select-none blur-[5px]" aria-hidden>
        <div className="px-5 py-4 text-white" style={{ background: PINK }}>
          <p className="text-[13px] font-semibold uppercase tracking-wide opacity-90">Your 12 week plan</p>
          <p className="text-[24px] font-bold">{fillName("{name}'s plan", state)}</p>
        </div>
        <div className="bg-white p-5">
          <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate={false} dateLabel="" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[#f0c9d8]" />
            <div className="h-3 w-2/3 rounded bg-[#f0c9d8]" />
            <div className="h-3 w-1/2 rounded bg-[#f0c9d8]" />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
        <span className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg" style={{ background: PINK }}><Lock className="h-6 w-6" /></span>
        <p className="mt-2 text-[14px] font-bold uppercase tracking-[0.12em] text-[#8c114a]">Enter your email to unlock your plan</p>
      </div>
    </div>
  );
}

// ── Plan reveal (the full breakdown) ─────────────────────────────────────────
function PlanScreen({ state, onContinue }: { state: State; onContinue: () => void }) {
  const meta = goalMeta(state);
  const dateLabel = useMemo(() => fmtDate(12), []);
  const ageVal = (state.answers["F1q"] as string) ?? "40s";
  const ageWord = AGE_DISPLAY[ageVal] ?? "your 40s";
  const ageSub =
    ageVal === "50s"
      ? "Built for your body, your hormones, your real schedule. Made for life after menopause. Not a generic template, a plan that fits the life you actually live."
      : "Built for your body, your hormones, your real schedule. Not a generic template, a plan that fits the life you actually live.";

  const inclusions = [
    { Icon: Phone, label: "A real call with me, every week", sub: "Every week it is just you and me. You always know exactly what to do next, and you never feel lost." },
    { Icon: MessageCircle, label: "I'm in your phone every morning", sub: "You start each day knowing someone has you. That is what makes you keep going." },
    { Icon: UtensilsCrossed, label: "Meals built around the food you love", sub: "No guessing, no sad diet plates, no thinking required. Real food you actually enjoy, planned for you each week." },
    { Icon: UserCheck, label: `A plan built for your body at ${ageWord}`, sub: ageSub },
    { Icon: BookOpen, label: "My eating out and family meals playbook", sub: "Going out, or feeding everyone else? You will always know what to order and grab, so real life never throws you off." },
    { Icon: Users, label: "The circle of sisters beside you", sub: "You are surrounded by women on the exact same journey, so you never feel like the only one." },
  ];

  return (
    <>
      <Content align="top">
        <h2 className="q-rise font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">
          {fillName("{name}, here is what the next 12 weeks look like with me.", state)}
        </h2>

        <div className="q-rise mt-5 overflow-hidden rounded-[1.9rem] bg-white shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="px-5 py-4 text-white" style={{ background: PINK }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide opacity-90">Your goal</p>
            <p className="text-[20px] font-bold leading-tight">{meta.chapterOne ? "A strong start" : `About ${meta.target} pounds`}, by {dateLabel}</p>
          </div>
          <div className="p-5">
            <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate dateLabel={dateLabel} detailed />
          </div>
        </div>

        <div className="mt-6 space-y-3 text-[18px] leading-[1.5] text-[#15102a]">
          <p className="font-semibold">We start fast.</p>
          <p>Your jumpstart is built to fit your life, so you feel it working in your first days.</p>
          <p>Then it is real food you already love, made simple, with your meals planned for you every single week, so you never have to wonder what to eat.</p>
          <p>And the whole way through, I am right here with you. Texting you in the morning. Calling you every week. Catching you before a slip becomes a week.</p>
          <p className="font-semibold text-[#c41e6a]">You are not doing this alone, not for one single day.</p>
        </div>

        {/* Recipe images (David to provide). Placeholders reserve the spot. */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-[#fbe3ea] to-[#f6d3a8]" aria-hidden>
              <UtensilsCrossed className="h-7 w-7 text-[#c98aa3]" />
            </div>
          ))}
        </div>

        <ul className="mt-7 space-y-3">
          {inclusions.map(({ Icon, label, sub }) => (
            <li key={label} className="flex items-start gap-3.5 rounded-[1.35rem] bg-white p-4 shadow-[0_14px_30px_-24px_rgba(140,17,74,0.8),inset_0_1px_0_rgba(255,255,255,0.9)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[17px] sm:text-[18px] font-bold leading-snug text-[#15102a]">{label}</p>
                <p className="mt-0.5 text-[15px] sm:text-[16px] leading-snug text-[#6b5b6e]">{sub}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5"><AgeCurveGraphic age={ageVal} /></div>

        {/* Circle of sisters image (David to provide). Placeholder reserves it. */}
        <div className="mt-5 flex items-center justify-center rounded-[1.9rem] bg-gradient-to-br from-[#fbe3ea] to-[#efd6e0] p-8" aria-hidden>
          <Users className="h-10 w-10 text-[#c98aa3]" />
        </div>

        <p className="mt-8 text-[15px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">Sisters who did it with me</p>
        <div className="mt-3"><TransformationCarousel items={TRANSF_PLAN} /></div>

        <p className="mt-8 text-[19px] leading-[1.5] font-medium text-[#15102a]">
          {fillName("This is your plan, {name}. Built for you, around your life, with me in your corner the whole way.", state)}
        </p>
        <p className="mt-2 text-[19px] leading-[1.5] font-bold text-[#c41e6a]">All you have to do is show up. I will handle the rest.</p>
        <div className="mt-6"><PrimaryButton onClick={onContinue}>Let's Get Started, sis</PrimaryButton></div>
      </Content>

      <StickyAction>
        <PrimaryButton onClick={onContinue}>Let's Get Started, sis</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Offer ────────────────────────────────────────────────────────────────────
function OfferScreen({ state, pricing, onCheckout }: { state: State; pricing: Pricing; onCheckout: (billing?: "MONTHLY" | "FULL_PROGRAM") => void }) {
  const { monthly, full } = pricing;
  useEffect(() => {
    track("offer_viewed");
  }, []);
  return (
    <>
      <Content align="top">
        <div className="q-rise inline-flex self-start rounded-full bg-[#15102a] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
          Your plan is ready
        </div>
        <h2 className="mt-4 font-sans font-bold text-[28px] sm:text-[33px] leading-[1.12] tracking-[-0.02em] text-[#15102a]">
          {fillName("So let's go get her, {name}.", state)}
        </h2>
        <p className="mt-3 text-[18px] sm:text-[20px] leading-[1.4] text-[#15102a]">
          Everything you just saw is waiting for you. Me, in your corner, one on one, every single day for the next 12 weeks.
        </p>

        <div className="mt-6 rounded-[1.9rem] bg-white p-5 shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
          <p className="text-[15px] font-bold uppercase tracking-[0.14em] text-[#c41e6a]">Everything you're getting</p>
          <ul className="mt-3 divide-y divide-dashed divide-[#f0c9d8]">
            {VALUE_STACK.map((it) => (
              <li key={it.label} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2 text-[16px] leading-snug text-[#15102a]"><Check className="h-4 w-4 shrink-0 text-[#d62a7a]" strokeWidth={3} /> {it.label}</span>
                <span className="shrink-0 text-[16px] font-semibold text-[#6b5b6e]">${it.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t-2 border-[#15102a] pt-3">
            <span className="text-[17px] font-bold text-[#15102a]">Total value</span>
            <span className="text-[20px] font-bold text-[#b79aa6] line-through">${VALUE_TOTAL.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-right text-[15px] font-semibold text-[#c41e6a]">Your price today: ${full}</p>
          <p className="mt-3 text-[16px] leading-snug text-[#15102a]">More than $2,600 of coaching, meals, and real support. Yours today for ${full}.</p>
        </div>

        <div className="mt-6 space-y-1">
          <div className="relative rounded-[1.9rem] border-2 border-[#15102a] bg-white p-5 shadow-[0_24px_50px_-32px_rgba(140,17,74,0.9)]">
            <span className="absolute -top-3 left-5 rounded-full bg-[#15102a] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Best value</span>
            <p className="text-[18px] font-bold text-[#15102a]">Pay in full. ${full} today.</p>
            <p className="text-[15px] text-[#6b5b6e]">One payment, you're done.</p>
            <button onClick={() => onCheckout("FULL_PROGRAM")} disabled={pricing.loading} className="mt-4 block w-full rounded-2xl px-6 py-4 text-center text-[17px] font-bold text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50" style={{ background: PINK }}>
              {pricing.loading ? "Loading…" : `Start With JJ, $${full}`}
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#e7c6d3]" />
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#9a7f8a]">or</span>
            <span className="h-px flex-1 bg-[#e7c6d3]" />
          </div>

          <div className="rounded-[1.9rem] border-2 border-[#f0c9d8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(140,17,74,0.9)]">
            <p className="text-[18px] font-bold text-[#15102a]">Start today for ${monthly}.</p>
            <p className="text-[15px] text-[#6b5b6e]">Then two payments of ${monthly}.</p>
            <button onClick={() => onCheckout("MONTHLY")} disabled={pricing.loading} className="mt-4 block w-full rounded-2xl border-2 border-[#d62a7a] px-6 py-4 text-center text-[17px] font-bold text-[#b81860] transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50">
              {pricing.loading ? "Loading…" : `Start Today for $${monthly}`}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-[17px] leading-[1.5] text-[#15102a]">
          <p className="font-semibold">The moment you say yes, we book your first call with me and your 12 weeks begin.</p>
          <p>You are not waiting for Monday. We start now.</p>
        </div>
        <p className="mt-4 rounded-2xl bg-[#fff0f5] p-4 text-[16px] font-semibold leading-snug text-[#8c114a]">
          This is a founding price for a small group, and this start date is filling up. When the spots are gone, they are gone, and this price goes with them.
        </p>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0c9d8] bg-white/70 p-4">
          <ShieldCheck className="h-7 w-7 shrink-0 text-[#c41e6a]" />
          <p className="font-serif italic text-[16px] leading-[1.6] text-[#15102a]">
            "Sister, I need you to be confident this is right for you. So if you're not 100% thrilled within 14 days, I want to send your money back. If you're not happy, I'm not happy. No reason needed. That's my promise."
            <span className="mt-2 block font-sans not-italic text-[13px] font-semibold tracking-[0.16em] text-[#9a7f8a]">JJ</span>
          </p>
        </div>

        <div className="mt-7 rounded-[1.9rem] bg-[#15102a] p-6 text-center text-white">
          <p className="font-serif text-[24px] sm:text-[28px] leading-[1.15]">The months ahead are happening either way.</p>
          <p className="mt-3 text-[16px] leading-[1.6] text-white/85">
            You can spend them like the last ones. Or you can spend them with me right there with you, every Tuesday morning, every Thursday night, every time life hits. This time, sister, you don't have to do it alone.
          </p>
        </div>

        <p className="mt-8 text-[15px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">Questions sisters ask me</p>
        <Accordion type="single" collapsible className="mt-2 w-full">
          {FAQ_ITEMS.map((it, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-[#f0c9d8]">
              <AccordionTrigger className="py-5 text-left text-[17px] font-bold text-[#15102a] hover:no-underline">{it.q}</AccordionTrigger>
              <AccordionContent className="text-[16px] leading-[1.6] text-[#6b5b6e]">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Content>

      <StickyAction>
        <PrimaryButton onClick={() => onCheckout("MONTHLY")} disabled={pricing.loading}>
          {pricing.loading ? "Loading…" : `Start Today for $${monthly}`}
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]"><Lock className="h-4 w-4" /> 14 day money back guarantee. Secure checkout.</p>
      </StickyAction>
    </>
  );
}

// ── Projection chart ─────────────────────────────────────────────────────────
function ProjectionChart({ target, chapterOne, animate, dateLabel, detailed = false }: { target: number; chapterOne: boolean; animate: boolean; dateLabel: string; detailed?: boolean }) {
  const W = 320;
  const H = detailed ? 200 : 180;
  const left = 16;
  const right = W - 16;
  const top = 24;
  const bottom = detailed ? H - 40 : H - 28;
  const plotW = right - left;
  const plotH = bottom - top;

  const maxLoss = chapterOne ? target * 1.5 : target;
  const solidSpan = chapterOne ? plotW * 0.62 : plotW;
  const loss = (w: number) => {
    if (w <= 0) return 0;
    const jump = target * 0.22;
    if (w === 1) return jump;
    return jump + (target - jump) * ((w - 1) / 11);
  };
  const x = (w: number) => left + (w / 12) * solidSpan;
  const y = (l: number) => top + (l / maxLoss) * plotH;

  const pts = Array.from({ length: 13 }, (_, w) => `${x(w)},${y(loss(w))}`);
  const linePath = `M ${pts.join(" L ")}`;
  const areaPath = `${linePath} L ${x(12)},${bottom} L ${left},${bottom} Z`;
  const endX = x(12);
  const endY = y(loss(12));
  const jumpX = x(2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Projected weight trend over 12 weeks">
      <defs>
        <linearGradient id="projFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d62a7a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d62a7a" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="projLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d62a7a" />
          <stop offset="100%" stopColor="#8c114a" />
        </linearGradient>
      </defs>

      {detailed && [0, 4, 8, 12].map((w) => (
        <g key={w}>
          <line x1={x(w)} y1={top} x2={x(w)} y2={bottom} stroke="#f3d9e2" strokeWidth="1" strokeDasharray="2 4" />
          <text x={x(w)} y={bottom + 16} fontSize="11" fontWeight="700" fill="#9a7f8a" textAnchor={w === 0 ? "start" : "middle"}>{w === 0 ? "Today" : `Wk ${w}`}</text>
        </g>
      ))}

      {detailed && (
        <>
          <rect x={left} y={top} width={jumpX - left} height={plotH} fill="#f7c9dd" opacity="0.35" />
          <text x={(left + jumpX) / 2} y={top + 14} fontSize="10" fontWeight="800" fill="#8c114a" textAnchor="middle">Your jumpstart</text>
        </>
      )}

      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#f0c9d8" strokeWidth="1" />
      <path d={areaPath} fill="url(#projFill)" />
      <path d={linePath} className={animate ? "q-draw" : undefined} fill="none" stroke="url(#projLine)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {chapterOne && <path d={`M ${endX},${endY} L ${right},${y(maxLoss)}`} fill="none" stroke="#c41e6a" strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" />}
      <circle cx={endX} cy={endY} r="6" fill="#b81860" stroke="#fff" strokeWidth="2.5" />

      {!detailed && <text x={left} y={top - 8} fontSize="12" fontWeight="700" fill="#6b5b6e">Today</text>}
      {dateLabel && (
        <text x={chapterOne ? endX : right} y={top - 8} fontSize="12" fontWeight="700" fill="#c41e6a" textAnchor={chapterOne ? "middle" : "end"}>{chapterOne ? "Week 12" : `by ${dateLabel}`}</text>
      )}
      <text x={endX} y={endY - 12} fontSize="13" fontWeight="800" fill="#8c114a" textAnchor="middle">{target} lbs off</text>
      {chapterOne && <text x={right} y={y(maxLoss) - 8} fontSize="11" fontWeight="700" fill="#c41e6a" textAnchor="end">we keep going</text>}
    </svg>
  );
}
