import {
  resolveMetaPurchaseEventId,
  trackMetaAddPaymentInfo,
  trackMetaAddToCart,
  trackMetaInitiateCheckout,
  trackMetaLead,
  trackMetaPurchase,
} from "./meta-pixel";

const GA4_IDS = ["G-6NTF2GY6XX", "G-PYRYHREW2F"] as const;
const EVENT_STORAGE_PREFIX = "yo_landing_funnel_event:";
const PURCHASE_STORAGE_PREFIX = "yo_landing_funnel_purchase:";
const RECORDING_STOPPED_KEY = "yo_signup_funnel_recording_stopped";

type AnalyticsPrimitive = string | number | boolean;
export type SignupAnalyticsPayload = Record<string, AnalyticsPrimitive | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<ArrayLike<unknown>>;
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function markOnce(prefix: string, key: string): boolean {
  if (!isBrowser()) return false;
  try {
    const storageKey = `${prefix}${key}`;
    if (sessionStorage.getItem(storageKey)) return false;
    sessionStorage.setItem(storageKey, "true");
    return true;
  } catch {
    return true;
  }
}

function clarityEvent(eventName: string): void {
  try {
    window.clarity?.("event", eventName);
  } catch {
    /* ignore */
  }
}

function trackGaEvent(
  eventName: string,
  payload: SignupAnalyticsPayload = {},
  options: { onceKey?: string } = {},
): void {
  if (!isBrowser()) return;
  if (options.onceKey && !markOnce(EVENT_STORAGE_PREFIX, options.onceKey)) return;
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value != null && value !== ""),
  );
  if (typeof window.gtag === "function") {
    for (const id of GA4_IDS) {
      window.gtag("event", eventName, { ...cleaned, send_to: id });
    }
  }
  clarityEvent(eventName);
}

export function stopSignupFunnelRecording(): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(RECORDING_STOPPED_KEY, "true");
  } catch {
    /* ignore */
  }
  try {
    window.clarity?.("stop");
  } catch {
    /* ignore */
  }
}

export function trackSelectPlan(payload: SignupAnalyticsPayload): void {
  trackGaEvent("select_plan", payload, {
    onceKey: `select_plan:${String(payload.billing_interval ?? "")}`,
  });
  trackGaEvent("cta_click", {
    button_position: payload.button_position ?? "offer",
    tier: payload.tier ?? "standard",
  });
  const contentId = String(payload.content_id ?? "").trim();
  const value = typeof payload.value === "number" ? payload.value : undefined;
  trackMetaInitiateCheckout({
    value,
    currency: typeof payload.currency === "string" ? payload.currency : "USD",
    content_ids: contentId ? [contentId] : ["yobody-program"],
    content_name: "Yobody Coaching",
    contents: contentId ? [{ id: contentId, quantity: 1, item_price: value ?? 0 }] : undefined,
  });
}

export function trackSignupScreenView(payload?: SignupAnalyticsPayload): void {
  trackGaEvent(
    "signup_screen_view",
    { ...payload, signup_screen: "account_start" },
    { onceKey: "signup_screen_view" },
  );
}

export function trackPaymentScreenView(payload?: SignupAnalyticsPayload): void {
  trackGaEvent("payment_screen_view", payload, {
    onceKey: "payment_screen_view",
  });
  try {
    window.clarity?.("upgrade", "checkout");
  } catch {
    /* ignore */
  }
}

/**
 * Fired when the checkout API fails between "continue to payment" and the
 * payment screen actually rendering — the funnel step that silently loses
 * ~half of in-app-browser buyers. Not deduped: every failure is counted.
 */
export function trackCheckoutError(
  payload: SignupAnalyticsPayload | undefined,
  info: {
    stage: string;
    statusCode?: number;
    message?: string;
    inApp?: boolean;
  },
): void {
  trackGaEvent("checkout_error", {
    ...payload,
    error_stage: info.stage,
    error_status: typeof info.statusCode === "number" ? info.statusCode : "none",
    error_message: (info.message ?? "").slice(0, 120),
    in_app_browser: info.inApp ? "yes" : "no",
  });
}

export function trackSignupMethodSelect(
  signupMethod: "email" | "google",
  payload?: SignupAnalyticsPayload,
): void {
  trackGaEvent(
    "signup_method_select",
    { ...payload, signup_method: signupMethod },
    { onceKey: `signup_method_select:${signupMethod}` },
  );
}

export function trackSignupLead(payload?: SignupAnalyticsPayload): void {
  const contentId = String(payload?.content_id ?? "").trim();
  trackMetaLead({
    value: typeof payload?.value === "number" ? payload.value : undefined,
    currency: typeof payload?.currency === "string" ? payload.currency : "USD",
    content_ids: contentId ? [contentId] : undefined,
  });
}

export function trackContinueToPayment(payload?: SignupAnalyticsPayload): void {
  trackGaEvent(
    "continue_to_payment",
    { ...payload, signup_method: "email" },
    { onceKey: "continue_to_payment:email" },
  );
  const contentId = String(payload?.content_id ?? "").trim();
  const value = typeof payload?.value === "number" ? payload.value : undefined;
  trackMetaAddToCart({
    value,
    currency: typeof payload?.currency === "string" ? payload.currency : "USD",
    content_ids: contentId ? [contentId] : undefined,
    contents:
      contentId && typeof value === "number"
        ? [{ id: contentId, quantity: 1, item_price: value }]
        : undefined,
  });
}

export function trackAddPaymentInfo(payload?: SignupAnalyticsPayload): void {
  const contentId = String(payload?.content_id ?? "").trim();
  trackMetaAddPaymentInfo({
    value: typeof payload?.value === "number" ? payload.value : undefined,
    currency: typeof payload?.currency === "string" ? payload.currency : "USD",
    content_ids: contentId ? [contentId] : undefined,
  });
}

export function trackPurchase(payload: SignupAnalyticsPayload): void {
  const transactionId = String(payload.transaction_id ?? "").trim();
  if (!transactionId || !markOnce(PURCHASE_STORAGE_PREFIX, transactionId)) return;
  trackGaEvent("purchase", payload);
  const value = Number(payload.value);
  const contentId = String(payload.content_id ?? "").trim();
  const lockedEventId = String(payload.event_id ?? "").trim();
  if (Number.isFinite(value) && value >= 0) {
    trackMetaPurchase({
      value,
      currency: String(payload.currency ?? "USD"),
      order_id: transactionId,
      content_ids: contentId ? [contentId] : undefined,
      contents: contentId ? [{ id: contentId, quantity: 1, item_price: value }] : undefined,
      eventID: lockedEventId || resolveMetaPurchaseEventId(transactionId),
    });
  }
  stopSignupFunnelRecording();
}
