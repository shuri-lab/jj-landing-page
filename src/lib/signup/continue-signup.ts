import { envYobodySignupUrl } from "./env";
import type { LovablePublicConfig, SignupIntentResponse } from "./types";

export function resolveContinueSignupBase(
  config?: Pick<LovablePublicConfig, "continueSignupBaseUrl"> | null,
): string {
  const fromConfig = config?.continueSignupBaseUrl?.replace(/\/$/, "") ?? "";
  if (fromConfig) return fromConfig;
  return envYobodySignupUrl();
}

export function buildContinueSignupUrl(input: {
  response?: SignupIntentResponse | null;
  email?: string;
  config?: Pick<LovablePublicConfig, "continueSignupBaseUrl"> | null;
}): string {
  const email = input.email?.trim() ?? "";
  const existing = input.response?.continueSignupUrl?.trim();
  if (existing) {
    try {
      const url = new URL(existing);
      if (email && !url.searchParams.get("email")) {
        url.searchParams.set("email", email);
      }
      if (!url.searchParams.get("step")) url.searchParams.set("step", "success");
      return url.toString();
    } catch {
      return existing;
    }
  }

  // The configured base already carries a query string
  // ("…/signup?coach=jj-smith"), so appending "?" a second time would fold
  // every parameter into the coach value. Merge through URL instead.
  const base = resolveContinueSignupBase(input.config);
  const setAll = (target: URLSearchParams) => {
    if (input.response?.intentId) target.set("intentId", input.response.intentId);
    if (input.response?.intentToken) {
      target.set("intentToken", input.response.intentToken);
    }
    if (email) target.set("email", email);
    target.set("step", "success");
  };
  try {
    const url = new URL(base);
    setAll(url.searchParams);
    return url.toString();
  } catch {
    const params = new URLSearchParams();
    setAll(params);
    return `${base}${base.includes("?") ? "&" : "?"}${params.toString()}`;
  }
}
