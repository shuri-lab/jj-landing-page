import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Check,
  Lock,
  ShieldCheck,
  Phone,
  MessageCircle,
  UtensilsCrossed,
  UserCheck,
  BookOpen,
  Users,
  HeartHandshake,
  FileText,
  LogOut,
  Heart,
  Briefcase,
  Footprints,
  Shuffle,
  GlassWater,
  Leaf,
  Smartphone,
  ClipboardList,
  Droplet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCoachPrograms, signupUrl } from "@/lib/coach-programs";
import jjAvatar from "@/assets/landing/jj-selfie-sun.jpg";
import jjHug from "@/assets/landing/jj-hug-signup.webp";
import jjLaughing from "@/assets/landing/jj-laughing-client.jpg";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
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

/**
 * QUIZ FUNNEL #1 — "12 Weeks to Sexy" (Clarity / offer-forward, v7)
 *
 * Full-screen takeover. Offer-led, no voice agent. Reveals fade in line by line
 * (slow, soft) under a small JJ "your coach" header, each with a supporting
 * visual. Scrollable screens use a sticky floating Continue button. No dashes
 * in copy. Transformations carry quote text only (no names, no pound numbers)
 * and never repeat across screens.
 */

const PINK = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";
const BG = "#fdebeb";

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

// Transformations (quotes only, no names/numbers). Different sets per screen.
const TRANSF_GOAL = [
  { src: t1, quote: "I'm not hiding in baggy clothes anymore." },
  { src: t4, quote: "I'm in family photos again, front and center." },
];
const TRANSF_PROOF = [
  { src: t8, quote: "I'm dressing up again. I'm smiling in pictures again." },
  { src: t10, quote: "I feel like the woman I forgot I was." },
  { src: t7, quote: "My doctor's visits sound completely different now." },
];
const TRANSF_PLAN = [
  { src: t12, quote: "I'm back to the size I never thought I'd see again." },
  { src: t9, quote: "I'm not the one hiding behind the camera anymore." },
  { src: tTammi, quote: "I lost the baby weight." },
];

// ── Answer model ─────────────────────────────────────────────────────────────
type Answers = {
  goal?: string;
  tried?: string[];
  attempts?: string;
  age?: string;
  name?: string;
  food?: string;
  day?: string;
  timeframe?: string;
  readiness?: string;
  email?: string;
};

const fill = (text: string, a: Answers) => text.replace(/\{name\}/g, a.name?.trim() || "sis");

const GOAL_META: Record<string, { label: string; target: number; chapterOne: boolean }> = {
  "10_20": { label: "10 to 20 lbs", target: 18, chapterOne: false },
  "20_35": { label: "20 to 35 lbs", target: 28, chapterOne: false },
  "35_50": { label: "35 to 50 lbs", target: 30, chapterOne: true },
  "50_plus": { label: "50+ lbs", target: 25, chapterOne: true },
};

const FOOD_LABEL: Record<string, string> = {
  comfort: "comfort food",
  cook: "the recipes you love to cook",
  quick: "quick, easy meals",
  eat_out: "real life, eating out and grabbing food",
};

const AGE_DISPLAY: Record<string, string> = {
  under_30: "under 30",
  "30s": "your 30s",
  "40s": "your 40s",
  "50s": "your 50s",
  "60_plus": "60 and beyond",
};

// ── Reveal copy (each string = one short fading line) ────────────────────────
const GOAL_REVEAL_LINES = [
  "Got it, sis. That is absolutely doable in 12 weeks.",
  "Women who started exactly where you are now did this with me.",
  "Here is what the next 12 weeks could look like.",
];

const TRIED_BASE = [
  "Here's the thing every one of those had in common.",
  "The day you slipped, nobody noticed. They hand you information and walk away.",
  "That's not a willpower problem, sis. It's a being left alone problem. And it's fixable.",
];
const TRIED_SHOTS = "And if you've used the shots, no judgment here, ever. A shot can quiet your appetite. It can't build the habit or show up on your hard days. That's the part I add.";
const TRIED_NONE = ["Whether you've tried a hundred things or none, same truth.", "What's been missing isn't another plan. It's a person. Let's fix that."];

function triedLines(tried: string[] = []): string[] {
  const picked = tried.filter((t) => t !== "shots");
  const lines = picked.length > 0 ? [...TRIED_BASE] : [...TRIED_NONE];
  if (tried.includes("shots")) lines.push(TRIED_SHOTS);
  return lines;
}

const ATTEMPTS_REFRAME = [
  "Can I be real with you, sis? It was never about willpower.",
  "You have more strength than you give yourself credit for. You show up for everyone else, every single time.",
  "What you never had was someone showing up for you.",
  "That is the only thing that has been missing. And that is exactly what changes now.",
];

const AGE_LINES: Record<string, string[]> = {
  under_30: [
    "Here is the smart part about starting now.",
    "Your metabolism is still on your side, so the habits you build today carry you through your 30s and 40s, when it gets harder.",
    "We lock them in now, so you never fight the uphill battle most women do later.",
  ],
  "30s": [
    "Here is what is quietly shifting.",
    "In your 30s, life fills up and the metabolism that carried you through your 20s starts to slow.",
    "Most women do not notice until the old tricks stop working.",
    "We get ahead of it now, so you stay in control instead of playing catch up later.",
  ],
  "40s": [
    "Here is what most plans completely ignore.",
    "In your 40s, your hormones shift and your metabolism changes, so the things that always worked just stop.",
    "That is real, not in your head.",
    "So we put the old rules down and build around the body you have now. That is exactly why this works when nothing else did.",
  ],
  "50s": [
    "Here is something most plans ignore.",
    "After 50, your body holds onto weight differently, and you naturally lose the muscle that keeps your metabolism burning.",
    "That is why eating less barely moves the needle anymore.",
    "So we do not fight your body, we work with it. Your plan is built for exactly where you are now.",
  ],
  "60_plus": [
    "Here is the real key at this stage.",
    "It is not about doing more or eating less. It is about protecting your strength and keeping your metabolism awake.",
    "Do that, and the weight follows.",
    "Your plan is built around that, so it feels doable, never punishing.",
  ],
};

const PROOF_LINES = [
  "For years I've helped women lose weight through my books and my challenges. 800,000 of them.",
  "But I'll be straight about what was always missing. Somebody with you, every day.",
  "A book can't notice when you slip. That's the part this finally fixes.",
];

const FOOD_LINES: Record<string, string[]> = {
  comfort: ["Good.", "We build around the food you love, not against it. That's the only kind of plan that lasts."],
  cook: ["Perfect.", "Real recipes you'll actually want to make. Cooking becomes the fun part, not the chore."],
  quick: ["Then quick and easy is what I'll build you.", "Real food, minimal time. A plan you don't have time for isn't a plan."],
  eat_out: ["No problem. That's real life, and I plan for it.", "You'll know exactly what to order and grab, so eating out never wrecks your week."],
};

const DAY_LINES: Record<string, string[]> = {
  desk: ["Desk most of the day, got it.", "We'll fit in movement that actually works for that."],
  feet: ["On your feet a lot, good.", "We'll use that and fuel it right."],
  running: ["Always taking care of everyone else.", "This plan fits around that. It won't add to your plate."],
  varies: ["No two days alike.", "Then your plan flexes with you, not against you."],
};

const TIME_LEADIN: Record<string, string> = {
  asap: "I love that energy, sis. So we do not wait.",
  few_months: "Good. We've got room to do this right.",
  date: "Then let's get you ready for it.",
  no_deadline: "No deadline, just done waiting. This isn't a sprint to a date. It's getting it off for good.",
};
const TIME_SHARED = [
  "The very first thing I build you is your jumpstart, shaped around your real life, so you feel it working in your first days.",
  "Nothing keeps you going like watching the scale move early.",
];

const READY_LINES: Record<string, string[]> = {
  ready: ["That's what I like to hear.", "Let's go get her."],
  think_so: ["Fair. You've been let down before.", "You don't have to be sure, {name}. You just have to start. I'll handle sure."],
  tell_more: ["Fair. You should know exactly what you're saying yes to.", "Let me show you your plan first, then you decide. No pressure, no tricks."],
};

// ── Screen sequence ──────────────────────────────────────────────────────────
const SEQUENCE = [
  "goal", "r-goal",
  "tried", "r-tried",
  "attempts", "r-attempts",
  "age", "r-age",
  "proof",
  "name", "r-name",
  "food", "r-food",
  "day", "r-day",
  "time", "r-time",
  "ready", "r-ready",
  "build",
  "email",
  "plan",
  "offer",
] as const;

const PLAN_INDEX = SEQUENCE.indexOf("plan");
type Pricing = { monthly: number; full: number; months: number; remaining: number; loading: boolean };

// ── Main component ───────────────────────────────────────────────────────────
export default function QuizTakeover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { basic } = useCoachPrograms();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const key = SEQUENCE[index];
  const next = () => setIndex((i) => Math.min(i + 1, SEQUENCE.length - 1));
  const set = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setIndex(0);
        setAnswers({});
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [index]);

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
    return { monthly, full, months, remaining: Math.max(1, months - 1), loading: !basic };
  }, [basic]);

  const goToCheckout = (billing: "MONTHLY" | "FULL_PROGRAM" = "MONTHLY") => {
    const params = new URLSearchParams();
    params.set("firstName", answers.name?.trim() ?? "");
    params.set("email", answers.email?.trim() ?? "");
    params.set("goal", answers.goal ?? "");
    params.set("tried", (answers.tried ?? []).join(","));
    params.set("attempts", answers.attempts ?? "");
    params.set("age", answers.age ?? "");
    params.set("food", answers.food ?? "");
    params.set("day", answers.day ?? "");
    params.set("timeframe", answers.timeframe ?? "");
    params.set("readiness", answers.readiness ?? "");
    params.set("paymentOption", billing === "FULL_PROGRAM" ? "pay_in_full" : "monthly");
    params.set("utm_source", "quiz-12wts");
    params.set("version", "clarity-v7");
    const url = basic
      ? `${signupUrl(basic.id, billing, { durationWeeks: basic.durationWeeks })}&${params.toString()}`
      : `/checkout?${params.toString()}`;
    if (typeof window !== "undefined") window.location.href = url;
  };

  if (!open) return null;

  const progress = Math.min(100, Math.round(((index + 1) / (PLAN_INDEX + 1)) * 100));
  const showProgress = index < PLAN_INDEX;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ backgroundColor: BG }} role="dialog" aria-modal="true">
      <div className="shrink-0">
        <div className="h-1.5 w-full bg-[#f3d3d3]">
          {showProgress && (
            <div className="h-full transition-[width] duration-500 ease-out" style={{ width: `${progress}%`, background: PINK }} />
          )}
        </div>
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#8c114a] transition-colors hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-[540px] flex-col px-6 pt-2">
          <Screen
            key={key}
            screenKey={key}
            answers={answers}
            pricing={pricing}
            onSingle={(field, value) => {
              set({ [field]: value } as Partial<Answers>);
              next();
            }}
            onMulti={(value) => set({ tried: value })}
            onName={(name) => {
              set({ name });
              next();
            }}
            onEmail={(email) => {
              set({ email });
              next();
            }}
            onContinue={next}
            onCheckout={goToCheckout}
          />
        </div>
      </div>
    </div>
  );
}

// ── Screen router ────────────────────────────────────────────────────────────
function Screen({
  screenKey,
  answers,
  pricing,
  onSingle,
  onMulti,
  onName,
  onEmail,
  onContinue,
  onCheckout,
}: {
  screenKey: string;
  answers: Answers;
  pricing: Pricing;
  onSingle: (field: keyof Answers, value: string) => void;
  onMulti: (value: string[]) => void;
  onName: (name: string) => void;
  onEmail: (email: string) => void;
  onContinue: () => void;
  onCheckout: (billing?: "MONTHLY" | "FULL_PROGRAM") => void;
}) {
  switch (screenKey) {
    case "goal":
      return (
        <SingleScreen
          eyebrow="First. Let's start here."
          question="How much are you looking to lose?"
          options={[
            { value: "10_20", label: "10 to 20 lbs" },
            { value: "20_35", label: "20 to 35 lbs" },
            { value: "35_50", label: "35 to 50 lbs" },
            { value: "50_plus", label: "50+ lbs" },
          ]}
          onPick={(v) => onSingle("goal", v)}
        />
      );
    case "r-goal":
      return <GoalRevealScreen answers={answers} onContinue={onContinue} />;

    case "tried":
      return (
        <MultiScreen
          question="What have you already tried?"
          hint="Tap all that apply."
          options={[
            { value: "cleanses", label: "Cleanses / detoxes", Icon: GlassWater },
            { value: "keto", label: "Keto / low carb", Icon: Leaf },
            { value: "apps", label: "Calorie counting apps", Icon: Smartphone },
            { value: "programs", label: "Weight loss programs", Icon: ClipboardList },
            { value: "shots", label: "The shots (Ozempic, etc.)", Icon: Droplet },
          ]}
          selected={answers.tried ?? []}
          onChange={onMulti}
          onContinue={onContinue}
        />
      );
    case "r-tried":
      return <Reveal lines={triedLines(answers.tried)} onContinue={onContinue} visual={<MissingGraphic />} />;

    case "attempts":
      return (
        <SingleScreen
          question="Be honest with me. How many times have you started over?"
          options={[
            { value: "so_many", label: "So many times" },
            { value: "a_few", label: "A few" },
            { value: "first_time", label: "This is my first real attempt" },
          ]}
          onPick={(v) => onSingle("attempts", v)}
        />
      );
    case "r-attempts":
      return <Reveal lines={ATTEMPTS_REFRAME} onContinue={onContinue} visual={<PhotoCard src={jjHug} caption="What you never had was someone showing up for you." />} />;

    case "age":
      return (
        <SingleScreen
          question="What's your age?"
          options={[
            { value: "under_30", label: "Under 30" },
            { value: "30s", label: "30s" },
            { value: "40s", label: "40s" },
            { value: "50s", label: "50s" },
            { value: "60_plus", label: "60+" },
          ]}
          onPick={(v) => onSingle("age", v)}
        />
      );
    case "r-age":
      return <Reveal lines={AGE_LINES[answers.age ?? "40s"]} onContinue={onContinue} visual={<AgeCurveGraphic age={answers.age ?? "40s"} />} />;

    case "proof":
      return <ProofScreen onContinue={onContinue} />;

    case "name":
      return <NameScreen onSubmit={onName} />;
    case "r-name":
      return <Reveal lines={[fill("Okay, {name}. Let's keep going.", answers)]} auto onContinue={onContinue} visual={<PhotoCard src={jjLaughing} compact />} />;

    case "food":
      return (
        <SingleScreen
          question={fill("What food do you actually love, {name}?", answers)}
          options={[
            { value: "comfort", label: "Comfort food, honestly" },
            { value: "cook", label: "I love to cook" },
            { value: "quick", label: "Quick and easy is all I've got time for" },
            { value: "eat_out", label: "I eat out or grab food a lot" },
          ]}
          onPick={(v) => onSingle("food", v)}
        />
      );
    case "r-food":
      return <Reveal lines={FOOD_LINES[answers.food ?? "comfort"]} onContinue={onContinue} visual={<IconCard Icon={UtensilsCrossed} text={`Built around ${FOOD_LABEL[answers.food ?? "comfort"]}.`} />} />;

    case "day":
      return (
        <SingleScreen
          question="What does a normal day look like for you?"
          options={[
            { value: "desk", label: "Desk most of the day" },
            { value: "feet", label: "On my feet a lot" },
            { value: "running", label: "Always running after everyone else" },
            { value: "varies", label: "Honestly, no two days the same" },
          ]}
          onPick={(v) => onSingle("day", v)}
        />
      );
    case "r-day": {
      const dayIcon = { desk: Briefcase, feet: Footprints, running: Heart, varies: Shuffle }[answers.day ?? "running"]!;
      return <Reveal lines={DAY_LINES[answers.day ?? "running"]} auto onContinue={onContinue} visual={<IconCard Icon={dayIcon} text="Your plan fits your real life." />} />;
    }

    case "time":
      return (
        <SingleScreen
          question="When do you want to feel like yourself again?"
          options={[
            { value: "asap", label: "As soon as possible" },
            { value: "few_months", label: "In the next few months" },
            { value: "date", label: "I've got a date in mind" },
            { value: "no_deadline", label: "No deadline, just done waiting" },
          ]}
          onPick={(v) => onSingle("timeframe", v)}
        />
      );
    case "r-time":
      return (
        <Reveal lines={[TIME_LEADIN[answers.timeframe ?? "date"], ...TIME_SHARED]} onContinue={onContinue} continueLabel="See my jumpstart" visual={<JumpstartCurve />} />
      );

    case "ready":
      return (
        <SingleScreen
          question="Last one. If I'm with you every single day for 12 weeks, are you ready?"
          options={[
            { value: "ready", label: "I'm ready" },
            { value: "think_so", label: "I think so" },
            { value: "tell_more", label: "Tell me more first" },
          ]}
          onPick={(v) => onSingle("readiness", v)}
        />
      );
    case "r-ready":
      return <Reveal lines={READY_LINES[answers.readiness ?? "think_so"].map((l) => fill(l, answers))} onContinue={onContinue} visual={<PhotoCard src={jjAvatar} caption="You just have to start. I'll handle sure." />} />;

    case "build":
      return <BuildScreen answers={answers} onDone={onContinue} />;

    case "email":
      return <EmailScreen answers={answers} onSubmit={onEmail} />;

    case "plan":
      return <PlanScreen answers={answers} onContinue={onContinue} />;

    case "offer":
      return <OfferScreen answers={answers} pricing={pricing} onCheckout={onCheckout} />;

    default:
      return null;
  }
}

// ── Layout primitives ────────────────────────────────────────────────────────
function Content({ children, align = "center" }: { children: React.ReactNode; align?: "center" | "top" }) {
  return <div className={`flex flex-1 flex-col ${align === "center" ? "justify-center" : "justify-start pt-3"} pb-6`}>{children}</div>;
}

function StickyAction({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sticky bottom-0 z-20 -mx-6 mt-2 bg-gradient-to-t from-[#fdebeb] via-[#fdebeb] to-transparent px-6 pt-6"
      style={{ paddingBottom: "calc(1.1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[15px] font-bold uppercase tracking-[0.14em] text-[#c41e6a]">{children}</p>;
}

function Question({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans font-bold text-[26px] sm:text-[31px] leading-[1.18] tracking-[-0.01em] text-[#15102a]">{children}</h2>;
}

function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="block w-full rounded-2xl px-6 py-5 text-center text-[18px] sm:text-[19px] font-bold tracking-wide text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{ background: PINK }}
    >
      {children}
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

const STEP_DELAY = 0.45; // seconds between reveal lines (slow, soft)

function FadeLines({ lines, startAt = 0 }: { lines: string[]; startAt?: number }) {
  return (
    <div className="space-y-3">
      {lines.map((line, i) => (
        <p
          key={i}
          className="q-fadeline text-[20px] sm:text-[22px] leading-[1.4] font-medium text-[#15102a]"
          style={{ animationDelay: `${(startAt + i) * STEP_DELAY}s` }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

// ── Single-select (one tap advances) ─────────────────────────────────────────
function SingleScreen({
  eyebrow,
  question,
  options,
  onPick,
}: {
  eyebrow?: string;
  question: string;
  options: { value: string; label: string }[];
  onPick: (value: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const choose = (v: string) => {
    if (picked) return;
    setPicked(v);
    setTimeout(() => onPick(v), 220);
  };
  return (
    <Content align={options.length > 4 ? "top" : "center"}>
      <div className="q-rise">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Question>{question}</Question>
        <div className="mt-7 space-y-3.5">
          {options.map((opt) => (
            <OptionButton key={opt.value} label={opt.label} selected={picked === opt.value} onClick={() => choose(opt.value)} />
          ))}
        </div>
      </div>
    </Content>
  );
}

function OptionButton({
  label,
  onClick,
  selected,
  Icon,
}: {
  label: string;
  onClick: () => void;
  selected?: boolean;
  Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 text-left text-[18px] sm:text-[19px] font-semibold leading-snug text-[#15102a] shadow-[0_12px_26px_-20px_rgba(140,17,74,0.7)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d62a7a] hover:shadow-[0_18px_34px_-18px_rgba(184,24,96,0.55)] active:scale-[0.98] ${
        selected ? "border-[#d62a7a] ring-2 ring-[#d62a7a]/30" : "border-[#f0c9d8]"
      }`}
      style={{ minHeight: 62 }}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
          selected ? "scale-105 text-white" : Icon ? "text-[#c41e6a]" : "border-2 border-[#e7b9cb] text-transparent"
        }`}
        style={selected ? { background: PINK } : Icon ? { backgroundColor: "#fdebeb" } : undefined}
        aria-hidden
      >
        {selected ? <Check className="h-5 w-5" strokeWidth={3} /> : Icon ? <Icon className="h-5 w-5" strokeWidth={2} /> : <Check className="h-5 w-5" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

// ── Multi-select (Continue) ──────────────────────────────────────────────────
function MultiScreen({
  question,
  hint,
  options,
  selected,
  onChange,
  onContinue,
}: {
  question: string;
  hint?: string;
  options: { value: string; label: string; Icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }[];
  selected: string[];
  onChange: (next: string[]) => void;
  onContinue: () => void;
}) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  return (
    <>
      <Content align="top">
        <div className="q-rise">
          <Question>{question}</Question>
          {hint && <p className="mt-2 text-[16px] text-[#6b5b6e]">{hint}</p>}
          <div className="mt-6 space-y-3.5">
            {options.map((opt) => (
              <OptionButton key={opt.value} label={opt.label} Icon={opt.Icon} selected={selected.includes(opt.value)} onClick={() => toggle(opt.value)} />
            ))}
          </div>
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Reveal (fade in line by line, with a supporting visual) ──────────────────
function Reveal({
  lines,
  onContinue,
  continueLabel = "Continue",
  auto = false,
  visual,
}: {
  lines: string[];
  onContinue: () => void;
  continueLabel?: string;
  auto?: boolean;
  visual?: React.ReactNode;
}) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const totalMs = lines.length * STEP_DELAY * 1000 + 500;
    const t = window.setTimeout(() => setDone(true), totalMs);
    let t2: number | undefined;
    if (auto) t2 = window.setTimeout(onContinue, totalMs + 1300);
    return () => {
      clearTimeout(t);
      if (t2) clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Content align="center">
        <CoachHeader />
        <div className="mt-6">
          <FadeLines lines={lines} />
        </div>
        {visual && (
          <div className="q-fadeline mt-7" style={{ animationDelay: `${lines.length * STEP_DELAY}s` }}>
            {visual}
          </div>
        )}
      </Content>
      {done && !auto && (
        <StickyAction>
          <div className="q-fadeline">
            <PrimaryButton onClick={onContinue}>{continueLabel}</PrimaryButton>
          </div>
        </StickyAction>
      )}
    </>
  );
}

// ── Screen 1 reveal (scrollable belief-builder) ──────────────────────────────
function GoalRevealScreen({ answers, onContinue }: { answers: Answers; onContinue: () => void }) {
  const meta = GOAL_META[answers.goal ?? "20_35"];
  const dateLabel = useMemo(() => fmtDate(12), []);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), GOAL_REVEAL_LINES.length * STEP_DELAY * 1000 + 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <Content align="top">
        <CoachHeader />
        <div className="mt-6">
          <FadeLines lines={GOAL_REVEAL_LINES} />
        </div>
        <div className="q-fadeline mt-7 rounded-3xl bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]" style={{ animationDelay: `${GOAL_REVEAL_LINES.length * STEP_DELAY}s` }}>
          <p className="mb-2 text-[14px] font-bold uppercase tracking-[0.12em] text-[#6b5b6e]">What your next 12 weeks could look like</p>
          <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate dateLabel={dateLabel} />
        </div>
        <div className="mt-6">
          <TransformationCarousel items={TRANSF_GOAL} />
        </div>
      </Content>
      {done && (
        <StickyAction>
          <div className="q-fadeline">
            <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
          </div>
        </StickyAction>
      )}
    </>
  );
}

// ── Reveal visuals ───────────────────────────────────────────────────────────
function PhotoCard({ src, caption, compact }: { src: string; caption?: string; compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      <img src={src} alt="JJ Smith" className={`block w-full object-cover ${compact ? "h-44" : "h-60"}`} loading="lazy" />
      {caption && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <p className="absolute inset-x-0 bottom-0 p-5 font-serif italic text-[19px] leading-snug text-white drop-shadow">{caption}</p>
        </>
      )}
    </div>
  );
}

function IconCard({ Icon, text }: { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; text: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
        <Icon className="h-7 w-7" strokeWidth={2} />
      </span>
      <p className="text-[18px] font-semibold leading-snug text-[#15102a]">{text}</p>
    </div>
  );
}

// "Every other plan vs With me" contrast: muted loser, elevated brand winner.
function MissingGraphic() {
  return (
    <div className="relative">
      <div className="ml-1 flex items-center gap-3 rounded-2xl border border-[#e7d3da] bg-[#f4eaee] p-3.5 opacity-90">
        <FileText className="h-6 w-6 shrink-0 text-[#a9909b]" />
        <p className="flex-1 text-[15px] font-semibold leading-snug text-[#8a7782]">Every other plan: hands you info, then they're gone</p>
        <LogOut className="h-5 w-5 shrink-0 text-[#bfa3b0]" />
      </div>

      <div className="relative z-10 my-1 flex justify-center">
        <span className="rounded-full bg-white px-3 py-0.5 text-[12px] font-bold uppercase tracking-[0.14em] text-[#c41e6a] shadow-sm">vs</span>
      </div>

      <div className="-mt-1 flex items-center gap-3.5 rounded-3xl border-2 border-[#d62a7a] bg-white p-5 shadow-[0_24px_50px_-26px_rgba(140,17,74,0.95)]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}>
          <HeartHandshake className="h-6 w-6" />
        </span>
        <p className="flex-1 text-[17px] font-bold leading-snug text-[#15102a]">With me: someone with you, every single day</p>
        <Check className="h-6 w-6 shrink-0 text-[#d62a7a]" strokeWidth={3} />
      </div>
    </div>
  );
}

function AgeCurveGraphic({ age }: { age: string }) {
  const decades = ["20s", "30s", "40s", "50s", "60+"];
  const idxByAge: Record<string, number> = { under_30: 0, "30s": 1, "40s": 2, "50s": 3, "60_plus": 4 };
  const active = idxByAge[age] ?? 2;
  const ys = [40, 56, 78, 100, 116];
  const W = 300;
  const xAt = (i: number) => 30 + (i / (decades.length - 1)) * (W - 60);
  const path = `M ${decades.map((_, i) => `${xAt(i)},${ys[i]}`).join(" L ")}`;
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
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
            <text x={xAt(i)} y={146} fontSize="12" fontWeight={i === active ? 800 : 600} fill={i === active ? "#8c114a" : "#9a7f8a"} textAnchor="middle">
              {d}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center text-[14px] font-semibold text-[#15102a]">Your plan is built for the body you have now.</p>
    </div>
  );
}

// Jumpstart curve: steep early drop ("Your jumpstart"), then steady loss.
function JumpstartCurve() {
  const W = 320;
  const H = 170;
  const left = 16;
  const right = W - 16;
  const top = 22;
  const bottom = H - 34;
  const pw = right - left;
  const ph = bottom - top;
  const f = (t: number) => 1 - Math.pow(1 - t, 2.3); // front-loaded loss
  const N = 40;
  const pts = Array.from({ length: N + 1 }, (_, k) => {
    const t = k / N;
    return `${left + t * pw},${top + f(t) * ph}`;
  });
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${right},${bottom} L ${left},${bottom} Z`;
  const jx = left + 0.28 * pw;
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      <p className="mb-2 text-center text-[14px] font-bold uppercase tracking-[0.12em] text-[#6b5b6e]">Your jumpstart</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Fast early weight loss then steady decline">
        <defs>
          <linearGradient id="jsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d62a7a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d62a7a" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="jsLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d62a7a" />
            <stop offset="100%" stopColor="#8c114a" />
          </linearGradient>
        </defs>
        <rect x={left} y={top} width={jx - left} height={ph} fill="#f7c9dd" opacity="0.35" />
        <path d={area} fill="url(#jsFill)" />
        <path d={line} className="q-draw" fill="none" stroke="url(#jsLine)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x={(left + jx) / 2} y={top + 16} fontSize="11" fontWeight="800" fill="#8c114a" textAnchor="middle">the first pounds, fast</text>
        <text x={right} y={bottom - 6} fontSize="11" fontWeight="700" fill="#c41e6a" textAnchor="end">steady from here</text>
        <line x1={jx} y1={top} x2={jx} y2={bottom} stroke="#d62a7a" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
      </svg>
    </div>
  );
}

// ── Auto-advancing, swipeable transformation carousel ────────────────────────
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
      className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]"
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
        <img src={items[i].src} alt="Sister transformation" className="block max-h-[420px] w-full bg-[#fbe3ea] object-contain" loading="lazy" />
        {items.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#8c114a] shadow-md hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <div className="p-5">
        <p className="font-serif italic text-[19px] leading-snug text-[#15102a]">"{items[i].quote}"</p>
        {items.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {items.map((_, k) => (
              <button
                key={k}
                onClick={() => setI(k)}
                aria-label={`Slide ${k + 1}`}
                className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-[#d62a7a]" : "w-2 bg-[#d62a7a]/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Marquee (press logos, reuse landing styling) ─────────────────────────────
function PressMarquee() {
  const track = [...PRESS, ...PRESS];
  return (
    <div className="relative -mx-6 overflow-hidden">
      <div className="flex w-max items-center gap-10 animate-marquee">
        {track.map((p, i) => (
          <img key={i} src={p.src} alt={p.alt} className="h-12 w-auto shrink-0 object-contain opacity-80" loading="eager" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#fdebeb] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#fdebeb] to-transparent" />
    </div>
  );
}

// ── Proof screen (S5) ────────────────────────────────────────────────────────
function ProofScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <>
      <Content align="top">
        <div className="q-rise">
          <h2 className="font-sans font-bold text-[26px] sm:text-[31px] leading-[1.15] text-[#15102a]">This is what happens with JJ in your corner.</h2>

          <p className="mt-6 text-center text-[12px] font-bold uppercase tracking-[0.2em] text-[#9a7f8a]">As seen on</p>
          <div className="mt-3">
            <PressMarquee />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { stat: "800K", label: "women helped" },
              { stat: "5M", label: "pounds lost" },
              { stat: "NYT", label: "bestselling author" },
            ].map((t) => (
              <div key={t.label} className="rounded-2xl bg-white px-3 py-5 text-center shadow-[0_16px_34px_-26px_rgba(140,17,74,0.8)]">
                <div className="text-[26px] sm:text-[30px] font-bold leading-none text-[#c41e6a]">{t.stat}</div>
                <div className="mt-2 text-[13px] font-semibold leading-tight text-[#6b5b6e]">{t.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <TransformationCarousel items={TRANSF_PROOF} />
          </div>

          <div className="mt-7">
            <CoachHeader />
            <div className="mt-4">
              <FadeLines lines={PROOF_LINES} />
            </div>
          </div>
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Name (S6) ────────────────────────────────────────────────────────────────
function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const submit = () => {
    if (val.trim()) onSubmit(val.trim());
  };
  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>What do I call you, sis?</Question>
          <p className="mt-3 text-[18px] sm:text-[20px] text-[#6b5b6e]">I like to know who I'm talking to.</p>
          <input
            ref={ref}
            type="text"
            autoComplete="given-name"
            placeholder="Your name"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mt-7 w-full rounded-2xl border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]"
          />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!val.trim()}>
          Continue
        </PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Build beat (S11) ─────────────────────────────────────────────────────────
function BuildScreen({ answers, onDone }: { answers: Answers; onDone: () => void }) {
  const lines = [
    "Reading what's tripped you up before",
    "Building it for the body you have now",
    `Mapping your meals around ${FOOD_LABEL[answers.food ?? "comfort"]}`,
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
        <Question>{fill("Building your plan, {name}.", answers)}</Question>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#f3d3d3]">
          <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%`, background: PINK }} />
        </div>
        <ul className="mt-7 space-y-4">
          {lines.map((line, i) => (
            <li
              key={line}
              className={`flex items-center gap-3 text-[18px] sm:text-[20px] leading-snug transition-all duration-500 ${
                i < shown ? "translate-y-0 text-[#15102a] opacity-100" : "translate-y-1 text-[#b79aa6] opacity-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-transform ${i < shown ? "scale-100" : "scale-0"}`}
                style={{ background: PINK }}
              >
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

// ── Email gate (S12) ─────────────────────────────────────────────────────────
function EmailScreen({ answers, onSubmit }: { answers: Answers; onSubmit: (email: string) => void }) {
  const [val, setVal] = useState("");
  const valid = /.+@.+\..+/.test(val.trim());
  const submit = () => {
    if (valid) onSubmit(val.trim());
  };
  return (
    <>
      <Content align="center">
        <div className="q-rise">
          <Question>{fill("Your plan is ready, {name}.", answers)}</Question>
          <p className="mt-3 text-[18px] sm:text-[20px] leading-snug text-[#6b5b6e]">
            Tell me where to send it, and I'll show you everything I put together for you.
          </p>
          <LockedPlanPreview answers={answers} />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="mt-5 w-full rounded-2xl border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]"
          />
        </div>
      </Content>
      <StickyAction>
        <PrimaryButton onClick={submit} disabled={!valid}>
          Show Me My Plan
        </PrimaryButton>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]">
          <Lock className="h-4 w-4" /> No spam, ever. Just your plan and a note from me.
        </p>
      </StickyAction>
    </>
  );
}

function LockedPlanPreview({ answers }: { answers: Answers }) {
  const meta = GOAL_META[answers.goal ?? "20_35"];
  return (
    <div className="relative mt-6 overflow-hidden rounded-3xl shadow-[0_24px_50px_-30px_rgba(140,17,74,0.9)]">
      <div className="select-none blur-[5px]" aria-hidden>
        <div className="px-5 py-4 text-white" style={{ background: PINK }}>
          <p className="text-[13px] font-semibold uppercase tracking-wide opacity-90">Your 12 week plan</p>
          <p className="text-[24px] font-bold">{fill("{name}'s plan", answers)}</p>
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
        <span className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg" style={{ background: PINK }}>
          <Lock className="h-6 w-6" />
        </span>
        <p className="mt-2 text-[14px] font-bold uppercase tracking-[0.12em] text-[#8c114a]">Enter your email to unlock your plan</p>
      </div>
    </div>
  );
}

// ── Plan / Results (S13, sale-closer) ────────────────────────────────────────
function fmtDate(weeksAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + weeksAhead * 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function PlanScreen({ answers, onContinue }: { answers: Answers; onContinue: () => void }) {
  const meta = GOAL_META[answers.goal ?? "20_35"];
  const dateLabel = useMemo(() => fmtDate(12), []);
  const ageWord = AGE_DISPLAY[answers.age ?? "40s"];
  const ageSub =
    answers.age === "50s"
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
        <h2 className="q-rise font-sans font-bold text-[27px] sm:text-[32px] leading-[1.14] tracking-[-0.01em] text-[#15102a]">
          {fill("{name}, here is what the next 12 weeks look like with me.", answers)}
        </h2>

        {/* Plan graph */}
        <div className="q-rise mt-5 overflow-hidden rounded-3xl bg-white shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9)]">
          <div className="px-5 py-4 text-white" style={{ background: PINK }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide opacity-90">Your goal</p>
            <p className="text-[20px] font-bold leading-tight">
              {meta.chapterOne ? "A strong start" : `About ${meta.target} pounds`}, by {dateLabel}
            </p>
          </div>
          <div className="p-5">
            <ProjectionChart target={meta.target} chapterOne={meta.chapterOne} animate dateLabel={dateLabel} detailed />
          </div>
        </div>

        {/* Narrative */}
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

        {/* Inclusions as outcomes */}
        <ul className="mt-7 space-y-3">
          {inclusions.map(({ Icon, label, sub }) => (
            <li key={label} className="flex items-start gap-3.5 rounded-2xl bg-white p-4 shadow-[0_14px_30px_-24px_rgba(140,17,74,0.8)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: PINK }}>
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[17px] sm:text-[18px] font-bold leading-snug text-[#15102a]">{label}</p>
                <p className="mt-0.5 text-[15px] sm:text-[16px] leading-snug text-[#6b5b6e]">{sub}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Age/metabolism graphic, personalized */}
        <div className="mt-5">
          <AgeCurveGraphic age={answers.age ?? "40s"} />
        </div>

        {/* Circle of sisters image (David to provide). Placeholder reserves it. */}
        <div className="mt-5 flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#fbe3ea] to-[#efd6e0] p-8" aria-hidden>
          <Users className="h-10 w-10 text-[#c98aa3]" />
        </div>

        {/* Transformations carousel (different images, quotes only) */}
        <p className="mt-8 text-[15px] font-bold uppercase tracking-[0.16em] text-[#c41e6a]">Sisters who did it with me</p>
        <div className="mt-3">
          <TransformationCarousel items={TRANSF_PLAN} />
        </div>

        {/* Closing line + second CTA at natural end */}
        <p className="mt-8 text-[19px] leading-[1.5] font-medium text-[#15102a]">
          {fill("This is your plan, {name}. Built for you, around your life, with me in your corner the whole way.", answers)}
        </p>
        <p className="mt-2 text-[19px] leading-[1.5] font-bold text-[#c41e6a]">All you have to do is show up. I will handle the rest.</p>
        <div className="mt-6">
          <PrimaryButton onClick={onContinue}>Let's Get Started, sis</PrimaryButton>
        </div>
      </Content>

      <StickyAction>
        <PrimaryButton onClick={onContinue}>Let's Get Started, sis</PrimaryButton>
      </StickyAction>
    </>
  );
}

// ── Offer (S15) ──────────────────────────────────────────────────────────────
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
  {
    q: "I'm in my 50s and nothing's worked. Will this?",
    a: "Sister, this is who I built it for. Most of the women I work with are 40+ navigating perimenopause, menopause, and hormone shifts. Your plan is built around all of that, and I'm right there with you the whole way.",
  },
  {
    q: "I work full-time and have kids. Do I have time?",
    a: "Yes. Personalizing your plan means it fits your life, not the other way around. And I'm meeting you right where you are, every day. Most sisters spend 20 to 30 minutes a day on this.",
  },
  {
    q: "Do I have to drink green smoothies?",
    a: "Only if you want to. This isn't the cleanse. Your plan is built around foods you actually love.",
  },
  {
    q: "What makes this different from your other programs?",
    a: "My books and challenges gave you the information. This one gives you me, every step of the way. The information was never the problem. Being alone on the hard days was.",
  },
  {
    q: "What if I miss this cohort?",
    a: "I keep enrollment small so every sister gets the real attention she deserves. Once these limited spots are gone, you'll have to wait until I open the next round.",
  },
];

function OfferScreen({
  answers,
  pricing,
  onCheckout,
}: {
  answers: Answers;
  pricing: Pricing;
  onCheckout: (billing?: "MONTHLY" | "FULL_PROGRAM") => void;
}) {
  const { monthly, full } = pricing;
  return (
    <>
      <Content align="top">
        <div className="q-rise inline-flex self-start rounded-full bg-[#15102a] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white">
          Your plan is ready
        </div>
        <h2 className="mt-4 font-sans font-bold text-[28px] sm:text-[33px] leading-[1.12] tracking-[-0.01em] text-[#15102a]">
          {fill("So let's go get her, {name}.", answers)}
        </h2>
        <p className="mt-3 text-[18px] sm:text-[20px] leading-[1.4] text-[#15102a]">
          Everything you just saw is waiting for you. Me, in your corner, one on one, every single day for the next 12 weeks.
        </p>

        {/* Value stack */}
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-[0_28px_60px_-32px_rgba(140,17,74,0.9)]">
          <p className="text-[15px] font-bold uppercase tracking-[0.14em] text-[#c41e6a]">Everything you're getting</p>
          <ul className="mt-3 divide-y divide-dashed divide-[#f0c9d8]">
            {VALUE_STACK.map((it) => (
              <li key={it.label} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-2 text-[16px] leading-snug text-[#15102a]">
                  <Check className="h-4 w-4 shrink-0 text-[#d62a7a]" strokeWidth={3} /> {it.label}
                </span>
                <span className="shrink-0 text-[16px] font-semibold text-[#6b5b6e]">${it.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t-2 border-[#15102a] pt-3">
            <span className="text-[17px] font-bold text-[#15102a]">Total value</span>
            <span className="text-[20px] font-bold text-[#b79aa6] line-through">${VALUE_TOTAL.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-right text-[15px] font-semibold text-[#c41e6a]">Your price today: ${full}</p>
          <p className="mt-3 text-[16px] leading-snug text-[#15102a]">
            More than $2,600 of coaching, meals, and real support. Yours today for ${full}.
          </p>
        </div>

        {/* Two payment options with "or" */}
        <div className="mt-6 space-y-1">
          <div className="relative rounded-3xl border-2 border-[#15102a] bg-white p-5 shadow-[0_24px_50px_-32px_rgba(140,17,74,0.9)]">
            <span className="absolute -top-3 left-5 rounded-full bg-[#15102a] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Best value</span>
            <p className="text-[18px] font-bold text-[#15102a]">Pay in full. ${full} today.</p>
            <p className="text-[15px] text-[#6b5b6e]">One payment, you're done.</p>
            <button
              onClick={() => onCheckout("FULL_PROGRAM")}
              disabled={pricing.loading}
              className="mt-4 block w-full rounded-2xl px-6 py-4 text-center text-[17px] font-bold text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50"
              style={{ background: PINK }}
            >
              {pricing.loading ? "Loading…" : `Start With JJ, $${full}`}
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-[#e7c6d3]" />
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#9a7f8a]">or</span>
            <span className="h-px flex-1 bg-[#e7c6d3]" />
          </div>

          <div className="rounded-3xl border-2 border-[#f0c9d8] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(140,17,74,0.9)]">
            <p className="text-[18px] font-bold text-[#15102a]">Start today for ${monthly}.</p>
            <p className="text-[15px] text-[#6b5b6e]">Then two payments of ${monthly}.</p>
            <button
              onClick={() => onCheckout("MONTHLY")}
              disabled={pricing.loading}
              className="mt-4 block w-full rounded-2xl border-2 border-[#d62a7a] px-6 py-4 text-center text-[17px] font-bold text-[#b81860] transition-all hover:-translate-y-0.5 active:scale-[0.99] disabled:opacity-50"
            >
              {pricing.loading ? "Loading…" : `Start Today for $${monthly}`}
            </button>
          </div>
        </div>

        {/* Start now + scarcity */}
        <div className="mt-6 space-y-3 text-[17px] leading-[1.5] text-[#15102a]">
          <p className="font-semibold">The moment you say yes, we book your first call with me and your 12 weeks begin.</p>
          <p>You are not waiting for Monday. We start now.</p>
        </div>
        <p className="mt-4 rounded-2xl bg-[#fff0f5] p-4 text-[16px] font-semibold leading-snug text-[#8c114a]">
          This is a founding price for a small group, and this start date is filling up. When the spots are gone, they are gone, and this price goes with them.
        </p>

        {/* Guarantee (pulled from landing) */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0c9d8] bg-white/70 p-4">
          <ShieldCheck className="h-7 w-7 shrink-0 text-[#c41e6a]" />
          <p className="font-serif italic text-[16px] leading-[1.6] text-[#15102a]">
            "Sister, I need you to be confident this is right for you. So if you're not 100% thrilled within 14 days, I want to send your money back. If you're not happy, I'm not happy. No reason needed. That's my promise."
            <span className="mt-2 block font-sans not-italic text-[13px] font-semibold tracking-[0.16em] text-[#9a7f8a]">JJ</span>
          </p>
        </div>

        {/* Last call reframe (pulled from landing) */}
        <div className="mt-7 rounded-3xl bg-[#15102a] p-6 text-center text-white">
          <p className="font-serif text-[24px] sm:text-[28px] leading-[1.15]">The months ahead are happening either way.</p>
          <p className="mt-3 text-[16px] leading-[1.6] text-white/85">
            You can spend them like the last ones. Or you can spend them with me right there with you, every Tuesday morning, every Thursday night, every time life hits. This time, sister, you don't have to do it alone.
          </p>
        </div>

        {/* FAQ (pulled from landing) */}
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
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[14px] text-[#6b5b6e]">
          <Lock className="h-4 w-4" /> 14 day money back guarantee. Secure checkout.
        </p>
      </StickyAction>
    </>
  );
}

// ── Projection chart ─────────────────────────────────────────────────────────
function ProjectionChart({
  target,
  chapterOne,
  animate,
  dateLabel,
  detailed = false,
}: {
  target: number;
  chapterOne: boolean;
  animate: boolean;
  dateLabel: string;
  detailed?: boolean;
}) {
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

      {/* gridlines + week markers (detailed) */}
      {detailed &&
        [0, 4, 8, 12].map((w) => (
          <g key={w}>
            <line x1={x(w)} y1={top} x2={x(w)} y2={bottom} stroke="#f3d9e2" strokeWidth="1" strokeDasharray="2 4" />
            <text x={x(w)} y={bottom + 16} fontSize="11" fontWeight="700" fill="#9a7f8a" textAnchor={w === 0 ? "start" : w === 12 ? "middle" : "middle"}>
              {w === 0 ? "Today" : `Wk ${w}`}
            </text>
          </g>
        ))}

      {/* jumpstart shaded phase (detailed) */}
      {detailed && (
        <>
          <rect x={left} y={top} width={jumpX - left} height={plotH} fill="#f7c9dd" opacity="0.35" />
          <text x={(left + jumpX) / 2} y={top + 14} fontSize="10" fontWeight="800" fill="#8c114a" textAnchor="middle">
            Your jumpstart
          </text>
        </>
      )}

      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#f0c9d8" strokeWidth="1" />
      <path d={areaPath} fill="url(#projFill)" />
      <path d={linePath} className={animate ? "q-draw" : undefined} fill="none" stroke="url(#projLine)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {chapterOne && (
        <path d={`M ${endX},${endY} L ${right},${y(maxLoss)}`} fill="none" stroke="#c41e6a" strokeWidth="2.5" strokeDasharray="2 6" strokeLinecap="round" />
      )}

      <circle cx={endX} cy={endY} r="6" fill="#b81860" stroke="#fff" strokeWidth="2.5" />

      {!detailed && (
        <text x={left} y={top - 8} fontSize="12" fontWeight="700" fill="#6b5b6e">Today</text>
      )}
      {dateLabel && (
        <text x={chapterOne ? endX : right} y={top - 8} fontSize="12" fontWeight="700" fill="#c41e6a" textAnchor={chapterOne ? "middle" : "end"}>
          {chapterOne ? `Week 12` : `by ${dateLabel}`}
        </text>
      )}
      <text x={endX} y={endY - 12} fontSize="13" fontWeight="800" fill="#8c114a" textAnchor="middle">
        {target} lbs off
      </text>
      {chapterOne && (
        <text x={right} y={y(maxLoss) - 8} fontSize="11" fontWeight="700" fill="#c41e6a" textAnchor="end">
          we keep going
        </text>
      )}
    </svg>
  );
}
