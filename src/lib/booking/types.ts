/**
 * The exact shape /free-call hands to the backend.
 *
 * Keep this in sync with docs/free-call-backend-handoff.md, which is the
 * document Christophe builds the real endpoint against.
 */

export interface BookingUtm {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
}

/** The chosen slot. `iso` is null when she picked "Other time". */
export interface BookingSlot {
  iso: string | null;
  label: string;
}

export interface BookingPayload {
  firstName: string;
  /** E.164, for example +13235550147. */
  phone: string;
  email: string;
  /** The optional "number one goal" answer. null when left blank. */
  goal: string | null;
  slot: BookingSlot;
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
