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
    utmSource:
      overrides?.utmSource ??
      readQueryValue(params, ["utmSource", "utm_source"]) ??
      "",
    utmMedium:
      overrides?.utmMedium ??
      readQueryValue(params, ["utmMedium", "utm_medium"]) ??
      "",
    utmCampaign:
      overrides?.utmCampaign ??
      readQueryValue(params, ["utmCampaign", "utm_campaign"]) ??
      "",
    utmContent:
      overrides?.utmContent ??
      readQueryValue(params, ["utmContent", "utm_content"]) ??
      "",
    utmTerm:
      overrides?.utmTerm ??
      readQueryValue(params, ["utmTerm", "utm_term"]) ??
      "",
    pageUrl: overrides?.pageUrl ?? readQueryValue(params, ["pageUrl", "page_url"]) ?? currentPageUrl(),
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
    const max =
      key === "pageUrl" || key === "referrer" ? 500 : key === "ctaText" ? 200 : 128;
    compact[key as keyof SignupMarketingAttribution] = trimmed.slice(0, max);
  }
  return compact;
}

export function readDiscountCodeFromUrl(): string | null {
  const code = currentSearchParams().get("discount-code")?.trim();
  return code ? code.toUpperCase() : null;
}
