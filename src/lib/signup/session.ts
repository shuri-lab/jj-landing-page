export interface SignupIntentSession {
  intentId: string;
  intentToken: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneE164?: string;
  countryId?: string;
  checkoutSessionId?: string;
}

const KEY = "yobody-signup-intent";

export function saveSignupIntentSession(value: SignupIntentSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getSignupIntentSession(): SignupIntentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SignupIntentSession>;
    if (typeof parsed.intentId === "string" && typeof parsed.intentToken === "string") {
      return {
        intentId: parsed.intentId,
        intentToken: parsed.intentToken,
        email: typeof parsed.email === "string" ? parsed.email : undefined,
        firstName: typeof parsed.firstName === "string" ? parsed.firstName : undefined,
        lastName: typeof parsed.lastName === "string" ? parsed.lastName : undefined,
        phoneE164: typeof parsed.phoneE164 === "string" ? parsed.phoneE164 : undefined,
        countryId: typeof parsed.countryId === "string" ? parsed.countryId : undefined,
        checkoutSessionId:
          typeof parsed.checkoutSessionId === "string" ? parsed.checkoutSessionId : undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function clearSignupIntentSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
