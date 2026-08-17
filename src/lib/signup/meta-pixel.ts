import { envMetaPixelDebug, envMetaPixelId } from "./env";

const META_EVENT_ID_STORAGE_KEY = "yo_signup_meta_event_id";
const META_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
const META_ONCE_PREFIX = "yo_landing_meta_once:";

type FacebookPixel = ((
  action: "init" | "track" | "trackCustom" | "set",
  eventOrPixelId: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded?: boolean;
  version?: string;
  push: FacebookPixel;
};

declare global {
  interface Window {
    fbq?: FacebookPixel;
    _fbq?: FacebookPixel;
  }
}

export type MetaContentPayload = {
  value?: number;
  currency?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price: number }>;
  content_type?: string;
  content_name?: string;
  status?: boolean | string;
  predicted_ltv?: number;
  order_id?: string;
};

export type MetaPurchasePayload = MetaContentPayload & {
  value: number;
  currency: string;
  order_id: string;
  eventID: string;
};

type MetaStandardEventName =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Subscribe"
  | "StartTrial"
  | "CompleteRegistration";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getPixelId(): string {
  return envMetaPixelId();
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!match) return null;
  const value = match.slice(prefix.length).trim();
  return value || null;
}

function writeCookie(name: string, value: string): void {
  if (!isBrowser() || !value) return;
  document.cookie = `${name}=${value}; path=/; max-age=${META_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function readQueryValue(
  searchParams: Pick<URLSearchParams, "get"> | null | undefined,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = searchParams?.get(key)?.trim();
    if (value) return value;
  }
  return null;
}

function currentSearchParams(): URLSearchParams {
  if (!isBrowser()) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function getStoredMetaEventId(): string | null {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem(META_EVENT_ID_STORAGE_KEY)?.trim() || null;
  } catch {
    return null;
  }
}

function persistMetaEventId(eventId: string): void {
  if (!isBrowser() || !eventId) return;
  try {
    sessionStorage.setItem(META_EVENT_ID_STORAGE_KEY, eventId);
  } catch {
    /* ignore */
  }
}

export function getOrCreateMetaEventId(
  searchParams?: Pick<URLSearchParams, "get"> | null,
): string {
  const params = searchParams ?? currentSearchParams();
  const fromUrl = readQueryValue(params, ["meta_event_id", "metaEventId"]);
  if (fromUrl) {
    persistMetaEventId(fromUrl);
    return fromUrl;
  }
  const stored = getStoredMetaEventId();
  if (stored) return stored;
  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `meta_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  persistMetaEventId(generated);
  return generated;
}

export function resolveMetaPurchaseEventId(
  paymentIntentId: string,
  searchParams?: Pick<URLSearchParams, "get"> | null,
): string {
  const existing =
    readQueryValue(searchParams ?? currentSearchParams(), [
      "meta_event_id",
      "metaEventId",
    ]) || getStoredMetaEventId();
  if (existing) {
    persistMetaEventId(existing);
    return existing;
  }
  return paymentIntentId.trim();
}

export function hydrateMetaClickIdsFromUrl(
  searchParams?: Pick<URLSearchParams, "get"> | null,
): { fbclid: string | null; fbc: string | null; fbp: string | null } {
  const params = searchParams ?? currentSearchParams();
  const fbclid = readQueryValue(params, ["fbclid"]);
  const fbpFromUrl = readQueryValue(params, ["_fbp", "fbp"]);
  const fbcFromUrl = readQueryValue(params, ["_fbc", "fbc"]);

  if (fbpFromUrl) writeCookie("_fbp", fbpFromUrl);
  if (fbcFromUrl) {
    writeCookie("_fbc", fbcFromUrl);
  } else if (fbclid && !readCookie("_fbc")) {
    writeCookie("_fbc", `fb.1.${Date.now()}.${fbclid}`);
  }

  return {
    fbclid,
    fbc: fbcFromUrl || readCookie("_fbc"),
    fbp: fbpFromUrl || readCookie("_fbp"),
  };
}

export function getMetaClickIds(
  searchParams?: Pick<URLSearchParams, "get"> | null,
): {
  fbclid: string;
  fbc: string;
  fbp: string;
  metaEventId: string;
} {
  const params = searchParams ?? currentSearchParams();
  const hydrated = hydrateMetaClickIdsFromUrl(params);
  return {
    fbclid: hydrated.fbclid ?? "",
    fbc: hydrated.fbc ?? readCookie("_fbc") ?? "",
    fbp: hydrated.fbp ?? readCookie("_fbp") ?? "",
    metaEventId: getOrCreateMetaEventId(params),
  };
}

function logMetaPixel(
  eventName: string,
  params?: Record<string, unknown>,
  eventID?: string,
): void {
  if (!envMetaPixelDebug() || !isBrowser()) return;
  try {
    console.info("[meta-pixel]", eventName, {
      ...(params ?? {}),
      ...(eventID ? { eventID } : {}),
    });
  } catch {
    /* ignore */
  }
}

function createUniqueEventId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}.${crypto.randomUUID()}`;
  }
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
}

function markMetaEventOnce(onceKey: string): boolean {
  if (!isBrowser()) return false;
  try {
    const key = `${META_ONCE_PREFIX}${onceKey}`;
    if (sessionStorage.getItem(key) === "true") return false;
    sessionStorage.setItem(key, "true");
    return true;
  } catch {
    return true;
  }
}

function buildContentParams(payload: MetaContentPayload = {}): Record<string, unknown> {
  const params: Record<string, unknown> = {
    content_type: payload.content_type || "product",
  };
  if (typeof payload.value === "number" && Number.isFinite(payload.value)) {
    params.value = payload.value;
  }
  if (payload.currency) params.currency = payload.currency.toUpperCase();
  if (payload.content_ids?.length) params.content_ids = payload.content_ids;
  if (payload.contents?.length) params.contents = payload.contents;
  if (payload.content_name) params.content_name = payload.content_name;
  if (payload.status !== undefined) params.status = payload.status;
  if (
    typeof payload.predicted_ltv === "number" &&
    Number.isFinite(payload.predicted_ltv)
  ) {
    params.predicted_ltv = payload.predicted_ltv;
  }
  if (payload.order_id) params.order_id = payload.order_id;
  return params;
}

function trackMetaEvent(
  eventName: MetaStandardEventName,
  params: Record<string, unknown>,
  eventID?: string,
): void {
  if (!isBrowser()) return;
  hydrateMetaClickIdsFromUrl();
  if (typeof window.fbq !== "function" || !getPixelId()) return;
  logMetaPixel(eventName, params, eventID);
  if (eventID) {
    window.fbq("track", eventName, params, { eventID });
    return;
  }
  window.fbq("track", eventName, params);
}

export function trackMetaLead(payload: MetaContentPayload = {}): void {
  if (!isBrowser() || !markMetaEventOnce("Lead")) return;
  trackMetaEvent("Lead", buildContentParams(payload), createUniqueEventId("lead"));
}

export function trackMetaAddToCart(payload: MetaContentPayload = {}): void {
  if (!isBrowser() || !markMetaEventOnce("AddToCart")) return;
  trackMetaEvent(
    "AddToCart",
    buildContentParams(payload),
    createUniqueEventId("atc"),
  );
}

export function trackMetaInitiateCheckout(payload: MetaContentPayload = {}): void {
  if (!isBrowser() || !markMetaEventOnce("InitiateCheckout")) return;
  trackMetaEvent(
    "InitiateCheckout",
    buildContentParams(payload),
    getOrCreateMetaEventId(),
  );
}

export function trackMetaAddPaymentInfo(payload: MetaContentPayload = {}): void {
  if (!isBrowser() || !markMetaEventOnce("AddPaymentInfo")) return;
  trackMetaEvent(
    "AddPaymentInfo",
    buildContentParams(payload),
    createUniqueEventId("api"),
  );
}

export function trackMetaSubscribe(payload: MetaPurchasePayload): void {
  if (!payload.eventID || !Number.isFinite(payload.value) || payload.value < 0) {
    return;
  }
  if (!markMetaEventOnce(`Subscribe:${payload.order_id}`)) return;
  trackMetaEvent(
    "Subscribe",
    buildContentParams({
      ...payload,
      predicted_ltv: payload.predicted_ltv ?? payload.value,
    }),
    createUniqueEventId("sub"),
  );
}

export function trackMetaStartTrial(payload: MetaPurchasePayload): void {
  if (!payload.eventID || !Number.isFinite(payload.value)) return;
  if (!markMetaEventOnce(`StartTrial:${payload.order_id}`)) return;
  trackMetaEvent(
    "StartTrial",
    buildContentParams({
      ...payload,
      predicted_ltv: payload.predicted_ltv ?? payload.value,
    }),
    createUniqueEventId("trial"),
  );
}

export function trackMetaPurchase(payload: MetaPurchasePayload): void {
  if (!payload.eventID || !Number.isFinite(payload.value) || payload.value < 0) {
    return;
  }
  if (!markMetaEventOnce(`Purchase:${payload.order_id}`)) return;
  trackMetaEvent("Purchase", buildContentParams(payload), payload.eventID);
  if (payload.value > 0) {
    trackMetaSubscribe(payload);
  } else {
    trackMetaStartTrial(payload);
  }
}
