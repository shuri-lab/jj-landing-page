import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/calls-test")({
  head: () => ({
    meta: [
      { title: "Accountability Agent Test Harness" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsTestHarness,
});

// ── types ────────────────────────────────────────────────────────────────────
type Tag = "event" | "preference" | "relationship" | "constraint" | "history" | "habit";
interface LooseThread {
  note: string;
  mentioned_on: string;
  relevant_around?: string;
  tag?: Tag | "";
}
interface Memory {
  profile: string;
  journey_state: string;
  loose_threads: LooseThread[];
}
type Payload = Record<string, unknown> & { memory?: Memory };

type FieldType = "text" | "number" | "date" | "select" | "longtext";
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  options?: string[];
  optional?: boolean;
  min?: number;
  max?: number;
  step?: number;
}
interface GroupDef {
  id: string;
  title: string;
  fields: FieldDef[];
}

// ── schema (drives the form; add/rename/remove here without a rewrite) ────────
const SCHEMA: GroupDef[] = [
  {
    id: "identity",
    title: "Identity and scheduling",
    fields: [
      { key: "first_name", label: "First name", type: "text" },
      { key: "preferred_checkin_day", label: "Preferred check-in day", type: "text", hint: "Example: Monday" },
      { key: "preferred_checkin_time", label: "Preferred check-in time", type: "text", hint: "Example: 9:00 AM" },
      { key: "current_local_time", label: "Current local time", type: "text", hint: "The user's current local time, example: 2:30 PM" },
      { key: "current_date", label: "Current date", type: "date", hint: "The date of this call" },
    ],
  },
  {
    id: "plan",
    title: "Plan awareness",
    fields: [
      { key: "current_plan_name", label: "Current plan name", type: "text", hint: "If this contains the word 'lifestyle' the agent treats the user as Lifestyle phase, otherwise Jumpstart phase. This changes the call flow." },
      { key: "current_week", label: "Current week", type: "number", min: 0, optional: true, hint: "Program week number." },
      { key: "current_plan_day", label: "Current plan day", type: "number", min: 0 },
      { key: "current_plan_total_days", label: "Current plan total days", type: "number", min: 0 },
      { key: "plan_end_date", label: "Plan end date", type: "date" },
    ],
  },
  {
    id: "week",
    title: "This week's data",
    fields: [
      { key: "days_evaluated", label: "Days evaluated", type: "number", min: 0, max: 7, hint: "How many days this window covers. Use 7 for an established user, fewer for a brand new one." },
      { key: "form_submissions_7d", label: "Form submissions (7d)", type: "number", min: 0, hint: "How many daily check-ins the user completed in the window." },
      { key: "avg_meals_7d", label: "Avg meal adherence (7d)", type: "number", min: 1, max: 5, step: 0.1, hint: "A meal-plan ADHERENCE score from 1 to 5, not a count of meals. 5 means they followed the plan almost perfectly, 1 means they barely followed it." },
      { key: "avg_sleep_7d", label: "Avg sleep (7d)", type: "number", min: 0, step: 0.1, hint: "Average hours of sleep per night." },
      { key: "avg_steps_7d", label: "Avg steps (7d)", type: "number", min: 0, hint: "Average daily step count." },
      { key: "avg_water_7d", label: "Avg water (7d)", type: "number", min: 0, hint: "Average daily water intake in ounces." },
      { key: "avg_mood_7d", label: "Avg mood (7d)", type: "number", min: 1, max: 5, step: 0.1, hint: "Average mood, 5 great, 1 low." },
      { key: "weight_trend", label: "Weight trend", type: "select", options: ["losing", "stable", "gaining", "no_data"] },
      { key: "current_weight_lbs", label: "Current weight (lbs)", type: "number", min: 0 },
      { key: "weight_change_7d", label: "Weight change (7d, lbs)", type: "number", step: 0.1, optional: true, hint: "Change in pounds over the window. Negative means down." },
      { key: "weight_checkins_7d", label: "Weight check-ins (7d)", type: "number", min: 0, hint: "How many times they logged their weight this window." },
      { key: "starting_weight_lbs", label: "Starting weight (lbs)", type: "number", min: 0, optional: true },
      { key: "goal_weight_lbs", label: "Goal weight (lbs)", type: "number", min: 0, optional: true },
    ],
  },
  {
    id: "previous",
    title: "Previous call state",
    fields: [
      { key: "previous_main_blocker", label: "Previous main blocker", type: "text", hint: "Leave empty or set to 'none' to make this a FIRST call. Any real value makes it a follow-up call and turns on the previous-call follow-up part of the flow." },
      { key: "previous_commitment", label: "Previous commitment", type: "text", hint: "What the user committed to on the last call." },
      { key: "previous_proposed_solution", label: "Previous proposed solution", type: "text", hint: "The tip the agent gave last call. On a repeat blocker the agent avoids repeating this." },
    ],
  },
];

const TAG_OPTIONS: Tag[] = ["event", "preference", "relationship", "constraint", "history", "habit"];
const EMPTY_MEMORY: Memory = { profile: "", journey_state: "", loose_threads: [] };
const WEIGHT_TREND_OPTIONS = ["losing", "stable", "gaining", "no_data"];

// ── defaults + presets ───────────────────────────────────────────────────────
function baseDefault(): Payload {
  return {
    first_name: "",
    preferred_checkin_day: "",
    preferred_checkin_time: "",
    current_local_time: "",
    current_date: "",
    current_plan_name: "",
    current_plan_day: undefined,
    current_plan_total_days: undefined,
    plan_end_date: "",
    days_evaluated: undefined,
    form_submissions_7d: undefined,
    avg_meals_7d: undefined,
    avg_sleep_7d: undefined,
    avg_steps_7d: undefined,
    avg_water_7d: undefined,
    avg_mood_7d: undefined,
    weight_trend: "no_data",
    current_weight_lbs: undefined,
    weight_checkins_7d: undefined,
    starting_weight_lbs: undefined,
    goal_weight_lbs: undefined,
    previous_main_blocker: "",
    previous_commitment: "",
    previous_proposed_solution: "",
    memory: { profile: "", journey_state: "", loose_threads: [] },
  };
}

function makePreset(over: Partial<Payload> & { memory?: Partial<Memory> }): Payload {
  const base = baseDefault();
  const memory: Memory = { ...base.memory, ...(over.memory ?? {}) } as Memory;
  return { ...base, ...over, memory };
}

const WAN_PROFILE =
  "Wan is 57 and lives in Washington, DC. She is warm, agreeable, and coachable when the tone is encouraging and tied to freedom, confidence, energy, and feeling better in her body. She disengages with pressure, complexity, rigid meal planning, or anything that feels like a cooking project. She cooks with her sister, often feeds a household, and has evening caregiving duties for her mother, so plans must fit family meals, low-prep food, and action earlier in the day before fatigue takes over. Good sleep noticeably improves her energy, mood, and follow-through. She has weak knees that need joint-friendly progression. Intermittent fasting has worked for her before and a 12-hour eating window feels doable. She is motivated by freedom, confidence, energy, and feeling better in her body. Goal: from about 205 toward 160, with 190 named as a nearer target. Onboarded 2026-05-15.";
const WAN_JOURNEY =
  "Wan completed the jump-start phase and by early June reported better energy, more limber movement, and improved clothing fit. Check-ins have become easy and sleep feels restorative. Recently she has been discouraged by a plateau and overwhelmed by a forced move. On her last call, 2026-07-06, she sounded steady and receptive: good follow-through on the post-lunch movement and amazing sleep, but tired and discouraged. The agreement was to reduce meal effort and begin two simple repeat meals starting 2026-07-07. Current focus is simplification during upheaval.";
const DEBRA_PROFILE =
  "Debra is 63 and lives in New York, balancing work and personal demands. She wants health support that fits real life, avoids extremes, and protects her energy. She responds to warmth, realism, and one clear doable action. She stays engaged when the plan feels simple and useful, and tends to shut down with pressure, rigidity, or too many moving parts. Quick, filling, portable options help, because busy and late workdays disrupt her meals and hydration. She is motivated more by health and feeling better than by appearance. Goal: from about 165 toward 140 over roughly six months, through sustainable real meals rather than restriction. Onboarded 2026-05-15.";
const DEBRA_JOURNEY =
  "Debra's recurring obstacle is consistency during busy seasons, rooted in work and family demands disrupting her eating rhythm, water, and recovery. What has worked is simplicity and visibility: the meal plan, Sunday portable-meal prep with a calendar reminder, visible ready snacks, and fruit kept on hand. By mid-June she had stronger hydration awareness, more restful sleep, and manageable movement, and she keeps showing up even when progress feels flat. On her last call, 2026-07-09, she sounded positive but said things had felt like a grind. Physically she felt good, steps and sleep and mood were good, water was getting easier, and a meal-plan issue had been resolved. She recommitted to one breakfast-tied glass of water with a posted note reminder. Scale and clothes have been about the same for a couple of weeks.";

const DEFAULT_PAYLOAD: Payload = {
  first_name: "Alyssa",
  plan_name: "Lifestyle Plan",
  plan_type: "Premium",
  current_plan_day: "fifty eight",
  current_plan_total_days: "eighty four",
  days_remaining: "twenty six",
  current_week: 8,
  total_days: "84",
  days_evaluated: "seven",
  current_date: "August 15th",
  current_local_time: "5:40 PM",
  timezone: "America/Chicago",
  preferred_checkin_day: "Tuesday",
  preferred_checkin_time: "9:00 AM",
  form_submissions_7d: "seven",
  avg_steps_7d: "seven thousand one hundred",
  avg_water_7d: "forty eight",
  avg_meals_7d: "four",
  meal_structure: "three meals, one snack",
  core_ingredients: "chicken, salmon, leafy greens, sweet potato, berries",
  snack_options: "almonds, apple slices, hummus and veggies",
  troublemaker_foods: "chips, ice cream",
  followup_prompt: "keep her water up at her sister's cookout last weekend",
  previous_commitment: "prep one simple repeat meal earlier in the day, around 1pm",
  acc_previous_commitment_kept: "true",
  acc_memory_profile: "Alyssa is 47, in Austin, Texas. Responds to encouragement tied to energy and feeling better; disengages under pressure, complexity, or anything that feels like a cooking project. Cooks for a household, so plans must fit family meals and stay low prep. Best earlier in the day before evening fatigue. Knee trouble means joint friendly progression only. Working from about 210 toward 168.",
  acc_memory_journey_state: "On a good run: consistent check-ins, weight moving in the right direction, and the post-lunch meal-prep habit is holding. Water is the one thing her main call is nudging her on right now. Last weekend was her sister's cookout and she committed to keeping her water up through it. Feeling steady and encouraged.",
  acc_posture: "steady",
  acc_posture_note: "Solid week heading into the weekend. Warm and practical, keep it fast, she is doing well.",
  acc_chapter: "momentum",
  acc_center: "water",
  acc_threads_to_surface: "- Alyssa cooks for a household (raise if food comes up)\n- Knee trouble, joint friendly only (raise if movement comes up)",
  acc_advice_constraints: "- Low prep, fits family meals.\n- Avoid pressure or complexity.\n- Joint friendly only because of knee trouble.\n- Earlier in the day where possible.",
  acc_fresh_tips: "- Bring a big water bottle to any weekend event so hydration is not an afterthought\n- Pair a glass of water with each meal or drink",
  acc_avoid_openings: "- opened warm and general, asked how the week went\n- asked how she was feeling and how her week had really been",
  acc_avoid_celebrate_lines: "- sleep is when everything clicks for you\n- you're still showing up, and I see you",
  acc_avoid_tips: "- prep one simple repeat meal earlier in the day\n- tie your first glass of water to breakfast",
};

const PRESETS: { id: string; label: string; note: string; build: () => Payload }[] = [
  {
    id: "first-early",
    label: "First call, early",
    note: "Day 3, sparse data, no previous blocker, Jumpstart plan.",
    build: () => makePreset({
      first_name: "Test User", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "9:05 AM", current_date: "2026-07-20",
      current_plan_name: "Jumpstart", current_plan_day: 3, current_plan_total_days: 14, plan_end_date: "2026-07-31",
      days_evaluated: 3, form_submissions_7d: 2, avg_meals_7d: 3, avg_sleep_7d: 6.5, avg_steps_7d: 3500,
      avg_water_7d: 40, avg_mood_7d: 3, weight_trend: "no_data", current_weight_lbs: 190, weight_checkins_7d: 1,
      previous_main_blocker: "", previous_commitment: "", previous_proposed_solution: "",
    }),
  },
  {
    id: "strong",
    label: "Follow-up, strong week",
    note: "Losing, high adherence and steps, positive mood.",
    build: () => makePreset({
      first_name: "Test User", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "9:05 AM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle", current_plan_day: 40, current_plan_total_days: 84, plan_end_date: "2026-09-01",
      days_evaluated: 7, form_submissions_7d: 7, avg_meals_7d: 4.6, avg_sleep_7d: 7.8, avg_steps_7d: 9200,
      avg_water_7d: 70, avg_mood_7d: 5, weight_trend: "losing", current_weight_lbs: 178, weight_checkins_7d: 6,
      starting_weight_lbs: 190, goal_weight_lbs: 160,
      previous_main_blocker: "water", previous_commitment: "carry a water bottle to work", previous_proposed_solution: "refill at every meal",
    }),
  },
  {
    id: "plateau",
    label: "Follow-up, plateau",
    note: "Stable weight, decent adherence, discouraged tone.",
    build: () => makePreset({
      first_name: "Test User", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "9:05 AM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle", current_plan_day: 50, current_plan_total_days: 84, plan_end_date: "2026-09-01",
      days_evaluated: 7, form_submissions_7d: 6, avg_meals_7d: 3.6, avg_sleep_7d: 7, avg_steps_7d: 6000,
      avg_water_7d: 55, avg_mood_7d: 3, weight_trend: "stable", current_weight_lbs: 182, weight_checkins_7d: 4,
      starting_weight_lbs: 190, goal_weight_lbs: 160,
      previous_main_blocker: "consistency", previous_commitment: "two repeat dinners this week", previous_proposed_solution: "batch cook on Sunday",
      memory: { profile: "", journey_state: "The last two weeks have felt flat. She is showing up but the scale has not moved and she sounded a little discouraged on the last call.", loose_threads: [] },
    }),
  },
  {
    id: "slipping",
    label: "Follow-up, slipping",
    note: "Few check-ins, gaining, low steps, water, and mood.",
    build: () => makePreset({
      first_name: "Test User", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "9:05 AM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle", current_plan_day: 55, current_plan_total_days: 84, plan_end_date: "2026-09-01",
      days_evaluated: 7, form_submissions_7d: 2, avg_meals_7d: 2.2, avg_sleep_7d: 6, avg_steps_7d: 2800,
      avg_water_7d: 30, avg_mood_7d: 2, weight_trend: "gaining", current_weight_lbs: 192, weight_checkins_7d: 1,
      starting_weight_lbs: 190, goal_weight_lbs: 160,
      previous_main_blocker: "stress eating", previous_commitment: "one planned snack in the afternoon", previous_proposed_solution: "keep cut vegetables ready",
    }),
  },
  {
    id: "repeat-blocker",
    label: "Repeat blocker (steps)",
    note: "Steps weakest again, previous blocker was steps.",
    build: () => makePreset({
      first_name: "Test User", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "9:05 AM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle", current_plan_day: 60, current_plan_total_days: 84, plan_end_date: "2026-09-01",
      days_evaluated: 7, form_submissions_7d: 6, avg_meals_7d: 4, avg_sleep_7d: 7.2, avg_steps_7d: 2600,
      avg_water_7d: 60, avg_mood_7d: 3.5, weight_trend: "stable", current_weight_lbs: 184, weight_checkins_7d: 4,
      starting_weight_lbs: 190, goal_weight_lbs: 160,
      previous_main_blocker: "steps", previous_commitment: "a 10 minute walk after dinner", previous_proposed_solution: "walk right after dinner every day",
    }),
  },
  {
    id: "wan",
    label: "Real user: Wan (plateau)",
    note: "Lifestyle plan, plateau, holding on during a move.",
    build: () => makePreset({
      first_name: "Wan", preferred_checkin_day: "Monday", preferred_checkin_time: "9:00 AM",
      current_local_time: "2:30 PM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle Reset", current_plan_day: 66, current_plan_total_days: 84, plan_end_date: "2026-08-07",
      days_evaluated: 7, form_submissions_7d: 6, avg_meals_7d: 3.5, avg_sleep_7d: 7.5, avg_steps_7d: 4200,
      avg_water_7d: 45, avg_mood_7d: 3, weight_trend: "stable", current_weight_lbs: 198, weight_checkins_7d: 4,
      starting_weight_lbs: 205, goal_weight_lbs: 160,
      previous_main_blocker: "steps",
      previous_commitment: "set noon reminders and do 10 minutes of movement after lunch",
      previous_proposed_solution: "stack a short walk right after lunch",
      memory: {
        profile: WAN_PROFILE,
        journey_state: WAN_JOURNEY,
        loose_threads: [
          { note: "Cooks with her sister", tag: "relationship", mentioned_on: "2026-05-15" },
          { note: "Evening caregiving for her mother crowds out her evenings", tag: "constraint", mentioned_on: "2026-05-15" },
          { note: "Weak knees, needs joint-friendly progression", tag: "constraint", mentioned_on: "2026-05-15" },
          { note: "Cravings for sweet and salty foods", tag: "preference", mentioned_on: "2026-05-15" },
          { note: "Intermittent fasting worked before, 12-hour window feels doable", tag: "history", mentioned_on: "2026-05-15" },
          { note: "Going through a forced move, feeling overwhelmed by it", tag: "event", mentioned_on: "2026-07-06" },
        ],
      },
    }),
  },
  {
    id: "debra",
    label: "Real user: Debra (flat but consistent)",
    note: "Lifestyle plan, consistent, water getting easier.",
    build: () => makePreset({
      first_name: "Debra", preferred_checkin_day: "Thursday", preferred_checkin_time: "8:00 AM",
      current_local_time: "8:05 AM", current_date: "2026-07-20",
      current_plan_name: "Lifestyle Reset", current_plan_day: 66, current_plan_total_days: 84, plan_end_date: "2026-08-07",
      days_evaluated: 7, form_submissions_7d: 7, avg_meals_7d: 4, avg_sleep_7d: 7, avg_steps_7d: 7800,
      avg_water_7d: 55, avg_mood_7d: 4, weight_trend: "stable", current_weight_lbs: 162, weight_checkins_7d: 5,
      starting_weight_lbs: 165, goal_weight_lbs: 140,
      previous_main_blocker: "water",
      previous_commitment: "pair a glass of water with breakfast, with a posted note reminder",
      previous_proposed_solution: "tie the first glass of water to a meal she already eats",
      memory: {
        profile: DEBRA_PROFILE,
        journey_state: DEBRA_JOURNEY,
        loose_threads: [
          { note: "Salmon is a favorite", tag: "preference", mentioned_on: "2026-07-02" },
          { note: "Sunday portable-meal prep with a calendar reminder", tag: "habit", mentioned_on: "2026-06-18" },
          { note: "Keeps fruit on hand and visible ready snacks", tag: "habit", mentioned_on: "2026-06-18" },
          { note: "Busy and late workdays disrupt meals and water", tag: "constraint", mentioned_on: "2026-05-15" },
        ],
      },
    }),
  },
];

// ── validation ───────────────────────────────────────────────────────────────
const REQUIRED = ["first_name", "current_date"];

function isBlank(v: unknown) {
  return v === undefined || v === null || v === "";
}
function validDate(s: unknown) {
  if (typeof s !== "string" || !s) return false;
  return !Number.isNaN(new Date(s + "T00:00:00").getTime());
}
function validate(p: Payload): Record<string, string> {
  const e: Record<string, string> = {};
  for (const key of REQUIRED) {
    if (isBlank(p[key])) e[key] = "Required.";
  }
  // The live agent payload sends spoken-form values ("fifty six", "August 6th"),
  // which are read aloud verbatim. So numeric bounds only apply when a field is
  // actually a number, and date parsing only applies to ISO-form dates. Any
  // non-empty string passes.
  const range = (key: string, lo: number, hi: number) => {
    const v = p[key];
    if (typeof v === "number" && (Number.isNaN(v) || v < lo || v > hi)) {
      e[key] = `Must be between ${lo} and ${hi}.`;
    }
  };
  range("avg_meals_7d", 1, 5);
  range("avg_mood_7d", 1, 5);
  range("days_evaluated", 0, 7);
  const nonNeg = ["form_submissions_7d", "avg_sleep_7d", "avg_steps_7d", "avg_water_7d", "current_weight_lbs", "weight_checkins_7d", "current_plan_day", "current_plan_total_days", "starting_weight_lbs", "goal_weight_lbs"];
  for (const key of nonNeg) {
    const v = p[key];
    if (typeof v === "number" && (Number.isNaN(v) || v < 0)) e[key] = "Must be a number 0 or above.";
  }
  if (!isBlank(p.weight_trend) && !WEIGHT_TREND_OPTIONS.includes(p.weight_trend as string)) {
    e.weight_trend = "Not an allowed value.";
  }
  for (const key of ["current_date", "plan_end_date"]) {
    const v = p[key];
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && !validDate(v)) e[key] = "Not a valid date.";
  }
  return e;
}

const STORAGE_CONFIGS = "cth:configs";
const STORAGE_ASSISTANT = "cth:assistant_id";

// Vapi nests errors as opaque objects (error.error.message deep inside), so
// recursively hunt for the most specific human-readable message.
function describeVapiError(err: unknown): string {
  if (err instanceof Error) return err.message;
  const seen = new Set<unknown>();
  function dig(v: unknown, depth: number): string | null {
    if (v == null || depth > 6) return null;
    if (typeof v === "string") return v.trim() || null;
    if (typeof v !== "object" || seen.has(v)) return null;
    seen.add(v);
    const o = v as Record<string, unknown>;
    for (const key of ["message", "errorMsg", "reason", "description"]) {
      if (typeof o[key] === "string" && (o[key] as string).trim()) return (o[key] as string).trim();
    }
    for (const key of ["error", "message", "data", "response", "body"]) {
      const found = dig(o[key], depth + 1);
      if (found) return found;
    }
    return null;
  }
  const msg = dig(err, 0);
  if (msg) return msg;
  try { return JSON.stringify(err); } catch { return String(err); }
}

// ── Vapi client type ─────────────────────────────────────────────────────────
type VapiClient = {
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeAllListeners?: () => void;
  start: (assistantId: string, overrides?: unknown) => Promise<unknown> | unknown;
  stop: () => Promise<unknown> | unknown;
};

// ── component ────────────────────────────────────────────────────────────────
function CallsTestHarness() {
  const [payload, setPayload] = useState<Payload>(() => JSON.parse(JSON.stringify(DEFAULT_PAYLOAD)) as Payload);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jsonView, setJsonView] = useState(true);
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(DEFAULT_PAYLOAD, null, 2));
  const [jsonError, setJsonError] = useState("");

  const [assistantId, setAssistantId] = useState("");
  const [configs, setConfigs] = useState<{ name: string; payload: Payload }[]>([]);
  const [saveName, setSaveName] = useState("");

  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "ended" | "error">("idle");
  const [callError, setCallError] = useState("");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [sentPayload, setSentPayload] = useState<Payload | null>(null);
  const vapiRef = useRef<VapiClient | null>(null);
  const importRef = useRef<HTMLInputElement | null>(null);
  const jsonFocusedRef = useRef(false);

  // load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_CONFIGS);
      if (raw) setConfigs(JSON.parse(raw));
      const a = localStorage.getItem(STORAGE_ASSISTANT);
      if (a) setAssistantId(a);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    return () => { try { vapiRef.current?.stop?.(); } catch { /* ignore */ } };
  }, []);

  // keep the raw JSON draft in sync when the payload changes from elsewhere
  // (presets, config load, form edits), without clobbering active JSON typing.
  useEffect(() => {
    if (!jsonFocusedRef.current) {
      setJsonDraft(JSON.stringify(payload, null, 2));
      setJsonError("");
    }
  }, [payload]);

  function persistConfigs(next: { name: string; payload: Payload }[]) {
    setConfigs(next);
    try { localStorage.setItem(STORAGE_CONFIGS, JSON.stringify(next)); } catch { /* ignore */ }
  }

  function setField(key: string, value: unknown) {
    setPayload((p) => ({ ...p, [key]: value }));
  }
  function setMemory(key: keyof Memory, value: unknown) {
    setPayload((p) => ({ ...p, memory: { ...(p.memory ?? EMPTY_MEMORY), [key]: value } }));
  }

  // loose threads
  function addThread() {
    setPayload((p) => {
      const m = p.memory ?? EMPTY_MEMORY;
      return { ...p, memory: { ...m, loose_threads: [...m.loose_threads, { note: "", mentioned_on: (p.current_date as string) || "", tag: "" }] } };
    });
  }
  function updateThread(i: number, patch: Partial<LooseThread>) {
    setPayload((p) => {
      const m = p.memory ?? EMPTY_MEMORY;
      const next = m.loose_threads.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
      return { ...p, memory: { ...m, loose_threads: next } };
    });
  }
  function removeThread(i: number) {
    setPayload((p) => {
      const m = p.memory ?? EMPTY_MEMORY;
      return { ...p, memory: { ...m, loose_threads: m.loose_threads.filter((_, idx) => idx !== i) } };
    });
  }

  // first-call toggle
  const isFirstCall = isBlank(payload.previous_main_blocker) || payload.previous_main_blocker === "none";
  function toggleFirstCall(on: boolean) {
    if (on) {
      setPayload((p) => ({ ...p, previous_main_blocker: "", previous_commitment: "", previous_proposed_solution: "" }));
    } else {
      setPayload((p) => ({ ...p, previous_main_blocker: p.previous_main_blocker || "consistency" }));
    }
  }

  function loadPreset(id: string) {
    const preset = PRESETS.find((x) => x.id === id);
    if (!preset) return;
    setPayload(preset.build());
    setErrors({});
    setJsonError("");
  }

  // json view sync
  function openJson() {
    setJsonView(true);
  }
  function onJsonChange(text: string) {
    setJsonDraft(text);
    try {
      const parsed = JSON.parse(text);
      if (!parsed.memory) parsed.memory = { profile: "", journey_state: "", loose_threads: [] };
      setPayload(parsed);
      setJsonError("");
    } catch (err) {
      setJsonError("Invalid JSON: " + (err instanceof Error ? err.message : String(err)));
    }
  }
  function closeJson() {
    if (jsonError) return;
    setJsonView(false);
  }

  // save / export / import
  function saveConfig() {
    const name = saveName.trim();
    if (!name) return;
    const e = validate(payload);
    setErrors(e);
    const next = [...configs.filter((c) => c.name !== name), { name, payload: JSON.parse(JSON.stringify(payload)) }];
    persistConfigs(next);
    setSaveName("");
  }
  function loadConfig(name: string) {
    const c = configs.find((x) => x.name === name);
    if (c) { setPayload(JSON.parse(JSON.stringify(c.payload))); setErrors({}); setJsonError(""); }
  }
  function deleteConfig(name: string) {
    persistConfigs(configs.filter((c) => c.name !== name));
  }
  function exportConfig() {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(payload.first_name as string || "config").toString().replace(/\s+/g, "-").toLowerCase()}-payload.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importConfig(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed.memory) parsed.memory = { profile: "", journey_state: "", loose_threads: [] };
        setPayload(parsed);
        setErrors({});
        setJsonError("");
      } catch {
        setCallError("Could not import: the file is not valid JSON.");
      }
    };
    reader.readAsText(file);
  }

  // call
  async function startCall() {
    const e = validate(payload);
    setErrors(e);
    if (Object.keys(e).length) {
      setCallError("Fix the highlighted fields before starting a call.");
      return;
    }
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    if (!publicKey) { setCallError("Missing VITE_VAPI_PUBLIC_KEY. The voice SDK is not configured."); return; }
    if (!assistantId.trim()) { setCallError("Set the accountability agent Assistant ID first."); return; }

    try {
      setCallError("");
      setTranscript([]);
      setCallStatus("connecting");

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCallError("Microphone is not available. Use HTTPS and a supported browser.");
        setCallStatus("error");
        return;
      }
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const eventsModule = await import("events");
      const EE = eventsModule.EventEmitter || eventsModule.default;
      if (typeof EE !== "function") throw new Error("Events polyfill is not available.");

      const VapiModule = await import("@vapi-ai/web");
      const Vapi = VapiModule.default;
      if (typeof Vapi !== "function") throw new Error("@vapi-ai/web default export is not a constructor.");

      const vapi = new Vapi(publicKey) as VapiClient;
      vapiRef.current = vapi;

      vapi.on("call-start", () => setCallStatus("connected"));
      vapi.on("call-end", () => setCallStatus("ended"));
      vapi.on("error", (err: unknown) => {
        console.error("Vapi error", err);
        setCallError("Call error: " + describeVapiError(err));
        setCallStatus("error");
      });
      vapi.on("message", (msg: unknown) => {
        const m = msg as { type?: string; role?: string; transcript?: string; transcriptType?: string };
        if (m?.type === "transcript" && m.transcriptType === "final" && m.transcript) {
          setTranscript((t) => [...t, { role: m.role || "unknown", text: m.transcript as string }]);
        }
      });

      const snapshot = JSON.parse(JSON.stringify(payload)) as Payload;
      setSentPayload(snapshot);
      await vapi.start(assistantId.trim(), { variableValues: snapshot });
    } catch (err) {
      console.error("startCall failed", err);
      setCallError("Could not start the call: " + (err instanceof Error ? err.message : String(err)));
      setCallStatus("error");
    }
  }
  function endCall() {
    try { vapiRef.current?.stop?.(); } catch { /* ignore */ }
    setCallStatus("ended");
  }
  function persistAssistant(v: string) {
    setAssistantId(v);
    try { localStorage.setItem(STORAGE_ASSISTANT, v); } catch { /* ignore */ }
  }

  const inCall = callStatus === "connecting" || callStatus === "connected";
  const statusLabel: Record<string, string> = {
    idle: "Idle", connecting: "Connecting", connected: "Connected", ended: "Call ended", error: "Error",
  };

  return (
    <div className="cth">
      <style>{CSS}</style>
      <header className="cth-top">
        <h1>Accountability Agent Test Harness</h1>
        <span className="cth-sub">Hand-set every input, then start a live call and talk to the agent in the browser.</span>
      </header>

      <div className="cth-grid">
        {/* LEFT: inputs */}
        <div className="cth-left">
          <details className="cth-card">
            <summary>Presets</summary>
            <div className="cth-card-body">
              <p className="cth-hint">Load a scenario, then edit any field. Loading replaces the whole payload.</p>
              <div className="cth-presets">
                {PRESETS.map((p) => (
                  <button key={p.id} type="button" className="cth-preset" onClick={() => loadPreset(p.id)} title={p.note}>
                    <strong>{p.label}</strong>
                    <span>{p.note}</span>
                  </button>
                ))}
              </div>
              <div className="cth-row cth-toggle-row">
                <label className="cth-check">
                  <input type="checkbox" checked={isFirstCall} onChange={(ev) => toggleFirstCall(ev.target.checked)} />
                  First call (clears the previous-call fields)
                </label>
              </div>
            </div>
          </details>

          <div className="cth-card cth-card-static">
            <div className="cth-viewbar-in">
              <span className="cth-viewbar-label">Editing view</span>
              <div className="cth-seg-group">
                <button className={`cth-seg ${!jsonView ? "on" : ""}`} type="button" onClick={() => setJsonView(false)}>Form</button>
                <button className={`cth-seg ${jsonView ? "on" : ""}`} type="button" onClick={openJson}>Raw JSON</button>
              </div>
            </div>
          </div>

          {jsonView ? (
            <div className="cth-card cth-card-static">
              <div className="cth-card-head">Raw JSON</div>
              <div className="cth-card-body">
                <p className="cth-hint">Edit the payload directly. Changes sync with the form when the JSON is valid.</p>
                <CodeArea value={jsonDraft} onChange={onJsonChange} onFocus={() => { jsonFocusedRef.current = true; }} onBlur={() => { jsonFocusedRef.current = false; }} />
                {jsonError ? <p className="cth-error">{jsonError}</p> : <p className="cth-ok">JSON is valid and in sync.</p>}
                <button type="button" className="cth-btn" onClick={closeJson} disabled={!!jsonError}>Back to form</button>
              </div>
            </div>
          ) : (
            <>
              {SCHEMA.map((group) => (
                <details className="cth-card" open key={group.id}>
                  <summary>{group.title}</summary>
                  <div className="cth-card-body cth-fields">
                    {group.fields.map((f) => (
                      <Field key={f.key} def={f} value={payload[f.key]} error={errors[f.key]} onChange={(v) => setField(f.key, v)} />
                    ))}
                  </div>
                </details>
              ))}

              <details className="cth-card" open>
                <summary>User memory</summary>
                <div className="cth-card-body cth-fields">
                  <p className="cth-hint">These memory fields only change the agent's behavior once its prompt has a placeholder that reads them. On the current agent they are sent but ignored, and that is expected.</p>
                  <label className="cth-field">
                    <span className="cth-label">memory.profile</span>
                    <span className="cth-hint">The stable picture of who they are. Changes slowly.</span>
                    <textarea className="cth-textarea" value={payload.memory?.profile ?? ""} onChange={(ev) => setMemory("profile", ev.target.value)} rows={5} />
                  </label>
                  <label className="cth-field">
                    <span className="cth-label">memory.journey_state</span>
                    <span className="cth-hint">Where they are right now and how the last week or two went. Rebuilt each call.</span>
                    <textarea className="cth-textarea" value={payload.memory?.journey_state ?? ""} onChange={(ev) => setMemory("journey_state", ev.target.value)} rows={5} />
                  </label>

                  <div className="cth-field">
                    <span className="cth-label">memory.loose_threads</span>
                    <span className="cth-hint">Specific things the user mentioned that should persist and can resurface later.</span>
                    <div className="cth-threads">
                      {(payload.memory?.loose_threads ?? []).map((t, i) => (
                        <div className="cth-thread" key={i}>
                          <div className="cth-thread-grid">
                            <label className="cth-mini"><span>note</span>
                              <input value={t.note} onChange={(ev) => updateThread(i, { note: ev.target.value })} />
                            </label>
                            <label className="cth-mini"><span>mentioned_on</span>
                              <input type="date" value={t.mentioned_on || ""} onChange={(ev) => updateThread(i, { mentioned_on: ev.target.value })} />
                            </label>
                            <label className="cth-mini"><span>relevant_around</span>
                              <input type="date" value={t.relevant_around || ""} onChange={(ev) => updateThread(i, { relevant_around: ev.target.value })} />
                            </label>
                            <label className="cth-mini"><span>tag</span>
                              <select value={t.tag || ""} onChange={(ev) => updateThread(i, { tag: ev.target.value as Tag })}>
                                <option value="">none</option>
                                {TAG_OPTIONS.map((tg) => <option key={tg} value={tg}>{tg}</option>)}
                              </select>
                            </label>
                          </div>
                          <button type="button" className="cth-btn cth-btn-ghost cth-btn-sm" onClick={() => removeThread(i)}>Remove</button>
                        </div>
                      ))}
                      <button type="button" className="cth-btn cth-btn-sm" onClick={addThread}>Add loose thread</button>
                    </div>
                  </div>
                </div>
              </details>
            </>
          )}

          <div className="cth-card cth-card-static">
            <div className="cth-card-head">Live payload preview</div>
            <div className="cth-card-body">
              <p className="cth-hint">The exact object sent to the agent as variableValues at call start.</p>
              <CodeBlock json={JSON.stringify(payload, null, 2)} />
            </div>
          </div>

          {sentPayload && (
            <div className="cth-card cth-card-static">
              <div className="cth-card-head">Last sent payload</div>
              <div className="cth-card-body">
                <CodeBlock json={JSON.stringify(sentPayload, null, 2)} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: call panel */}
        <div className="cth-right">
          <div className="cth-card cth-card-static cth-sticky">
            <div className="cth-card-head">Call</div>
            <div className="cth-card-body">
              <label className="cth-field">
                <span className="cth-label">Accountability agent Assistant ID</span>
                <span className="cth-hint">The Vapi assistant to call. Paste the main accountability agent's ID. It is saved for next time.</span>
                <input value={assistantId} onChange={(ev) => persistAssistant(ev.target.value)} placeholder="assistant id" />
              </label>

              <div className="cth-status">
                <span className={`cth-dot cth-dot-${callStatus}`} />
                <span>{statusLabel[callStatus]}</span>
              </div>
              {callError ? <p className="cth-error">{callError}</p> : null}

              <div className="cth-row">
                {!inCall ? (
                  <button type="button" className="cth-btn cth-btn-primary" onClick={startCall}>Start test call</button>
                ) : (
                  <button type="button" className="cth-btn cth-btn-danger" onClick={endCall}>End call</button>
                )}
              </div>

              {transcript.length > 0 && (
                <div className="cth-transcript">
                  <div className="cth-label">Transcript</div>
                  {transcript.map((line, i) => (
                    <p key={i} className={`cth-tline cth-tline-${line.role}`}><strong>{line.role}:</strong> {line.text}</p>
                  ))}
                </div>
              )}

              <div className="cth-save">
                <div className="cth-label">Saved configurations</div>
                <div className="cth-row">
                  <input value={saveName} placeholder="name this config" onChange={(ev) => setSaveName(ev.target.value)} />
                  <button type="button" className="cth-btn cth-btn-sm" onClick={saveConfig} disabled={!saveName.trim()}>Save</button>
                </div>
                {configs.length === 0 ? <p className="cth-hint">No saved configs yet.</p> : (
                  <ul className="cth-config-list">
                    {configs.map((c) => (
                      <li key={c.name}>
                        <span>{c.name}</span>
                        <span className="cth-config-actions">
                          <button type="button" className="cth-link" onClick={() => loadConfig(c.name)}>Load</button>
                          <button type="button" className="cth-link cth-link-danger" onClick={() => deleteConfig(c.name)}>Delete</button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="cth-row">
                  <button type="button" className="cth-btn cth-btn-ghost cth-btn-sm" onClick={exportConfig}>Export JSON</button>
                  <button type="button" className="cth-btn cth-btn-ghost cth-btn-sm" onClick={() => importRef.current?.click()}>Import JSON</button>
                  <input ref={importRef} type="file" accept="application/json" style={{ display: "none" }} onChange={(ev) => { const f = ev.target.files?.[0]; if (f) importConfig(f); ev.target.value = ""; }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── single field ─────────────────────────────────────────────────────────────
function Field({ def, value, error, onChange }: { def: FieldDef; value: unknown; error?: string; onChange: (v: unknown) => void }) {
  const id = `f-${def.key}`;
  return (
    <label className={`cth-field ${error ? "has-error" : ""}`} htmlFor={id}>
      <span className="cth-label">{def.label}{def.optional ? <em className="cth-opt"> optional</em> : null}</span>
      {def.hint ? <span className="cth-hint">{def.hint}</span> : null}
      {def.type === "select" ? (
        <select id={id} value={(value as string) ?? ""} onChange={(ev) => onChange(ev.target.value)}>
          {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : def.type === "number" ? (
        <input id={id} type="number" min={def.min} max={def.max} step={def.step} value={value === undefined || value === null ? "" : String(value)}
          onChange={(ev) => onChange(ev.target.value === "" ? undefined : Number(ev.target.value))} />
      ) : def.type === "date" ? (
        <input id={id} type="date" value={(value as string) ?? ""} onChange={(ev) => onChange(ev.target.value)} />
      ) : (
        <input id={id} type="text" value={(value as string) ?? ""} onChange={(ev) => onChange(ev.target.value)} />
      )}
      {error ? <span className="cth-error">{error}</span> : null}
    </label>
  );
}

// ── json syntax highlighting ─────────────────────────────────────────────────
function highlightJson(src: string): string {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc.replace(
    /"(?:\\u[a-fA-F0-9]{4}|\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (m: string, ...args: unknown[]) => {
      const whole = args[args.length - 1] as string;
      const offset = args[args.length - 2] as number;
      let cls = "num";
      if (m[0] === '"') {
        cls = /^\s*:/.test(whole.slice(offset + m.length)) ? "key" : "str";
      } else if (m === "true" || m === "false") cls = "bool";
      else if (m === "null") cls = "nul";
      return `<span class="tk-${cls}">${m}</span>`;
    },
  );
}

function CodeArea({ value, onChange, onFocus, onBlur }: { value: string; onChange: (v: string) => void; onFocus: () => void; onBlur: () => void }) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const sync = () => {
    if (taRef.current && preRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
    }
  };
  return (
    <div className="cth-code">
      <pre ref={preRef} className="cth-code-hl" aria-hidden dangerouslySetInnerHTML={{ __html: highlightJson(value) + "\n" }} />
      <textarea ref={taRef} className="cth-code-ta" spellCheck={false} value={value} onScroll={sync} onFocus={onFocus} onBlur={onBlur} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function CodeBlock({ json }: { json: string }) {
  return <pre className="cth-code-block" dangerouslySetInnerHTML={{ __html: highlightJson(json) }} />;
}

const CSS = `
.cth{--bg:#0e1013;--panel:#191c22;--panel-2:#20242b;--ink:#e7eaf0;--soft:#9aa4b2;--faint:#6c7683;--line:#2b3138;--line-2:#242931;--pri:#8b5cf6;--pri-ink:#b79df6;--danger:#f26a5f;--ok:#48c98a;--radius:12px;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
.cth *{box-sizing:border-box}
.cth-top{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;padding:13px 28px;background:var(--panel);border-bottom:1px solid var(--line)}
.cth-top h1{margin:0;font-size:19px;font-weight:700;letter-spacing:-.01em}
.cth-sub{margin:0;color:var(--soft);font-size:14px}
.cth-seg{border:1px solid var(--line);background:var(--panel-2);color:var(--soft);padding:9px 16px;border-radius:9px;cursor:pointer;font-weight:600;font-size:14px}
.cth-seg.on{background:var(--pri);border-color:var(--pri);color:#fff}
.cth-viewbar-in{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px}
.cth-viewbar-label{font-weight:600;font-size:14px;color:var(--soft)}
.cth-seg-group{display:inline-flex;gap:8px}
.cth-grid{display:grid;grid-template-columns:1fr;gap:18px;padding:18px 28px 72px;max-width:1500px;margin:0 auto}
@media (min-width:1000px){.cth-grid{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr)}}
.cth-left,.cth-right{display:flex;flex-direction:column;gap:16px;min-width:0}
.cth-card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
.cth-card>summary{list-style:none;cursor:pointer;padding:16px 18px;font-weight:700;font-size:16px;display:flex;align-items:center;gap:9px}
.cth-card>summary::-webkit-details-marker{display:none}
.cth-card>summary::before{content:"";width:8px;height:8px;border-right:2px solid var(--faint);border-bottom:2px solid var(--faint);transform:rotate(-45deg);transition:transform .15s}
.cth-card[open]>summary::before{transform:rotate(45deg)}
.cth-card-head{padding:16px 18px;font-weight:700;font-size:16px;border-bottom:1px solid var(--line-2)}
.cth-card-body{padding:0 18px 18px}
.cth-card>summary + .cth-card-body{padding-top:2px}
.cth-fields{display:flex;flex-direction:column;gap:18px}
.cth-field{display:flex;flex-direction:column;gap:5px}
.cth-label{font-weight:600;font-size:14px;color:var(--ink)}
.cth-opt{font-style:normal;color:var(--faint);font-weight:500;font-size:12.5px}
.cth-hint{color:var(--soft);font-size:13px;line-height:1.45;margin:0}
.cth input,.cth select,.cth textarea{width:100%;border:1px solid var(--line);border-radius:9px;padding:10px 12px;font-size:15px;font-family:inherit;color:var(--ink);background:#12151a}
.cth input::placeholder,.cth textarea::placeholder{color:var(--faint)}
.cth input:focus,.cth select:focus,.cth textarea:focus{outline:none;border-color:var(--pri);box-shadow:0 0 0 3px rgba(139,92,246,.28)}
.cth select option{background:#12151a;color:var(--ink)}
.cth-textarea{resize:vertical;line-height:1.55}
.cth-field.has-error input,.cth-field.has-error select{border-color:var(--danger);background:#2a1a1c}
.cth-error{color:var(--danger);font-size:13px;font-weight:600;margin:2px 0 0}
.cth-ok{color:var(--ok);font-size:13px;font-weight:600;margin:7px 0 0}
.cth-btn{border:1px solid var(--pri);background:var(--pri);color:#fff;font-weight:600;font-size:14.5px;padding:11px 18px;border-radius:9px;cursor:pointer;font-family:inherit}
.cth-btn:hover{filter:brightness(1.08)}
.cth-btn:disabled{opacity:.45;cursor:not-allowed}
.cth-btn-sm{padding:9px 14px;font-size:13.5px}
.cth-btn-primary{background:var(--pri);border-color:var(--pri)}
.cth-btn-ghost{background:var(--panel-2);color:var(--pri-ink);border-color:var(--line)}
.cth-btn-danger{background:var(--danger);border-color:var(--danger);color:#fff}
.cth-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px}
.cth-toggle-row{margin-top:16px;border-top:1px solid var(--line-2);padding-top:14px}
.cth-check{display:flex;align-items:center;gap:10px;font-size:14.5px;font-weight:600;cursor:pointer}
.cth-check input{width:auto;accent-color:var(--pri);transform:scale(1.2)}
.cth-presets{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
@media (max-width:560px){.cth-presets{grid-template-columns:1fr}}
.cth-preset{text-align:left;border:1px solid var(--line);background:var(--panel-2);border-radius:10px;padding:12px 14px;cursor:pointer;display:flex;flex-direction:column;gap:3px}
.cth-preset:hover{border-color:var(--pri);background:#242732}
.cth-preset strong{font-size:14px;color:var(--ink)}
.cth-preset span{font-size:12.5px;color:var(--soft)}
.cth .tk-key{color:#9cdcfe}
.cth .tk-str{color:#ce9178}
.cth .tk-num{color:#b5cea8}
.cth .tk-bool{color:#569cd6}
.cth .tk-nul{color:#569cd6}
.cth-code{position:relative;height:520px;min-height:260px;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#0b0e13;resize:vertical}
.cth-code-hl,.cth-code .cth-code-ta{position:absolute;inset:0;margin:0;padding:16px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;overflow:auto;border:0;border-radius:0;tab-size:2}
.cth-code-hl{color:#d4d4d4;pointer-events:none;z-index:0}
.cth-code .cth-code-ta{z-index:1;width:100%;height:100%;background:transparent;color:transparent;caret-color:#e7eaf0;resize:none;outline:none}
.cth-code .cth-code-ta:focus{box-shadow:none;border:0}
.cth-code .cth-code-ta::selection{background:rgba(139,92,246,.38)}
.cth-code-block{margin:9px 0 0;background:#0b0e13;color:#d4d4d4;border:1px solid var(--line);border-radius:10px;padding:16px;overflow:auto;max-height:520px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
.cth-threads{display:flex;flex-direction:column;gap:12px;margin-top:8px}
.cth-thread{border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--panel-2)}
.cth-thread-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media (max-width:560px){.cth-thread-grid{grid-template-columns:1fr}}
.cth-mini{display:flex;flex-direction:column;gap:4px}
.cth-mini span{font-size:12.5px;color:var(--faint);font-weight:600}
.cth-sticky{position:sticky;top:16px}
.cth-status{display:flex;align-items:center;gap:10px;font-weight:600;font-size:14.5px;margin-top:14px}
.cth-dot{width:10px;height:10px;border-radius:999px;background:var(--faint)}
.cth-dot-connecting{background:#e0a52e}
.cth-dot-connected{background:var(--ok)}
.cth-dot-ended{background:var(--faint)}
.cth-dot-error{background:var(--danger)}
.cth-transcript{margin-top:16px;border-top:1px solid var(--line-2);padding-top:14px;max-height:340px;overflow:auto}
.cth-tline{margin:0 0 8px;font-size:14.5px;color:var(--ink)}
.cth-tline-assistant strong{color:var(--pri-ink)}
.cth-tline-user strong{color:var(--soft)}
.cth-save{margin-top:18px;border-top:1px solid var(--line-2);padding-top:14px}
.cth-config-list{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:5px}
.cth-config-list li{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px;padding:7px 0;border-bottom:1px solid var(--line-2)}
.cth-config-actions{display:flex;gap:12px}
.cth-link{background:none;border:0;color:var(--pri-ink);font-weight:600;cursor:pointer;font-size:13.5px;padding:0}
.cth-link-danger{color:var(--danger)}
.cth-card-static{background:var(--panel)}
`;
