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
    aha: "Most women are told their metabolism just slowed down. Here is what actually happened, and it is two things wearing one disguise. After 40 you started losing muscle, the tissue that burns energy all day, so you burn less even in your sleep, eating exactly what you always did. And as estrogen drops, your body moves fat to your middle, so the belly is often not new fat, it is the same fat relocating.",
    reframe: "You did not get lazy. Your body changed the rules underneath you, and the plan you were handed was built for a body you no longer have.",
    turn: "The fix is not eating less and doing more cardio, which costs you more of the muscle you cannot afford to lose. It is protecting and rebuilding that muscle, eating enough protein, and working with your hormones instead of against them.",
    closingSensation: "relief and permission",
  },
  R2: {
    patternShort: "the fast-loss cycle",
    essence: "It is not that the weight comes back. It is how it comes back.",
    aha: "Here is the part the scale never showed you. When you lose weight fast, you lose muscle along with the fat. But when it comes back, it comes back mostly as fat. So round after round, if nothing was protecting your muscle, you end up with a little less of it each time, and muscle is what keeps you burning all day. That is why every attempt feels harder than the last.",
    reframe: "It was never a shortage of willpower. It was the method.",
    turn: "The way out is not another fast round. It is one round done differently, slow enough and supported enough to hold onto your muscle this time, so more of what you lose is actually fat, and more of it actually stays gone.",
    closingSensation: "clarity and resolve",
  },
  R3: {
    patternShort: "a fight on the wrong front, out-exercising your plate",
    essence: "You have been pouring real effort into the one lever that moves the scale least.",
    aha: "You already know exercise matters, so the line about it being 80 percent food lands as a shrug. Here is the part that stings. For a lot of people, hard exercise quietly works against the scale: it drives your appetite up, and it leaves you so wiped you move less the rest of the day, both without noticing. So the punishing workouts were often canceling themselves out.",
    reframe: "You were never lazy. You were sold a story that sweat equals weight loss, and you worked harder at it than most people ever would, aimed at the wrong target.",
    turn: "The relief is that the answer asks less of you, not more. Lead with your food, where the results actually live, and let movement you enjoy support it instead of punish you. You get to leave the war you could not win.",
    closingSensation: "relief that it can be easier",
  },
  R4: {
    patternShort: "the restriction trap",
    essence: "You are not eating too much. You have been eating too little, and it keeps backfiring.",
    aha: "This is the one almost no one sees, because it is the opposite of what you were told. When you hold yourself to very little for too long, two things happen. Your body settles in to run on less, so the scale stalls even though you are barely eating. And the restriction snaps back: the barely-eating all day becomes the ravenous, out-of-control evening, because a body kept too hungry eventually takes the wheel.",
    reframe: "That is not weak willpower at night. It is the predictable rebound to being too restricted by day, and your discipline was never the problem.",
    turn: "The fix feels wrong until it works: eat enough of the right food, steadily, especially protein, so the day is not one long deprivation the night has to correct. More structure, not more restriction.",
    closingSensation: "a stunned unlock",
  },
  R5: {
    patternShort: "an all-or-nothing pattern",
    essence: "You do not have a willpower problem. You have an all-or-nothing problem.",
    aha: "Look at the real math, because it changes how you see every attempt you called a failure. One slip, a single big meal, is almost nothing. What undid your week was never the slip, it was the thought that followed it: I blew it, might as well. That one thought turned a five-minute slip into a lost weekend, into I will start Monday, into three weeks off. The damage was never in the food. It was in the quitting the slip triggered.",
    reframe: "So you were never weak or inconsistent by nature. You are one of the most disciplined people you know, right up until one imperfect moment flips a switch no one taught you how to turn off.",
    turn: "The fix is not more willpower or a stricter plan. It is a way to have a bad day and simply keep going, so your effort finally stacks instead of resetting. A woman who is 80 percent consistent forever beats a woman who is 100 percent then 0 percent, by a mile, every time.",
    closingSensation: "self-forgiveness",
  },
  R6: {
    patternShort: "doing this without anyone in your corner",
    essence: "You were never weak. You were doing it without anyone in your corner.",
    aha: "Here is what the research on people who actually keep it off keeps finding, and it is not what you would guess. The biggest predictor is not the diet they chose, it is whether someone was in their corner. Willpower is not a character trait, it is a fuel tank, and it drains a little every day, which is why so many attempts die around week two or three when the tank runs dry. Someone checking on you does what willpower cannot: it carries the effort so you are not generating it alone every morning.",
    reframe: "You quit when no one was watching because that is what almost everyone does alone. It was never a flaw in you. It was a missing piece outside you.",
    turn: "The fix is not becoming a more disciplined person. It is never having to do the hard part alone again: daily support and people on the same climb, the one thing that carries you through the weeks willpower cannot.",
    closingSensation: "being seen and less alone",
  },
  R7: {
    patternShort: "years of following the wrong rules",
    essence: "You did everything you were told. You were told wrong.",
    aha: "Sit with this, because it reframes years of your life. You are not a person who fails at diets. You are a smart, disciplined person who was handed broken instructions by an industry that profits when you regain. The contradictory advice, eat this, never that, this is the secret, no this is, was mostly built to sell, not to work. A disciplined person following bad instructions gets bad results every time, so the fact that none of it held is not proof you are broken. It is proof the information was.",
    reframe: "That is not the same as failing. You cannot win a game whose rulebook was wrong.",
    turn: "The fix is almost embarrassingly simple after all the noise: the handful of things that are actually true, from someone with no reason to sell you the next myth, who stays with you while you unlearn the old ones.",
    closingSensation: "vindication",
  },
  R8: {
    patternShort: "a body carrying too much stress",
    essence: "This was never only about food. Your body has been bracing.",
    aha: "Here is a connection no one drew for you. When you run on too little sleep and too much stress, month after month, two things happen that have nothing to do with discipline. You reliably eat more, especially the quick-energy carbs, because a tired, stretched body reaches for fast fuel. And a body under chronic stress tends to hold more weight around the middle. It is not one clean hormone switch, whatever the internet told you. It is your whole body, run down and bracing, making the belly the last place anything wants to leave.",
    reframe: "So the times you did everything right and it still would not move were not failures. You were trying to out-discipline a body that was worn thin and holding on.",
    turn: "The fix is to ease the load your body is bracing against, your sleep, your stress, the weight you carry, right alongside your food, so it finally has room to let go. And you should not have to carry any of it, or fix it, alone.",
    closingSensation: "permission to rest",
  },
  R9: {
    patternShort: "food becoming how you cope with a hard day",
    essence: "It was never weak willpower. It is how you have coped with a hard day.",
    aha: "Here is why just do not eat it has never once worked for you, and it is not a character flaw. In a moment of real stress or exhaustion, the part of you that made the plan gets quiet, and the part that wants to feel better right now takes over, and it has learned that food is the fastest relief it knows. So at the exact moment you needed willpower most, the part that produces it had already checked out.",
    reframe: "You were not failing at self-control. You were a human being reaching for the fastest relief available, exactly as your brain is wired to.",
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
  everything: "tried a little bit of everything",
};

const HAPPENED_FRAGMENT: Record<string, string> = {
  regained: "And every time, you lost it, and it found its way back.",
  couldnt_stick: "And you could not make it stick past a few weeks.",
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

// "What gets in the way" (C3) and "when it's time to eat" (D2) fragments, in her
// words, for the Mirror. One is woven in when it is central to her primary.
const GETS_FRAGMENT: Record<string, string> = {
  blownit: "And you said it plainly: one bad day and you figure you have blown it.",
  driftoff: "You start strong, and then you quietly drift off.",
  losesteam: "And you lose steam the moment the scale stops moving.",
  hungryrestricted: "And you have been hungry and restricted the whole time.",
  putmelast: "And life gets busy, so you put yourself last.",
};

const MEAL_FRAGMENT: Record<string, string> = {
  quick: "You grab whatever is quick, because there is nothing left in you to cook.",
  everyoneelse: "You feed everyone else first and eat whatever is left.",
  boring: "And the healthy food bores you, so it never lasts.",
  dontknow: "And you do not even know what you are supposed to eat anymore.",
};

// The one extra "telling" fragment (gets-in-the-way or mealtime) woven into the
// Mirror, chosen only when it is central to her primary reason (keeps it tight).
function mirrorExtra(primary: ReasonKey, s: State): string {
  const gets = s.answers["C3"] as string | undefined;
  const meal = s.answers["D2"] as string | undefined;
  switch (primary) {
    case "R5":
      return gets && GETS_FRAGMENT[gets] && ["blownit", "losesteam", "driftoff"].includes(gets) ? GETS_FRAGMENT[gets] : "";
    case "R6":
      if (meal === "everyoneelse") return MEAL_FRAGMENT.everyoneelse;
      if (gets === "driftoff") return GETS_FRAGMENT.driftoff;
      if (gets === "putmelast") return GETS_FRAGMENT.putmelast;
      return "";
    case "R9":
      // R9's felt behavior now comes from the Screen 8 day fragment, not this screen.
      return "";
    case "R7":
      return meal === "dontknow"
        ? MEAL_FRAGMENT.dontknow
        : meal === "boring"
          ? MEAL_FRAGMENT.boring
          : meal === "quick"
            ? MEAL_FRAGMENT.quick
            : "";
    case "R4":
      return gets === "hungryrestricted" ? GETS_FRAGMENT.hungryrestricted : "";
    case "R8":
      return gets === "putmelast" ? GETS_FRAGMENT.putmelast : "";
    default:
      return "";
  }
}

function buildMirror(s: State, primary: ReasonKey): string {
  const tried = asArray(s.answers["C1"]);
  const happened = s.answers["C2"] as string | undefined;
  const day = s.answers["D1"] as string | undefined;
  const alone = s.answers["D6"] as string | undefined;

  const parts: string[] = [];

  // Behavior first: what she tried (up to 2 fragments, or the "everything" line).
  const triedOrder = ["keto", "calories", "gym", "fasting", "shakes", "ww"];
  if (tried.includes("everything")) {
    parts.push("You have tried a little bit of everything.");
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

  // One extra telling fragment from the new questions, when central to her primary.
  const extra = mirrorExtra(primary, s);
  if (extra) parts.push(extra);

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

// ── Beat 3b: the food-vs-exercise slider payoff (always shown, blueprint §4a) ──
// The slider answer is delivered HERE, not mid-quiz. Tone adapts to how she guessed.
function sliderPayoff(s: State): string {
  const g = s.sliderGuess ?? 50;
  // Off (guessed exercise-heavy / 50-50): reveal the truth she was made to wait for.
  if (g <= 50) {
    if (s.flags.FLAG_ED_watch) {
      return `And that slider at the start? You guessed ${g} percent food. Here is the truth I held back: most of this is about the food, and exercise, as good as it is for you, has a smaller say over the scale than anyone tells you. It was never about pushing yourself harder. So if you have been moving your body and barely losing, that is why.`;
    }
    return `And that slider at the start? You guessed ${g} percent food. Here is the truth I held back: for most women it is around 80 to 90 percent food. Exercise is wonderful for your heart and your head, but it was never the lever that moves the scale. So if you have been working out and barely losing, now you know why.`;
  }
  // Close: honor it.
  return `And that slider at the start? Your guess was actually close. Most of this really is about the food, and the fact that you already sensed that tells me you are sharper about this than most. You have just never had a plan that put it into practice for you.`;
}

// ── Beat 4: why what SHE tried did not last (blueprint §4b) ────────────────────
// Never "X does not work"; always why it did not last FOR HER. Woven, not listed.
const DIET_LINE: Record<string, string> = {
  keto: "Keto worked by cutting out whole groups of food, which is exactly why it never lasted, because no one lives without bread and fruit and the foods they love forever.",
  calories: "Counting every calorie turns eating into a math problem you solve alone every day, and the first busy week, the tracking is the first thing to go.",
  gym: "You cannot out-train your plate; hard workouts can push your appetite up and leave you too drained to move, so you grind and barely lose.",
  fasting: "Skipping meals feels like control, but it flips on you: you are so hungry by night that one evening undoes the whole day.",
  shakes: "The shakes and cleanses give you a fast drop that comes right back, because they were never built to teach you how to actually eat.",
  ww: "Points work while you are counting, but the day you stop, there is nothing holding it in place, just you and an app and your willpower.",
  everything: "And there it is. You have tried more than most people ever will, and not one of them held. That is not a list of your failures, it is proof the problem was never you, and that not one of them was built for your body.",
};
const DIET_ORDER = ["gym", "keto", "fasting", "shakes", "ww", "calories"];

function dietsBeat(s: State): string {
  const tried = asArray(s.answers["C1"]);
  const hasEverything = tried.includes("everything");
  const specific = DIET_ORDER.filter((t) => tried.includes(t)).slice(0, hasEverything ? 2 : 3);
  const lines = specific.map((t) => DIET_LINE[t]);
  if (hasEverything) lines.push(DIET_LINE.everything);
  if (!lines.length) return "";
  return "Now look at what you actually tried. " + lines.join(" ");
}

// ── Support gating: the corner only leads where her answers make it hers ──────
function supportSignal(s: State): boolean {
  return (
    s.answers["D6"] === "always_alone" ||
    s.answers["D6"] === "fizzles" ||
    s.answers["D7"] === "yesneverhad" ||
    s.answers["D7"] === "feltithelps"
  );
}

// ── Beat 5: the through-line (her real missing piece, NOT always support) ──────
// blueprint §5: support LEADS only for R6 and, softly, R9. Everyone else points
// at food / plan / eating-enough / consistency / the truth.
function throughline(primary: ReasonKey, s: State, name: string): string {
  const supp = supportSignal(s);
  const open = `So here is the real picture, ${name}. `;
  switch (primary) {
    case "R1":
      return open + "You are a disciplined woman doing the right things with a plan built for a body you no longer have. The old rules quietly expired, and no one handed you the new ones.";
    case "R2":
      return open + "You have been running hard, on your own, through a cycle that was rigged to get harder, blaming your willpower for a setup that was never your fault. You have more discipline than half the people you know. What you have never had is a way to do this that actually protects your body" + (supp ? ", and someone paying attention so it does not quietly fall apart around week three again." : ".");
    case "R3":
      return open + "You have got more drive than most people ever will, and you have been spending it in the wrong place, punishing your body in the gym for a problem that lives on the plate.";
    case "R4":
      return open + "Your discipline was never the problem. It has been real, and relentless, and pointed in exactly the wrong direction. You were told the answer was less, and you did less better than almost anyone. What your body needs now is to feel safe enough to let go, and that starts with being fed, not pushed harder.";
    case "R5":
      return open + "You are not inconsistent by nature. You are consistent until one bad day, and then the all-or-nothing takes the wheel." + (supp ? " You told me you start with people and it fizzles, which is the exact moment a slip becomes a spiral, right when the support disappears." : "");
    case "R6":
      return open + "You are the strong one. You have shown up for everyone for years, and no one has ever shown up just for you. You told me the part you have never had is someone in your corner. That was the missing piece the whole time.";
    case "R7":
      return open + "You cannot win a game whose rulebook was wrong." + (s.answers["D2"] === "dontknow" ? " Not knowing what to eat anymore is not on you, that is simply what years of contradictions do to a smart person." : "") + " What you have never had is the handful of things that are actually true, from someone with no reason to sell you the next myth.";
    case "R8":
      return open + "You are a strong woman carrying too much, running on empty, aimed at all the wrong levers. It was never about trying harder. It is about easing the load your body has been bracing under, so it can finally stop holding on.";
    case "R9":
      return open + "You are not undisciplined. You have been managing real stress the fastest way you knew how, then punishing yourself for it, alone, on repeat." + (supp ? " You told me the part you have never had is someone in your corner, and the hard nights are exactly where that matters most." : "");
  }
}

// ── Beat 6: the Turn, tied to her "why" ───────────────────────────────────────
const WHY_CLOSE: Record<string, string> = {
  energy: "That is how you get your energy and your confidence back.",
  myself: "That is how you get back to feeling like yourself, in the clothes you have been holding onto.",
  health: "And you told me this is about your health, so hear me: that matters more than any number on the scale.",
  family: "And you told me this is about being there, strong, for the people who lean on you. That is what this is for.",
  moment: "And you have got that moment coming, so let's make sure you walk in feeling like you.",
};

function turnBeat(core: Core, s: State, res: Resolution, primary: ReasonKey): string {
  const parts: string[] = [core.turn];
  const supp = supportSignal(s);

  // The corner: leads for R6, soft for R9, a light close for R2/R5/R7 only when
  // her answers earned it, and absent for the food/midlife/plan reasons.
  if (primary === "R6") {
    // Core turn already names "never doing the hard part alone"; add only the new
    // texture of what that support looks like (advance, do not restate).
    parts.push("The kind who checks in, remembers what you said, and notices when you go quiet.");
  } else if (primary === "R9") {
    // Core turn already lands "when the craving comes, you are not alone"; no restatement.
  } else if (supp && (primary === "R2" || primary === "R5")) {
    parts.push("And someone to catch the slip before it becomes a lost week, so you are not doing the hard part alone this time.");
  } else if (supp && primary === "R7") {
    parts.push("From someone walking it with you, instead of selling you the next thing.");
  }

  // ED compassion: gentle, encourage real help (no numbers, no "eat less").
  if (res.edMode) {
    parts.push("You deserve to eat, and if the not-eating ever starts to feel bigger than a diet, please talk to someone you trust about it.");
  }

  // Grace-first, sourced shot handling. [clinician check: confirm figures]
  if (s.flags.FLAG_GLP1) {
    parts.push(res.edMode
      ? "A shot can quiet your appetite, but it cannot build the habits or be in your corner on the hard days. That part is the work, and it is the part that lasts."
      : "A shot can quiet your appetite, and for some women that helps. But up to about 40 percent of what it takes off can be muscle, not fat, the very muscle that keeps your metabolism up. It works on your appetite, but it cannot build your habits or protect your muscle, and that part is the work that lasts.");
  }
  if (s.flags.FLAG_GLP1_cameoff) {
    parts.push("Coming off it is exactly when protecting your muscle and your results matters most, that is the window it wants to come back.");
  }

  // Honest timeline for a large goal (no support push).
  if (s.flags.FLAG_goalBig) {
    parts.push("A goal like yours is likely more than one focused stretch, done in a way that lasts.");
  }

  // Tie the close to what she said matters (her "why").
  const wc = s.why ? WHY_CLOSE[s.why] : undefined;
  if (wc) parts.push(wc);

  return parts.join(" ");
}

// ── The Pattern beat (confidence-aware, §6.1) ─────────────────────────────────
function buildPattern(core: Core, res: Resolution): string {
  if (res.confidence === "near_tie") {
    return "Your pattern is really two things pulling together, which is why nothing aimed at just one of them has worked.";
  }
  if (res.confidence === "low_signal") {
    return `Here is the thread I can see in what you told me. It points to ${core.patternShort}, and it is worth looking at.`;
  }
  return `Here is the pattern underneath all of it. You are not failing at weight loss. You are caught in ${core.patternShort}.`;
}

// ── Flag / goal / hope addenda to the Turn ────────────────────────────────────
const PERI_WEAVE =
  "And the hot flashes you mentioned tell me your body is also entering a new season, which pulls the same way: less of the muscle that keeps you burning, more settling at the middle.";

// ── The public composition (the six beats, blueprint §1) ──────────────────────
// Each beat carries a `kind` so the UI can give it a labeled header and the right
// emphasis (pattern, through-line, and turn are the anchors).
export type SectionKind = "mirror" | "pattern" | "aha" | "slider" | "diets" | "throughline" | "turn";
// A supporting graphic that rides alongside a beat (pinned on desktop, stacked on
// mobile). sliderSplit = the food-vs-exercise result; regain = the fast-loss
// rebound; midlifeCurve = the after-40 muscle/burn decline.
export type VisualKind = "sliderSplit" | "regain" | "midlifeCurve";
export type DiagnosisSection = { kind: SectionKind; text: string; bullets?: string[]; visual?: VisualKind };

export type ComposedDiagnosis = {
  title: string;
  sections: DiagnosisSection[];
  closingSensation: string;
};

export function composeDiagnosis(s: State, res: Resolution): ComposedDiagnosis {
  const core = CORES[res.primary];
  const name = s.name?.trim() || "";

  const sections: DiagnosisSection[] = [];

  // 1. Mirror — 2 to 3 of her most telling answers, in her words.
  sections.push({ kind: "mirror", text: buildMirror(s, res.primary) });

  // 2. Pattern, named (near-tie -> "two things pulling together").
  sections.push({ kind: "pattern", text: buildPattern(core, res) });

  // 3. Aha — the honest mechanism + blame lift. For a near-tie the contributing
  //    thread joins; for the midlife/peri woman the after-40 mechanism weaves in.
  //    These are deduped: when the second thread is already R1 (midlife), the weave
  //    carries the after-40 point, so PERI_WEAVE is skipped (no two midlife threads).
  let aha = `${core.aha} ${core.reframe}`;
  const nearTieWeave =
    res.confidence === "near_tie" && res.contributing ? buildWeave(res.primary, res.contributing) : "";
  if (nearTieWeave) aha += ` ${nearTieWeave}`;
  if (s.flags.FLAG_peri && res.primary !== "R1" && res.contributing !== "R1") aha += ` ${PERI_WEAVE}`;
  // The Aha carries a graphic when its mechanism is visual: the fast-loss rebound
  // for the yo-yo woman, the after-40 decline for the midlife/peri woman.
  const ahaVisual: VisualKind | undefined =
    res.primary === "R2"
      ? "regain"
      : res.primary === "R1" || s.flags.FLAG_peri
        ? "midlifeCurve"
        : undefined;
  sections.push({ kind: "aha", text: aha, visual: ahaVisual });

  // 3b. The slider payoff (always shown, delivered here not mid-quiz), with the
  //     food-vs-exercise split graphic.
  sections.push({ kind: "slider", text: sliderPayoff(s), visual: "sliderSplit" });

  // 4. Why what SHE tried did not last (one honest line per diet she selected).
  const diets = dietsBeat(s);
  if (diets) sections.push({ kind: "diets", text: diets });

  // 5. The through-line — her real missing piece (support only where it is hers).
  sections.push({ kind: "throughline", text: throughline(res.primary, s, name) });

  // 6. The Turn — what works for her, tied to her "why".
  sections.push({ kind: "turn", text: turnBeat(core, s, res, res.primary) });

  return {
    title: name ? `${name}, here is what is really going on.` : "Here is what is really going on.",
    sections,
    closingSensation: core.closingSensation,
  };
}

// ── Result gate content (spec §16) ────────────────────────────────────────────
// We do NOT name the pattern here. Naming a single reason on the gate either
// pre-commits her to one thread the multi-threaded breakdown then reframes, or
// makes the tailored breakdown feel one-note. Instead we reflect her own words
// back: recognition, not a label, is what earns the email. The pattern name is
// saved for the paid reveal (the diagnosis), where it lands harder unspent.
export function gatePattern(res: Resolution): { name: string; essence: string } {
  return { name: CORES[res.primary].patternShort, essence: CORES[res.primary].essence };
}

// A SHORT one-line Mirror in her voice, composed from her two most telling
// answers, deliberately worded differently from the fuller Mirror that opens the
// diagnosis so she never reads the same sentence twice. Structure: a "situation"
// lead (her words) + the "outcome" tail (what happened). Priority for the lead:
// tried-breadth > alone/support > eating shape > symptoms. The tail is always her
// what-happened answer (C2 is always one of the three).
const GATE_LEAD: Record<string, string> = {
  everything: "You've tried nearly everything",
  always_alone: "You've been doing this on your own",
  fizzles: "You start out with people, then end up on your own",
  clean_stuck: "You eat clean",
  barely_eat: "You barely eat all day",
  night_stress: "You keep it together all day",
  graze: "You graze all day without really thinking",
  weekend: "You're good all week",
  lose_but_stomach: "The weight keeps settling at your middle",
  belly: "The weight keeps settling at your middle",
  exhausted: "You're running on empty",
  cravings: "The cravings run the show",
};
const GATE_TAIL: Record<string, string> = {
  regained: "it keeps coming back",
  couldnt_stick: "it never quite sticks",
  stalled: "the scale just will not move",
};

export function gateMirror(s: State): string {
  const tried = asArray(s.answers["C1"]);
  const symptoms = asArray(s.answers["E1"]);
  const d1 = s.answers["D1"] as string | undefined;
  const d6 = s.answers["D6"] as string | undefined;
  const c2 = s.answers["C2"] as string | undefined;

  let lead = "";
  if (tried.includes("everything") || tried.filter((t) => t !== "everything").length >= 3) {
    lead = GATE_LEAD.everything;
  } else if (d6 && GATE_LEAD[d6]) {
    lead = GATE_LEAD[d6];
  } else if (d1 && GATE_LEAD[d1]) {
    lead = GATE_LEAD[d1];
  } else {
    const sym = symptoms.find((x) => GATE_LEAD[x]);
    if (sym) lead = GATE_LEAD[sym];
  }

  const tail = (c2 && GATE_TAIL[c2]) || "";
  if (lead && tail) return `${lead}, and ${tail}.`;
  if (lead) return `${lead}.`;
  if (tail) return `And still, ${tail}.`;
  return "You've been trying so hard, and it still hasn't added up.";
}

export const GATE_REVEALS = [
  "What's really driving it",
  "Why nothing has stuck, for you",
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

// One desire-first line naming HER specific fix on the Solution screen, composed
// from her PRIMARY reason (blueprint §5 / §7.1). Not a mechanism re-explanation
// (the diagnosis already taught that): the feeling of the thing built for her. Each
// is a full "And ..." sentence so it stands on its own as the last feeling-card.
export const SOLUTION_HER_FIX: Record<ReasonKey, string> = {
  R1: "And your plan is finally built for the body you have now, so your hormones and your muscle work with you instead of against you.",
  R2: "And this time we go at a pace that actually protects your muscle, so what comes off finally stays off.",
  R3: "And we put the work on your plate, where it actually moves, so you can stop punishing yourself.",
  R4: "And you get to eat enough, real food, so your body finally stops fighting you.",
  R5: "And you get a way to have a bad day and keep right on going, so your effort finally adds up instead of resetting.",
  R6: "And this time you have someone in your corner, every single day, so you are never doing it alone again.",
  R7: "And I hand you the handful of things that are actually true, from someone with nothing to sell you.",
  R8: "And we make the whole load lighter, with a plan simple enough to be one less thing you carry.",
  R9: "And you have real support on the hard nights, so food stops having to be the thing that gets you through.",
};

// The closing beat of the Solution screen (the last thing before the CTA): her own
// stated reason reflected back (blueprint §4j), composed from her "why" answer. She
// decides on her own words, her own stakes, not on testimonials.
const SOLUTION_WHY_CLOSE: Record<string, string> = {
  energy: "This was never really about a number. It is about getting your energy and your confidence back, and feeling like you again.",
  myself: "This was never really about a number. It is about feeling like yourself again, back in the clothes you have been holding onto.",
  health: "This was never really about a number. It is about your health, and being here strong for the people who need you.",
  family: "This was never really about a number. It is about being here, strong, for the people who lean on you. That is what this is for.",
  moment: "This was never really about a number. You have got that moment coming, so let's make sure you walk in feeling like the best version of you.",
};

export function solutionWhyClose(s: State): string {
  return (s.why && SOLUTION_WHY_CLOSE[s.why]) || "This was never really about a number. It is about becoming the woman you know is still in there.";
}

export function solutionFlagLines(s: State): { plan?: string; header?: string; goalNote?: string; progress?: string } {
  const out: { plan?: string; header?: string; goalNote?: string; progress?: string } = {};
  if (s.flags.FLAG_GLP1) out.plan = "And if you are on the shot, this is the part it cannot do, the habits, the muscle, the person in your corner. That is what makes it last.";
  if (s.flags.FLAG_health_why) out.header = "This was never only about a number. It is about your energy and being here strong for the people who need you.";
  if (s.flags.FLAG_goalBig) out.goalNote = "A goal like yours is likely more than one focused stretch, done in a way that lasts. We start now, and I am with you the whole way.";
  // "I lose steam when the scale stalls" -> the progress-tracking payoff (she needs to
  // see herself changing beyond the one number).
  if (s.answers["C3"] === "losesteam") out.progress = "And you will see yourself changing even on the weeks the scale is being stubborn, so you are never flying blind on one number again.";
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
