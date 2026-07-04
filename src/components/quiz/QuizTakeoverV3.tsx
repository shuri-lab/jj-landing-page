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
import meal1 from "@/assets/landing/meals/meal-1.jpg";
import meal2 from "@/assets/landing/meals/meal-2.jpg";
import meal3 from "@/assets/landing/meals/meal-3.jpg";
import meal4 from "@/assets/landing/meals/meal-4.jpg";
import meal5 from "@/assets/landing/meals/meal-5.jpg";
import meal6 from "@/assets/landing/meals/meal-6.jpg";
import meal7 from "@/assets/landing/meals/meal-7.jpg";
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
  type VisualKind,
  GATE_REVEALS,
  SOLUTION_HER_FIX,
  solutionWhyClose,
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
      <div className="q-zoom-desktop shrink-0">
        <div className="mx-4 mt-3 h-2 overflow-hidden rounded-full bg-[#f0cdd9]/70 shadow-[inset_0_1px_2px_rgba(140,17,74,0.25)]">
          {(showProgress || stepKey === "GATE") && (
            <div className="h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ width: `${stepKey === "GATE" ? 100 : progress}%`, background: PINK }} />
          )}
        </div>
        <div className="flex justify-end px-4 pt-3">
          <button onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#8c114a] transition-colors hover:bg-white">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} onScroll={checkBottom} className="relative flex-1 overflow-y-auto">
        <div className={`q-zoom-desktop mx-auto flex min-h-full w-full flex-col px-6 pt-2 ${stepKey === "OFFER" ? "max-w-[980px]" : stepKey === "DIAGNOSIS" ? "max-w-[960px]" : stepKey === "GATE" ? "max-w-[960px]" : stepKey === "SOLUTION" ? "max-w-[720px]" : "max-w-[540px]"}`}>
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

function StickyAction({ children, innerClassName = "max-w-[560px]" }: { children: React.ReactNode; innerClassName?: string }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-2 bg-gradient-to-t from-[#fdebeb] via-[#fdebeb] to-transparent px-6 pt-6" style={{ paddingBottom: "calc(1.1rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Inner width matches the screen's content column so the CTA aligns with it. */}
      <div className={`mx-auto w-full ${innerClassName}`}>{children}</div>
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
function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

// The blurred "full breakdown" card (the desire engine). Rendered on the right
// column on desktop and inline on mobile.
function GateTeaserCard({ meta }: { meta: { target: number; chapterOne: boolean } }) {
  const revealIcons = [Search, Sparkles];
  return (
    <div className="relative overflow-hidden rounded-[1.9rem] bg-white shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      {/* Blurred projection chart, a soft background behind the reveals. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 select-none opacity-90 blur-[7px]" aria-hidden>
        <div className="p-4"><ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate={false} dateLabel="" detailed /></div>
      </div>
      {/* Glass + the two reveals define the (now shorter) height. */}
      <div className="relative bg-white/72 px-6 py-6 backdrop-blur-[1px]">
        <p className="text-[14px] font-bold uppercase tracking-[0.12em] text-[#8c114a]">Inside your breakdown</p>
        <ul className="mt-3 space-y-2.5">
          {GATE_REVEALS.map((r, i) => {
            const RI = revealIcons[i] ?? Search;
            return (
              <li key={r} className="flex items-center gap-3 text-[17px] font-semibold leading-snug text-[#15102a]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style={{ background: PINK }}><RI className="h-4 w-4" strokeWidth={2.4} /></span>
                {r}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function GateScreen({ state, onSubmit }: { state: State; onSubmit: (email: string) => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const [val, setVal] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);
  const valid = /.+@.+\..+/.test(val.trim());
  const submit = () => { if (valid) onSubmit(val.trim()); };
  // Google is a MOCK for now: show "Signed in", then unlock. Wire real OAuth later;
  // when she signs in with Google we already have her name, so the name step is skipped.
  const google = () => {
    if (googleBusy) return;
    setGoogleBusy(true);
    track("result_gate_google_mock", { primary: res.primary });
    setTimeout(() => onSubmit("signed-in-with-google@gmail.com"), 750);
  };
  useEffect(() => { track("result_gate_shown", { primary: res.primary }); }, [res.primary]);
  const meta = goalMeta(state);
  return (
    <Content align="center">
      {/* Desktop: hero-style two columns (hook + breakdown card left, the two ways to
          unlock right). Mobile: one stacked column, same source order. */}
      <div className="q-rise mx-auto w-full max-w-[460px] lg:max-w-[960px] lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        {/* LEFT: the status headline, the intrigue, and the breakdown card. */}
        <div className="lg:max-w-[460px]">
          <h2 className="font-sans font-bold text-[27px] sm:text-[32px] lg:text-[38px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">{fillName("{name}, your full breakdown is ready.", state)}</h2>
          <p className="mt-3 text-[19px] sm:text-[21px] leading-[1.5] text-[#3a3147]" style={{ fontFamily: READ_FONT }}>It was never your willpower, and it was never just one thing.</p>
          <div className="mt-5"><GateTeaserCard meta={meta} /></div>
        </div>

        {/* RIGHT: the two ways to unlock. */}
        <div className="mt-7 lg:mt-0 lg:max-w-[440px]">
          <p className="mb-3 text-[16px] font-medium text-[#6b5b6e]">Where should I send it?</p>
          {/* Fast path on top: continue with Google (mock). */}
          <button
            onClick={google}
            disabled={googleBusy}
            className="flex w-full items-center justify-center gap-3 rounded-[1.35rem] border-2 border-[#e3d2da] bg-white px-5 py-4 text-[18px] font-bold text-[#15102a] shadow-[0_12px_28px_-20px_rgba(20,16,42,0.7)] transition-all hover:border-[#c9b3bf] active:scale-[0.99] disabled:opacity-70"
          >
            {googleBusy ? (
              <><Check className="h-5 w-5 text-[#34A853]" strokeWidth={3} /> Signed in</>
            ) : (
              <><GoogleG className="h-5 w-5" /> Continue with Google</>
            )}
          </button>

          {/* A real divider, so the two paths feel like a choice, not a stack. */}
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e7c6d3]" />
            <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#9a7f8a]">or use your email</span>
            <span className="h-px flex-1 bg-[#e7c6d3]" />
          </div>

          {/* Email path below. */}
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} className="w-full rounded-[1.35rem] border-2 border-[#f0c9d8] bg-white px-5 py-4 text-[19px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]" />
          <div className="mt-3">
            <PrimaryButton onClick={submit} disabled={!valid}>Unlock my breakdown</PrimaryButton>
          </div>
        </div>
      </div>
    </Content>
  );
}

// ── Full diagnosis (composed) ────────────────────────────────────────────────
// Split composed prose into sentences so each card reads as short, scannable
// lines instead of one block. Content is unchanged; only the line breaks differ.
function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+["']?(?=\s|$)/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [text];
}

function DiagnosisSectionCard({ section, delay }: { section: DiagnosisSection; delay: number }) {
  const { kind, text, bullets } = section;
  const pivot = kind === "pattern" || kind === "throughline" || kind === "turn"; // the anchors
  const sentences = splitSentences(text);
  return (
    <div
      className={`q-fadeline rounded-[1.6rem] p-6 sm:p-7 shadow-[0_20px_44px_-30px_rgba(140,17,74,0.55)] ring-1 ${
        pivot ? "bg-[#fff5f9] ring-[#f3b9d2]" : "bg-white ring-[#f6e0ea]"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >

      {bullets ? (
        <ul className="space-y-3">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[14px] h-2 w-2 shrink-0 rounded-full" style={{ background: PINK }} aria-hidden />
              <span className="text-[22px] sm:text-[24px] leading-[1.55] text-[#2f2740]" style={{ fontFamily: READ_FONT }}>{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2.5">
          {sentences.map((s, i) => {
            // JJ writes in a punch-explain-punch rhythm: the SHORT lines are the
            // payoffs. Rendering the lead and the short punches bold in dark ink (and
            // the explaining lines lighter) gives the eye skimmable anchors, so a long
            // card reads much shorter than it is, with no change to the words.
            const isLead = i === 0;
            const isPunch = !isLead && s.split(/\s+/).length <= 9;
            return (
              <p
                key={i}
                className={
                  isLead
                    ? "text-[23px] sm:text-[25px] font-semibold leading-[1.5] text-[#15102a]"
                    : isPunch
                      ? "text-[22px] sm:text-[24px] font-semibold leading-[1.45] text-[#15102a]"
                      : "text-[22px] sm:text-[24px] leading-[1.55] text-[#3a3147]"
                }
                style={{ fontFamily: READ_FONT }}
              >
                {s}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Diagnosis support graphics ────────────────────────────────────────────────
// Small, on-brand visuals that ride alongside a beat: pinned in a sticky rail on
// desktop, stacked inline under their card on mobile.
function VizCard({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_40px_-28px_rgba(140,17,74,0.55)] ring-1 ring-[#f6e0ea]">
      <p className="text-[13px] font-bold uppercase tracking-[0.13em] text-[#c41e6a]">{title}</p>
      <div className="mt-4">{children}</div>
      {/* The description is desktop-only: on mobile it stacks under the beat and
          made the page too long, and the surrounding beat text already gives context. */}
      <p className="mt-4 hidden text-[22px] leading-[1.55] text-[#3f3448] lg:block lg:text-[24px]" style={{ fontFamily: READ_FONT }}>{caption}</p>
    </div>
  );
}

// Matches the food-vs-exercise slider from the quiz question (SliderSide + SplitBar),
// shown here at the real ~85/15 split as the payoff.
function SliderSplitViz() {
  return (
    <VizCard title="What actually moves the scale" caption="For most women it is mostly the food. Exercise is wonderful for your heart and your head, but it is a small slice of the scale.">
      <div className="flex items-end justify-between gap-6">
        <SliderSide Icon={UtensilsCrossed} label="Food" pct={85} color={FOOD_COLOR} />
        <SliderSide Icon={Dumbbell} label="Exercise" pct={15} color={EXERCISE_COLOR} />
      </div>
      <div className="mt-5"><SplitBar guess={85} /></div>
    </VizCard>
  );
}

function RegainViz() {
  const pts: [number, number][] = [[18, 55], [70, 115], [122, 60], [174, 105], [226, 66], [282, 96]];
  return (
    <VizCard title="The fast-loss cycle" caption="Each rebound comes back as fat, not the muscle you lost, so every round starts a little harder than the last.">
      <svg viewBox="0 0 300 140" className="w-full" fill="none" role="img" aria-label="A weight line dropping and rebounding, each low point creeping higher.">
        <line x1="14" y1="130" x2="286" y2="130" stroke="#f0dbe5" strokeWidth="1.5" />
        <path d="M70 120 L282 100" stroke="#e7a9c6" strokeWidth="2" strokeDasharray="4 6" />
        <path d={`M${pts.map((p) => p.join(" ")).join(" L")}`} stroke="#c41e6a" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill={i % 2 === 0 ? "#8c114a" : "#d62a7a"} />
        ))}
      </svg>
    </VizCard>
  );
}

function MidlifeCurveViz() {
  return (
    <VizCard title="What changes after 40" caption="Muscle and daily calorie burn quietly decline, and fat shifts toward your middle, on the exact same plan that used to work.">
      <svg viewBox="0 0 300 140" className="w-full" fill="none" role="img" aria-label="A muscle and metabolism line staying level, then declining after age 40.">
        <line x1="14" y1="122" x2="286" y2="122" stroke="#f0dbe5" strokeWidth="1.5" />
        <line x1="104" y1="24" x2="104" y2="122" stroke="#e7a9c6" strokeWidth="2" strokeDasharray="4 6" />
        <text x="104" y="136" textAnchor="middle" fontSize="13" fontWeight="700" fill="#b81860">40</text>
        <path d="M18 46 L104 48 Q160 54 210 86 Q246 112 282 118" stroke="#c41e6a" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="18" cy="46" r="4" fill="#8c114a" />
        <circle cx="282" cy="118" r="4" fill="#d62a7a" />
      </svg>
    </VizCard>
  );
}

function DiagVisual({ kind }: { kind: VisualKind }) {
  if (kind === "sliderSplit") return <SliderSplitViz />;
  if (kind === "regain") return <RegainViz />;
  return <MidlifeCurveViz />;
}

function DiagnosisScreen({ state, atBottom, onNudge, onContinue }: { state: State; atBottom: boolean; onNudge: () => void; onContinue: () => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const diag = useMemo(() => composeDiagnosis(state, res), [state, res]);
  useEffect(() => { track("diagnosis_shown", { primary: res.primary, confidence: res.confidence }); }, [res.primary, res.confidence]);

  // Layout: one constant-width text column (readability sweet spot) for EVERY beat,
  // with the two graphics fixed beside their own card in a 300px column. Text-only
  // beats leave that column as whitespace, so text width never changes. On mobile the
  // row collapses and the graphic stacks directly under its beat.
  return (
    <>
      <Content align="top">
        <div className="lg:mx-auto lg:w-[884px]">
          <CoachHeader />
          <h2 className="q-rise mt-5 font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">{diag.title}</h2>
          <div className="mt-5 space-y-3.5">
            {diag.sections.map((sec, i) => (
              // Constant-width text column for every beat (lg:pr reserves the right
              // gutter). The visual sits ABOVE its card on mobile; on desktop it is
              // absolutely placed in the right gutter and OUT OF FLOW, so a graphic
              // taller than its card overflows down beside the following card instead
              // of pushing the next beat lower.
              <div key={i} className="lg:relative lg:pr-[324px]">
                {sec.visual && (
                  <div className="mb-3 lg:absolute lg:right-0 lg:top-0 lg:mb-0 lg:w-[300px]">
                    <DiagVisual kind={sec.visual} />
                  </div>
                )}
                <DiagnosisSectionCard section={sec} delay={Math.min(i, 4) * 0.12} />
              </div>
            ))}
          </div>
        </div>
      </Content>
      <StickyAction innerClassName="lg:max-w-[884px]">
        {atBottom
          ? <PrimaryButton onClick={onContinue}>I'm ready to fix this</PrimaryButton>
          : <ScrollHint label="Keep reading" onNudge={onNudge} />}
      </StickyAction>
    </>
  );
}

// ── Meal photo marquee (auto-sliding) under the "meals" feeling-card ──────────
const MEAL_IMAGES = [meal1, meal2, meal3, meal4, meal5, meal6, meal7];

function MealStrip() {
  const track = [...MEAL_IMAGES, ...MEAL_IMAGES]; // doubled for a seamless loop
  return (
    <div className="relative mt-2.5 overflow-hidden">
      {/* Per-item margin (not flex gap) so translateX(-50%) lands on an exact seam. */}
      <div className="flex w-max animate-marquee-slow">
        {track.map((src, i) => (
          <div key={i} className="mr-3 shrink-0 overflow-hidden rounded-[1.3rem] shadow-[0_16px_34px_-26px_rgba(140,17,74,0.8)] ring-1 ring-[#f6e0ea]">
            <img
              src={src}
              alt="A meal from your plan"
              loading="lazy"
              className="h-[168px] w-[168px] object-cover sm:h-[186px] sm:w-[186px]"
            />
          </div>
        ))}
      </div>
      {/* Fade the edges into the screen background so photos slide in and out softly. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#fdebeb] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fdebeb] to-transparent" />
    </div>
  );
}

// ── Solution (the emotional bridge: diagnosis -> price) ───────────────────────
// Job: catch the hope the diagnosis ended on and answer one question, "what is it
// like to do this with her?" It makes her WANT; the Offer makes her DECIDE, so no
// value stack / guarantee / FAQ here, and no re-teaching (the diagnosis did that).
function SolutionScreen({ state, atBottom, onNudge, onContinue }: { state: State; atBottom: boolean; onNudge: () => void; onContinue: () => void }) {
  const res = useMemo(() => resolve(state), [state]);
  const meta = goalMeta(state);
  const dateLabel = useMemo(() => fmtDate(12), []);

  // "What it's like" — the FEELING of the product, not its mechanism. Four fixed
  // lines, then one composed from her primary reason (her specific fix).
  const feelItems: { Icon: typeof Phone; text: string; her?: boolean; strip?: boolean }[] = [
    { Icon: MessageCircle, text: "You wake up to a text from me, so you never start the day on your own." },
    { Icon: UtensilsCrossed, text: "Your meal plan, built around food you love, simple to make and easy on your grocery bill.", strip: true },
    { Icon: Phone, text: "Every week we talk, and I tell you exactly what to do next." },
    { Icon: Heart, text: "The morning after a hard day, I catch you before it becomes a lost week." },
    { Icon: Sparkles, text: SOLUTION_HER_FIX[res.primary], her: true },
  ];

  return (
    <>
      <Content align="top">
        <div className="lg:mx-auto lg:max-w-[640px]">
          <CoachHeader />

          {/* 1. The catch (one breath). */}
          <h2 className="q-rise mt-5 font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.02em] text-[#15102a]">
            {fillName("{name}, everything we just went through is exactly what the next 12 weeks finally fix.", state)}
          </h2>
          <p className="q-rise mt-3 text-[22px] sm:text-[24px] font-semibold leading-[1.4] text-[#b81860]" style={{ fontFamily: READ_FONT }}>
            Me, with you, the whole way.
          </p>

          {/* 2. What it's like — feeling cards (visual, breathing, one line each). */}
          <p className="mt-7 text-[13px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">What it's like, starting day one</p>
          <div className="mt-3 space-y-2.5">
            {feelItems.map(({ Icon, text, her, strip }) => (
              <React.Fragment key={text}>
                <div
                  className={`flex items-center gap-3.5 rounded-[1.5rem] p-4 sm:p-[18px] ring-1 ${
                    her ? "bg-[#fff5f9] ring-[#f3b9d2]" : "bg-white ring-[#f6e0ea]"
                  } shadow-[0_16px_34px_-28px_rgba(140,17,74,0.8)]`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className={`text-[19px] sm:text-[20px] leading-[1.4] text-[#241d2e] ${her ? "font-semibold text-[#8c114a]" : ""}`} style={{ fontFamily: READ_FONT }}>{text}</p>
                </div>
                {strip && <MealStrip />}
              </React.Fragment>
            ))}
          </div>

          {/* 3. The goal picture (chart moved here, after the feeling). */}
          <div className="q-rise mt-7 overflow-hidden rounded-[1.9rem] bg-white shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9),inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="px-5 py-4 text-white" style={{ background: PINK }}>
              <p className="text-[12px] font-semibold uppercase tracking-wide opacity-90">Your goal</p>
              <p className="text-[20px] font-bold leading-tight">Where you could be by {dateLabel}</p>
            </div>
            <div className="p-5">
              <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate dateLabel={dateLabel} detailed />
            </div>
          </div>
          {/* 5. The proof. */}
          <div className="mt-10">
            <h3 className="font-serif text-[26px] sm:text-[30px] leading-[1.12] text-[#15102a]">Here's what happens with me by your side.</h3>
            <div className="mt-6"><ProofCarousel /></div>
          </div>

          {/* 6. The why-close: her own reason, the last note before she decides. */}
          <div className="mt-10 rounded-[1.9rem] bg-[#fff5f9] p-6 sm:p-7 ring-1 ring-[#f3b9d2]">
            <p className="text-[22px] sm:text-[24px] font-semibold leading-[1.45] text-[#8c114a]" style={{ fontFamily: READ_FONT }}>
              {solutionWhyClose(state)}
            </p>
          </div>
        </div>
      </Content>

      <StickyAction innerClassName="lg:max-w-[640px]">
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
        <div className="lg:mx-auto lg:max-w-[820px] lg:text-center">
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
        <div className="mt-6 lg:mx-auto lg:mt-9 lg:max-w-[820px] space-y-6 lg:grid lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-7 lg:space-y-0">
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
        <div className="mt-6 space-y-5 lg:mt-11 lg:mx-auto lg:max-w-[820px] lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:space-y-0">
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
        <div className="lg:mx-auto lg:mt-6 lg:max-w-[820px]">
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
      <text x={endX} y={endY - 12} fontSize="13" fontWeight="800" fill="#8c114a" textAnchor="middle">up to {target} lbs</text>
      {chapterOne && <text x={right} y={y(maxLoss) - 8} fontSize="11" fontWeight="700" fill="#c41e6a" textAnchor="end">we keep going</text>}
    </svg>
  );
}
