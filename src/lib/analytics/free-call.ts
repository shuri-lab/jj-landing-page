/**
 * /free-call funnel events.
 *
 * One PostHog project, one key, one init: see lib/analytics/posthog.ts, which
 * is called once at the app root. Do not add a second init or a second key.
 *
 * Pages are kept apart by event prefix and by path, not by project. The main
 * landing page sends `yobody_*`, the Hormone Focus page sends `hf_*`, and this
 * page sends `fc_*`. The names below are referenced by the "Free Call Funnel"
 * dashboard, so they must not be renamed.
 *
 * `page: "free-call"` rides on each event as an event property rather than a
 * registered super property, so a visitor who sees both `/` and `/free-call`
 * in one session can never carry it onto the other page's events.
 *
 * Never pass a name, phone number or email into these. Those go to the backend
 * with the booking. UTMs and the Facebook click id are already registered on
 * every event by the init, so there is nothing to add here.
 */

import { ph } from "./posthog";

/** Where on the page a "Book my free call" button was pressed. */
export type FcCtaLocation =
  | "hero"
  | "pain"
  | "jj"
  | "howitworks"
  | "valueprops"
  | "faq"
  | "closer"
  | "everyday"
  | "header"
  | "sticky";

/** Step one's three choices. Note this is the day, not the `when.mode` in the payload. */
export type FcWhenMode = "now" | "today" | "tomorrow";

const PAGE = "free-call";

function capture(event: string, props: Record<string, string | number | boolean> = {}): void {
  const client = ph();
  if (!client) return;
  client.capture(event, { page: PAGE, ...props });
}

/** Any "Book my free call" button. Every one of them scrolls to the form. */
export function trackFcCtaClicked(location: FcCtaLocation): void {
  capture("fc_cta_clicked", { location });
}

let bookingStarted = false;

/**
 * Funnel step two: her first touch of the booking form. Fires once per page
 * load, which is the unit the funnel counts.
 */
export function trackFcBookingStarted(): void {
  if (bookingStarted) return;
  bookingStarted = true;
  capture("fc_booking_started");
}

/**
 * When the "when" becomes a real choice: picking Now, or picking a time under
 * Later today or Tomorrow. Picking the day alone does not count, because no
 * time has been chosen yet.
 */
export function trackFcTimeSelected(when_mode: FcWhenMode): void {
  capture("fc_time_selected", { when_mode });
}

/** Funnel step three, the conversion. */
export function trackFcBooked(props: { when_mode: FcWhenMode; had_time: boolean }): void {
  capture("fc_booked", props);
}
