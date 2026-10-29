/**
 * /start funnel events.
 *
 * One PostHog project, one key, one init: see lib/analytics/posthog.ts. Pages
 * are kept apart by event prefix and by path, not by project. The main landing
 * page sends `yobody_*`, /free-call sends `fc_*`, and this page sends
 * `start_*`.
 *
 * `page: "start"` rides on each event as an event property rather than a
 * registered super property, so it can never carry onto another page in a
 * session that visits both.
 *
 * Never pass a name or any contact detail into these. `personalized` says only
 * whether the page knew who she was, never who.
 */

import { ph } from "./posthog";

/** Where on the page a join button was pressed. */
export type StartCtaLocation = "hero" | "bridge" | "whatyouget" | "close" | "sticky";

const PAGE = "start";

function capture(event: string, props: Record<string, string | number | boolean> = {}): void {
  const client = ph();
  if (!client) return;
  client.capture(event, { page: PAGE, ...props });
}

/**
 * $pageview is captured automatically on this route (capture_pageview is
 * "history_change", see TRACKING_PLAN.md). This adds the one thing it cannot
 * know: whether she arrived on a join link that resolved to a lead.
 */
export function trackStartViewed(personalized: boolean): void {
  capture("start_page_viewed", { personalized });
}

export function trackStartCtaClicked(location: StartCtaLocation): void {
  capture("start_cta_clicked", { location });
}

/** She picked a plan and the checkout card opened. */
export function trackStartCheckoutStarted(props: {
  plan: string;
  value: number;
  personalized: boolean;
}): void {
  capture("start_checkout_started", props);
}

/** The browser saw the payment complete. The authoritative event is server side. */
export function trackStartPurchaseCompleted(props: { plan: string; value: number }): void {
  capture("start_purchase_completed", props);
}
