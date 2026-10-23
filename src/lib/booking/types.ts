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

export type BookingResult = { ok: true; bookingId: string | null } | { ok: false; reason: string };
