import React, { useEffect, useRef, useState } from "react";
import { X, Mic, Loader2 } from "lucide-react";

/**
 * QUIZ / LEAD FORM — "12 Weeks to Sexy"
 *
 * Full-screen takeover launched from the "Talk to JJ Now" CTA.
 * One question per screen, tap-to-advance, thin progress bar, no "X of Y" counter.
 * Voice = JJ throughout. The only typed field is the first name (Screen 4).
 * Final screen captures email and hands off to the JJ voice call with all answers attached.
 */

type Option = { value: string; label: string };

type QuestionScreen = {
  kind: "question";
  key: string; // data key captured
  leadIn?: string;
  question: string;
  options: Option[];
  reaction?: string; // brief JJ reaction shown after a tap
};

type Screen = QuestionScreen | { kind: "name" } | { kind: "build" } | { kind: "email" } | { kind: "handoff" };

const fill = (text: string, name: string) => text.replace(/\{firstName\}/g, name || "girl");

// ── Screen definitions (Screens 1–3, 5–7 are tap questions) ──────────────────
const SCREEN_1: QuestionScreen = {
  kind: "question",
  key: "struggle",
  leadIn: "Okay girl — real talk first.",
  question: "What's been the hardest part for you?",
  options: [
    { value: "consistency", label: "Staying consistent past the first couple of weeks" },
    { value: "rebound", label: "I lose it — then it comes right back" },
    { value: "cravings", label: "Cravings and late-night eating" },
    { value: "no_time", label: "No time — life keeps getting in the way" },
  ],
  reaction: "Mm. I know that one.",
};

const SCREEN_2: QuestionScreen = {
  kind: "question",
  key: "years_fighting",
  question: "How long have you been fighting this?",
  options: [
    { value: "just_started", label: "Just started getting serious" },
    { value: "year_or_two", label: "A year or two" },
    { value: "years", label: "Honestly, years" },
    { value: "forever", label: "As long as I can remember" },
  ],
};

const SCREEN_3: QuestionScreen = {
  kind: "question",
  key: "tried_before",
  question: "Be honest — have you tried before?",
  options: [
    { value: "so_many", label: "So many times" },
    { value: "a_few", label: "A few times" },
    { value: "first_time", label: "This is my first real attempt" },
  ],
  reaction: "Girl, that took something to admit. I see you.",
};

const SCREEN_5 = (name: string): QuestionScreen => ({
  kind: "question",
  key: "goal_amount",
  question: `How much are you looking to lose, ${name || "girl"}?`,
  options: [
    { value: "10_20", label: "10–20 lbs" },
    { value: "20_35", label: "20–35 lbs" },
    { value: "35_50", label: "35–50 lbs" },
    { value: "50_plus", label: "50+ lbs" },
  ],
});

const SCREEN_6: QuestionScreen = {
  kind: "question",
  key: "timeframe",
  question: "When do you want to feel like yourself again?",
  options: [
    { value: "asap", label: "As soon as possible" },
    { value: "few_months", label: "In the next few months" },
    { value: "event", label: "I've got a date or event in mind" },
    { value: "no_deadline", label: "No deadline — just done waiting" },
  ],
};

const SCREEN_7: QuestionScreen = {
  kind: "question",
  key: "readiness",
  question: "If I could walk this with you — one-on-one, every day — would you go all in?",
  options: [
    { value: "ready", label: "I'm ready" },
    { value: "think_so", label: "I think so" },
    { value: "tell_me_more", label: "Tell me more first" },
  ],
};

const BUILD_LINES = [
  "Looking at what's tripped you up before…",
  "Mapping out your first 12 weeks…",
  "Building it around your goal…",
  "Getting JJ ready to meet you…",
];

const PINK_GRADIENT = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";

export default function QuizTakeover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);

  // Build the ordered screen list. firstName is interpolated where needed.
  const screens: Screen[] = [
    SCREEN_1,
    SCREEN_2,
    SCREEN_3,
    { kind: "name" },
    SCREEN_5(firstName),
    SCREEN_6,
    SCREEN_7,
    { kind: "build" },
    { kind: "email" },
    { kind: "handoff" },
  ];
  const total = screens.length;
  const current = screens[stepIndex];

  // Reset everything whenever the takeover is closed.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStepIndex(0);
        setAnswers({});
        setFirstName("");
        setEmail("");
        setReaction(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const advance = () => setStepIndex((i) => Math.min(i + 1, total - 1));

  const handleAnswer = (key: string, value: string, reactionText?: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (reactionText) {
      setReaction(fill(reactionText, firstName));
      window.setTimeout(() => {
        setReaction(null);
        advance();
      }, 1500);
    } else {
      advance();
    }
  };

  const handleName = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setFirstName(clean);
    setReaction(`Okay, ${clean}. Now we're talking.`);
    window.setTimeout(() => {
      setReaction(null);
      advance();
    }, 1500);
  };

  if (!open) return null;

  // Progress: count completed steps. Hide on the handoff screen.
  const progress = Math.min(100, Math.round(((stepIndex + 1) / total) * 100));
  const showProgress = current.kind !== "handoff";

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{ backgroundColor: "#fdebeb" }}
      role="dialog"
      aria-modal="true"
      aria-label="12 Weeks to Sexy — talk to JJ"
    >
      {/* Top bar: progress + close */}
      <div className="sticky top-0 z-10" style={{ backgroundColor: "#fdebeb" }}>
        {showProgress && (
          <div className="h-1.5 w-full bg-[#f3d3d3]">
            <div
              className="h-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%`, background: PINK_GRADIENT }}
            />
          </div>
        )}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#8c114a] hover:bg-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-[640px] flex-col justify-center px-6 pb-16 pt-2">
        {reaction ? (
          <Reaction text={reaction} />
        ) : current.kind === "question" ? (
          <QuestionView
            key={`q-${stepIndex}`}
            screen={current}
            firstName={firstName}
            onPick={(value) => handleAnswer(current.key, value, current.reaction)}
          />
        ) : current.kind === "name" ? (
          <NameView key="name" onSubmit={handleName} />
        ) : current.kind === "build" ? (
          <BuildView key="build" firstName={firstName} onDone={advance} />
        ) : current.kind === "email" ? (
          <EmailView
            key="email"
            firstName={firstName}
            value={email}
            onChange={setEmail}
            onSubmit={(val) => {
              setEmail(val);
              advance();
            }}
          />
        ) : (
          <HandoffView
            firstName={firstName}
            answers={answers}
            email={email}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// ── Shared layout ────────────────────────────────────────────────────────────
function ScreenWrap({ children }: { children: React.ReactNode }) {
  return <div className="animate-[fadeUp_0.35s_ease-out] w-full">{children}</div>;
}

function LeadIn({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[16px] sm:text-[18px] font-semibold tracking-wide text-[#c41e6a]">
      {children}
    </p>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-[30px] sm:text-[40px] lg:text-[44px] leading-[1.12] tracking-[-0.01em] text-[#15102a]">
      {children}
    </h2>
  );
}

// ── Question screen ──────────────────────────────────────────────────────────
function QuestionView({
  screen,
  firstName,
  onPick,
}: {
  screen: QuestionScreen;
  firstName: string;
  onPick: (value: string) => void;
}) {
  return (
    <ScreenWrap>
      {screen.leadIn && <LeadIn>{fill(screen.leadIn, firstName)}</LeadIn>}
      <Question>{fill(screen.question, firstName)}</Question>
      <div className="mt-8 space-y-3.5">
        {screen.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPick(opt.value)}
            className="group flex w-full items-center gap-3 rounded-2xl border-2 border-[#f0c9d8] bg-white px-5 py-5 text-left text-[18px] sm:text-[20px] font-semibold leading-snug text-[#15102a] shadow-[0_10px_24px_-18px_rgba(184,24,96,0.5)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#d62a7a] hover:shadow-[0_18px_34px_-18px_rgba(184,24,96,0.6)] active:translate-y-0 active:scale-[0.99]"
          >
            <span className="flex-1">{opt.label}</span>
            <span
              aria-hidden
              className="shrink-0 translate-x-[-4px] text-[#d62a7a] opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </ScreenWrap>
  );
}

// ── Name screen (only typed field) ───────────────────────────────────────────
function NameView({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <ScreenWrap>
      <Question>Hold on — what do I call you, girl?</Question>
      <p className="mt-4 text-[18px] sm:text-[20px] text-[#6b5b6e]">I wanna do this right.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(val);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full rounded-2xl border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]"
        />
        <PrimaryButton type="submit" disabled={!val.trim()}>
          Continue
        </PrimaryButton>
      </form>
    </ScreenWrap>
  );
}

// ── Build beat screen (animated, auto-advances) ──────────────────────────────
function BuildView({
  firstName,
  onDone,
}: {
  firstName: string;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const timers: number[] = [];
    BUILD_LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setShown(i + 1), 600 + i * 850));
    });
    timers.push(window.setTimeout(onDone, 600 + BUILD_LINES.length * 850 + 700));
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ScreenWrap>
      <Question>Building your plan, {firstName || "girl"}…</Question>
      <ul className="mt-9 space-y-5">
        {BUILD_LINES.map((line, i) => (
          <li
            key={line}
            className={`flex items-center gap-3 text-[19px] sm:text-[22px] leading-snug text-[#15102a] transition-all duration-500 ${
              i < shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <span className="text-[#d62a7a]">✦</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </ScreenWrap>
  );
}

// ── Email capture screen ─────────────────────────────────────────────────────
function EmailView({
  firstName,
  value,
  onChange,
  onSubmit,
}: {
  firstName: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}) {
  const valid = /.+@.+\..+/.test(value.trim());
  return (
    <ScreenWrap>
      <Question>
        Your plan's ready, {firstName || "girl"} — and I wanna walk you through it myself.
      </Question>
      <p className="mt-4 text-[18px] sm:text-[20px] text-[#6b5b6e]">Where should I reach you?</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onSubmit(value.trim());
        }}
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border-2 border-[#f0c9d8] bg-white px-5 py-5 text-[20px] font-semibold text-[#15102a] outline-none transition-colors placeholder:font-normal placeholder:text-[#b79aa6] focus:border-[#d62a7a]"
        />
        <PrimaryButton type="submit" disabled={!valid}>
          Talk to JJ
        </PrimaryButton>
      </form>
      <p className="mt-4 text-center text-[14px] text-[#6b5b6e]">
        No spam — just your plan and a moment with me.
      </p>
    </ScreenWrap>
  );
}

// ── Handoff screen → launches the JJ voice call with all answers attached ────
function HandoffView({
  firstName,
  answers,
  email,
  onClose,
}: {
  firstName: string;
  answers: Record<string, string>;
  email: string;
  onClose: () => void;
}) {
  const variableValues = {
    firstName,
    struggle: answers.struggle ?? "",
    years_fighting: answers.years_fighting ?? "",
    tried_before: answers.tried_before ?? "",
    goal_amount: answers.goal_amount ?? "",
    timeframe: answers.timeframe ?? "",
    readiness: answers.readiness ?? "",
    email,
  };
  return <JJVoiceCall variableValues={variableValues} onClose={onClose} />;
}

// ── Primary button ───────────────────────────────────────────────────────────
function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="block w-full rounded-2xl px-6 py-5 text-center text-[18px] sm:text-[20px] font-bold uppercase tracking-wide text-white shadow-[0_14px_30px_-10px_rgba(184,24,96,0.55)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      style={{ background: PINK_GRADIENT }}
    >
      {children}
    </button>
  );
}

// ── Reaction line (brief JJ aside between some screens) ───────────────────────
function Reaction({ text }: { text: string }) {
  return (
    <div className="flex w-full flex-col items-center justify-center py-16 text-center animate-[fadeUp_0.3s_ease-out]">
      <p className="font-serif italic text-[28px] sm:text-[38px] leading-[1.25] text-[#c41e6a]">
        {text}
      </p>
    </div>
  );
}

// ── Vapi voice call (auto-starts, passes quiz answers as variableValues) ──────
type VapiClient = {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeAllListeners?: () => void;
  start: (assistantId: string, overrides?: Record<string, unknown>) => Promise<unknown> | unknown;
  stop: () => Promise<unknown> | unknown;
};

type CallStatus = "connecting" | "connected" | "ended" | "error";

function JJVoiceCall({
  variableValues,
  onClose,
}: {
  variableValues: Record<string, string>;
  onClose: () => void;
}) {
  const vapiRef = useRef<VapiClient | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);
  const [status, setStatus] = useState<CallStatus>("connecting");
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

  const releaseMic = () => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  };

  useEffect(() => {
    let mounted = true;
    if (startedRef.current) return;
    startedRef.current = true;

    async function run() {
      try {
        if (typeof window === "undefined") return;
        if (!publicKey || !assistantId) {
          setError("Voice agent is not configured.");
          setStatus("error");
          return;
        }
        // Ensure the EventEmitter polyfill is present before loading Vapi.
        await import("events");
        const VapiModule = await import("@vapi-ai/web");
        const Vapi = VapiModule.default;
        if (typeof Vapi !== "function") throw new Error("Vapi failed to load");
        if (!mounted) return;

        const vapi = new Vapi(publicKey) as VapiClient;
        vapiRef.current = vapi;

        vapi.on("call-start", () => mounted && setStatus("connected"));
        vapi.on("call-end", () => {
          releaseMic();
          if (mounted) {
            setSpeaking(false);
            setStatus("ended");
          }
        });
        vapi.on("speech-start", () => mounted && setSpeaking(true));
        vapi.on("speech-end", () => mounted && setSpeaking(false));
        vapi.on("error", (err: unknown) => {
          console.error("Vapi error", err);
          releaseMic();
          if (mounted) {
            setError("Could not connect to JJ. Please try again.");
            setStatus("error");
          }
        });

        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Microphone is not available on this device/browser.");
          setStatus("error");
          return;
        }
        try {
          micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          setError("Microphone permission is required to talk to JJ.");
          setStatus("error");
          return;
        }

        await vapi.start(assistantId, { variableValues });
      } catch (err) {
        console.error("Failed to start JJ call:", err);
        if (mounted) {
          setError("Could not start the call. Please try again.");
          setStatus("error");
        }
      }
    }

    run();

    return () => {
      mounted = false;
      releaseMic();
      try {
        vapiRef.current?.removeAllListeners?.();
        vapiRef.current?.stop?.();
      } catch {
        /* noop */
      }
      vapiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endCall = () => {
    try {
      releaseMic();
      vapiRef.current?.stop?.();
    } catch {
      /* noop */
    }
    onClose();
  };

  return (
    <div className="flex w-full flex-col items-center justify-center py-10 text-center animate-[fadeUp_0.35s_ease-out]">
      <div className="relative mb-8 flex items-center justify-center">
        <span
          className={`absolute inline-flex h-40 w-40 rounded-full ${
            status === "connected" ? "animate-ping" : "animate-pulse"
          }`}
          style={{ backgroundColor: speaking ? "#c41e6a40" : "#c41e6a22" }}
          aria-hidden
        />
        <div
          className="relative inline-flex h-28 w-28 items-center justify-center rounded-full text-white"
          style={{ background: PINK_GRADIENT }}
        >
          {status === "connecting" ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : (
            <Mic className="h-10 w-10" />
          )}
        </div>
      </div>

      <h2 className="font-serif text-[28px] sm:text-[36px] leading-tight text-[#15102a]">
        {status === "connecting"
          ? "Connecting you with JJ…"
          : status === "connected"
          ? speaking
            ? "JJ is speaking…"
            : `I'm right here, ${variableValues.firstName || "girl"}.`
          : status === "ended"
          ? "That was so good talking to you."
          : "Hmm, that didn't connect."}
      </h2>

      <p className="mt-4 max-w-[440px] text-[17px] leading-[1.6] text-[#6b5b6e]">
        {error
          ? error
          : status === "connecting"
          ? "Allow microphone access when your browser asks — then we'll talk."
          : status === "connected"
          ? "Talk to me like you'd talk to your big sister. Tap below whenever you're done."
          : status === "ended"
          ? "Check your email — your plan is on the way."
          : ""}
      </p>

      <div className="mt-9 w-full max-w-[360px]">
        {status === "connected" ? (
          <PrimaryButton onClick={endCall}>End call</PrimaryButton>
        ) : status === "error" || status === "ended" ? (
          <PrimaryButton onClick={onClose}>Close</PrimaryButton>
        ) : null}
      </div>
    </div>
  );
}
