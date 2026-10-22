/**
 * Placeholder call availability for /free-call.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * Nothing here talks to a calendar. The slots below are generated from the
 * browser clock purely so the picker has something friendly to show in v1.
 *
 * To wire real availability, replace `buildPlaceholderSlots` with a fetch of
 * the coach's open slots and return the same `CallSlot[]` shape. The form
 * already stores both halves of a slot (`iso` for machines, `label` for
 * humans) and sends them untouched, so the booking form itself does not have
 * to change.
 * ──────────────────────────────────────────────────────────────────────────
 */

export interface CallSlot {
  /** Stable positional key for the radio group. */
  id: string;
  /** ISO 8601 instant. null before the client clock is read, and for "Other time". */
  iso: string | null;
  label: string;
}

export const OTHER_SLOT: CallSlot = { id: "other", iso: null, label: "Other time" };

/** Friendly hours we pretend the coach is free. */
const CANDIDATE_HOURS = [9, 12, 15, 18];
/** How far ahead we are willing to look to fill the list. */
const DAYS_AHEAD = 3;
/** Never offer a slot that is almost here. */
const LEAD_MINUTES = 60;
const SLOT_COUNT = 4;

/**
 * Rendered on the server and on the first client paint, so the markup matches
 * and hydration stays quiet. `buildPlaceholderSlots` replaces these on mount
 * with real instants in her own time zone. Ids are positional, so a selection
 * made in that first instant survives the swap.
 */
export const DEFAULT_SLOTS: CallSlot[] = [
  { id: "slot-0", iso: null, label: "Today 3:00 PM" },
  { id: "slot-1", iso: null, label: "Today 6:00 PM" },
  { id: "slot-2", iso: null, label: "Tomorrow 9:00 AM" },
  { id: "slot-3", iso: null, label: "Tomorrow 12:00 PM" },
];

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const WEEKDAY_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "long" });

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function dayWord(at: Date, now: Date): string {
  const days = Math.round((startOfDay(at) - startOfDay(now)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return WEEKDAY_FORMAT.format(at);
}

/** "Tomorrow 9:00 AM". The same label the confirmation, the SMS and the email use. */
export function slotLabel(at: Date, now: Date = new Date()): string {
  return `${dayWord(at, now)} ${TIME_FORMAT.format(at)}`;
}

/** Browser-only. Call it from an effect, never during render. */
export function buildPlaceholderSlots(now: Date = new Date()): CallSlot[] {
  const earliest = now.getTime() + LEAD_MINUTES * 60_000;
  const slots: CallSlot[] = [];
  for (let day = 0; day < DAYS_AHEAD && slots.length < SLOT_COUNT; day += 1) {
    for (const hour of CANDIDATE_HOURS) {
      if (slots.length >= SLOT_COUNT) break;
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, 0, 0, 0);
      if (at.getTime() < earliest) continue;
      slots.push({
        id: `slot-${slots.length}`,
        iso: at.toISOString(),
        label: slotLabel(at, now),
      });
    }
  }
  return slots.length ? slots : DEFAULT_SLOTS;
}
