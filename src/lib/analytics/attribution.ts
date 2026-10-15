/**
 * YoBody attribution store.
 *
 * Keeps FIRST-touch and LATEST-touch campaign data for a visitor so that
 * source attribution survives the whole landing-page -> lead -> checkout flow,
 * long after the UTMs have disappeared from the address bar.
 *
 * Raw values are stored verbatim. `traffic_channel` is a *derived* convenience
 * field for reporting and never replaces the raw values.
 *
 * NOTE: the storage key is deliberately distinct from the legacy `yb_attr` key
 * owned by the inline Meta passthrough script in `__root.tsx`.
 */

const STORAGE_KEY = "yb_attr_v1";

/** Query params that, when present, mark a visit as a new attributable touch. */
const CAMPAIGN_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
] as const;

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  referrer?: string;
  landing_url?: string;
  landing_path?: string;
  /** ISO timestamp of the touch. */
  at?: string;
}

export interface AttributionState {
  first: AttributionTouch;
  last: AttributionTouch;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** camelCase aliases are accepted because existing landing links use both forms. */
function readParam(params: URLSearchParams, snake: string): string | undefined {
  const camel = snake.replace(/_(.)/g, (_, c: string) => c.toUpperCase());
  const value = (params.get(snake) ?? params.get(camel) ?? "").trim();
  return value || undefined;
}

/**
 * Strip PII the landing page puts in its own query string (prefill links and
 * the Stripe embedded-checkout return URL both carry email/name).
 */
const PII_PARAMS = [
  "email",
  "firstName",
  "first_name",
  "lastName",
  "last_name",
  "name",
  "fullName",
  "full_name",
  "phone",
];

export function scrubUrl(input: string): string {
  if (!input) return input;
  try {
    const url = new URL(input, isBrowser() ? window.location.origin : "https://localhost");
    let touched = false;
    for (const key of PII_PARAMS) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, "redacted");
        touched = true;
      }
    }
    return touched ? url.toString() : input;
  } catch {
    return input;
  }
}

function currentTouch(): AttributionTouch {
  if (!isBrowser()) return {};
  const params = new URLSearchParams(window.location.search);
  const touch: AttributionTouch = {
    utm_source: readParam(params, "utm_source"),
    utm_medium: readParam(params, "utm_medium"),
    utm_campaign: readParam(params, "utm_campaign"),
    utm_content: readParam(params, "utm_content"),
    utm_term: readParam(params, "utm_term"),
    fbclid: readParam(params, "fbclid"),
    gclid: readParam(params, "gclid"),
    referrer: document.referrer || undefined,
    landing_url: scrubUrl(window.location.href),
    landing_path: window.location.pathname,
    at: new Date().toISOString(),
  };
  for (const key of Object.keys(touch) as (keyof AttributionTouch)[]) {
    if (!touch[key]) delete touch[key];
  }
  return touch;
}

/** True when the visit carries campaign params, or an off-site referrer. */
function isAttributable(touch: AttributionTouch): boolean {
  if (CAMPAIGN_PARAMS.some((key) => touch[key as keyof AttributionTouch])) return true;
  if (!touch.referrer) return false;
  try {
    return new URL(touch.referrer).hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

function read(): AttributionState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AttributionState>;
    if (!parsed || typeof parsed !== "object" || !parsed.first) return null;
    return { first: parsed.first ?? {}, last: parsed.last ?? parsed.first ?? {} };
  } catch {
    return null;
  }
}

function write(state: AttributionState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / storage disabled — attribution degrades to in-memory */
  }
}

let memo: AttributionState | null = null;

/**
 * Record this page view against the attribution store and return the result.
 *
 * - first-touch is written once and never overwritten
 * - latest-touch is refreshed only when the visit is itself attributable
 */
export function captureAttribution(): AttributionState {
  if (!isBrowser()) return { first: {}, last: {} };
  const touch = currentTouch();
  const existing = read();

  if (!existing) {
    const state: AttributionState = { first: touch, last: touch };
    write(state);
    memo = state;
    return state;
  }

  if (isAttributable(touch)) {
    const state: AttributionState = { first: existing.first, last: touch };
    write(state);
    memo = state;
    return state;
  }

  memo = existing;
  return existing;
}

export function getAttribution(): AttributionState {
  if (memo) return memo;
  return read() ?? captureAttribution();
}

/**
 * Derived reporting channel. Convenience only — raw UTMs remain the source of
 * truth and are always sent alongside this.
 */
export function deriveTrafficChannel(touch: AttributionTouch): string {
  const source = (touch.utm_source ?? "").toLowerCase();
  const medium = (touch.utm_medium ?? "").toLowerCase();
  const paid = /^(cpc|ppc|paid|paid_social|paidsocial|paid-social|cpm)$/.test(medium);

  if (source.includes("manychat") || medium.includes("manychat") || medium === "dm") {
    return "manychat";
  }
  if (medium === "email" || source.includes("klaviyo") || source === "email") return "email";
  if (touch.gclid || source.includes("google")) return paid ? "google_paid" : "google";
  if (touch.fbclid && !source) return "meta_paid";
  if (/(^|\b)(facebook|fb)($|\b)/.test(source)) {
    return paid || touch.fbclid ? "meta_paid" : "facebook_organic";
  }
  if (/(^|\b)(instagram|ig)($|\b)/.test(source)) {
    return paid || touch.fbclid ? "meta_paid" : "instagram_organic";
  }
  if (paid) return "meta_paid";

  // No campaign params: fall back to the referring host, so an organic click
  // from Instagram reads as instagram_organic rather than generic "referral".
  if (touch.referrer) {
    try {
      const host = new URL(touch.referrer).hostname.toLowerCase();
      if (host && host !== window.location.hostname) {
        if (/(^|\.)instagram\.com$/.test(host) || host === "l.instagram.com") {
          return "instagram_organic";
        }
        if (/(^|\.)(facebook|fb)\.com$/.test(host) || host === "lm.facebook.com") {
          return "facebook_organic";
        }
        if (/(^|\.)google\./.test(host)) return "google";
        return "referral";
      }
    } catch {
      /* fall through */
    }
  }
  if (!source && !medium && !touch.referrer) return "direct";
  return "other";
}

/** Flat, PostHog-friendly property bag: raw first + latest touch + derived channel. */
export function attributionProperties(): Record<string, string> {
  const { first, last } = getAttribution();
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(last)) {
    if (value) out[key] = value;
  }
  for (const [key, value] of Object.entries(first)) {
    if (value) out[`first_${key}`] = value;
  }
  out.traffic_channel = deriveTrafficChannel(last);
  out.first_traffic_channel = deriveTrafficChannel(first);
  return out;
}
