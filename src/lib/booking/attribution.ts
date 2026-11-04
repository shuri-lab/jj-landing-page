/**
 * The hidden half of the booking form: where she came from.
 *
 * Read once on page load and sent with the booking so marketing can tie a
 * booked call back to the ad that paid for it.
 */

import { deriveTrafficChannel, getAttribution } from "@/lib/analytics/attribution";
import { FREE_CALL_PATH } from "./config";
import type { BookingUtm } from "./types";

export interface BookingContext {
  utm: BookingUtm;
  referrer: string | null;
  /** The reporting channel: an Instagram click with no UTMs is instagram_organic, not direct. */
  trafficChannel: string | null;
  pagePath: string;
}

const UTM_KEYS = {
  source: "utm_source",
  medium: "utm_medium",
  campaign: "utm_campaign",
  content: "utm_content",
  term: "utm_term",
} as const;

export const EMPTY_BOOKING_CONTEXT: BookingContext = {
  utm: { source: null, medium: null, campaign: null, content: null, term: null },
  referrer: null,
  trafficChannel: null,
  pagePath: FREE_CALL_PATH,
};

/** camelCase aliases are accepted because existing landing links use both forms. */
function readParam(params: URLSearchParams, snake: string): string | null {
  const camel = snake.replace(/_(.)/g, (_, c: string) => c.toUpperCase());
  return (params.get(snake) ?? params.get(camel) ?? "").trim() || null;
}

/**
 * Query string first. The persisted first/latest-touch store is the fallback,
 * so a reload, a back button or an in-app browser hand-off cannot drop the
 * campaign that actually sent her here.
 */
export function readBookingContext(): BookingContext {
  if (typeof window === "undefined") return EMPTY_BOOKING_CONTEXT;

  const params = new URLSearchParams(window.location.search);
  const { first, last } = getAttribution();
  const pick = (key: (typeof UTM_KEYS)[keyof typeof UTM_KEYS]): string | null =>
    readParam(params, key) ?? last[key] ?? first[key] ?? null;

  return {
    utm: {
      source: pick(UTM_KEYS.source),
      medium: pick(UTM_KEYS.medium),
      campaign: pick(UTM_KEYS.campaign),
      content: pick(UTM_KEYS.content),
      term: pick(UTM_KEYS.term),
    },
    referrer: document.referrer || last.referrer || first.referrer || null,
    trafficChannel: deriveTrafficChannel(last),
    pagePath: window.location.pathname || FREE_CALL_PATH,
  };
}
