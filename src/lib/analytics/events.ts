/**
 * Canonical YoBody tracking events.
 *
 * This is the ONLY place that names a `yobody_*` event. Every event here is
 * documented in TRACKING_PLAN.md — add to that file when you add one here.
 *
 * Rules:
 *  - never pass raw email / phone / name / card data into these helpers
 *  - `$pageview` is PostHog's own; we never emit a duplicate
 *  - "fire once" semantics use sessionStorage so a reload re-arms sensibly
 */

import { attributionProperties } from "./attribution";
import { ph } from "./posthog";

export type EventProps = Record<string, string | number | boolean | undefined>;

const ONCE_PREFIX = "yb_ph_once:";

function firedOnce(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const storageKey = `${ONCE_PREFIX}${key}`;
    if (sessionStorage.getItem(storageKey)) return true;
    sessionStorage.setItem(storageKey, "1");
    return false;
  } catch {
    // Storage blocked — better to send than to silently lose the funnel step.
    return false;
  }
}

function clean(props: EventProps): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

function send(event: string, props: EventProps = {}, options?: { onceKey?: string }): void {
  const client = ph();
  if (!client) return;
  if (options?.onceKey && firedOnce(options.onceKey)) return;
  client.capture(event, clean(props));
}

/** Escape hatch for one-off events; prefer a named helper below. */
export function captureYobody(event: string, props: EventProps = {}): void {
  send(event, props);
}

// ---------------------------------------------------------------------------
// Landing page behaviour
// ---------------------------------------------------------------------------

export function trackCtaClicked(props: {
  cta_name: string;
  section_name: string;
  /** "scroll" for in-page jumps, "external" for a link off-site. */
  destination_type: "scroll" | "external" | "checkout";
  tier?: string;
}): void {
  send("yobody_cta_clicked", props);
}

/** Fired once per section per session, when the section is substantially visible. */
export function trackSectionViewed(section_name: string): void {
  send("yobody_section_viewed", { section_name }, { onceKey: `section:${section_name}` });
}

export function trackScrollDepth(percent: 25 | 50 | 75 | 90): void {
  send("yobody_scroll_depth_reached", { percent }, { onceKey: `scroll:${percent}` });
}

// ---------------------------------------------------------------------------
// Checkout funnel
// ---------------------------------------------------------------------------

export function trackCheckoutStepViewed(step: "contact" | "payment", props: EventProps = {}): void {
  send("yobody_checkout_step_viewed", { step, ...props }, { onceKey: `checkout_step:${step}` });
}

/** First meaningful interaction with the contact step. */
export function trackLeadFormStarted(props: EventProps = {}): void {
  send("yobody_lead_form_started", props, { onceKey: "lead_form_started" });
}

/**
 * Step 1 accepted by the backend. `lead_id` is the durable intent id.
 * Never pass the phone number itself — only `has_phone`.
 */
export function trackLeadCaptured(props: {
  lead_id: string;
  has_phone: boolean;
  sms_consent?: boolean;
  billing_interval?: string;
  offer_id?: string;
  value?: number;
  currency?: string;
}): void {
  send("yobody_lead_captured", props, { onceKey: `lead_captured:${props.lead_id}` });
}

/** The embedded Stripe payment UI is mounted and ready. */
export function trackStripeCheckoutLoaded(props: {
  lead_id?: string;
  offer_id?: string;
  billing_interval?: string;
  value?: number;
  currency?: string;
  discount_applied?: boolean;
}): void {
  send("yobody_stripe_checkout_loaded", props);
}

/**
 * Meaningful checkout failure. `error_category` is a coarse bucket — raw
 * messages are deliberately not sent, since backend text can echo user input.
 */
export function trackCheckoutError(props: {
  error_category: string;
  checkout_step: "contact" | "payment";
  status_code?: number;
  in_app_browser?: boolean;
}): void {
  send("yobody_checkout_error", props);
}

/**
 * Browser-side signal that Stripe reported the payment complete. This is NOT
 * the authoritative purchase event — see `yobody_purchase_completed` in
 * TRACKING_PLAN.md, which must be emitted server-side from the Stripe webhook.
 */
export function trackPurchaseConfirmedClientSide(props: {
  lead_id?: string;
  order_id?: string;
  value?: number;
  currency?: string;
  offer_id?: string;
}): void {
  send(
    "yobody_purchase_completed_clientside",
    { ...props, ...attributionProperties() },
    { onceKey: `purchase_cs:${props.order_id ?? props.lead_id ?? "unknown"}` },
  );
}

/** Maps an API/exception failure onto a coarse, non-sensitive category. */
export function categorizeCheckoutError(input: {
  stage?: string;
  statusCode?: number;
  message?: string;
}): string {
  const status = input.statusCode;
  if (status === 409) return "email_already_registered";
  if (status === 0) return "network_unreachable";
  if (status === 429) return "rate_limited";
  if (typeof status === "number" && status >= 500) return "server_error";
  if (typeof status === "number" && status >= 400) return "validation_rejected";
  const message = (input.message ?? "").toLowerCase();
  if (message.includes("timed out") || message.includes("timeout")) return "timeout";
  if (message.includes("reach")) return "network_unreachable";
  if (message.includes("initialize payment")) return "stripe_init_failed";
  if (input.stage === "start_email") return "lead_create_failed";
  if (input.stage === "create_checkout") return "checkout_create_failed";
  if (input.stage === "open_external") return "in_app_browser_escape";
  return "unknown";
}

/**
 * Resolve the stable section name for a clicked element by walking up to the
 * nearest `[data-yb-section]`. Keeps CTA tracking free of prop threading.
 */
export function sectionNameOf(element: Element | null | undefined): string {
  const host = element?.closest?.("[data-yb-section]");
  return host?.getAttribute("data-yb-section") ?? "unknown";
}
