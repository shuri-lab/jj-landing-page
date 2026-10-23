/**
 * Call times for the /free-call booking form.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * Nothing here talks to a calendar. The times below are generated from the
 * browser clock, in her own time zone, purely so the picker has something
 * real to show in v1.
 *
 * To wire real availability, replace `buildDayTimes` with a fetch of JJ's
 * open slots for that day and return the same `CallTime[]` shape. The form
 * stores both halves of a time (`iso` for machines, `label` for humans) and
 * sends them untouched, so the form itself does not have to change.
 *
 * The "Now" option never has an `iso`: it means "call me as soon as you can",
 * and the backend decides what that turns into.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** Calling hours, her local time. 8:00 AM through 9:00 PM. */
export const CALL_DAY_START_HOUR = 8;
export const CALL_DAY_END_HOUR = 21;
/** The picker steps in half hours. */
export const SLOT_STEP_MINUTES = 30;
/** Never offer a time that is almost here. */
export const LEAD_MINUTES = 30;

export type WhenMode = "now" | "scheduled";
/** 0 is today, 1 is tomorrow. */
export type DayOffset = 0 | 1;

export interface CallTime {
  /** ISO 8601 instant. */
  iso: string;
  /** "4:30 PM", her local time. */
  label: string;
}

export interface WhenSelection {
  mode: WhenMode;
  /** null for "now". */
  iso: string | null;
  /** "Now", "Today at 4:30 PM", "Tomorrow at 9:00 AM". */
  label: string;
}

export const WHEN_NOW: WhenSelection = { mode: "now", iso: null, label: "Now" };

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "4:30 PM". */
export function formatTime(date: Date): string {
  return TIME_FORMAT.format(date);
}

/**
 * Every half hour inside calling hours for today (0) or tomorrow (1).
 * Today drops anything inside the lead time, so a call is never booked for a
 * minute from now. Browser only: call it from an effect or an event handler.
 */
export function buildDayTimes(day: DayOffset, now: Date = new Date()): CallTime[] {
  const earliest = now.getTime() + LEAD_MINUTES * 60_000;
  const times: CallTime[] = [];
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);

  for (let hour = CALL_DAY_START_HOUR; hour <= CALL_DAY_END_HOUR; hour += 1) {
    for (let minute = 0; minute < 60; minute += SLOT_STEP_MINUTES) {
      // 9:00 PM is the last call of the day, so 9:30 PM is out.
      if (hour === CALL_DAY_END_HOUR && minute > 0) break;
      const at = new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute, 0, 0);
      if (day === 0 && at.getTime() < earliest) continue;
      times.push({ iso: at.toISOString(), label: formatTime(at) });
    }
  }
  return times;
}

/** "Today at 4:30 PM" / "Tomorrow at 9:00 AM". The label the SMS and email reuse. */
export function scheduledLabel(day: DayOffset, time: CallTime): string {
  return `${day === 0 ? "Today" : "Tomorrow"} at ${time.label}`;
}

/** How the confirmation says it out loud: "today at 4:30 PM". */
export function spokenWhen(selection: WhenSelection): string {
  if (selection.mode === "now") return "in the next few minutes";
  return selection.label.replace(/^Today/, "today").replace(/^Tomorrow/, "tomorrow");
}

/**
 * Her time zone, short form: "EDT", "PST", "GMT+2". Browser only, so read it
 * from an effect. Falls back to an empty string, and the form then simply
 * does not show the line.
 */
export function timeZoneLabel(): string {
  if (typeof Intl === "undefined") return "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZoneName: "short" }).formatToParts(
      new Date(),
    );
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}
