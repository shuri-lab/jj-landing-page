/**
 * The exact shape /free-call hands to the backend.
 *
 * Keep this in sync with docs/free-call-backend-handoff.md, which is the
 * document Christophe builds the real endpoint against.
 */

import type { WhenSelection } from "./slots";

export interface BookingUtm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

export interface BookingPayload {
  /**
   * When she wants the call.
   *  - `{ mode: "now", iso: null, label: "Now" }` means call as soon as you can
   *  - `{ mode: "scheduled", iso, label }` carries the instant and the words
   *    she saw, for example "Tomorrow at 9:00 AM"
   */
  when: WhenSelection;
  firstName: string;
  /** E.164, for example +13235550147. */
  phone: string;
  email: string;
  /** Always true: the form cannot be submitted with the box unticked. */
  consent: true;
  /** ISO 8601, the moment the box was ticked. */
  consentAt: string;
  utm: BookingUtm;
  referrer: string | null;
  pagePath: string;
  submittedAt: string;
}

export type BookingResult =
  | {
      ok: true;
      bookingId: string | null;
      /**
       * Her free-call link token, the one her texts carry (7 days). The
       * confirmation uses it to see how the call went and, after a missed
       * call, to get her called again. Null from an older backend.
       */
      statusToken: string | null;
      /** Her reschedule page on the coach's site, for picking another time. */
      rescheduleUrl: string | null;
    }
  | { ok: false; reason: string };

/** Where her free call stands, as GET /public/free-call/reschedule reports it. */
export type CallState = "open" | "scheduled" | "calling" | "done" | "member" | "closed";

/**
 * Why the call is where it is. `unreachable` comes with `closed`: her number
 * cannot be called, so the page offers to book with another one.
 */
export type CallReason = "cut_off" | "missed" | "callback" | "booked" | "unreachable";

export interface CallStatus {
  state: CallState;
  reason: CallReason;
  /** When the newest dial ended without reaching her; null otherwise. */
  missedAt: string | null;
  firstName: string | null;
  /** Who is on the phone, e.g. "JJ's coach". */
  caller: string;
  /** The next dial, when one is booked. `label` reads "Today at 8:15 PM". */
  scheduledFor: { iso: string; label: string } | null;
  slots: { now: { available: boolean } };
}
