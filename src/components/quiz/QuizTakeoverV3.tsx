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
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  Leaf,
  Smartphone,
  Dumbbell,
  Clock,
  GlassWater,
  ClipboardList,
  Droplet,
  Shuffle,
  Anchor,
  Droplets,
  Cookie,
  Battery,
  CloudFog,
  Flame,
  Target,
  Zap,
  Heart,
  HeartPulse,
  Calendar,
  Search,
  Sparkles,
  RefreshCcw,
  CloudRain,
  Wind,
  Gauge,
  Moon,
  HelpCircle,
  HeartCrack,
  Smile,
  User,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCoachPrograms, signupUrl } from "@/lib/coach-programs";
import jjAvatar from "@/assets/landing/jj-selfie-sun.jpg";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import tTammi from "@/assets/landing/transformation-tammi.jpg";
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
  SLIDER_PROMPT,
  SLIDER_LOCKED_TITLE,
  SLIDER_REVEAL,
  discHistory,
  discDay,
  ANALYZING_TICKS,
  PREPARING_TICKS,
} from "./quiz01.v3";
import {
  composeDiagnosis,
  type DiagnosisSection,
  gatePattern,
  GATE_REVEALS,
  SOLUTION_LINES,
  solutionFlagLines,
  VALUE_STACK,
  VALUE_TOTAL,
  OFFER_COPY,
  FAQ_ITEMS,
} from "./diagnosis.v3";

const PINK = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";
const STEP_DELAY = 0.45; // seconds between reveal lines
// A warm, high-legibility serif for JJ's spoken / explainer copy. Different from
// the Montserrat used on the questions, and far easier to read in a white card
// than medium sans on the pink mesh.
const READ_FONT = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";
// Clean, rounded geometric sans for question titles + option labels (more open
// and legible than Montserrat for the interactive quiz screens).
const QUIZ_FONT = "'Poppins', 'Montserrat', sans-serif";
const READ_CARD = "rounded-[1.5rem] bg-white p-5 shadow-[0_18px_40px_-28px_rgba(140,17,74,0.55)]";

const ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  leaf: Leaf, smartphone: Smartphone, dumbbell: Dumbbell, clock: Clock,
  glass: GlassWater, clipboard: ClipboardList, droplet: Droplet, shuffle: Shuffle,
  anchor: Anchor, droplets: Droplets, cookie: Cookie, battery: Battery,
  cloudfog: CloudFog, flame: Flame, target: Target,
  zap: Zap, heart: Heart, heartpulse: HeartPulse, calendar: Calendar, users: Users,
  cloudrain: CloudRain, wind: Wind, gauge: Gauge, utensilscrossed: UtensilsCrossed, moon: Moon,
  help: HelpCircle, heartcrack: HeartCrack, smile: Smile, user: User,
};

// Goal -> 12-week projection metadata.
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


const fillName = (t: string, s: State) => t.replace(/\{name\}/g, s.name?.trim() || "you");

function fmtDate(weeksAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeksAhead * 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Pricing = { monthly: number; full: number; remaining: number; loading: boolean };

// ── Main ─────────────────────────────────────────────────────────────────────
export default function QuizTakeoverV3({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { basic } = useCoachPrograms();
  const [state, setState] = useState<State>(initialState);
  const [stepKey, setStepKey] = useState<string>("GOAL");
  const [atBottom, setAtBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Tracks whether the scroll container has been read to the end. Used to gate
  // the diagnosis / solution CTAs until she has actually read the breakdown.
  const checkBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 16);
  };
  // Tapping the "keep reading" hint smooth-scrolls the panel down a screenful.
  const nudge = () => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ top: el.clientHeight * 0.82, behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      track("quiz_start");
    } else {
      const t = setTimeout(() => {
        setState(initialState());
        setStepKey("GOAL");
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setAtBottom(false);
    // Re-measure once the new screen has laid out: short screens have no scroll,
    // so they should count as "read" immediately.
    const id = window.setTimeout(checkBottom, 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const answerSlider = (guess: number) => {
    const ns = scoreAnswer(state, "B1", String(guess));
    track("question_answered", { q: "B1", value: guess });
    setState(ns);
    setStepKey(nextKey("SLIDER", ns));
  };
  const advance = (from: string) => setStepKey(nextKey(from, state));
  const setName = (name: string) => {
    const ns = { ...state, name };
    setState(ns);
    setStepKey(nextKey("NAME", ns));
  };
  const setEmail = (email: string) => {
    const ns = { ...state, email };
    setState(ns);
    track("email_captured", { email });
    setStepKey(nextKey("GATE", ns));
  };

  const goToCheckout = (billing: "MONTHLY" | "FULL_PROGRAM" = "MONTHLY") => {
    const r = resolve(state);
    track("checkout_start", { primary: r.primary });
    const params = new URLSearchParams();
    params.set("firstName", state.name?.trim() ?? "");
    params.set("email", state.email?.trim() ?? "");
    params.set("goal", state.goal ?? "");
    params.set("why", state.why ?? "");
    params.set("primary", r.primary);
    params.set("paymentOption", billing === "FULL_PROGRAM" ? "pay_in_full" : "monthly");
    params.set("utm_source", "quiz-belly-after-40");
    params.set("version", "quiz01-v3");
    const url = basic
      ? `${signupUrl(basic.id, billing, { durationWeeks: basic.durationWeeks })}&${params.toString()}`
      : `/checkout?${params.toString()}`;
    if (typeof window !== "undefined") window.location.href = url;
  };

  if (!open) return null;

  const progressQids = ["A1", "F1q", "B1", "C1", "C2", "C3", "D1", "D2", "D4", "D6", "D7", "E1", "F3q", "G1"];
  const answeredCount = progressQids.filter((qid) => state.answers[qid] !== undefined).length;
  const progress = Math.min(100, Math.round((answeredCount / progressQids.length) * 100));
  const showProgress = !["ANALYZING", "GATE", "PREPARING", "DIAGNOSIS", "SOLUTION", "OFFER"].includes(stepKey);

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

      <div ref={scrollRef} onScroll={checkBottom} className="relative flex-1 overflow-y-auto">
        <div className={`mx-auto flex min-h-full w-full flex-col px-6 pt-2 ${stepKey === "OFFER" ? "max-w-[980px]" : "max-w-[540px]"}`}>
          <Screen
            key={stepKey}
            stepKey={stepKey}
            state={state}
            pricing={pricing}
            atBottom={atBottom}
            onNudge={nudge}
            onAnswer={answer}
            onSlider={answerSlider}
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
  stepKey, state, pricing, atBottom, onNudge, onAnswer, onSlider, onAdvance, onName, onEmail, onCheckout,
}: {
  stepKey: string;
  state: State;
  pricing: Pricing;
  atBottom: boolean;
  onNudge: () => void;
  onAnswer: (q: QuestionDef, value: string | string[]) => void;
  onSlider: (guess: number) => void;
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
    case "SLIDER":
      return <SliderScreen onContinue={onSlider} />;
    case "DISC_HISTORY": {
      const c2 = state.answers["C2"] as string;
      return <DiscoveryScreen lines={discHistory(c2)} flip="history" bgVisual={c2 === "regained" ? <TwoPathGraphic /> : undefined} bgCollage={c2 === "couldnt_stick" ? <PhotoCollageBg /> : undefined} onContinue={() => onAdvance("DISC_HISTORY")} />;
    }
    case "DISC_DAY": {
      const d1 = state.answers["D1"] as string;
      return <DiscoveryScreen lines={discDay(d1)} flip="day" onContinue={() => onAdvance("DISC_DAY")} />;
    }
    case "DISC_MIDLIFE":
      return <DiscoveryScreen lines={DISC_MIDLIFE} flip="midlife" onContinue={() => onAdvance("DISC_MIDLIFE")} />;
    case "NAME":
      return <NameScreen onSubmit={onName} />;
    case "ANALYZING":
      return <TransitionScreen title={fillName("Reading your answers, {name}.", state)} ticks={ANALYZING_TICKS} onDone={() => onAdvance("ANALYZING")} />;
    case "GATE":
      return <GateScreen state={state} onSubmit={onEmail} />;
    case "PREPARING":
      return <TransitionScreen title={fillName("Putting your breakdown together, {name}.", state)} ticks={PREPARING_TICKS} onDone={() => onAdvance("PREPARING")} />;
    case "DIAGNOSIS":
      return <DiagnosisScreen state={state} atBottom={atBottom} onNudge={onNudge} onContinue={() => onAdvance("DIAGNOSIS")} />;
    case "SOLUTION":
      return <SolutionScreen state={state} atBottom={atBottom} onNudge={onNudge} onContinue={() => onAdvance("SOLUTION")} />;
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
      <h2 className="font-bold text-[26px] sm:text-[31px] leading-[1.18] tracking-[-0.01em] text-[#15102a]" style={{ fontFamily: QUIZ_FONT }}>{children}</h2>
      {sub && <p className="mt-2 text-[16px] text-[#6b5b6e]" style={{ fontFamily: QUIZ_FONT }}>{sub}</p>}
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

// Shown in place of a scroll-gated CTA: makes the "read to the end" requirement
// obvious and tappable (a tap scrolls the panel down a screenful).
function ScrollHint({ label, onNudge }: { label: string; onNudge: () => void }) {
  return (
    <button
      type="button"
      onClick={onNudge}
      className="flex w-full items-center justify-center gap-2.5 rounded-[1.35rem] border-2 border-dashed border-[#e08bb0] bg-white/70 px-7 py-5 text-center text-[15px] font-bold uppercase tracking-[0.08em] text-[#b81860] transition-colors hover:bg-white"
    >
      <ChevronDown className="h-5 w-5 animate-bounce" strokeWidth={2.6} />
      {label}
      <ChevronDown className="h-5 w-5 animate-bounce" strokeWidth={2.6} />
    </button>
  );
}

function CoachHeader() {
  return (
    <div className="q-fadeline flex items-center gap-3">
      <img src={jjAvatar} alt="JJ Smith" className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-[0_6px_16px_-6px_rgba(140,17,74,0.6)]" />
      <p className="text-[16px] font-bold leading-none text-[#15102a]">JJ Smith</p>
    </div>
  );
}

function FadeLines({ lines, startAt = 0 }: { lines: string[]; startAt?: number }) {
  return (
    <div className={`space-y-2.5 ${READ_CARD}`}>
      {lines.map((line, i) => (
        <p key={i} className="q-fadeline text-[22px] sm:text-[24px] leading-[1.6] text-[#241d2e]" style={{ animationDelay: `${(startAt + i) * STEP_DELAY}s`, fontFamily: READ_FONT }}>
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
      <span className="flex-1" style={{ fontFamily: QUIZ_FONT }}>{label}</span>
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
function DiscoveryScreen({ lines, visual, bgVisual, bgCollage, flip, onContinue }: { lines: string[]; visual?: React.ReactNode; bgVisual?: React.ReactNode; bgCollage?: React.ReactNode; flip: string; onContinue: () => void }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    track("belief_flip_shown", { flip });
    const t = window.setTimeout(() => setDone(true), lines.length * STEP_DELAY * 1000 + 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="relative flex flex-1 flex-col">
        {bgCollage && <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>{bgCollage}</div>}
        {bgVisual && (
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden" aria-hidden>
            <div className="w-full max-w-[440px] opacity-25 blur-[6px]">{bgVisual}</div>
          </div>
        )}
        <div className="relative z-10 flex flex-1 flex-col">
          <Content align="center">
            <CoachHeader />
            <div className="mt-6"><FadeLines lines={lines} /></div>
            {visual && <div className="q-fadeline mt-7" style={{ animationDelay: `${lines.length * STEP_DELAY}s` }}>{visual}</div>}
          </Content>
        </div>
      </div>
      {done && (
        <StickyAction>
          <div className="q-fadeline"><PrimaryButton onClick={onContinue}>Continue</PrimaryButton></div>
        </StickyAction>
      )}
    </>
  );
}

// ── Food-vs-exercise slider (screen 3, styled as a question) ─────────────────
const FOOD_COLOR = "#d62a7a";
const EXERCISE_COLOR = "#6d5a86"; // muted brand plum, cooler counterpart to the pink

function SplitBar({ guess, onChange }: { guess: number; onChange?: (v: number) => void }) {
  const interactive = !!onChange;
  return (
    <div className="relative select-none">
      <div className="flex h-7 w-full overflow-hidden rounded-full shadow-[inset_0_1px_3px_rgba(140,17,74,0.25)]">
        <div style={{ width: `${guess}%`, background: FOOD_COLOR }} className="h-full transition-[width] duration-150" />
        <div style={{ width: `${100 - guess}%`, background: EXERCISE_COLOR }} className="h-full transition-[width] duration-150" />
      </div>
      {interactive && (
        <>
          <input
            type="range" min={0} max={100} step={5} value={guess}
            onChange={(e) => onChange?.(Number(e.target.value))}
            aria-label="Food versus exercise"
            className="absolute inset-0 h-7 w-full cursor-pointer opacity-0"
          />
          <span
            className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#8c114a] shadow-[0_6px_16px_-4px_rgba(140,17,74,0.8)]"
            style={{ left: `${guess}%` }}
          >
            <MoveHorizontal className="h-4 w-4 text-white" strokeWidth={2.6} />
          </span>
        </>
      )}
    </div>
  );
}

function SliderSide({ Icon, label, pct, color }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>; label: string; pct: number; color: string }) {
  // Icon + number grow with the side's share so the bigger lever reads bigger.
  const p = pct / 100;
  const iconSize = 22 + p * 26; // 22..48
  const numSize = 22 + p * 22; // 22..44
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <span className="flex items-center justify-center rounded-2xl" style={{ height: iconSize + 18, width: iconSize + 18, backgroundColor: `${color}1a`, color }}>
        <Icon strokeWidth={2} style={{ height: iconSize, width: iconSize }} />
      </span>
      <span className="mt-1 text-[13px] font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
      <span className="font-bold leading-none" style={{ color, fontSize: numSize }}>{pct}%</span>
    </div>
  );
}

function SliderScreen({ onContinue }: { onContinue: (guess: number) => void }) {
  const [guess, setGuess] = useState(50);
  const [locked, setLocked] = useState(false);
  const lock = () => {
    if (locked) return;
    setLocked(true);
    track("discovery_interaction", { flip: "food-vs-exercise", guess });
  };

  if (locked) {
    return (
      <>
        <Content align="center">
          <div className="q-rise">
            {/* The real split is blurred out (revealed only at the end), with the
                teaser headline sitting in front of it. */}
            <div className="relative mt-2 py-6">
              <div className="pointer-events-none select-none blur-[15px] saturate-[0.9]" aria-hidden>
                <div className="flex items-end justify-between gap-6">
                  <SliderSide Icon={UtensilsCrossed} label="Food" pct={80} color={FOOD_COLOR} />
                  <SliderSide Icon={Dumbbell} label="Exercise" pct={20} color={EXERCISE_COLOR} />
                </div>
                <div className="mt-6"><SplitBar guess={80} /></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center px-3">
                <p
                  className="max-w-[92%] rounded-[1.35rem] bg-white/92 px-6 py-4 text-center text-[24px] font-bold leading-[1.15] tracking-[-0.01em] text-[#15102a] shadow-[0_16px_40px_-18px_rgba(140,17,74,0.55)] ring-1 ring-[#f2d0e0] backdrop-blur-sm sm:text-[29px]"
                  style={{ fontFamily: QUIZ_FONT }}
                >
                  {SLIDER_LOCKED_TITLE}
                </p>
              </div>
            </div>
            <div className="mt-6"><FadeLines lines={SLIDER_REVEAL} /></div>
          </div>
        </Content>
        <StickyAction>
          <div className="q-fadeline" style={{ animationDelay: `${SLIDER_REVEAL.length * STEP_DELAY}s` }}>
            <PrimaryButton onClick={() => onContinue(guess)}>Continue</PrimaryButton>
          </div>
        </StickyAction>
      </>
    );
  }

  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>{SLIDER_PROMPT}</Question>
          <div className="mt-9 flex items-end justify-between gap-6">
            <SliderSide Icon={UtensilsCrossed} label="Food" pct={guess} color={FOOD_COLOR} />
            <SliderSide Icon={Dumbbell} label="Exercise" pct={100 - guess} color={EXERCISE_COLOR} />
          </div>
          <div className="mt-6"><SplitBar guess={guess} onChange={setGuess} /></div>
          <p className="mt-4 flex items-center justify-center gap-2 text-[15px] font-semibold text-[#8c114a]">
            <MoveHorizontal className="h-5 w-5 animate-pulse" strokeWidth={2.4} />
            Drag the slider to make your guess
          </p>
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={lock}>Lock in my guess</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Discovery visuals ────────────────────────────────────────────────────────
// A washed-out masonry of transformation photos, used as a subtle background
// behind a reveal (the "women who keep it off" moment).
function PhotoCollageBg() {
  const base = [t8, t10, t4, t12, t9, t7, t1, tTammi];
  // Repeat enough times to overfill any viewport height (overflow is clipped).
  const tiles = [...base, ...base, ...base, ...base];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="columns-2 gap-2 p-2 sm:columns-3">
        {tiles.map((src, i) => (
          <img key={i} src={src} alt="" className="mb-2 w-full rounded-xl object-cover" loading="lazy" />
        ))}
      </div>
      {/* Blush wash so the photos read as a soft texture, not the focus. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdebeb]/90 via-[#fdebeb]/82 to-[#fdebeb]/94" />
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

// ── Proof coverflow (center card large, neighbors peek; caption fades below) ───
type ProofSlide = { src: string; quote: string; name?: string };

const PROOF_SLIDES: ProofSlide[] = [
  { src: t10, quote: "I feel like the woman I forgot I was." },
  { src: t8, quote: "It keeps me accountable because I feel big sister is always watching.", name: "Keisha" },
  { src: t12, quote: "I'm back to the size I never thought I'd see again." },
  { src: t4, quote: "Actually hearing JJ's voice and speaking to her holds you accountable. There was no room for excuses.", name: "Monique" },
  { src: t9, quote: "I'm not the one hiding behind the camera anymore." },
  { src: t7, quote: "I don't have to figure out what to eat or look up recipes. It's all put together for me.", name: "Tasha" },
  { src: t1, quote: "I'm not hiding in baggy clothes anymore." },
  { src: tTammi, quote: "Just hearing JJ's voice gets me out of bed even if I'm fatigued.", name: "Latoya" },
];

function ProofCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stageH, setStageH] = useState(420);
  const startX = useRef<number | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const n = PROOF_SLIDES.length;
  const go = (d: number) => setActive((p) => (p + d + n) % n);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((p) => (p + 1) % n), 4200);
    return () => clearInterval(id);
  }, [paused, n]);

  // The stage hugs the active image: measure it and animate the height so there
  // are never any bars around the photo.
  const measure = () => {
    const el = cardRefs.current[active];
    if (el) setStageH(el.offsetHeight);
  };
  useEffect(() => {
    measure();
    const on = () => measure();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Shortest signed distance from the active slide, so neighbors wrap around.
  const rel = (idx: number) => {
    let o = idx - active;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  };

  const cur = PROOF_SLIDES[active];
  const arrowCls =
    "absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#8c114a] shadow-[0_10px_26px_-8px_rgba(140,17,74,0.7)] backdrop-blur transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95";

  return (
    <div>
      <div
        className="relative select-none overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ height: stageH }}
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
        {PROOF_SLIDES.map((s, idx) => {
          const o = rel(idx);
          const abs = Math.abs(o);
          const visible = abs <= 1;
          return (
            <div
              key={idx}
              ref={(el) => { cardRefs.current[idx] = el; }}
              aria-hidden={o !== 0}
              onClick={() => visible && o !== 0 && setActive(idx)}
              className={`absolute left-1/2 top-1/2 w-[70%] max-w-[300px] overflow-hidden rounded-[1.4rem] shadow-[0_34px_66px_-26px_rgba(140,17,74,0.65)] ring-1 ring-black/5 transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${visible && o !== 0 ? "cursor-pointer" : ""}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${o * 62}%) scale(${o === 0 ? 1 : 0.82})`,
                opacity: visible ? (o === 0 ? 1 : 0.5) : 0,
                zIndex: 20 - abs,
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              {/* The card sizes to the image's real aspect ratio: no crop, no bars. */}
              <img
                src={s.src}
                alt="Sister transformation before and after"
                className="block w-full"
                loading="lazy"
                onLoad={() => { if (o === 0) measure(); }}
              />
              {o !== 0 && <div className="absolute inset-0 bg-[#4b415b]/30" />}
            </div>
          );
        })}

        <button onClick={() => go(-1)} aria-label="Previous" className={`${arrowCls} left-0`}><ChevronLeft className="h-5 w-5" strokeWidth={2.4} /></button>
        <button onClick={() => go(1)} aria-label="Next" className={`${arrowCls} right-0`}><ChevronRight className="h-5 w-5" strokeWidth={2.4} /></button>
      </div>

      {/* Caption fades in on every change. */}
      <div className="mt-6 min-h-[96px] text-center">
        <blockquote key={active} className="q-fadeline mx-auto max-w-[440px] font-serif italic text-[21px] sm:text-[23px] leading-[1.35] text-[#15102a]">"{cur.quote}"</blockquote>
        {cur.name && (
          <p key={`n-${active}`} className="q-fadeline mt-2 text-[15px] font-semibold text-[#c41e6a]" style={{ animationDelay: "0.08s" }}>– {cur.name}</p>
        )}
      </div>

      {/* Segment indicators. */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {PROOF_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${idx === active ? "w-7 bg-[#8c114a]" : "w-3.5 bg-[#d9b8c6]"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Name (before analyzing) ──────────────────────────────────────────────────
function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => { if (val.trim()) onSubmit(val.trim()); };
  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>Before I put your breakdown together, what should I call you?</Question>
          <p className="mt-3 text-[18px] sm:text-[20px] text-[#6b5b6e]">I like to know who I'm talking to.</p>
          <input ref={ref} type="text" autoComplete="given-name" placeholder="Your first name" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-7 w-full rounded-[1.35rem] border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]" />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!val.trim()}>Continue</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Transition beats (Analyzing / Preparing) ─────────────────────────────────
function TransitionScreen({ title, ticks, onDone }: { title: string; ticks: string[]; onDone: () => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    ticks.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 500 + i * 750)));
    timers.push(window.setTimeout(onDone, 500 + ticks.length * 750 + 700));
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pct = Math.round((shown / ticks.length) * 100);
  return (
    <Content align="center">
      <div className="q-rise">
        <Question>{title}</Question>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#f3d3d3]">
          <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: PINK }} />
        </div>
        <ul className="mt-7 space-y-4">
          {ticks.map((line, i) => (
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

// ── Result gate (pattern name free; email unlocks the full breakdown) ─────────
function GateScreen({ state, onSubmit }: { state: State; onSubmit: (email: string) => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const pattern = gatePattern(res);
  const [val, setVal] = useState("");
  const valid = /.+@.+\..+/.test(val.trim());
  const submit = () => { if (valid) onSubmit(val.trim()); };
  useEffect(() => { track("result_gate_shown", { primary: res.primary }); }, [res.primary]);
  const meta = goalMeta(state);
  const revealIcons = [Search, RefreshCcw, Sparkles];
  return (
    <>
      <Content align="top">
        <div className="q-rise">
          <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">Your pattern</p>
          <h2 className="mt-2 font-serif text-[30px] sm:text-[36px] leading-[1.1] capitalize text-[#15102a]">{pattern.name}</h2>
          <p className="mt-3 text-[19px] sm:text-[21px] leading-[1.4] font-medium text-[#15102a]">{pattern.essence}</p>

          {/* Full breakdown teaser: real chart blurred behind, reveals listed on top. */}
          <div className="relative mt-6 overflow-hidden rounded-[1.9rem] shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
            <div className="select-none blur-[6px]" aria-hidden>
              <div className="bg-white p-5">
                <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate={false} dateLabel="" detailed />
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-center bg-white/72 p-5 backdrop-blur-[1px]">
              <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#8c114a]">Your full breakdown reveals</p>
              <ul className="mt-3 space-y-2.5">
                {GATE_REVEALS.map((r, i) => {
                  const RI = revealIcons[i] ?? Search;
                  return (
                    <li key={r} className="flex items-start gap-3 text-[17px] font-semibold leading-snug text-[#15102a]">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: PINK }}><RI className="h-4 w-4" strokeWidth={2.4} /></span>
                      {r}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <p className="mt-6 text-[18px] sm:text-[20px] leading-snug text-[#6b5b6e]">Where should I send it? I'll also walk you through the whole thing in the next screen.</p>
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="mt-4 w-full rounded-[1.35rem] border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]" />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!valid}>Unlock My Full Breakdown</PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]"><Lock className="h-4 w-4" /> Free. Your complete breakdown, and how to fix it.</p>
      </StickyAction>
    </>
  );
}

// ── Full diagnosis (composed) ────────────────────────────────────────────────
const DIAG_LABEL: Record<string, string> = {
  mirror: "What you told me",
  pattern: "Your pattern",
  aha: "What's really going on",
  slider: "About that slider",
  diets: "Why what you tried didn't last",
  throughline: "The real picture",
  turn: "What changes it",
};

// Split composed prose into sentences so each card reads as short, scannable
// lines instead of one block. Content is unchanged; only the line breaks differ.
function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [text];
}

function DiagnosisSectionCard({ section, delay }: { section: DiagnosisSection; delay: number }) {
  const { kind, text, bullets } = section;
  const label = DIAG_LABEL[kind] ?? "";
  const pivot = kind === "pattern" || kind === "throughline" || kind === "turn"; // the anchors
  const sentences = splitSentences(text);
  return (
    <div
      className={`q-fadeline rounded-[1.6rem] p-6 sm:p-7 shadow-[0_20px_44px_-30px_rgba(140,17,74,0.55)] ring-1 ${
        pivot ? "bg-[#fff5f9] ring-[#f3b9d2]" : "bg-white ring-[#f6e0ea]"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Statement title (bold sans), like the "/" reveal cards. */}
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-5 w-1.5 shrink-0 rounded-full" style={{ background: pivot ? PINK : "#f0b9d2" }} aria-hidden />
        <h3 className={`font-sans text-[19px] sm:text-[21px] font-bold leading-tight tracking-tight ${pivot ? "text-[#b81860]" : "text-[#15102a]"}`}>{label}</h3>
      </div>

      {bullets ? (
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[14px] h-2 w-2 shrink-0 rounded-full" style={{ background: PINK }} aria-hidden />
              <span className="text-[19px] sm:text-[21px] leading-[1.55] text-[#2f2740]" style={{ fontFamily: READ_FONT }}>{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2.5">
          {sentences.map((s, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-[21px] sm:text-[23px] font-semibold leading-[1.5] text-[#15102a]"
                  : "text-[19px] sm:text-[21px] leading-[1.55] text-[#3a3147]"
              }
              style={{ fontFamily: READ_FONT }}
            >
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function DiagnosisScreen({ state, atBottom, onNudge, onContinue }: { state: State; atBottom: boolean; onNudge: () => void; onContinue: () => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const diag = useMemo(() => composeDiagnosis(state, res), [state, res]);
  useEffect(() => { track("diagnosis_shown", { primary: res.primary, confidence: res.confidence }); }, [res.primary, res.confidence]);
  return (
    <>
      <Content align="top">
        <CoachHeader />
        <h2 className="q-rise mt-5 font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">{diag.title}</h2>
        <div className="mt-5 space-y-3.5">
          {diag.sections.map((sec, i) => (
            <DiagnosisSectionCard key={i} section={sec} delay={Math.min(i, 4) * 0.12} />
          ))}
        </div>
      </Content>
      <StickyAction>
        {atBottom
          ? <PrimaryButton onClick={onContinue}>I'm ready to fix this</PrimaryButton>
          : <ScrollHint label="Keep reading" onNudge={onNudge} />}
      </StickyAction>
    </>
  );
}

// ── Solution (the 12-week challenge, personalized to her diagnosis) ───────────
function SolutionScreen({ state, atBottom, onNudge, onContinue }: { state: State; atBottom: boolean; onNudge: () => void; onContinue: () => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const meta = goalMeta(state);
  const dateLabel = useMemo(() => fmtDate(12), []);
  const ageVal = (state.answers["F1q"] as string) ?? "40s";
  const ageWord = AGE_DISPLAY[ageVal] ?? "your 40s";
  const lines = SOLUTION_LINES[res.primary] ?? {};
  const flagLines = solutionFlagLines(state);

  const planDefault =
    ageVal === "50s"
      ? "Built for your body, your hormones, your real schedule. Made for life after menopause, not a generic template."
      : "Built for your body, your hormones, your real schedule. Not a generic template, a plan that fits the life you actually live.";

  const inclusions: { Icon: typeof Phone; label: string; sub: string }[] = [
    { Icon: Phone, label: "A real call with me, every week", sub: lines.weeklyCall ?? "Every week it is just you and me. You always know exactly what to do next, and you never feel lost." },
    { Icon: MessageCircle, label: "I'm in your phone every morning", sub: lines.dailyCheckin ?? "You start each day knowing someone has you. That is what makes you keep going." },
    { Icon: UtensilsCrossed, label: "Meals built around the food you love", sub: lines.meals ?? "No guessing, no sad diet plates. Real food you actually enjoy, planned for you each week." },
    { Icon: UserCheck, label: `A plan built for your body at ${ageWord}`, sub: (lines.plan ?? planDefault) + (flagLines.plan ? ` ${flagLines.plan}` : "") },
    { Icon: Users, label: "The circle of sisters beside you", sub: lines.sisters ?? "You are surrounded by women on the exact same journey, so you never feel like the only one." },
  ];

  return (
    <>
      <Content align="top">
        <h2 className="q-rise font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">
          {fillName("{name}, here is exactly how we fix this together.", state)}
        </h2>
        <p className="q-rise mt-4 text-[20px] sm:text-[21px] leading-[1.6] text-[#241d2e]" style={{ fontFamily: READ_FONT }}>
          Everything your breakdown just showed you, your pattern and what actually works for it, is what these next 12 weeks are built around. Not a generic program. Your pattern, handled, with me beside you the whole way.
        </p>
        {flagLines.header && <p className="mt-3 text-[18px] font-semibold leading-snug text-[#b81860]" style={{ fontFamily: READ_FONT }}>{flagLines.header}</p>}

        <div className="q-rise mt-5 overflow-hidden rounded-[1.9rem] bg-white shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="px-5 py-4 text-white" style={{ background: PINK }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide opacity-90">Your goal</p>
            <p className="text-[20px] font-bold leading-tight">{meta.chapterOne ? "A strong start" : `About ${meta.target} pounds`}, by {dateLabel}</p>
          </div>
          <div className="p-5">
            <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate dateLabel={dateLabel} detailed />
          </div>
        </div>
        {flagLines.goalNote && <p className="mt-3 text-[16px] leading-snug text-[#6b5b6e]">{flagLines.goalNote}</p>}
        {flagLines.progress && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-[#fff0f5] p-4 text-[16px] font-medium leading-snug text-[#8c114a]">
            <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-[#c41e6a]" strokeWidth={2} />
            <span>{flagLines.progress}</span>
          </div>
        )}

        <div className={`mt-6 space-y-3 text-[22px] sm:text-[24px] leading-[1.6] text-[#241d2e] ${READ_CARD}`} style={{ fontFamily: READ_FONT }}>
          <p className="font-semibold">We start fast.</p>
          <p>Your jumpstart is built to fit your life, so you feel it in the first few days, not the first month. The cravings quiet down, the bloat comes off, your energy comes back, and you get that early win that makes you believe it is possible again. It is not the whole plan. It is the running start.</p>
          <p>Then it is real food you already love, made simple, with your meals planned for you every single week, so you never have to wonder what to eat.</p>
          <p>And the whole way through, I am right here with you. Texting you in the morning. Calling you every week. Catching you before a slip becomes a week.</p>
          <p className="font-semibold text-[#b81860]">You are not doing this alone, not for one single day.</p>
        </div>

        <div className="mt-7 space-y-3">
          {inclusions.map(({ Icon, label, sub }, idx) => (
            <React.Fragment key={label}>
              <div className="flex items-start gap-3.5 rounded-[1.5rem] bg-white p-5 shadow-[0_16px_34px_-26px_rgba(140,17,74,0.8)] ring-1 ring-[#f6e0ea]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <p className="text-[18px] sm:text-[19px] font-bold leading-snug text-[#15102a]">{label}</p>
                  <p className="mt-1.5 text-[18px] sm:text-[19px] leading-[1.55] text-[#2f2740]" style={{ fontFamily: READ_FONT }}>{sub}</p>
                </div>
              </div>
              {/* The metabolism curve lives right under the "plan for your body" item. */}
              {idx === 3 && <AgeCurveGraphic age={ageVal} />}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-[#c41e6a]">Real women, with me by their side</p>
          <h3 className="mt-2 font-serif text-[26px] sm:text-[30px] leading-[1.12] text-[#15102a]">Here's what happens with me by your side.</h3>
          <div className="mt-6"><ProofCarousel /></div>
        </div>
      </Content>

      <StickyAction>
        {atBottom
          ? <PrimaryButton onClick={onContinue}>Show Me How to Start</PrimaryButton>
          : <ScrollHint label="Keep reading" onNudge={onNudge} />}
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
        {/* Header (constrained + centered on desktop for readability). */}
        <div className="lg:mx-auto lg:max-w-[760px] lg:text-center">
          <div className="q-rise inline-flex self-start rounded-full bg-[#15102a] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
            {OFFER_COPY.eyebrow}
          </div>
          <h2 className="mt-4 font-sans font-bold text-[28px] sm:text-[33px] lg:text-[40px] leading-[1.12] tracking-[-0.02em] text-[#15102a]">
            {fillName("So let's go get her, {name}.", state)}
          </h2>
          <p className="mt-3 text-[18px] sm:text-[20px] leading-[1.4] text-[#15102a] lg:mx-auto lg:max-w-[620px]">
            You know your pattern now, and you know what fixes it. This is me doing it with you, one on one, every single day for the next 12 weeks.
          </p>
        </div>

        {/* Value stack + pricing side by side on desktop. Mobile keeps the stacked order. */}
        <div className="mt-6 lg:mt-9 space-y-6 lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-7 lg:space-y-0">
          <div className="rounded-[1.9rem] bg-white p-5 shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
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

          <div className="space-y-1 lg:sticky lg:top-3">
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
        </div>

        {/* Reassurance: two balanced columns on desktop, stacked on mobile. */}
        <div className="mt-6 space-y-5 lg:mt-11 lg:mx-auto lg:max-w-[860px] lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
          <div className="space-y-5">
            <div className="space-y-3 text-[17px] leading-[1.5] text-[#15102a]">
              <p className="font-semibold">{OFFER_COPY.startNow}</p>
            </div>
            <p className="rounded-2xl bg-[#fff0f5] p-4 text-[16px] font-semibold leading-snug text-[#8c114a]">
              {OFFER_COPY.scarcity}
            </p>
          </div>
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-2xl border border-[#f0c9d8] bg-white/70 p-4">
              <ShieldCheck className="h-7 w-7 shrink-0 text-[#c41e6a]" />
              <p className="font-serif italic text-[16px] leading-[1.6] text-[#15102a]">
                "{OFFER_COPY.guarantee}"
                <span className="mt-2 block font-sans not-italic text-[13px] font-semibold tracking-[0.16em] text-[#9a7f8a]">JJ</span>
              </p>
            </div>
            <div className="rounded-[1.9rem] bg-[#15102a] p-6 text-center text-white">
              <p className="font-serif text-[24px] sm:text-[28px] leading-[1.15]">The months ahead are happening either way.</p>
              <p className="mt-3 text-[16px] leading-[1.6] text-white/85">
                You can spend them like the last ones. Or you can spend them with me right there with you, and come out the other side feeling like yourself again.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ + trust line, full width but readable. */}
        <div className="lg:mx-auto lg:mt-6 lg:max-w-[760px]">
          <p className="mt-8 text-[15px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">Questions women ask me</p>
          <Accordion type="single" collapsible className="mt-2 w-full">
            {FAQ_ITEMS.map((it, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-[#f0c9d8]">
                <AccordionTrigger className="py-5 text-left text-[17px] font-bold text-[#15102a] hover:no-underline">{it.q}</AccordionTrigger>
                <AccordionContent className="text-[16px] leading-[1.6] text-[#6b5b6e]">{it.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]"><Lock className="h-4 w-4" /> 14 day money back guarantee. Secure checkout.</p>
        </div>
      </Content>
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
        <linearGradient id="projFillV3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d62a7a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d62a7a" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="projLineV3" x1="0" y1="0" x2="1" y2="0">
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
      <path d={areaPath} fill="url(#projFillV3)" />
      <path d={linePath} className={animate ? "q-draw" : undefined} fill="none" stroke="url(#projLineV3)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

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
