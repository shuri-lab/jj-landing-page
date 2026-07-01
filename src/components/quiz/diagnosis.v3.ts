/**
 * Diagnosis composition engine (v3) — Yobody / JJ Smith Edition.
 *
 * Implements `diagnosis-design.md` + `quiz-01-harder-after-40-v3.md` §6/§7:
 * the diagnosis is COMPOSED from her actual answers, not looked up. Assembly
 * order (design §2 / spec §6.0):
 *   Mirror -> Pattern -> Aha -> Reframe -> Contributing weave -> Consequence
 *   -> Turn (goal-aware, flag overrides, conditional hope).
 *
 * Honesty guardrails (design §8): honest flagged mechanisms only (R2 no
 * permanent-damage, R4 no "starvation mode", R8 hormone-agnostic), no selling
 * inside the diagnosis, ED-watch compassion mode overrides. No "sis" in the
 * diagnosis copy. No em dashes anywhere.
 *
 * This module also holds the result-gate essences, the Solution personalization
 * map (§7.1), and the Offer content (§7) the tail screens consume.
 */

import type { ReasonKey, State, Resolution } from "./quiz01.v3";

const asArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

// ── The nine reason cores (design §3, honest flagged versions) ────────────────
type Core = {
  patternShort: string; // "the fast-loss cycle" (folded into the Pattern beat)
  essence: string; // free one-liner shown at the result gate
  aha: string;
  reframe: string;
  turn: string;
  closingSensation: string;
};

const CORES: Record<ReasonKey, Core> = {
  R1: {
    patternShort: "the midlife shift",
    essence: "Your body changed the rules after 40, and no one handed you the new ones.",
    aha: "Most women are told their metabolism slowed down, which sounds vague and permanent. Here is what actually happened, and it is two separate things wearing one disguise. Starting in your 40s you began losing muscle, the tissue that burns energy all day, so your body burns less even while you sleep, even eating exactly what you always did. And as estrogen drops, your body relocates fat to your middle, so the belly is often not new fat, it is the same fat moving.",
    reframe: "You did not get lazy or lose your discipline. Your body quietly changed underneath you, and the plan you were handed was built for a body you no longer have.",
    turn: "The fix is not eating less and doing more cardio, which costs you more of the muscle you cannot afford to lose. It is protecting and rebuilding that muscle, eating enough protein, and working with your hormones instead of against them.",
    closingSensation: "relief and permission",
  },
  R2: {
    patternShort: "the fast-loss cycle",
    essence: "It is not that the weight comes back. It is how it comes back.",
    aha: "Here is the part the scale never showed you. When you lose weight fast, you do not only lose fat, you lose muscle along with it. But when the weight finds its way back, it tends to come back mostly as fat. So round after round, if you were never training to hold onto it, you can end up with a little less muscle than you had before, and muscle is the tissue that keeps you burning through the day. That is a big part of why each attempt can feel harder than the last, and why the fast diet that works quickest is so often the one that sets up the next regain.",
    reframe: "So when anyone tells you that you just have to keep it off this time, they are skipping the part that matters. Fast loss itself, without protecting your muscle, is part of why it keeps coming back. It was never a shortage of willpower. It was the method.",
    turn: "The way out is not another fast round. It is one round done differently, slow enough and supported enough to hold onto your muscle this time, so more of what you lose is actually fat, and more of it actually stays gone.",
    closingSensation: "clarity and resolve",
  },
  R3: {
    patternShort: "a fight on the wrong front, out-exercising your plate",
    essence: "You have been pouring real effort into the one lever that moves the scale least.",
    aha: "You already know exercise matters, so the usual line about it being 80 percent food lands as a shrug. Here is the part that actually stings. For a lot of people, hard exercise quietly works against the scale. It can drive your appetite up, so you eat a little more without noticing, and it can leave you so wiped that you move less the rest of the day, also without noticing. So the punishing workouts were often not just the wrong tool, they were partly canceling themselves out.",
    reframe: "You were never lazy or inconsistent. You were sold a story that sweat equals weight loss, and you believed it and worked harder than most people ever would, aimed at the wrong target.",
    turn: "The relief is that the answer asks less of you, not more. Lead with your food, where the results actually live, and let movement you enjoy support it instead of punish you. You get to leave the war you could not win.",
    closingSensation: "relief that it can be easier",
  },
  R4: {
    patternShort: "the restriction trap",
    essence: "You are not eating too much. You have been eating too little, and it keeps backfiring.",
    aha: "This is the one almost no one sees, because it is the opposite of everything you have been told. When you hold yourself to very little for too long, two things happen. Your body adapts a little, settling in to run on less, so the scale stalls even though you are barely eating. And then, almost every time, the restriction snaps back on you: the barely-eating all day becomes the ravenous, out-of-control evening, because a body kept too hungry for too long eventually takes the wheel. That is not weak willpower at night. It is the completely predictable rebound to being too restricted by day.",
    reframe: "Your discipline was never the problem. It has been real, and relentless, and pointed in exactly the wrong direction. You were told the answer was less, and you did less better than almost anyone.",
    turn: "The fix feels wrong until it works: eat enough of the right food, steadily, especially protein, so the day is not one long deprivation the night has to correct. More structure, not more restriction.",
    closingSensation: "a stunned unlock",
  },
  R5: {
    patternShort: "an all-or-nothing pattern",
    essence: "You do not have a willpower problem. You have an all-or-nothing problem.",
    aha: "Look at the real math, because it will change how you see every attempt you called a failure. One slip, a single big meal, is almost nothing. It could never undo your week. What undid your week was not the slip, it was the thought that followed it: I blew it, might as well. That one thought turned a five-minute slip into a lost weekend, into I will start Monday, into three weeks off. The damage was never in the food. It was in the days of quitting the slip triggered.",
    reframe: "Which means you were never weak, and you were never inconsistent by nature. You are actually one of the most disciplined people you know, right up until one imperfect moment flips a switch that no one ever taught you how to turn off.",
    turn: "The fix is not more willpower or a stricter plan. It is a way to have a bad day and simply keep going, so your effort finally stacks instead of resetting. A woman who is 80 percent consistent forever beats a woman who is 100 percent then 0 percent, by a mile, every time.",
    closingSensation: "self-forgiveness",
  },
  R6: {
    patternShort: "doing this without anyone in your corner",
    essence: "You were never weak. You were doing it without anyone in your corner.",
    aha: "Here is what the research on people who actually keep the weight off keeps finding, and it is not what you would guess. The biggest predictor is not the diet they chose, it is whether someone was in their corner holding them accountable. Willpower is not a character trait, it is a fuel tank, and it drains a little every day, which is exactly why every attempt died around week two or three when the tank ran dry. Someone checking on you does what willpower cannot: it outsources the effort so you do not have to generate it alone every single morning.",
    reframe: "You quit when no one was watching because that is what almost everyone does alone. It was never a flaw in you. It was a missing piece outside you.",
    turn: "The fix is not becoming a more disciplined person. It is never having to do the hard part alone again: daily support and people on the same climb, the one thing that carries you through the weeks willpower cannot.",
    closingSensation: "being seen and less alone",
  },
  R7: {
    patternShort: "years of following the wrong rules",
    essence: "You did everything you were told. You were told wrong.",
    aha: "Sit with this, because it reframes years of your life. You are not a person who fails at diets. You are a smart, disciplined person who was handed broken instructions by an industry that profits when you regain. The reason you got contradictory advice, eat this, never that, this is the secret, no this is, is that most of it was built to sell, not to work. And here is the tell that proves it was never you: a disciplined person following bad instructions gets bad results, every time. The fact that you tried so many things and none of them held is not evidence that you are broken. It is evidence the information is.",
    reframe: "So every failure was garbage instructions in, garbage results out. That is not the same as failing. You cannot win a game whose rulebook was wrong.",
    turn: "The fix is almost embarrassingly simple after all the noise: the handful of things that are actually true, from someone with no reason to sell you the next myth, who stays with you while you unlearn the old ones.",
    closingSensation: "vindication",
  },
  R8: {
    patternShort: "a body carrying too much stress",
    essence: "This was never only about food. Your body has been bracing.",
    aha: "Here is a connection no one drew for you. When you are running on too little sleep and too much stress, month after month, two things happen that have nothing to do with how disciplined you are. First, you reliably eat more, especially the quick-energy carbs, often without fully clocking it, because a tired, stretched body reaches for fast fuel. Second, women carrying chronic stress and short sleep tend to hold more weight around the middle. It is not one clean hormone switch, whatever the internet told you. It is your whole system, run down and bracing, making the belly the last place anything wants to leave.",
    reframe: "Which means the times you did everything right and it still would not move were not failures. You were trying to out-discipline a body that was worn thin and holding on, and no amount of clean eating fixes a body that is running on empty.",
    turn: "The fix is to ease the load your body is bracing against, your sleep, your stress, the weight you carry, right alongside your food, so it finally has room to let go. And you should not have to carry any of it, or fix it, alone.",
    closingSensation: "permission to rest",
  },
  R9: {
    patternShort: "food becoming how you cope with a hard day",
    essence: "It was never weak willpower. It is how you have coped with a hard day.",
    aha: "Here is why just do not eat it has never once worked for you, and it is not a character flaw. In a moment of real stress or exhaustion, the part of you that made the plan and knows better gets quiet, and the part that just wants to feel better right now takes over, and it has learned that food is the fastest relief it knows. So at the exact moment you needed willpower most, the part of you that produces it had already checked out. You have been trying to out-think a feeling, and feelings do not answer to a to-do list.",
    reframe: "So all those nights you gave in, you were not failing at self-control. You were a human being reaching for the fastest relief available, exactly as your brain is wired to. The shame you carried was for something that was never a character flaw.",
    turn: "The fix is not another rule to break. It is real support for the hard moments and gentler ways to meet them, so that when the craving comes, you are not facing it alone with only a rule. When the hard nights are covered, the eating that came with them tends to settle on its own.",
    closingSensation: "compassion and relief",
  },
};

// ── The Mirror (design §4a) ───────────────────────────────────────────────────
const TRIED_FRAGMENT: Record<string, string> = {
  keto: "done keto",
  calories: "counted every calorie",
  gym: "gone hard at the gym",
  fasting: "skipped meals and fasted",
  shakes: "done the shakes and cleanses",
  ww: "done Weight Watchers",
  shot: "even looked at the shot",
  everything: "tried a little of everything, honestly",
};

const HAPPENED_FRAGMENT: Record<string, string> = {
  regained: "And every time, you lost it, and it found its way back.",
  couldnt_stick: "And you could not make it stick past a few weeks.",
  barely_lost: "And you followed it closely, and the scale barely moved.",
  stalled: "And it worked, until it just stopped.",
};

const DAY_FRAGMENT: Record<string, string> = {
  barely_eat: "Most days you barely eat, and then you are starving by night.",
  clean_stuck: "You eat clean now, and the scale ignores you.",
  graze: "You graze through the day without really thinking about it.",
  night_stress: "You hold it together all day, and the nights undo you.",
  weekend: "You are good all week, and the weekend erases it.",
};

const ALONE_TENDER: Record<string, string> = {
  always_alone: "And you have carried most of it by yourself.",
  fizzles: "And you start with people, then find yourself on your own again.",
};

function buildMirror(s: State): string {
  const tried = asArray(s.answers["C1"]);
  const happened = s.answers["C2"] as string | undefined;
  const day = s.answers["D1"] as string | undefined;
  const alone = s.answers["D6"] as string | undefined;

  const parts: string[] = [];

  // Behavior first: what she tried (up to 2 fragments, or the "everything" line).
  const triedOrder = ["keto", "calories", "gym", "fasting", "shakes", "ww"];
  if (tried.includes("everything")) {
    parts.push("You have tried a little of everything, honestly.");
  } else {
    const picked = triedOrder.filter((t) => tried.includes(t)).slice(0, 2);
    if (picked.length) {
      parts.push("You have " + picked.map((t) => TRIED_FRAGMENT[t]).join(". You have ") + ".");
    }
  }

  // What happened.
  if (happened && HAPPENED_FRAGMENT[happened]) parts.push(HAPPENED_FRAGMENT[happened]);

  // A normal day (the felt behavior).
  if (day && DAY_FRAGMENT[day]) parts.push(DAY_FRAGMENT[day]);

  // End on the tenderest: carrying it alone.
  if (alone && ALONE_TENDER[alone]) parts.push(ALONE_TENDER[alone]);

  // Safety net if she was guarded everywhere.
  if (parts.length === 0) parts.push("You told me you have tried, and that it has not worked the way it should have.");

  return parts.join(" ");
}

// ── Contributing weave (spec §6.3) ────────────────────────────────────────────
const BESPOKE_WEAVE: Record<string, string> = {
  "R2+R6": "And you ran the whole cycle alone, so there was never anyone to catch the rebound before it took hold. The cycle and the silence fed each other.",
  "R2+R7": "And each of those diets was a different promise that ended the same way, which is not five failures, it is one broken cycle sold to you five different ways.",
  "R5+R6": "And with no one beside you, there was no one to interrupt the spiral after a slip, so one bad day always got to become three lost weeks.",
  "R5+R7": "And every perfect plan you were sold set a bar so high that the fall was built in. The all-or-nothing was baked into the rules you were handed.",
  "R1+R2": "And the years of fast cycles cost you muscle right as your body was already losing it to midlife, so two forces pulled the same direction.",
  "R4+R8": "And you were doing all that under-eating while running on empty, asking a depleted body to give up more, which it was never going to do.",
  "R9+R5": "And a hard-night slip did not stay one night. The all-or-nothing turned it into I blew it, so the comfort eating and the spiral kept triggering each other.",
  "R9+R6": "And you have faced the hard nights alone, which is the exact moment support matters most and you have never had it.",
  "R6+R9": "And you have faced the hard nights alone, which is the exact moment support matters most and you have never had it.",
  "R8+R1": "And the midlife shift and the stress have been pulling together on the same stubborn belly, which is why nothing aimed at just one of them worked.",
  "R3+R4": "And you were doing all that exercise on too little food, the worst possible pairing, burning hard while giving your body too little to work with.",
};

const GENERIC_WEAVE: Record<ReasonKey, string> = {
  R1: "And your body moving into a new season only made the old approach fit less.",
  R2: "And the losing-and-regaining underneath it made each round a little harder.",
  R3: "And leaning on exercise to fix it sent your effort where it pays back least.",
  R4: "And eating less than your body needed quietly worked against you the whole time.",
  R5: "And the all-or-nothing pattern ended more attempts than it ever should have.",
  R6: "And you have carried most of it alone, which is usually where it comes undone.",
  R7: "And a lot of what you were taught along the way simply was not true.",
  R8: "And the stress and exhaustion you have carried kept your body holding on.",
  R9: "And food being how you got through the hard days is human, and fixable.",
};

function buildWeave(primary: ReasonKey, contributing: ReasonKey | null): string {
  if (!contributing) return "";
  return BESPOKE_WEAVE[`${primary}+${contributing}`] ?? GENERIC_WEAVE[contributing];
}

// ── Consequence connectors (spec §6.4 / design §4b) ───────────────────────────
// For each primary, sentences keyed by an answer token; fire the matching ones.
function consequenceConnectors(primary: ReasonKey, contributing: ReasonKey | null, s: State): string[] {
  const tried = asArray(s.answers["C1"]);
  const happened = s.answers["C2"] as string | undefined;
  const day = s.answers["D1"] as string | undefined;
  const stress = s.answers["D4"] as string | undefined;
  const symptoms = asArray(s.answers["E1"]);
  const out: string[] = [];
  const triedCount = tried.filter((t) => t !== "everything").length + (tried.includes("everything") ? 1 : 0);

  const push = (cond: boolean, line: string) => {
    if (cond && out.length < 3) out.push(line);
  };

  switch (primary) {
    case "R2":
      push(day === "clean_stuck", "It is exactly why eating clean stopped working. The food was never the piece that slipped.");
      // Skip the "one cycle run many times" connector when the bespoke R2+R7
      // weave already made that point (avoid saying it twice).
      push(contributing !== "R7" && tried.some((t) => ["keto", "ww", "everything", "calories"].includes(t)), "Keto, the counting, all of it, each one worked and then rebounded, which was never five separate failures, it was one cycle run five times.");
      push(stress === "white_knuckle", "And running each attempt while burning out only made the rebound more certain.");
      push(tried.includes("gym"), "And the hard workouts cost you more of the muscle the cycle was already taking.");
      break;
    case "R4":
      push(happened === "barely_lost", "It is the whole reason you followed a plan closely and the scale barely moved.");
      push(day === "barely_eat", "The starving-by-night is the tell, a debt you ran up all day.");
      push(symptoms.includes("cravings"), "And the cravings you can't control are not weakness, they are the alarm.");
      push(tried.includes("fasting"), "The fasting was the restriction your body kept correcting for.");
      break;
    case "R8":
      push(day === "clean_stuck", "That is why clean eating never cracked the belly.");
      push(symptoms.includes("exhausted") || symptoms.includes("brain_fog"), "The exhaustion and the fog are part of the same story, a run-down body holding on to everything.");
      push(stress === "white_knuckle", "You have been burning out and dieting at the same time, signaling danger to your body while asking it to let go.");
      push(symptoms.includes("belly"), "The belly that will not move is the loudest sign of it.");
      break;
    case "R5":
      push(day === "weekend", "The weekend is the whole pattern in miniature, five good days a single slip erases.");
      push(happened === "couldnt_stick", "It is why nothing stuck past a few weeks, the first imperfect day ended the whole thing.");
      push(tried.includes("everything"), "Every new diet was a fresh start after the last slip. You do not need another one.");
      break;
    case "R6":
      push(happened === "couldnt_stick", "Week two or three, when the newness wore off and no one was watching, is exactly when the tank ran dry.");
      push(stress === "stop_caring", "And when life got hard with no one in your corner, you were the first thing off your own list.");
      push(s.answers["D6"] === "fizzles", "You start with people and end alone, which is right when it always falls apart.");
      break;
    case "R3":
      push(tried.includes("gym"), "All those hard sessions were the effort of someone who refused to quit, spent where it pays back least.");
      push(happened === "barely_lost", "It is why you barely lost despite working so hard.");
      push(day === "clean_stuck", "You had the food closer to right than you think. The punishing exercise was the misfire.");
      break;
    case "R1":
      push(happened === "stalled", "The stall was your old plan meeting your new body, and losing.");
      push(day === "clean_stuck", "Food was never the lever that slipped. The muscle was.");
      push(symptoms.includes("lose_but_stomach"), "Losing it everywhere but the middle is the midlife shift with your name on it.");
      break;
    case "R9":
      push(day === "night_stress", "The nights are where you see it clearest, the plan-making part of you clocks out right when you need it most.");
      push(stress === "reach_food", "Food being where you go is the signal that the hard moments were never covered.");
      push(symptoms.includes("cravings"), "And the cravings are that same pull, not a flaw.");
      break;
    case "R7":
      push(triedCount >= 3, "The sheer number of things you tried is a receipt for the bad advice, not a list of your failures.");
      push(happened === "regained", "Each one worked briefly and rebounded because each was built to sell a result, not to keep it.");
      push(symptoms.includes("bloated"), "Even the bloat you were sold a supplement for was usually just the wrong foods.");
      break;
  }
  return out;
}

// ── The Pattern beat (confidence-aware, §6.1) ─────────────────────────────────
function buildPattern(core: Core, res: Resolution): string {
  if (res.confidence === "near_tie") {
    return "Your pattern is really two things pulling together, which is why nothing aimed at just one of them has worked.";
  }
  if (res.confidence === "low_signal") {
    return `Here is the thread I can see in what you told me. It points to ${core.patternShort}, and it is worth looking at honestly.`;
  }
  return `Here is the pattern underneath all of it. You are not failing at weight loss. You are caught in ${core.patternShort}.`;
}

// ── Flag / goal / hope addenda to the Turn ────────────────────────────────────
const PERI_WEAVE =
  "And with the hot flashes you told me about, your body is also moving into a new season, which pulls in the very same direction: less of the muscle that keeps you burning, and more settling at your middle.";

function turnAddenda(s: State, res: Resolution): string[] {
  const add: string[] = [];
  const age = s.answers["F1q"] as string | undefined;

  // ED-watch compassion mode: soften, encourage real support (design §6.5).
  if (res.edMode) {
    add.push("This is gentler than what you have been doing to yourself, not harder. And it is not something you should have to figure out alone.");
  }

  // GLP-1 grace-first.
  if (s.flags.FLAG_GLP1) {
    add.push("And if you are on the shot, or thinking about it, there is no judgment here. It can quiet your appetite. It cannot build the habits or be in your corner on the hard days. That part is the work, and it is the part that lasts.");
  }
  if (s.flags.FLAG_GLP1_cameoff) {
    add.push("Coming off it is exactly when the muscle-protecting, supported version matters most.");
  }

  // Health / family why.
  if (s.flags.FLAG_health_why) {
    add.push("And since you told me this is about your health and the people who need you, that matters more than any number. This is about your energy, and being here strong for them.");
  }

  // Goal-aware honest timeline (also seeds "hard to do alone").
  if (s.flags.FLAG_goalBig) {
    add.push("A goal like yours is likely more than one focused stretch, done in a way that lasts, and that part is genuinely hard to do alone, which is exactly why it kept slipping. It does not have to be alone this time.");
  } else if (!res.edMode) {
    add.push("This part is real, and it is genuinely hard to do on your own. It does not have to be alone this time.");
  }

  // Conditional hope (§6c): older, or "don't feel like me".
  if (age === "50s" || age === "60plus" || s.goal === "not_sure") {
    add.push("And your 40s and 50s can absolutely be your strongest chapter. The fact that nothing worked before was never proof that nothing will.");
  }

  return add;
}

// ── The public composition ────────────────────────────────────────────────────
// Each beat carries a `kind` so the UI can give it a labeled header, an icon,
// and the right emphasis (the pattern and the turn are the pivots). The text
// itself is unchanged; only the structure around it is.
export type SectionKind = "mirror" | "pattern" | "aha" | "reframe" | "weave" | "consequence" | "turn";
export type DiagnosisSection = { kind: SectionKind; text: string };

export type ComposedDiagnosis = {
  title: string;
  sections: DiagnosisSection[];
  closingSensation: string;
};

export function composeDiagnosis(s: State, res: Resolution): ComposedDiagnosis {
  const core = CORES[res.primary];
  const name = s.name?.trim();

  const sections: DiagnosisSection[] = [];

  // 1. Mirror.
  sections.push({ kind: "mirror", text: buildMirror(s) });

  // 2. Pattern.
  sections.push({ kind: "pattern", text: buildPattern(core, res) });

  // 3. Aha (+ peri weave when peri and primary is not already midlife).
  let aha = core.aha;
  if (s.flags.FLAG_peri && res.primary !== "R1") aha = `${aha} ${PERI_WEAVE}`;
  sections.push({ kind: "aha", text: aha });

  // 4. Reframe.
  sections.push({ kind: "reframe", text: core.reframe });

  // 5. Contributing weave (given more room on a near-tie by leading the paragraph).
  const weave = buildWeave(res.primary, res.contributing);
  if (weave) sections.push({ kind: "weave", text: weave });

  // 6. Her Consequence.
  const connectors = consequenceConnectors(res.primary, res.contributing, s);
  if (connectors.length) sections.push({ kind: "consequence", text: connectors.join(" ") });

  // 7. The Turn (+ addenda).
  const addenda = turnAddenda(s, res);
  sections.push({ kind: "turn", text: [core.turn, ...addenda].join(" ") });

  return {
    title: name ? `${name}, here is what is really going on.` : "Here is what is really going on.",
    sections,
    closingSensation: core.closingSensation,
  };
}

// ── Result gate content (spec §16) ────────────────────────────────────────────
export function gatePattern(res: Resolution): { name: string; essence: string } {
  return { name: CORES[res.primary].patternShort, essence: CORES[res.primary].essence };
}

export const GATE_REVEALS = [
  "What's really driving it",
  "Why the things you've tried haven't worked",
  "What actually works for your pattern",
];

// ── Solution personalization map (spec §7.1) ──────────────────────────────────
// Component keys map to the six inclusions rendered on the Solution screen.
export type ComponentKey = "weeklyCall" | "dailyCheckin" | "meals" | "plan" | "playbook" | "sisters";

export const SOLUTION_LINES: Record<ReasonKey, Partial<Record<ComponentKey, string>>> = {
  R1: {
    plan: "Built for the body you have now, your hormones, your muscle, your real schedule, not the plan that stopped fitting years ago.",
    meals: "Enough protein to protect the muscle that keeps your metabolism up, the piece the old plans ignored.",
  },
  R2: {
    plan: "This time we go at a pace that protects your muscle, so the weight that comes off actually stays off. No more crash and rebound.",
  },
  R3: {
    meals: "We put the focus where it actually works, your food, and let movement you enjoy support it. You get to stop punishing yourself in the gym.",
    weeklyCall: "No more guessing or grinding. You always know the few things that actually move the scale.",
  },
  R4: {
    meals: "Real food, enough food. We are done with barely eating and paying for it at night. You will eat to lose, not to starve.",
    plan: "Built to feed you properly, especially protein, so your body stops fighting you.",
  },
  R5: {
    dailyCheckin: "This is how one bad day stops becoming a bad week. I catch the slip before it spirals, the exact thing that has ended every attempt.",
    weeklyCall: "No more waiting for Monday. Every week we just keep going, so your effort finally stacks instead of resetting.",
  },
  R6: {
    weeklyCall: "This is the piece you have never had. Every week it is you and me, so you are finally not doing the hard part alone.",
    dailyCheckin: "The reason it always fell apart around week two was that no one was watching. Now someone is, every morning.",
    sisters: "You have carried this by yourself. Not anymore. You are surrounded by women on the same climb.",
  },
  R7: {
    weeklyCall: "Finally, the few things that are actually true, and someone with no reason to sell you the next myth, walking it with you.",
  },
  R8: {
    dailyCheckin: "We look at the whole picture, your rest, your stress, the load you carry, not just your plate, so your body can finally stop bracing.",
    plan: "Built to work with a full, tired life, not add one more pressure to it.",
  },
  R9: {
    dailyCheckin: "Someone in your corner on the hard nights, so the tough moments are covered instead of faced alone with only willpower.",
    weeklyCall: "Real support and gentler ways through the hard days, not another rule to break.",
  },
};

export function solutionFlagLines(s: State): { plan?: string; header?: string; goalNote?: string } {
  const out: { plan?: string; header?: string; goalNote?: string } = {};
  if (s.flags.FLAG_GLP1) out.plan = "And if you are on the shot, this is the part it cannot do, the habits, the muscle, the person in your corner. That is what makes it last.";
  if (s.flags.FLAG_health_why) out.header = "This was never only about a number. It is about your energy and being here strong for the people who need you.";
  if (s.flags.FLAG_goalBig) out.goalNote = "A goal like yours is likely more than one focused stretch, done in a way that lasts. We start now, and I am with you the whole way.";
  return out;
}

// ── Offer content (spec §7, pending TJ's final numbers) ───────────────────────
// NOTE: value-stack numbers and the anchor are placeholders pending TJ.
export const VALUE_STACK = [
  { label: "Weekly 1 on 1 coaching with JJ", value: 1200 },
  { label: "Daily check ins from JJ", value: 400 },
  { label: "Your done for you meal plan", value: 300 },
  { label: "A plan for your body and your life", value: 200 },
  { label: "The eating out and family meals playbook", value: 150 },
  { label: "Your jumpstart", value: 97 },
  { label: "The recipe vault", value: 97 },
  { label: "The circle of sisters", value: 200 },
];
export const VALUE_TOTAL = 2650;

// Offer copy (spec §7, "sis"/"sister" removed per §0 / §7 note).
export const OFFER_COPY = {
  eyebrow: "Your plan is ready",
  startNow: "The moment you say yes, we book your first call with me and your 12 weeks begin. You are not waiting for Monday. We start now.",
  scarcity: "This is a founding price for a small group, and this start date is filling up. When the spots are gone, they are gone, and this price goes with them.",
  guarantee: "I need you to be confident this is right for you. If you are not thrilled within 14 days, I want to send your money back. No reason needed. That is my promise.",
  monthsAhead: "The months ahead are happening either way. You can spend them like the last ones. Or you can spend them with me right there with you, and come out the other side feeling like yourself again.",
};

export const FAQ_ITEMS = [
  { q: "I'm in my 50s and nothing has ever worked.", a: "That is exactly who this is built for. The plan is made for a body in this season, and you are not doing it on your own this time." },
  { q: "I don't have much time, between work and everyone else.", a: "The plan is built around your real schedule. The meals are planned for you, and the daily check-ins keep it simple." },
  { q: "Do I have to drink green smoothies?", a: "No. You keep the food you love. The plan works around your life, not against it." },
  { q: "What makes this different from everything else?", a: "Everything else handed you a plan and left. Here, I am with you every day, one on one, for twelve weeks." },
  { q: "What if I miss this start date?", a: "This is a founding group at a founding price. When the spots are gone, the price goes with them." },
];
