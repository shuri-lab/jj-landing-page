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
      { value: "60plus", label: "60+ and fabulous" },
    ],
  },
  TRIED: {
    key: "TRIED", qid: "C1", type: "multi",
    prompt: "What have you tried before?",
    sub: "Tap everything that rings true.",
    options: [
      { value: "keto", label: "Keto or low-carb", icon: "leaf" },
      { value: "calories", label: "Counting calories or macros", icon: "smartphone" },
      { value: "gym", label: "Going hard at the gym or cardio", icon: "dumbbell" },
      { value: "fasting", label: "Fasting or skipping meals", icon: "clock" },
      { value: "shakes", label: "Shakes, cleanses, or detoxes", icon: "glass" },
      { value: "ww", label: "Weight Watchers or points", icon: "clipboard" },
      { value: "everything", label: "A bit of everything", icon: "shuffle" },
    ],
  },
  HAPPENED: {
    key: "HAPPENED", qid: "C2", type: "single",
    prompt: "And when you tried, what usually happened?",
    options: [
      { value: "regained", label: "I lost it, then it came back" },
      { value: "couldnt_stick", label: "I couldn't stick with it" },
      { value: "stalled", label: "It worked, then just... stalled" },
    ],
  },
  WHATGETS: {
    key: "WHATGETS", qid: "C3", type: "single",
    prompt: "When you start something, what usually gets in the way?",
    sub: "Pick the one that feels most like you.",
    options: [
      { value: "blownit", label: "One bad day and I figure I've blown it", icon: "cloudrain" },
      { value: "driftoff", label: "I start strong, then quietly drift off", icon: "wind" },
      { value: "losesteam", label: "I lose steam when the scale stops moving", icon: "gauge" },
      { value: "hungryrestricted", label: "Being hungry and restricted all the time", icon: "utensilscrossed" },
      { value: "putmelast", label: "Life gets busy and I put myself last", icon: "users" },
    ],
  },
  DAY: {
    key: "DAY", qid: "D1", type: "single",
    prompt: "On a normal day, what does your eating actually look like?",
    sub: "Pick the one that feels most like you.",
    options: [
      { value: "barely_eat", label: "I barely eat, then I'm starving by night", icon: "utensilscrossed" },
      { value: "graze", label: "I graze and snack all day without thinking", icon: "cookie" },
      { value: "night_stress", label: "I'm good all day, then night or stress hits", icon: "moon" },
      { value: "weekend", label: "Good all week, then the weekend undoes it", icon: "calendar" },
      { value: "clean_stuck", label: "I eat pretty clean, but the scale won't budge", icon: "leaf" },
    ],
  },
  MEAL: {
    key: "MEAL", qid: "D2", type: "single",
    prompt: "When it's time to eat, what usually happens?",
    sub: "Pick the one that feels most like you.",
    options: [
      { value: "quick", label: "I grab whatever's quick, I don't have it in me to cook", icon: "zap" },
      { value: "everyoneelse", label: "I feed everyone else first and just eat what they're having", icon: "users" },
      { value: "boring", label: "The healthy stuff is boring, so it never lasts", icon: "leaf" },
      { value: "dontknow", label: "I don't even know what I'm supposed to eat anymore", icon: "help" },
    ],
  },
  STRESS: {
    key: "STRESS", qid: "D4", type: "single",
    prompt: "When life gets stressful, where does it usually go for you?",
    sub: "Pick the one that feels most like you.",
    options: [
      { value: "reach_food", label: "I reach for food, it's my comfort", icon: "cookie" },
      { value: "stop_caring", label: "I stop taking care of myself", icon: "heartcrack" },
      { value: "white_knuckle", label: "I push through and burn out", icon: "battery" },
      { value: "cope", label: "I usually handle it okay", icon: "smile" },
    ],
  },
  ALONE: {
    key: "ALONE", qid: "D6", type: "single",
    prompt: "When you've gone after this before, were you doing it on your own?",
    options: [
      { value: "always_alone", label: "Always alone, nobody really knew", icon: "user" },
      { value: "had_group", label: "I had a person or group, and it helped", icon: "users" },
      { value: "fizzles", label: "I start with people, but it fizzles out", icon: "wind" },
    ],
  },
  SUPPORT: {
    key: "SUPPORT", qid: "D7", type: "single",
    prompt: "Do you think having someone in your corner would make the difference?",
    options: [
      { value: "yesneverhad", label: "Yes. That's the part I've never had", icon: "heart" },
      { value: "feltithelps", label: "I've felt how much it helps, I just haven't had it stick", icon: "users" },
      { value: "ifkeptup", label: "Maybe, if they actually kept up with me", icon: "help" },
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

// The signature food-vs-exercise slider (spec screen 3): guess, then a blurred
// teaser (the real answer is deferred to keep her curious to the end).
export const SLIDER_INTRO = "Take your best guess. Most women get this one backwards.";
export const SLIDER_PROMPT = "How much of weight loss do you think is food vs. exercise?";
export const SLIDER_LOCKED_TITLE = "Most women are off by a lot here...";
export const SLIDER_REVEAL: string[] = [
  "The real answer surprises almost everyone. I'll show you at the end.",
];

// Mid-quiz reveals are CLIFFHANGERS, not lessons (spec §4): each lands one true,
// slightly surprising thing and points forward to the diagnosis, without giving
// away the mechanism the diagnosis delivers as the aha.
export function discHistory(c2: string): string[] {
  switch (c2) {
    case "regained":
      return [
        "Oh, I know this one. It came back every time, and a little heavier. That is not you failing.",
        "There is a real reason it keeps happening, and it is not what you have been told. I will show you.",
      ];
    case "couldnt_stick":
      return [
        "You are not the problem here. The women who keep it off are not more disciplined than you, they just have something you have never had.",
        "Hold that thought.",
      ];
    case "stalled":
    default:
      return [
        "That stall is not you slipping. Your body did something specific, and pushing harder is exactly the wrong answer.",
        "I will show you what actually works.",
      ];
  }
}

export function discDay(d1: string): string[] {
  switch (d1) {
    case "barely_eat":
      return [
        "I hear this all the time, and I need you to know it is not a discipline problem.",
        "Your body is doing something to protect you, and the fix is the opposite of what you would think.",
        "I will show you.",
      ];
    case "clean_stuck":
      return [
        "This is the one that breaks women's hearts, doing everything right and the scale just sits there. If you are eating clean and it will not move, the thing holding your weight is not on your plate.",
        "Your answers already told me where it is. Almost there.",
      ];
    case "graze":
      return [
        "You are not weak, and you are not lazy. A lot of everyday food is built to slip right past you, filling you up with nothing.",
        "But there is more to your story than that, and it is coming into focus.",
      ];
    case "night_stress":
      return [
        "Reaching for food when you are drained is not a character flaw, it is human. Something real happens on those hard nights, and it was never about resisting harder.",
        "What it is really about is in your results.",
      ];
    case "weekend":
    default:
      return [
        "Here is what I see: you are not failing all week, you are winning all week, and one weekend gets to erase it in your head. The slip was never the real problem.",
        "What the real problem is might surprise you. Keep going.",
      ];
  }
}

// Midlife discovery (spec screen 15), gated in isShown(). A cliffhanger, like the
// others: it lands "your body changed the rules" (credibility + blame-lift for the
// 50+ woman) and points forward. The biology moves to the R1 diagnosis aha.
export const DISC_MIDLIFE: string[] = [
  "Your body changed the rules. Something shifts after 40 that no one warns you about, and it is why the old way stopped working.",
  "It was never you giving up. I'll show you what changed.",
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
      // Note: the shot is NOT here anymore (its own screen, F3q, is the single
      // source for the GLP1 flag). This eliminates the double-ask.
      const v = asArray(value);
      if (v.includes("keto")) add(s, "R7", 1);
      if (v.includes("calories")) add(s, "R6", 1); // "doing the math alone" angle
      if (v.includes("gym")) add(s, "R3", 3);
      if (v.includes("fasting")) add(s, "R4", 2);
      if (v.includes("shakes")) add(s, "R7", 1);
      if (v.includes("ww")) add(s, "R7", 1); // "points forever, still on your own"
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
      } else if (value === "stalled") {
        add(s, "R1", 2);
        add(s, "R4", 1);
      }
      break;
    }
    case "C3": {
      // What gets in the way (spec screen 7): pattern behind the outcome + motivation.
      if (value === "blownit") add(s, "R5", 3);
      else if (value === "driftoff") {
        add(s, "R6", 2);
        add(s, "R5", 1);
      } else if (value === "losesteam") {
        add(s, "R6", 1);
        add(s, "R5", 1);
      } else if (value === "hungryrestricted") add(s, "R4", 2);
      else if (value === "putmelast") {
        add(s, "R6", 2);
        add(s, "R8", 1);
      }
      break;
    }
    case "D2": {
      // When it's time to eat (spec screen 10): the food ENVIRONMENT (sets up the
      // meals module). Emotional eating is caught on Screen 8 + stress question, so
      // no R9 here (de-duplicated).
      if (value === "quick") add(s, "R7", 1);
      else if (value === "everyoneelse") add(s, "R6", 2);
      else if (value === "boring") {
        add(s, "R4", 1);
        add(s, "R7", 1);
      } else if (value === "dontknow") add(s, "R7", 2);
      break;
    }
    case "D7": {
      // Would support help (spec screen 13): she names her own need. No opt-out option
      // (all three are a version of yes/open), a clean R6 gradient.
      if (value === "yesneverhad") add(s, "R6", 3);
      else if (value === "feltithelps") add(s, "R6", 2);
      else if (value === "ifkeptup") add(s, "R6", 1);
      break;
    }
    case "D1": {
      if (value === "barely_eat") {
        add(s, "R4", 3);
        // ED candidate: barely-eating all day + fasting/skipping is the reliable signal.
        const tried = asArray(s.answers["C1"] ?? []);
        if (tried.includes("fasting")) s.flags.FLAG_ED_watch = true;
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
        // Honest yo-yo nudge, kept light (+1) so her behavioral answers decide;
        // the shot messaging rides on the GLP1_cameoff flag, not this score.
        add(s, "R2", 1);
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
  "WHATGETS", "DAY", "DISC_DAY", "MEAL", "STRESS", "ALONE",
  "SUPPORT", "SYMPTOMS", "DISC_MIDLIFE", "SHOT", "WHY", "NAME",
  "ANALYZING", "GATE", "PREPARING", "DIAGNOSIS", "SOLUTION", "OFFER",
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
// How far a fallback reason (R1/R7) must beat the best behavioral reason to lead
// OUTRIGHT. At a smaller edge the behavioral reason leads and the fallback is woven
// in as the second thread ("two things pulling together"). This is the same
// principle as the R6 gate: fallback/accumulation reasons must not hijack a woman's
// behavioral story on a slim margin. For the midlife woman especially, leading with
// "it's just your age" is both fatalistic and the read she has already heard too
// many times, so R1 must clearly dominate to take the lead alone.
const FALLBACK_DOMINANCE = 3;
// How far R6 (no-support) must beat the best behavioral reason to lead as PRIMARY.
// Set to 4 (one past the near-tie band) so a woman whose behavioral pattern only
// trails R6 by a point or two keeps her behavioral Aha, with support carried into
// the through-line. A true R6 woman (support is the whole story) clears this easily.
const R6_DOMINANCE = 4;

export function resolve(s: State): Resolution {
  const reasons = Object.keys(s.reasonScores) as ReasonKey[];
  const score = (r: ReasonKey) => s.reasonScores[r];

  // R6 rebalance rule (spec §9.2): no-support may now accumulate from many places,
  // so it only wins as primary when her DIRECT support answers back it up (she is
  // doing it alone/fades, or she said support would make the difference). Otherwise
  // it drops to contributing and the next reason leads, so R6 never swamps a woman
  // whose real pattern is elsewhere by accumulation alone.
  const r6Backed =
    s.answers["D6"] === "always_alone" ||
    s.answers["D6"] === "fizzles" ||
    s.answers["D7"] === "yesneverhad" ||
    s.answers["D7"] === "feltithelps";

  const ranked = [...reasons].sort((a, b) => {
    if (score(b) !== score(a)) return score(b) - score(a);
    return PRIORITY.indexOf(a) - PRIORITY.indexOf(b); // behavioral-first tie-break
  });

  let primary = ranked[0];

  // R6 dominance gate: support (R6) is the through-line for many women, so as a
  // PRIMARY it should carry the Aha only when it clearly is the whole story, not
  // when it edges a real behavioral pattern by a point or two of accumulation.
  // R6 leads only when (a) her DIRECT support answers back it AND (b) it beats the
  // best behavioral reason by >= R6_DOMINANCE. Otherwise it demotes to contributing
  // and the behavioral pattern leads; her support signal still drives the
  // through-line and Turn in composition (supportSignal, independent of primary).
  if (primary === "R6") {
    const bestBehavioral = ranked.find(
      (r) => r !== "R6" && !FALLBACK.includes(r) && score(r) > 0,
    );
    const dominates = bestBehavioral
      ? score("R6") - score(bestBehavioral) >= R6_DOMINANCE
      : true; // nothing behavioral to yield to
    if (!r6Backed || !dominates) {
      primary = bestBehavioral ?? ranked.find((r) => r !== "R6" && score(r) > 0) ?? primary;
    }
  }

  // Fallback demotion: R1/R7 only lead when they clearly dominate. If the top
  // reason is R1 or R7 and a behavioral reason is within FALLBACK_DOMINANCE
  // points, the behavioral reason leads instead (the anti-"it's your age" fix).
  // An unbacked R6 is not eligible to be promoted here.
  if (FALLBACK.includes(primary)) {
    const bestBehavioral = ranked.find(
      (r) => !FALLBACK.includes(r) && score(r) > 0 && (r !== "R6" || r6Backed),
    );
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
