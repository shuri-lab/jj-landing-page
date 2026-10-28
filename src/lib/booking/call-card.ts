/**
 * Which confirmation she sees, from where her call stands.
 *
 * Kept apart from the markup so the rules read in one place:
 *  - nothing new yet: the original "You're booked" card;
 *  - a dial rang out (no answer, voicemail, a failed connection, a silent
 *    pickup): "We missed you", with "Call me now" while a retry is not
 *    already ringing;
 *  - an answered call that got cut off, or "call me later" with no time:
 *    her way back to the call;
 *  - she asked for a call now on this page: "Calling you now", until a newer
 *    dial goes unanswered;
 *  - finished, joined, closed, a number we cannot call, or a booking someone
 *    replaced by booking this number again on the page.
 */

import type { CallStatus } from "./types";

export type CallCard =
  | { kind: "booked" }
  | { kind: "calling" }
  /** `retry`: "later" has a next dial booked, "now" is dialing again, null has none. */
  | { kind: "missed"; missedAt: string | null; retry: "later" | "now" | null }
  | { kind: "cut_off" }
  | { kind: "callback" }
  | { kind: "open" }
  | { kind: "done" }
  | { kind: "member" }
  | { kind: "closed" }
  | { kind: "unreachable" }
  | { kind: "replaced" };

/** She pressed "Call me now" on this page, and the backend took it. */
export interface AskedNow {
  /**
   * When she pressed it (her clock, ms), compared only with `checkedAt`,
   * which is her clock too. Status checks are held while the request is in
   * flight, so every status checked after this comes from after it.
   */
  at: number;
  /** The miss on screen when she asked; any other miss is a new one. */
  missedBefore: string | null;
}

/**
 * @param asked her "Call me now", so the page shows the call she asked for
 * rather than the miss before it.
 * @param checkedAt when the request behind `status` started (her clock): a
 * status asked for before she pressed the button says nothing about the
 * call she just asked for.
 */
export function callCard(
  status: CallStatus | null,
  asked: AskedNow | null = null,
  checkedAt: number | null = null,
): CallCard {
  if (asked && (!status || checkedAt === null || checkedAt < asked.at)) {
    return { kind: "calling" };
  }
  if (!status) return { kind: "booked" };
  switch (status.state) {
    case "done":
      return { kind: "done" };
    case "member":
      return { kind: "member" };
    case "closed":
      return status.reason === "unreachable"
        ? { kind: "unreachable" }
        : status.reason === "replaced"
          ? { kind: "replaced" }
          : { kind: "closed" };
  }

  // Server times only: a phone's clock can be minutes off.
  const missedAt = status.missedAt;
  if (missedAt !== null && (!asked || missedAt !== asked.missedBefore)) {
    return {
      kind: "missed",
      missedAt,
      retry: status.state === "scheduled" ? "later" : status.state === "calling" ? "now" : null,
    };
  }
  if (status.state === "calling") return asked ? { kind: "calling" } : { kind: "booked" };
  if (status.state === "scheduled") return { kind: "booked" };
  if (status.reason === "cut_off") return { kind: "cut_off" };
  if (status.reason === "callback") return { kind: "callback" };
  if (status.reason === "missed") return { kind: "missed", missedAt: null, retry: null };
  return { kind: "open" };
}

/** "Today at 8:15 PM" reads "today at 8:15 PM" inside a sentence. */
export function inSentence(label: string): string {
  return label.replace(/^Today/, "today").replace(/^Tomorrow/, "tomorrow");
}

/** "8:10 PM" on her own clock. */
export function clockTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
      new Date(iso),
    );
  } catch {
    return "";
  }
}
