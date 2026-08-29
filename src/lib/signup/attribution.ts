import { getMetaClickIds } from "./meta-pixel";
import type { SignupMarketingAttribution } from "./types";

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
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function currentPageUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function currentReferrer(): string {
  if (typeof document === "undefined") return "";
  return document.referrer || "";
}

export function buildMarketingAttribution(
  overrides?: Partial<SignupMarketingAttribution>,
): SignupMarketingAttribution {
  const params = currentSearchParams();
  const clickIds = getMetaClickIds(params);
  const raw: SignupMarketingAttribution = {
    sourceSurface:
      overrides?.sourceSurface ??
      readQueryValue(params, ["sourceSurface", "source_surface"]) ??
      "landing",
    sourceContext:
      overrides?.sourceContext ??
      readQueryValue(params, ["sourceContext", "source_context"]) ??
      "landing-page",
    tier: overrides?.tier ?? readQueryValue(params, ["tier"]) ?? "standard",
    buttonPosition:
      overrides?.buttonPosition ??
      readQueryValue(params, ["buttonPosition", "button_position"]) ??
      "offer",
    ctaText: overrides?.ctaText ?? readQueryValue(params, ["ctaText", "cta_text"]) ?? "",
    utmSource: overrides?.utmSource ?? readQueryValue(params, ["utmSource", "utm_source"]) ?? "",
    utmMedium: overrides?.utmMedium ?? readQueryValue(params, ["utmMedium", "utm_medium"]) ?? "",
    utmCampaign:
      overrides?.utmCampaign ?? readQueryValue(params, ["utmCampaign", "utm_campaign"]) ?? "",
    utmContent:
      overrides?.utmContent ?? readQueryValue(params, ["utmContent", "utm_content"]) ?? "",
    utmTerm: overrides?.utmTerm ?? readQueryValue(params, ["utmTerm", "utm_term"]) ?? "",
    pageUrl:
      overrides?.pageUrl ?? readQueryValue(params, ["pageUrl", "page_url"]) ?? currentPageUrl(),
    referrer: overrides?.referrer ?? readQueryValue(params, ["referrer"]) ?? currentReferrer(),
    fbclid: overrides?.fbclid ?? readQueryValue(params, ["fbclid"]) ?? clickIds.fbclid,
    fbc: overrides?.fbc ?? readQueryValue(params, ["_fbc", "fbc"]) ?? clickIds.fbc,
    fbp: overrides?.fbp ?? readQueryValue(params, ["_fbp", "fbp"]) ?? clickIds.fbp,
    metaEventId:
      overrides?.metaEventId ??
      readQueryValue(params, ["meta_event_id", "metaEventId"]) ??
      clickIds.metaEventId,
  };

  const compact: SignupMarketingAttribution = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    const max = key === "pageUrl" || key === "referrer" ? 500 : key === "ctaText" ? 200 : 128;
    compact[key as keyof SignupMarketingAttribution] = trimmed.slice(0, max);
  }
  return compact;
}

export function readDiscountCodeFromUrl(): string | null {
  const code = currentSearchParams().get("discount-code")?.trim();
  return code ? code.toUpperCase() : null;
}

export function readLandingPrefill(): {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  plan: "monthly" | "quarter" | null;
} {
  const params = currentSearchParams();
  const email = readQueryValue(params, ["email"]) ?? "";
  const firstName = readQueryValue(params, ["firstName", "first_name"]) ?? "";
  const lastName = readQueryValue(params, ["lastName", "last_name"]) ?? "";
  const named = readQueryValue(params, ["name", "fullName", "full_name"]) ?? "";
  const fullName = named || [firstName, lastName].filter(Boolean).join(" ");
  const planRaw = readQueryValue(params, ["plan"])?.toLowerCase();
  const plan = planRaw === "monthly" || planRaw === "quarter" ? planRaw : null;
  return { email, firstName, lastName, fullName, plan };
}

export function readCheckoutSessionIdFromUrl(): string | null {
  const value = currentSearchParams().get("session_id")?.trim();
  return value || null;
}

export function buildEmbeddedReturnUrl(input: {
  plan?: "monthly" | "quarter";
  email?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (input.email?.trim()) params.set("email", input.email.trim());
  if (input.firstName?.trim()) params.set("firstName", input.firstName.trim());
  if (input.lastName?.trim()) params.set("lastName", input.lastName.trim());
  if (input.plan) params.set("plan", input.plan);
  params.delete("session_id");
  const query = params.toString();
  const hash = url.hash || "#offer";
  return `${url.origin}${url.pathname}${query ? `?${query}&` : "?"}session_id={CHECKOUT_SESSION_ID}${hash}`;
}

export function buildLandingOfferUrl(input: {
  email?: string;
  firstName?: string;
  lastName?: string;
  plan?: "monthly" | "quarter";
  extras?: Record<string, string | undefined>;
}): string {
  const params = new URLSearchParams();
  if (input.email?.trim()) params.set("email", input.email.trim());
  if (input.firstName?.trim()) params.set("firstName", input.firstName.trim());
  if (input.lastName?.trim()) params.set("lastName", input.lastName.trim());
  if (input.plan) params.set("plan", input.plan);
  for (const [key, value] of Object.entries(input.extras ?? {})) {
    if (value?.trim()) params.set(key, value.trim());
  }
  const query = params.toString();
  return query ? `/?${query}#offer` : "/#offer";
}
