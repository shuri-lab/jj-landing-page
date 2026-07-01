/**
 * Quiz 01 — "Why Losing the Belly After 40 Feels Impossible"
 * Engine + content for the diagnostic quiz (Yobody / JJ Smith Edition).
 *
 * This is the fixed diagnostic engine described in the framework: a quiet
 * points tally over belief/behavior answers resolves to a primary +
 * contributing diagnosis, gated by a few flags. The hook (S0) lives on the
 * landing page; this module powers S1 to S21 inside the takeover.
 *
 * No em dashes in any on-screen copy. Product is JJ, a person.
 */

export type ReasonKey = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9";

export const REASON_NAME: Record<ReasonKey, string> = {
  R1: "The Midlife Shift",
  R2: "The Yo-Yo Trap",
  R3: "Out-Exercising the Plate",
  R4: "The Restriction Trap",
  R5: "All-or-Nothing",
  R6: "No Support",
  R7: "Bad Information",
  R8: "Stress and Sleep",
  R9: "Emotional Eating",
};

// Short clause used when a reason is the CONTRIBUTING factor.
export const CONTRIB_PHRASE: Record<ReasonKey, string> = {
  R1: "your body changing the rules after 40",
  R2: "the yo-yo cycle wearing you down",
  R3: "pouring your effort into exercise",
  R4: "eating too little for too long",
  R5: "the all-or-nothing pattern",
  R6: "trying to do it all on your own",
  R7: "being told wrong about all of it",
  R8: "stress and exhaustion holding on",
  R9: "food being where the stress goes",
};

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
  lastTouch: Record<ReasonKey, number>; // recency for tie-breaks
  flags: Flags;
  beliefsSurfaced: string[];
  goal: string | null;
  why: string | null;
  name: string | null;
  email: string | null;
  answers: Record<string, string | string[]>;
  _tick: number;
};

export function initialState(): State {
  return {
    reasonScores: { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0, R8: 0, R9: 0 },
    lastTouch: { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0, R8: 0, R9: 0 },
    flags: {
      FLAG_40plus: false,
      FLAG_peri: false,
      FLAG_GLP1: false,
      FLAG_GLP1_cameoff: false,
      FLAG_health_why: false,
      FLAG_ED_watch: false,
      FLAG_goalBig: false,
    },
    beliefsSurfaced: [],
    goal: null,
    why: null,
    name: null,
    email: null,
    answers: {},
    _tick: 0,
  };
}

// ── Question screens (data) ──────────────────────────────────────────────────
export type Option = { value: string; label: string; icon?: string };
export type QuestionDef = {
  key: string; // screen id
  qid: string; // event id
  type: "single" | "multi";
  prompt: string;
  sub?: string;
  field?: keyof State | "goal" | "why";
  options: Option[];
};

export const QUESTIONS: Record<string, QuestionDef> = {
  S1: {
    key: "S1", qid: "A1", type: "single",
    prompt: "First, the honest goal. How much are you hoping to lose?",
    options: [
      { value: "under_15", label: "Under 15 lbs" },
      { value: "15_30", label: "15 to 30 lbs" },
      { value: "30_50", label: "30 to 50 lbs" },
      { value: "more_50", label: "More than 50 lbs" },
      { value: "not_sure", label: "I'm not sure, I just don't feel like me" },
    ],
  },
  S2: {
    key: "S2", qid: "F1q", type: "single",
    prompt: "What season of life are you in right now?",
    options: [
      { value: "30s", label: "My 30s" },
      { value: "40s", label: "My 40s" },
      { value: "50s", label: "My 50s" },
      { value: "60plus", label: "60 and fabulous" },
    ],
  },
  S3: {
    key: "S3", qid: "F2q", type: "multi",
    prompt: "Are you noticing any of these lately?",
    sub: "Tap all that feel true.",
    options: [
      { value: "hot", label: "Hot flashes or night sweats" },
      { value: "mood", label: "Mood swings or feeling off" },
      { value: "sleep", label: "Sleep changing on me" },
      { value: "periods", label: "My periods changing or stopped" },
      { value: "none", label: "Honestly, not really" },
    ],
  },
  S5: {
    key: "S5", qid: "B1", type: "single",
    prompt: "Quick gut check. What do you think matters more for losing weight?",
    options: [
      { value: "mostly_exercise", label: "It's mostly exercise" },
      { value: "mostly_food", label: "It's mostly food" },
      { value: "fifty", label: "About 50/50" },
      { value: "no_idea", label: "Honestly, no idea" },
    ],
  },
  S7: {
    key: "S7", qid: "C1", type: "multi",
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
  S8: {
    key: "S8", qid: "C2", type: "single",
    prompt: "And when you tried, what usually happened?",
    options: [
      { value: "regained", label: "I lost it, then it all came back" },
      { value: "couldnt_stick", label: "I couldn't stick with it past a few weeks" },
      { value: "barely_lost", label: "I followed it and barely lost anything" },
      { value: "stalled", label: "It worked, then just... stalled" },
    ],
  },
  S10: {
    key: "S10", qid: "D1", type: "single",
    prompt: "On a normal day, what does your eating actually look like?",
    options: [
      { value: "barely_eat", label: "I barely eat, then I'm starving by night" },
      { value: "clean_stuck", label: "I eat pretty clean, but the scale won't budge" },
      { value: "graze", label: "I graze and snack all day without thinking" },
      { value: "night_stress", label: "I'm good all day, then night or stress hits" },
      { value: "weekend", label: "Good all week, then the weekend undoes it" },
    ],
  },
  S12: {
    key: "S12", qid: "D4", type: "single",
    prompt: "When life gets stressful, where does it usually go for you?",
    options: [
      { value: "reach_food", label: "I reach for food, it's my comfort" },
      { value: "stop_caring", label: "I stop taking care of myself" },
      { value: "white_knuckle", label: "I white-knuckle it and burn out" },
      { value: "cope", label: "I've got decent ways to cope" },
    ],
  },
  S13: {
    key: "S13", qid: "D6", type: "single",
    prompt: "When you've gone after this before, were you doing it on your own?",
    options: [
      { value: "always_alone", label: "Always alone, nobody really knew" },
      { value: "had_group", label: "I had a person or group, and it helped" },
      { value: "fizzles", label: "I start with people, but it fizzles out" },
    ],
  },
  S14: {
    key: "S14", qid: "E1", type: "multi",
    prompt: "Which of these sound like you lately? Tap any that fit.",
    options: [
      { value: "belly", label: "Belly fat that won't budge" },
      { value: "bloated", label: "Bloated, puffy, or heavy" },
      { value: "cravings", label: "Cravings I can't control" },
      { value: "exhausted", label: "Exhausted all the time" },
      { value: "brain_fog", label: "Brain fog" },
      { value: "hot_flashes", label: "Hot flashes or night sweats" },
      { value: "lose_but_stomach", label: "I lose it everywhere but my stomach" },
    ],
  },
  S15: {
    key: "S15", qid: "F3q", type: "single",
    prompt: "One honest question, no judgment either way. Are you on, considering, or coming off a weight-loss shot like Ozempic?",
    options: [
      { value: "on_it", label: "I'm on it now" },
      { value: "considering", label: "I'm thinking about it" },
      { value: "came_off", label: "I came off it" },
      { value: "not_for_me", label: "No, not for me" },
    ],
  },
  S16: {
    key: "S16", qid: "G1", type: "single",
    prompt: "Last one, sis, and it matters most. Why does this matter to you right now?",
    options: [
      { value: "energy", label: "I want my energy and confidence back" },
      { value: "myself", label: "I want to feel like myself again" },
      { value: "health", label: "For my health, I'm worried about it" },
      { value: "family", label: "To be around and strong for my family" },
      { value: "moment", label: "There's a moment coming (event, photo, trip)" },
    ],
  },
};

// ── Discovery content ────────────────────────────────────────────────────────
export const DISC_MIDLIFE: string[] = [
  "Here's what almost no one tells you, sis.",
  "Starting around 40, your body quietly changed the rules.",
  "As your hormones shift, you start losing the muscle that keeps your metabolism burning. And fat starts moving to your belly, even if you're eating exactly the same.",
  "So it was never that you got lazy or lost your willpower.",
  "Your old plan just stopped fitting the body you have now.",
];

export const SLIDER_INTRO = "Most women get this one backwards. Let's see.";
export const SLIDER_PROMPT = "How much of weight loss do you think is food vs. exercise?";
export const SLIDER_REVEAL: string[] = [
  "It's about 80% food, 20% exercise.",
  "Even most active women burn under 100 calories a day exercising. That's about 5% of what your body uses. The food on your plate has 20 times more pull on your weight than the gym does.",
  "You can't out-train your fork, sis. Nobody ever showed you the math.",
];

export function discHistory(c2: string): string[] {
  switch (c2) {
    case "regained":
      return [
        "Here's why it keeps coming back, sis. When you lose weight fast, you lose muscle, not just fat.",
        "Then when it returns, it comes back as fat. So every crash-and-regain leaves you a little worse off than you started.",
        "The diet that drops it fastest is the one that sets up the regain.",
        "It was never you failing. It's what fast loss was always going to do.",
      ];
    case "couldnt_stick":
      return [
        "Can I tell you the truth? The women who keep it off don't have more willpower than you.",
        "They have consistency, and consistency comes from the right plan and people around them, not from being a stronger person.",
        "You've been told to white-knuckle something that was never a willpower problem.",
      ];
    case "barely_lost":
      return [
        "Here's what nobody told you. If you're barely losing on very little food, you're often eating too little, and your body has gone into defense mode.",
        "The fix isn't less, it's eating enough of the right things, especially protein, to wake your metabolism back up.",
      ];
    case "stalled":
    default:
      return [
        "That stall is real, and it has a cause. As the body adapts and muscle quietly drops, the old plan stops working and the scale parks.",
        "The way through isn't trying harder at the same thing, it's protecting the muscle that keeps your metabolism up.",
      ];
  }
}

export function discDay(d1: string, gentle: boolean): string[] {
  switch (d1) {
    case "barely_eat":
      return gentle
        ? [
            "Here's the thing almost no one says out loud, said gently: eating too little can be exactly what keeps the weight on.",
            "When you under-eat, your body slows down to protect itself.",
            "This was never a lack of discipline, sis. You've had plenty. It's just been pointed the wrong way.",
          ]
        : [
            "Here's the thing almost no one says out loud: eating too little can be exactly what keeps the weight on.",
            "When you under-eat, your body slows down to protect itself, and then it pushes back hard at night.",
            "It was never a lack of discipline, sis. You've had plenty. It's been pointed the wrong way.",
          ];
    case "clean_stuck":
      return [
        "When you're eating clean and the scale still won't move, the missing piece is usually muscle.",
        "After 40, the muscle that keeps your metabolism burning quietly slips away, and eating clean doesn't replace it.",
        "The shift that works is protecting that muscle, not eating even less.",
      ];
    case "graze":
      return [
        "It's not just how much you're nibbling, sis, it's what.",
        "A lot of everyday snack food is built to make you eat more without ever feeling full.",
        "In one study, people ate about 500 extra calories a day on processed food without realizing it. Same hunger, more calories.",
        "It was the food, not your willpower.",
      ];
    case "night_stress":
      return [
        "Real talk, with love. Reaching for food when you're stressed or wiped out isn't weakness, it's how a lot of us cope.",
        "And here's what's unfair: stress literally turns up the craving and turns down your brakes at the same time.",
        "White-knuckling was never going to win that. There's a better way, and it isn't shame.",
      ];
    case "weekend":
    default:
      return [
        "Here's what I see: you're not failing all week, you're winning all week, and then one weekend unravels it and you start over Monday.",
        "The problem was never the slip. It's that one slip ends the whole thing.",
        "Imagine if a bad day just... didn't.",
      ];
  }
}

export const DISC_UNIVERSAL: string[] = [
  "Here's the truth almost no one in your feed will tell you, sis.",
  "You didn't fail all those diets. They failed you.",
  "You were handed rules that were never going to work, eat less, sweat more, go faster, and then blamed when they didn't.",
  "It was never you. It was the information. And that's the part that changes now.",
];

export const TRUST_LINES: string[] = [
  "Everything you just learned? It's exactly what JJ Smith has taught hundreds of thousands of women.",
  "JJ is a New York Times bestselling author who has helped over 800,000 women through her books and challenges get the truth about their bodies, and their results back.",
  "Now she's doing something she's never done before: walking it day by day, one-on-one, with women who are done doing this alone.",
  "Let's see what your answers actually say.",
];

export const ANALYZING_TICKS: string[] = [
  "What you've tried, and what happened",
  "What your body's doing after 40",
  "The one pattern underneath it all",
];

// ── Diagnoses (S19) ──────────────────────────────────────────────────────────
export const DIAGNOSIS_LINES: Record<ReasonKey, string[]> = {
  R1: [
    "Here's what's actually going on, sis. Your body changed the rules after 40, and nobody handed you the new ones.",
    "You told me the same things stopped working, and that you're carrying it in your middle now. That's the tell.",
    "As your hormones shifted, you started losing the muscle that keeps your metabolism burning, and fat moved to your belly. So the plan that worked at 30 literally can't work on the body you have today.",
    "That's why eating less and doing more just stalled. It was never your discipline. You were using the wrong map.",
    "What your body needs now is to protect and rebuild that muscle, with food and support built for a 40-plus body. There's a clear way through.",
  ],
  R2: [
    "Here's the truth, sis. The reason it keeps coming back harder isn't you failing. It's the cycle.",
    "You told me you've lost it and regained it more than once, and that it comes back faster each time. That's the tell.",
    "Every fast loss costs you muscle, and the regain comes back as fat, so each round leaves you a little worse off and a little harder to budge. You've been running the exact cycle that makes it harder.",
    "That's why the next diet always felt tougher than the last. It was never weakness. It was the math of crash dieting.",
    "What you need is to end the cycle, a pace that protects your muscle instead of stripping it. There's a clear way through, and it can be the last time.",
  ],
  R3: [
    "Here's what I see, and it honestly made my heart hurt a little. You've been working so hard at the wrong thing.",
    "You told me you go hard at the gym, and that you've barely lost for all that effort. That's the tell.",
    "Losing weight is about 80 percent food, and exercise is a small slice. You've been pouring everything into the part that moves the needle least, and blaming yourself when it didn't work.",
    "That's why the workouts never paid off the way they should have. You were never lazy. You were aimed at the wrong target.",
    "What you need is a food-first approach, and movement you'll actually keep, like walking, instead of punishing yourself for results that were never going to come from the gym. There's a clear way through.",
  ],
  R4: [
    "I'm going to tell you something nobody else has, sis. You're not eating too much. You're eating too little.",
    "You told me you barely eat and still can't lose, and that you're starving by night. That's the tell.",
    "When you under-eat for too long, your body slows down to defend itself, and then it pushes back hard, which is the night eating. Your discipline has been incredible. It's just been working against you.",
    "That's why eat less kept failing. It was never a willpower problem. You've had more than enough.",
    "What you need is to eat enough of the right things, especially protein, consistently, so your body stops fighting you. There's a clear way through.",
  ],
  R5: [
    "Here's what's really going on, sis. You don't have a willpower problem. You have an all-or-nothing problem.",
    "You told me you're good until one slip, and then it unravels and you wait for Monday. That's the tell.",
    "You're actually winning most of the time. But one bad day ends the whole thing, so you never get to stack the wins that add up. The slip was never the issue. Quitting after it is.",
    "That's why every restart felt like starting from zero. It was never that you're weak. It's that no one taught you how to not quit.",
    "What you need is a way to get back on track the same day, and someone to catch the slip before it spirals. There's a clear way through, and this part is completely fixable.",
  ],
  R6: [
    "Can I tell you what I really see, sis? You were never weak. You were alone.",
    "You told me you've always done this on your own, and that it fizzles when no one's watching. That's the tell.",
    "The women who keep it off almost never do it alone, not because they're stronger, but because someone in their corner is what keeps them going past the hard week. You've had the will. You've just never had the hand to hold.",
    "That's why it died every time around week two or three. It was never your character. It was the silence.",
    "What you need is daily accountability and women doing it alongside you, so showing up stops being something you carry by yourself. There's a clear way through, and this is the heart of it.",
  ],
  R7: [
    "Here's the honest truth, sis. You did everything you were told. The problem was never you. It was what you were told.",
    "You told me you've tried a little of everything, and that none of it stuck. That's the tell.",
    "Diet after diet, you optimized your whole life around things that simply aren't true, eat less, sweat more, go faster. You followed the instructions perfectly. The instructions were wrong.",
    "That's why failing at all of them was never really failing. You can't win a game with a broken rulebook.",
    "What you need is the handful of things that are actually true, from someone who'll tell you the truth and walk it with you. There's a clear way through.",
  ],
  R8: [
    "Here's something nobody connected for you, sis. You might not be eating too much at all.",
    "You told me you're exhausted and stressed, and that the belly won't budge no matter how clean you eat. That's the tell.",
    "When you're running on empty and stretched thin, your body holds on, especially around the middle, because it thinks you're under threat. This was never just about food.",
    "That's why clean eating alone never cracked it. It was never your effort. Your body's been bracing.",
    "What you need is to address the whole picture, your rest, your stress, the load you carry, not just more dieting, and not alone. There's a clear way through.",
  ],
  R9: [
    "I want to say this gently, sis, because it matters. You are not weak around food.",
    "You told me food is where stress goes, and that the hard nights are when it slips. That's the tell.",
    "Stress literally turns up the craving and turns down your brakes at the same moment, so white-knuckling was never a fair fight. You've been blaming yourself for something that was never a character flaw. It's how a lot of us cope.",
    "That's why just have more willpower never worked. It was the wrong tool for the job.",
    "What you need isn't more rules, it's real tools for the hard moments, and someone in your corner on the nights it's hardest. There's a clear way through, and it isn't shame.",
  ],
};

// ── Offers (S21) ─────────────────────────────────────────────────────────────
export const OFFER_BRIDGE: Record<ReasonKey, string> = {
  R1: "And that is exactly what I built this for, sis. A way of eating and moving made for the body you have now, not the one you had at 30, that protects your muscle and works with your hormones instead of against them. With me checking in on you every day, as someone who gets exactly what your body is doing.",
  R2: "And that is exactly what makes this the last time. A pace that finally protects your muscle instead of stripping it, so the weight that comes off stays off, with me beside you every day so you never have to white-knuckle a restart alone again.",
  R3: "And that is exactly how I do this with you. We put the focus where it actually works, your food, and we let movement you enjoy, like walking, do its part. No more living in the gym for results that were never going to come from there. Just the right plan, and me keeping it simple with you every day.",
  R4: "And that is exactly what I teach you to do. How to eat enough of the right things to lose, not starve your way there, so your body finally stops fighting you. Real food, enough food, and me with you every day so it actually sticks.",
  R5: "And that is the whole heart of what I do with you, sis. I'm not here to make you perfect. I'm here so one bad day doesn't become a bad week. Every single day, I check in, I catch the slip before it spirals, and I keep you going. That's the thing you've never had.",
  R6: "And that is exactly what this is, more than anything else. You, not alone anymore. Me checking in on you every single day, and a whole circle of sisters doing this right alongside you. The thing that was always missing wasn't willpower. It was someone in your corner. Now you've got one.",
  R7: "And that is exactly what I'm here to do. Cut through all the noise and give you the handful of things that are actually true, then walk every day of it with you so you never have to guess again. No more myths. Just the truth, and someone who's got you.",
  R8: "And that is exactly the kind of support this is. We look at the whole picture, your rest, your stress, the weight you're carrying, not just your plate, so your body can finally stop bracing and let go. And you don't carry any of it alone, because I'm with you every day.",
  R9: "And that is exactly what having me with you every day is for, sis. Not another set of rules. Someone in your corner on the hard nights, so you're not facing them alone with only willpower. Real tools, real support, and zero shame. That's how this actually changes.",
};

export const FLAG_MOD = {
  GLP1: "And if you're on the shot or thinking about it, sis, no judgment from me. It can quiet your appetite. It just can't build the habits, protect your muscle, or be in your corner on the hard days. That part is me. And that's the part that makes it last.",
  GLP1_cameoff: "And coming off the shot is exactly when having me with you matters most, sis. That's the moment the weight wants to come back. Let's make sure it doesn't, together.",
  peri: "And everything we do is built for what your body's actually going through right now. You're not fighting your hormones alone anymore.",
  health_why: "And sis, I know this was never really about a number on the scale. It's about your energy, your health, and being here strong for the people who need you. That's worth everything, and it's exactly what this is for.",
  honest_timeline: "Real talk, because you deserve the truth. A goal like yours is likely more than one focused round, done in a way that's safe and actually lasts. But what is two rounds against the rest of your life feeling like yourself? I'll be with you the whole way.",
};

export const CLOSE = {
  promise:
    "Here's my honest promise to you, sis. I'm not promising you'll be perfect. I'm promising I won't let you quit, and I won't let you do this alone. That's 12 Weeks to Sexy.",
  valueStack: [
    "JJ with you, checking in every day",
    "Your personalized jumpstart, your fast first win",
    "The plan built for your body and your diagnosis",
    "The Eating-Out and Family-Meals Playbook",
    "The Recipe Vault",
    "The Circle of Sisters",
  ],
  jumpstart: "We start with a personalized jumpstart, so you feel it move in the first days, not the first month.",
  guarantee: "Try it for 14 days. If it's not for you, you get your money back. Simple.",
  scarcity: "JJ takes women in small founding groups, so each start date is limited. When the spots are gone, they're gone.",
  ask: "Here's what I'd do if I were you, sis. Let's do this together.",
};

// ── Scoring ──────────────────────────────────────────────────────────────────
function add(s: State, r: ReasonKey, n: number) {
  s.reasonScores[r] += n;
  s._tick += 1;
  s.lastTouch[r] = s._tick;
}

const asArray = (v: string | string[]) => (Array.isArray(v) ? v : [v]);

/** Apply an answer to the state. Returns a new state object. */
export function scoreAnswer(prev: State, qid: string, value: string | string[]): State {
  const s: State = structuredClone(prev);
  s.answers[qid] = value;

  switch (qid) {
    case "A1": {
      s.goal = value as string;
      if (value === "30_50" || value === "more_50") s.flags.FLAG_goalBig = true;
      break;
    }
    case "F1q": {
      if (value === "40s" || value === "50s" || value === "60plus") s.flags.FLAG_40plus = true;
      if (value === "40s" || value === "50s") add(s, "R1", 1);
      break;
    }
    case "F2q": {
      const v = asArray(value);
      const sym = v.filter((x) => x !== "none");
      if (sym.length >= 1) {
        add(s, "R1", 2);
        s.flags.FLAG_peri = true;
      }
      if (sym.length >= 2) add(s, "R1", 1);
      break;
    }
    case "B1": {
      if (value === "mostly_exercise") {
        add(s, "R3", 2);
        add(s, "R7", 1);
        s.beliefsSurfaced.push("exercise>food");
      } else if (value === "fifty") {
        add(s, "R3", 1);
        add(s, "R7", 1);
        s.beliefsSurfaced.push("50/50");
      } else if (value === "no_idea") {
        add(s, "R7", 1);
      }
      break;
    }
    case "C1": {
      const v = asArray(value);
      if (v.includes("gym")) add(s, "R3", 1);
      if (v.includes("fasting")) add(s, "R4", 1);
      if (v.includes("shot")) s.flags.FLAG_GLP1 = true;
      if (v.includes("everything")) {
        add(s, "R7", 1);
        add(s, "R5", 1);
      }
      if (v.filter((x) => x !== "everything").length >= 3) add(s, "R7", 1);
      break;
    }
    case "C2": {
      if (value === "regained") {
        add(s, "R2", 2);
        add(s, "R7", 1);
      } else if (value === "couldnt_stick") {
        add(s, "R5", 2);
        add(s, "R6", 1);
      } else if (value === "barely_lost") {
        add(s, "R4", 1);
        add(s, "R1", 1);
      } else if (value === "stalled") {
        add(s, "R4", 1);
        add(s, "R1", 1);
      }
      break;
    }
    case "D1": {
      if (value === "barely_eat") {
        add(s, "R4", 2);
        add(s, "R9", 1);
        // ED candidate: barely-eat + restriction signal elsewhere
        const tried = asArray(s.answers["C1"] ?? []);
        if (tried.includes("fasting") || s.goal === "under_15") s.flags.FLAG_ED_watch = true;
      } else if (value === "clean_stuck") {
        add(s, "R1", 2);
        add(s, "R4", 1);
      } else if (value === "graze") {
        add(s, "R4", 1);
        add(s, "R9", 1);
      } else if (value === "night_stress") {
        add(s, "R9", 2);
        add(s, "R8", 1);
      } else if (value === "weekend") {
        add(s, "R5", 2);
      }
      break;
    }
    case "D4": {
      if (value === "reach_food") {
        add(s, "R9", 2);
        add(s, "R8", 1);
        if (s.answers["D1"] === "barely_eat") s.flags.FLAG_ED_watch = true;
      } else if (value === "stop_caring") {
        add(s, "R9", 1);
        add(s, "R6", 1);
      } else if (value === "white_knuckle") {
        add(s, "R8", 1);
        add(s, "R5", 1);
      }
      break;
    }
    case "D6": {
      if (value === "always_alone") add(s, "R6", 2);
      else if (value === "fizzles") {
        add(s, "R6", 1);
        add(s, "R5", 1);
      } else if (value === "had_group") add(s, "R6", 1);
      break;
    }
    case "E1": {
      const v = asArray(value);
      if (v.includes("belly") || v.includes("lose_but_stomach")) {
        add(s, "R1", 1);
        add(s, "R8", 1);
      }
      if (v.includes("bloated")) add(s, "R7", 1);
      if (v.includes("cravings")) add(s, "R4", 1);
      if (v.includes("exhausted") || v.includes("brain_fog")) {
        add(s, "R8", 1);
        add(s, "R1", 1);
      }
      if (v.includes("hot_flashes")) {
        add(s, "R1", 2);
        s.flags.FLAG_peri = true;
      }
      break;
    }
    case "F3q": {
      if (value === "on_it" || value === "considering" || value === "came_off") s.flags.FLAG_GLP1 = true;
      if (value === "came_off") {
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

// ── Flow / skip logic ────────────────────────────────────────────────────────
// Diagnosis reveal removed. After the value-building quiz + trust beat, we
// gate the payoff behind email: name -> build -> email -> plan -> offer.
export const ORDER = [
  "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10",
  "S11", "S12", "S13", "S14", "S15", "S16", "UNIV", "S17", "NAME", "BUILD", "EMAIL", "PLAN", "OFFER",
] as const;

export function isShown(key: string, s: State): boolean {
  switch (key) {
    case "S3":
      return s.flags.FLAG_40plus;
    case "S4":
      return s.flags.FLAG_40plus || s.flags.FLAG_peri;
    case "S6":
      return s.answers["B1"] !== undefined && s.answers["B1"] !== "mostly_food";
    case "UNIV": {
      // Minimum-3-discoveries guarantee. S9 + S11 always fire (2). Add a
      // universal flip only when both S4 and S6 were skipped.
      const fired = 2 + (isShown("S4", s) ? 1 : 0) + (isShown("S6", s) ? 1 : 0);
      return fired < 3;
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

// ── Resolution ───────────────────────────────────────────────────────────────
export type Resolution = {
  primary: ReasonKey;
  contributing: ReasonKey | null;
  edMode: boolean;
};

const R7_MARGIN = 2;

export function resolve(s: State): Resolution {
  const reasons = Object.keys(s.reasonScores) as ReasonKey[];
  const score = (r: ReasonKey) => s.reasonScores[r];

  const ranked = [...reasons].sort((a, b) => {
    if (score(b) !== score(a)) return score(b) - score(a);
    return s.lastTouch[b] - s.lastTouch[a]; // recency tie-break
  });

  let primary = ranked[0];
  // R7 suppression: not primary unless it clears the field by a margin.
  if (primary === "R7") {
    const second = ranked[1];
    if (score("R7") - score(second) < R7_MARGIN) {
      primary = ranked.find((r) => r !== "R7") ?? "R7";
    }
  }
  // Fallback if everything is zero: lead with the midlife shift (the hook).
  if (score(primary) === 0) primary = s.flags.FLAG_40plus ? "R1" : "R6";

  const contributing = ranked.find((r) => r !== primary && score(r) > 0) ?? null;

  return { primary, contributing, edMode: s.flags.FLAG_ED_watch };
}

// ── Events (lightweight; dataLayer stub, tagged with the angle) ───────────────
export const ANGLE = "belly-after-40";

export function track(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, angle: ANGLE, ...payload });
}
