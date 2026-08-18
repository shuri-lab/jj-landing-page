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

  const params = new URLSearchParams();
  if (input.response?.intentId) params.set("intentId", input.response.intentId);
  if (input.response?.intentToken) {
    params.set("intentToken", input.response.intentToken);
  }
  if (email) params.set("email", email);
  params.set("step", "success");
  return `${resolveContinueSignupBase(input.config)}?${params.toString()}`;
}
