/**
 * Quiz 01 v3 — "Why Losing Weight After 40 Feels Impossible"
 * Recalibrated diagnostic engine (Yobody / JJ Smith Edition).
 *
 * This is the v3 rebuild described in `quiz-01-harder-after-40-v3.md`. The
 * scoring table matches spec §9.1 exactly, resolution uses the behavioral-first
 * priority (§9.2) with a confidence classification (§6.1), and the flow ends on
 * the composed diagnosis tail: analyzing -> result gate (+email) -> preparing ->
 * full diagnosis -> solution -> offer.
 *
 * The diagnosis composition itself lives in `diagnosis.v3.ts`.
 *
 * No em dashes in any on-screen copy. Product is JJ, a person.
 */

export type ReasonKey = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9";

export const REASON_NAME: Record<ReasonKey, string> = {
  R1: "The Midlife Shift",
  R2: "The Fast-Loss Cycle",
  R3: "Out-Exercising the Plate",
  R4: "The Restriction Trap",
  R5: "The All-or-Nothing Trap",
  R6: "Doing It Alone",
  R7: "Following the Wrong Rules",
  R8: "Carrying Too Much Stress",
  R9: "Food as the Way to Cope",
};

export type Confidence = "clear" | "near_tie" | "low_signal";

export type Flags = {
  FLAG_40plus: boolean;
  FLAG_peri: boolean;
  FLAG_GLP1: boolean;
  FLAG_GLP1_cameoff: boolean;
  FLAG_health_why: boolean;
  FLAG_ED_watch: boolean;
  FLAG_goalBig: boolean;
};

export type State = {
  reasonScores: Record<ReasonKey, number>;
  flags: Flags;
  goal: string | null;
  why: string | null;
  name: string | null;
  email: string | null;
  sliderGuess: number | null; // food % she locked in on the slider
  answers: Record<string, string | string[]>;
};

export function initialState(): State {
  return {
    reasonScores: { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0, R8: 0, R9: 0 },
    flags: {
      FLAG_40plus: false,
      FLAG_peri: false,
      FLAG_GLP1: false,
      FLAG_GLP1_cameoff: false,
      FLAG_health_why: false,
      FLAG_ED_watch: false,
      FLAG_goalBig: false,
    },
    goal: null,
    why: null,
    name: null,
    email: null,
    sliderGuess: null,
    answers: {},
  };
}

// ── Question screens (data) ──────────────────────────────────────────────────
export type Option = { value: string; label: string; icon?: string };
export type QuestionDef = {
  key: string; // screen id
  qid: string; // event id (used as the answers[] key)
  type: "single" | "multi";
  prompt: string;
  sub?: string;
  options: Option[];
};

export const QUESTIONS: Record<string, QuestionDef> = {
  GOAL: {
    key: "GOAL", qid: "A1", type: "single",
    prompt: "First, how much are you hoping to lose?",
    options: [
      { value: "under_15", label: "Under 15 lbs" },
      { value: "15_30", label: "15 to 30 lbs" },
      { value: "30_50", label: "30 to 50 lbs" },
      { value: "more_50", label: "More than 50 lbs" },
      { value: "not_sure", label: "I'm not sure, I just don't feel like me" },
    ],
  },
  AGE: {
    key: "AGE", qid: "F1q", type: "single",
    prompt: "What season of life are you in right now?",
    options: [
      { value: "30s", label: "My 30s" },
      { value: "40s", label: "My 40s" },
      { value: "50s", label: "My 50s" },
      { value: "60plus", label: "60 and fabulous" },
    ],
  },
  TRIED: {
    key: "TRIED", qid: "C1", type: "multi",
    prompt: "What have you tried before? Tap everything that rings true.",
    options: [
      { value: "keto", label: "Keto or low-carb", icon: "leaf" },
      { value: "calories", label: "Counting calories or macros", icon: "smartphone" },
      { value: "gym", label: "Going hard at the gym or cardio", icon: "dumbbell" },
      { value: "fasting", label: "Fasting or skipping meals", icon: "clock" },
      { value: "shakes", label: "Shakes, cleanses, or detoxes", icon: "glass" },
      { value: "ww", label: "Weight Watchers or points", icon: "clipboard" },
      { value: "shot", label: "The shot (Ozempic, Wegovy, etc.)", icon: "droplet" },
      { value: "everything", label: "Honestly, a little of everything", icon: "shuffle" },
    ],
  },
  HAPPENED: {
    key: "HAPPENED", qid: "C2", type: "single",
    prompt: "And when you tried, what usually happened?",
    options: [
      { value: "regained", label: "I lost it, then it all came back" },
      { value: "couldnt_stick", label: "I couldn't stick with it past a few weeks" },
      { value: "barely_lost", label: "I followed it and barely lost anything" },
      { value: "stalled", label: "It worked, then just... stalled" },
    ],
  },
  DAY: {
    key: "DAY", qid: "D1", type: "single",
    prompt: "On a normal day, what does your eating actually look like?",
    options: [
      { value: "barely_eat", label: "I barely eat, then I'm starving by night" },
      { value: "clean_stuck", label: "I eat pretty clean, but the scale won't budge" },
      { value: "graze", label: "I graze and snack all day without thinking" },
      { value: "night_stress", label: "I'm good all day, then night or stress hits" },
      { value: "weekend", label: "Good all week, then the weekend undoes it" },
    ],
  },
  STRESS: {
    key: "STRESS", qid: "D4", type: "single",
    prompt: "When life gets stressful, where does it usually go for you?",
    options: [
      { value: "reach_food", label: "I reach for food, it's my comfort" },
      { value: "stop_caring", label: "I stop taking care of myself" },
      { value: "white_knuckle", label: "I push through and burn out" },
      { value: "cope", label: "I've got decent ways to cope" },
    ],
  },
  ALONE: {
    key: "ALONE", qid: "D6", type: "single",
    prompt: "When you've gone after this before, were you doing it on your own?",
    options: [
      { value: "always_alone", label: "Always alone, nobody really knew" },
      { value: "had_group", label: "I had a person or group, and it helped" },
      { value: "fizzles", label: "I start with people, but it fizzles out" },
    ],
  },
  SYMPTOMS: {
    key: "SYMPTOMS", qid: "E1", type: "multi",
    prompt: "Which of these sound like you lately? Tap any that fit.",
    options: [
      { value: "belly", label: "Belly fat that won't budge", icon: "anchor" },
      { value: "bloated", label: "Bloated, puffy, or heavy", icon: "droplets" },
      { value: "cravings", label: "Cravings I can't control", icon: "cookie" },
      { value: "exhausted", label: "Exhausted all the time", icon: "battery" },
      { value: "brain_fog", label: "Brain fog", icon: "cloudfog" },
      { value: "hot_flashes", label: "Hot flashes or night sweats", icon: "flame" },
      { value: "lose_but_stomach", label: "I lose it everywhere but my stomach", icon: "target" },
    ],
  },
  SHOT: {
    key: "SHOT", qid: "F3q", type: "single",
    prompt: "Are you on, considering, or coming off a weight-loss shot like Ozempic?",
    options: [
      { value: "on_it", label: "I'm on it now" },
      { value: "considering", label: "I'm thinking about it" },
      { value: "came_off", label: "I came off it" },
      { value: "not_for_me", label: "No, not for me" },
    ],
  },
  WHY: {
    key: "WHY", qid: "G1", type: "single",
    prompt: "Last one, and it matters most. Why does this matter to you right now?",
    options: [
      { value: "energy", label: "I want my energy and confidence back", icon: "zap" },
      { value: "myself", label: "I want to feel like myself again", icon: "heart" },
      { value: "health", label: "For my health, I'm worried about it", icon: "heartpulse" },
      { value: "family", label: "To be around and strong for my family", icon: "users" },
      { value: "moment", label: "There's a moment coming (event, photo, trip)", icon: "calendar" },
    ],
  },
};

// ── Discovery content ────────────────────────────────────────────────────────

// The signature food-vs-exercise slider (spec screen 3): guess, then reveal.
export const SLIDER_INTRO = "Take your best guess. Most women get this one backwards.";
export const SLIDER_PROMPT = "How much of weight loss do you think is food vs. exercise?";
export const SLIDER_REVEAL: string[] = [
  "It's about 80% food, 20% exercise.",
  "Even most active women burn under 100 calories a day working out. That's about 5% of what your body uses. The food on your plate has roughly 20 times more pull on your weight than the gym does.",
  "Exercise still matters for your health. It was just never the lever that moves the scale.",
];

export function discHistory(c2: string): string[] {
  switch (c2) {
    case "regained":
      return [
        "Here's why it keeps coming back. When weight comes off fast, a lot of what leaves is muscle, not just fat.",
        "And when it returns, it comes back as fat. So each round quietly trades away the very thing that keeps your metabolism up, which is why every attempt feels a little harder than the last.",
        "The weight coming back was not you slipping. It was built into how fast you lost it.",
      ];
    case "couldnt_stick":
      return [
        "The women who keep it off are not tougher than you. They just are not running on willpower, because willpower is a battery, and it runs down for everyone.",
        "Sticking with something has never come from gritting your teeth harder. It comes from the setup around you being built so you do not have to.",
        "You were asked to white-knuckle something that was never meant to be done on grit alone.",
      ];
    case "barely_lost":
      return [
        "If you followed a plan closely and the scale barely moved, the effort was never the problem.",
        "It usually means the plan was aimed at the wrong lever, either too much weight on exercise, or so little food that your body slowed down to protect itself.",
        "Either way, the answer is not to try harder. It is to aim at the thing that actually moves.",
      ];
    case "stalled":
    default:
      return [
        "That stall is your body adapting. It gets more efficient, some muscle slips away, and the plan that used to work quietly stops working.",
        "Doing more of the same rarely restarts it, and often makes it dig in harder.",
        "What gets things moving again is protecting the muscle that sets your pace, not cutting further.",
      ];
  }
}

export function discDay(d1: string, gentle: boolean): string[] {
  switch (d1) {
    case "barely_eat":
      return gentle
        ? [
            "Barely eating all day and then feeling ravenous at night is not a discipline problem. It is your body running low and sounding the alarm.",
            "When food stays too scarce for too long, your body slows down to protect you.",
            "It is asking for steady fuel, not less of it. This was never a lack of discipline. You've had plenty.",
          ]
        : [
            "Barely eating all day and then feeling ravenous at night is not a discipline problem. It is your body running low and sounding the alarm.",
            "When food stays too scarce for too long, your body slows down to protect you, then drives you to eat later.",
            "It is asking for steady fuel, not less of it.",
          ];
    case "clean_stuck":
      return [
        "Eating clean and still not losing means the problem is not on your plate, it is somewhere the plate can't reach.",
        "For some women that is lost muscle, for others it is stress, or a body that has slowed to protect itself.",
        "Clean eating is not the fix on its own, because it was never the missing piece. In a moment we'll show you which piece is yours.",
      ];
    case "graze":
      return [
        "It's not just how much you're nibbling, it's what.",
        "A lot of everyday food is designed to be easy to overeat without ever feeling full. In one careful study, people ate about 500 extra calories a day on processed food, same hunger, more calories, without noticing.",
        "It was not weak willpower. The food was built to slip right past it.",
      ];
    case "night_stress":
      return [
        "Reaching for food when you're stressed or drained is not weakness.",
        "Under stress, your body turns up the pull toward comfort food and turns down your ability to resist, at the very same moment. That is a setup, not a character flaw.",
        "Which means the fix was never about resisting harder on the hard nights. It's about what is driving them.",
      ];
    case "weekend":
    default:
      return [
        "Look closely and you are not failing all week, you are winning all week, and one weekend erases it in your mind.",
        "The slip was never the problem. The problem is that a single off day ends the whole thing instead of being just one day you move past.",
        "Staying mostly on track beats being perfect, every time.",
      ];
  }
}

// Midlife discovery (spec screen 12), gated in isShown().
export const DISC_MIDLIFE: string[] = [
  "After 40, something shifts that no plan warns you about.",
  "As your hormones change, you slowly lose the muscle that keeps your metabolism running, and your body starts storing fat around your middle. It happens even when you're eating exactly the way you always have.",
  "So when the old approach stops working, it is not that you stopped trying.",
  "The body changed, and the plan never got updated to match.",
];

export const ANALYZING_TICKS: string[] = [
  "What you've tried, and what happened",
  "The pattern underneath it all",
  "What actually works for it",
];

export const PREPARING_TICKS: string[] = [
  "Your pattern, in full",
  "Why the past attempts fell short",
  "The path that actually fits it",
];

// ── Scoring ──────────────────────────────────────────────────────────────────
function add(s: State, r: ReasonKey, n: number) {
  s.reasonScores[r] += n;
}

const asArray = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

/** Apply an answer to the state. Returns a new state object. Scoring per spec §9.1. */
export function scoreAnswer(prev: State, qid: string, value: string | string[]): State {
  const s: State = structuredClone(prev);
  s.answers[qid] = value;

  switch (qid) {
    case "A1": {
      // Goal: no points. Stores goal + big-goal flag (honest-timeline handling).
      s.goal = value as string;
      if (value === "30_50" || value === "more_50") s.flags.FLAG_goalBig = true;
      break;
    }
    case "F1q": {
      // Age: NO points (anti "it's just your age"). 40+ sets the flag only.
      if (value === "40s" || value === "50s" || value === "60plus") s.flags.FLAG_40plus = true;
      break;
    }
    case "B1": {
      // Food-vs-exercise slider. `value` is the locked food % as a string.
      const foodPct = Number(value);
      s.sliderGuess = foodPct;
      if (foodPct <= 50) {
        add(s, "R3", 1);
        add(s, "R7", 1);
      } else if (foodPct <= 65) {
        add(s, "R7", 1);
      }
      // >= 66% food: none (she already knows).
      break;
    }
    case "C1": {
      const v = asArray(value);
      if (v.includes("keto")) add(s, "R7", 1);
      if (v.includes("gym")) add(s, "R3", 3);
      if (v.includes("fasting")) add(s, "R4", 2);
      if (v.includes("shakes")) add(s, "R7", 1);
      if (v.includes("shot")) s.flags.FLAG_GLP1 = true;
      if (v.includes("everything")) {
        add(s, "R7", 2);
        add(s, "R5", 1);
      }
      break;
    }
    case "C2": {
      if (value === "regained") {
        add(s, "R2", 4);
      } else if (value === "couldnt_stick") {
        add(s, "R5", 2);
        add(s, "R6", 1);
      } else if (value === "barely_lost") {
        add(s, "R4", 2);
      } else if (value === "stalled") {
        add(s, "R1", 2);
        add(s, "R4", 1);
      }
      break;
    }
    case "D1": {
      if (value === "barely_eat") {
        add(s, "R4", 3);
        // ED candidate: barely-eat + a restriction signal (fasting or barely-lost).
        const tried = asArray(s.answers["C1"] ?? []);
        if (tried.includes("fasting") || s.answers["C2"] === "barely_lost") {
          s.flags.FLAG_ED_watch = true;
        }
      } else if (value === "clean_stuck") {
        add(s, "R1", 2);
      } else if (value === "graze") {
        add(s, "R9", 2);
        add(s, "R4", 1);
      } else if (value === "night_stress") {
        add(s, "R9", 3);
      } else if (value === "weekend") {
        add(s, "R5", 3);
      }
      break;
    }
    case "D4": {
      if (value === "reach_food") {
        add(s, "R9", 3);
        // reach-for-food + barely-eat reinforces the compassion watch.
        if (s.answers["D1"] === "barely_eat") s.flags.FLAG_ED_watch = true;
      } else if (value === "stop_caring") {
        add(s, "R6", 2);
        add(s, "R9", 1);
      } else if (value === "white_knuckle") {
        add(s, "R8", 3);
      }
      // cope: none.
      break;
    }
    case "D6": {
      if (value === "always_alone") add(s, "R6", 3);
      else if (value === "fizzles") {
        add(s, "R6", 2);
        add(s, "R5", 1);
      } else if (value === "had_group") add(s, "R6", 1);
      break;
    }
    case "E1": {
      const v = asArray(value);
      // belly: neutral (the universal complaint), no points.
      if (v.includes("bloated")) add(s, "R7", 1);
      if (v.includes("cravings")) add(s, "R9", 1);
      if (v.includes("exhausted")) add(s, "R8", 2);
      if (v.includes("brain_fog")) {
        add(s, "R8", 1);
        add(s, "R1", 1);
      }
      if (v.includes("hot_flashes")) {
        add(s, "R1", 3);
        s.flags.FLAG_peri = true;
      }
      if (v.includes("lose_but_stomach")) add(s, "R1", 1);
      break;
    }
    case "F3q": {
      if (value === "on_it" || value === "considering" || value === "came_off") s.flags.FLAG_GLP1 = true;
      if (value === "came_off") {
        add(s, "R2", 2);
        s.flags.FLAG_GLP1_cameoff = true;
      }
      break;
    }
    case "G1": {
      s.why = value as string;
      if (value === "health" || value === "family") s.flags.FLAG_health_why = true;
      break;
    }
  }
  return s;
}

// ── Flow / skip logic (spec §2) ──────────────────────────────────────────────
export const ORDER = [
  "GOAL", "AGE", "SLIDER", "TRIED", "HAPPENED", "DISC_HISTORY",
  "DAY", "DISC_DAY", "STRESS", "ALONE", "SYMPTOMS", "DISC_MIDLIFE",
  "SHOT", "WHY", "NAME", "ANALYZING", "GATE", "PREPARING",
  "DIAGNOSIS", "SOLUTION", "OFFER",
] as const;

export function isShown(key: string, s: State): boolean {
  switch (key) {
    case "DISC_MIDLIFE": {
      // Gate: 40+ AND a real midlife signal (hot flashes OR lose-everywhere OR stalled).
      const symptoms = asArray(s.answers["E1"] ?? []);
      const signal =
        symptoms.includes("hot_flashes") ||
        symptoms.includes("lose_but_stomach") ||
        s.answers["C2"] === "stalled";
      return s.flags.FLAG_40plus && signal;
    }
    default:
      return true;
  }
}

export function nextKey(current: string, s: State): string {
  const idx = ORDER.indexOf(current as (typeof ORDER)[number]);
  for (let i = idx + 1; i < ORDER.length; i++) {
    if (isShown(ORDER[i], s)) return ORDER[i];
  }
  return ORDER[ORDER.length - 1];
}

// ── Resolution (spec §9.2) ───────────────────────────────────────────────────
export type Resolution = {
  primary: ReasonKey;
  contributing: ReasonKey | null;
  confidence: Confidence;
  edMode: boolean;
};

// Behavioral-first tie-break priority: a woman's specific behavioral story leads,
// and the two "fallback" reasons (R1 midlife, R7 misinformation) only lead when
// they clearly dominate rather than by accumulation (spec §3, §9.2).
const PRIORITY: ReasonKey[] = ["R2", "R9", "R5", "R6", "R4", "R3", "R8", "R1", "R7"];
const FALLBACK: ReasonKey[] = ["R1", "R7"];
// How far a fallback reason (R1/R7) must beat the best behavioral reason to be
// allowed to lead. Below this it is demoted so "it's just your age/the info"
// never swallows a real behavioral story.
const FALLBACK_DOMINANCE = 2;

export function resolve(s: State): Resolution {
  const reasons = Object.keys(s.reasonScores) as ReasonKey[];
  const score = (r: ReasonKey) => s.reasonScores[r];

  const ranked = [...reasons].sort((a, b) => {
    if (score(b) !== score(a)) return score(b) - score(a);
    return PRIORITY.indexOf(a) - PRIORITY.indexOf(b); // behavioral-first tie-break
  });

  let primary = ranked[0];

  // Fallback demotion: R1/R7 only lead when they clearly dominate. If the top
  // reason is R1 or R7 and a behavioral reason is within FALLBACK_DOMINANCE
  // points, the behavioral reason leads instead (the anti-"it's your age" fix).
  if (FALLBACK.includes(primary)) {
    const bestBehavioral = ranked.find((r) => !FALLBACK.includes(r) && score(r) > 0);
    if (bestBehavioral && score(primary) - score(bestBehavioral) < FALLBACK_DOMINANCE) {
      primary = bestBehavioral;
    }
  }

  // Fallback if everything is zero: lead with the midlife shift (40+) or no-support.
  if (score(primary) === 0) primary = s.flags.FLAG_40plus ? "R1" : "R6";

  const contributing = ranked.find((r) => r !== primary && score(r) > 0) ?? null;

  // Confidence drives diagnosis conviction (§6.1).
  const margin = score(primary) - (contributing ? score(contributing) : 0);
  let confidence: Confidence;
  if (score(primary) <= 2) confidence = "low_signal";
  else if (margin >= 3) confidence = "clear";
  else confidence = "near_tie"; // includes demoted cases where contributing outscores primary

  return { primary, contributing, confidence, edMode: s.flags.FLAG_ED_watch };
}

// ── Events (lightweight; dataLayer stub, tagged with the angle) ───────────────
export const ANGLE = "belly-after-40";

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, angle: ANGLE, version: "quiz01-v3", ...payload });
}
