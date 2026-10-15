/**
 * PostHog client for the YoBody JJ landing page.
 *
 * Single source of initialization — do not call `posthog.init` anywhere else.
 * Product Analytics + Web Analytics + Session Replay all come from this one
 * instance. Privacy rules live here so every event and every recording inherits
 * them (see TRACKING_PLAN.md, "Privacy rules").
 */

import posthog from "posthog-js";
import { attributionProperties, captureAttribution, scrubUrl } from "./attribution";

/** Public, client-side write key — safe in the bundle. */
const POSTHOG_KEY = "phc_kTK9U4b4kAALQcgKJYM9rvRECAGa9hCrm7bn4BDmHdjB";
const POSTHOG_HOST = "https://us.i.posthog.com";

export type YobodyEnvironment = "development" | "preview" | "production";

const PRODUCTION_HOSTS = new Set([
  "mycoach.jjsmithonline.com",
  "jjsmithonline.com",
  "www.jjsmithonline.com",
]);

/**
 * Derived from the runtime hostname so a preview deploy can never be mistaken
 * for production traffic. Everything that is neither loopback nor a known
 * production host is treated as `preview`.
 */
export function detectEnvironment(): YobodyEnvironment {
  if (typeof window === "undefined") return "production";
  const host = window.location.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".local")) {
    return "development";
  }
  if (PRODUCTION_HOSTS.has(host)) return "production";
  return "preview";
}

/**
 * Property keys whose values must never reach PostHog.
 *
 * Deliberately explicit rather than a loose `name` match: a greedy
 * `(^|_)name($|_)` rule also eats legitimate analytics keys such as
 * `section_name`, `cta_name` and `offer_name`.
 */
const SENSITIVE_KEYS =
  /^(email|e_?mail|phone|phone_?number|tel|password|name|full_?name|first_?name|last_?name|card|card_?number|cvc|cvv|iban|ssn)$/i;

/** Person-name style keys that stay sensitive whatever their prefix. */
const SENSITIVE_SUFFIXES =
  /_(email|phone|phone_?number|password|card_?number|cvc|cvv|iban|ssn)$|_(first|last|full)_?name$/i;

function isSensitiveKey(key: string): boolean {
  if (key.startsWith("has_")) return false;
  return SENSITIVE_KEYS.test(key) || SENSITIVE_SUFFIXES.test(key);
}

/** URL-shaped property keys that need PII query params scrubbed. */
const URL_KEYS = [
  "$current_url",
  "$referrer",
  "$initial_current_url",
  "$initial_referrer",
  "$session_entry_url",
  "$pathname",
  "landing_url",
  "first_landing_url",
  "page_url",
];

let started = false;

export function initPostHog(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // Record first/latest touch BEFORE init so the very first $pageview already
  // carries attribution as super properties.
  captureAttribution();

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2025-05-24",

    // Anonymous visitors are tracked by distinct_id; a person profile is only
    // created once we identify a real lead.
    person_profiles: "identified_only",

    // Exploratory behaviour (clicks, rage clicks, dead clicks) comes from
    // autocapture + replay. Custom events are reserved for funnel steps.
    autocapture: true,
    capture_pageleave: true,

    // --- Session Replay privacy -------------------------------------------
    disable_session_recording: false,
    session_recording: {
      // Mask the *value* of every input, so name / email / phone / discount
      // never appear in a recording. Stripe's payment fields live in a
      // cross-origin iframe and are never recorded at all.
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
      // Keep request URLs but strip PII query params from them.
      maskNetworkRequestFn: (request) => ({ ...request, url: scrubUrl(request.url) }),
    },

    // PostHog's built-in PII masking for captured properties.
    // Left OFF deliberately: it rewrites campaign click ids (fbclid/gclid) to
    // "<masked>", which breaks Meta/Google reconciliation. Personal fields are
    // removed precisely by `sanitize_properties` below instead.
    mask_personal_data_properties: false,

    // --- Property-level scrubbing -----------------------------------------
    // Runs on every event, including $pageview and autocapture.
    sanitize_properties: (properties) => {
      const clean: Record<string, unknown> = { ...properties };
      for (const key of URL_KEYS) {
        const value = clean[key];
        if (typeof value === "string") clean[key] = scrubUrl(value);
      }
      for (const key of Object.keys(clean)) {
        // Never allow a raw identifier through, whatever set it.
        if (isSensitiveKey(key)) delete clean[key];
      }
      return clean;
    },

    loaded: (ph) => {
      // Environment + attribution ride on EVERY event from here on.
      ph.register({
        environment: detectEnvironment(),
        funnel: "yobody_jj",
        ...attributionProperties(),
      });
    },
  });
}

/** The live PostHog instance. Safe to call on the server (no-ops). */
export function ph(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  return posthog;
}

export function isPostHogReady(): boolean {
  return typeof window !== "undefined" && Boolean(posthog.__loaded);
}

/**
 * Link the anonymous visitor to a durable YoBody lead id.
 *
 * `posthog.identify` keeps the pre-lead anonymous history attached to the same
 * person, which is what makes "which source created this buyer" answerable.
 */
export function identifyLead(
  leadId: string,
  personProperties: Record<string, string | number | boolean> = {},
): void {
  const client = ph();
  if (!client || !leadId) return;
  client.identify(leadId, {
    funnel: "yobody_jj",
    lead_created: true,
    environment: detectEnvironment(),
    ...attributionProperties(),
    ...personProperties,
  });
}

/** PostHog's distinct id, for stamping onto backend/Stripe records. */
export function posthogDistinctId(): string | undefined {
  const client = ph();
  if (!client) return undefined;
  try {
    return client.get_distinct_id?.() || undefined;
  } catch {
    return undefined;
  }
}

/** PostHog session id — lets us jump straight to the session replay. */
export function posthogSessionId(): string | undefined {
  const client = ph();
  if (!client) return undefined;
  try {
    return client.get_session_id?.() || undefined;
  } catch {
    return undefined;
  }
}
