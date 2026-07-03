/**
 * Scoring regression harness (spec §9.4). Encodes 15 personas (the original 12,
 * re-scored with the three v4 questions, plus 3 that exercise the new questions
 * and the R6 rebalance rule) and asserts each resolves to the correct primary
 * reason (and key flags). Run with Bun:  bun run src/components/quiz/quiz01.v3.harness.ts
 *
 * This is the guard the docs call for: re-run after any scoring or copy change
 * to confirm the diagnosis engine has not drifted.
 */

import { initialState, scoreAnswer, resolve, type State, type ReasonKey } from "./quiz01.v3";

type Answer = [qid: string, value: string | string[]];
type Persona = {
  name: string;
  expect: ReasonKey;
  flags?: Partial<Record<keyof State["flags"], boolean>>;
  answers: Answer[];
};

// Answer sequences are applied in flow order. Slider guess is passed via "B1".
// C3 = what gets in the way, D2 = when it's time to eat, D7 = would support help
// (the three v4 questions). D7 also drives the R6 rebalance guard.
const PERSONAS: Persona[] = [
  {
    name: "Denise", expect: "R2",
    answers: [
      ["A1", "30_50"], ["F1q", "40s"], ["B1", "45"],
      ["C1", ["keto", "calories", "everything"]], ["C2", "regained"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "quick"], ["D4", "white_knuckle"], ["D6", "fizzles"], ["D7", "myself"],
      ["E1", ["belly", "lose_but_stomach"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
  {
    name: "Karen", expect: "R1",
    answers: [
      ["A1", "15_30"], ["F1q", "50s"], ["B1", "70"],
      ["C1", ["calories"]], ["C2", "stalled"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "quick"], ["D4", "cope"], ["D6", "had_group"], ["D7", "ifkeptup"],
      ["E1", ["belly", "hot_flashes", "lose_but_stomach"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
    flags: { FLAG_peri: true },
  },
  {
    name: "Toya", expect: "R3",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "30"],
      ["C1", ["gym"]], ["C2", "stalled"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "quick"], ["D4", "cope"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["belly"]], ["F3q", "not_for_me"], ["G1", "energy"],
    ],
  },
  {
    name: "Michelle", expect: "R4",
    answers: [
      ["A1", "under_15"], ["F1q", "40s"], ["B1", "60"],
      ["C1", ["calories", "fasting"]], ["C2", "stalled"], ["C3", "hungryrestricted"],
      ["D1", "barely_eat"], ["D2", "dontknow"], ["D4", "white_knuckle"], ["D6", "always_alone"], ["D7", "ifkeptup"],
      ["E1", ["cravings", "exhausted"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
    flags: { FLAG_ED_watch: true },
  },
  {
    name: "Renee", expect: "R5",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "55"],
      ["C1", ["everything"]], ["C2", "couldnt_stick"], ["C3", "blownit"],
      ["D1", "weekend"], ["D2", "quick"], ["D4", "cope"], ["D6", "fizzles"], ["D7", "yesneverhad"],
      ["E1", ["belly"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
  {
    name: "Angela", expect: "R6",
    answers: [
      ["A1", "30_50"], ["F1q", "40s"], ["B1", "70"],
      ["C1", ["calories", "ww"]], ["C2", "couldnt_stick"], ["C3", "driftoff"],
      ["D1", "clean_stuck"], ["D2", "everyoneelse"], ["D4", "stop_caring"], ["D6", "always_alone"], ["D7", "yesneverhad"],
      ["E1", ["belly", "exhausted"]], ["F3q", "not_for_me"], ["G1", "health"],
    ],
    flags: { FLAG_health_why: true },
  },
  {
    name: "Pam", expect: "R7",
    answers: [
      ["A1", "15_30"], ["F1q", "50s"], ["B1", "40"],
      ["C1", ["keto", "shakes", "ww", "everything"]], ["C2", "regained"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "dontknow"], ["D4", "cope"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["bloated"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
  {
    name: "Sharon", expect: "R8", // near-tie with R1
    answers: [
      ["A1", "15_30"], ["F1q", "50s"], ["B1", "70"],
      ["C1", ["calories"]], ["C2", "stalled"], ["C3", "putmelast"],
      ["D1", "night_stress"], ["D2", "quick"], ["D4", "white_knuckle"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["belly", "exhausted", "brain_fog", "lose_but_stomach", "hot_flashes"]], ["F3q", "not_for_me"], ["G1", "health"],
    ],
    flags: { FLAG_peri: true, FLAG_health_why: true },
  },
  {
    name: "Gwen", expect: "R9",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "70"],
      ["C1", ["calories", "ww"]], ["C2", "couldnt_stick"], ["C3", "losesteam"],
      ["D1", "night_stress"], ["D2", "comfort"], ["D4", "reach_food"], ["D6", "fizzles"], ["D7", "ifkeptup"],
      ["E1", ["cravings"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
  {
    name: "Lisa", expect: "R2",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "70"],
      ["C1", ["calories"]], ["C2", "regained"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "quick"], ["D4", "cope"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["belly"]], ["F3q", "came_off"], ["G1", "myself"],
    ],
    flags: { FLAG_GLP1: true, FLAG_GLP1_cameoff: true },
  },
  {
    name: "Brenda", expect: "R1",
    answers: [
      ["A1", "15_30"], ["F1q", "50s"], ["B1", "70"],
      ["C1", ["calories"]], ["C2", "stalled"], ["C3", "losesteam"],
      ["D1", "clean_stuck"], ["D2", "dontknow"], ["D4", "cope"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["belly", "hot_flashes", "lose_but_stomach"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
    flags: { FLAG_peri: true },
  },
  {
    name: "Nicole", expect: "R5",
    answers: [
      ["A1", "15_30"], ["F1q", "30s"], ["B1", "70"],
      ["C1", ["everything"]], ["C2", "couldnt_stick"], ["C3", "blownit"],
      ["D1", "weekend"], ["D2", "quick"], ["D4", "cope"], ["D6", "fizzles"], ["D7", "ifkeptup"],
      ["E1", ["belly"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },

  // ── New personas exercising the three v4 questions + the R6 rebalance rule ──
  {
    // "Puts herself last" woman: R6 backed by direct support answers -> R6 leads.
    name: "Coretta", expect: "R6",
    answers: [
      ["A1", "30_50"], ["F1q", "50s"], ["B1", "70"],
      ["C1", ["calories"]], ["C2", "couldnt_stick"], ["C3", "putmelast"],
      ["D1", "clean_stuck"], ["D2", "everyoneelse"], ["D4", "stop_caring"], ["D6", "always_alone"], ["D7", "yesneverhad"],
      ["E1", ["belly", "exhausted"]], ["F3q", "not_for_me"], ["G1", "family"],
    ],
    flags: { FLAG_health_why: true },
  },
  {
    // "Don't know what to eat" woman: bad-info R7 leads; her R6 is unbacked.
    name: "Pamela", expect: "R7",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "50"],
      ["C1", ["keto", "shakes", "ww", "everything"]], ["C2", "regained"], ["C3", "losesteam"],
      ["D1", "graze"], ["D2", "dontknow"], ["D4", "cope"], ["D6", "had_group"], ["D7", "ifkeptup"],
      ["E1", ["bloated"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
  {
    // Rebalance guard: R6 is highest by accumulation but UNBACKED (had_group +
    // "should do it myself"), so it must drop and the real pattern (R5) leads.
    name: "Deborah", expect: "R5",
    answers: [
      ["A1", "15_30"], ["F1q", "40s"], ["B1", "70"],
      ["C1", ["everything"]], ["C2", "couldnt_stick"], ["C3", "driftoff"],
      ["D1", "weekend"], ["D2", "everyoneelse"], ["D4", "stop_caring"], ["D6", "had_group"], ["D7", "myself"],
      ["E1", ["belly"]], ["F3q", "not_for_me"], ["G1", "myself"],
    ],
  },
];

function run() {
  let pass = 0;
  const failures: string[] = [];

  for (const p of PERSONAS) {
    let s = initialState();
    for (const [qid, value] of p.answers) s = scoreAnswer(s, qid, value);
    const r = resolve(s);

    const okPrimary = r.primary === p.expect;
    const flagIssues: string[] = [];
    if (p.flags) {
      for (const [flag, want] of Object.entries(p.flags)) {
        if (s.flags[flag as keyof State["flags"]] !== want) flagIssues.push(`${flag} expected ${want}`);
      }
    }

    const scoreStr = (Object.keys(s.reasonScores) as ReasonKey[])
      .filter((k) => s.reasonScores[k] > 0)
      .map((k) => `${k}:${s.reasonScores[k]}`)
      .join(" ");

    if (okPrimary && flagIssues.length === 0) {
      pass++;
      console.log(`  PASS  ${p.name.padEnd(9)} -> ${r.primary} (contrib ${r.contributing ?? "none"}, ${r.confidence})  [${scoreStr}]`);
    } else {
      const why = [
        okPrimary ? "" : `primary ${r.primary}, expected ${p.expect}`,
        ...flagIssues,
      ].filter(Boolean).join("; ");
      failures.push(`${p.name}: ${why}  [${scoreStr}]`);
      console.log(`  FAIL  ${p.name.padEnd(9)} -> ${r.primary}  (${why})  [${scoreStr}]`);
    }
  }

  console.log(`\n${pass}/${PERSONAS.length} personas resolved correctly.`);
  if (failures.length) {
    console.error("\nFailures:\n" + failures.map((f) => "  - " + f).join("\n"));
    process.exit(1);
  }
}

run();
