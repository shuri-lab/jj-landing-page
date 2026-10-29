import { envApiUrl } from "./env";
import {
  SignupApiError,
  type LovablePublicConfig,
  type SignupBillingInterval,
  type SignupIntentResponse,
  type SignupMarketingAttribution,
  type VerifiedDiscount,
} from "./types";

type Envelope<T> = { data?: T } & T;

const PREFIX = "/public/landing/signup";

const REQUEST_TIMEOUT_MS = 10000;

function isAbortError(err: unknown): boolean {
  return !!err && typeof err === "object" && (err as { name?: string }).name === "AbortError";
}

async function fetchOnce(
  url: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer =
    controller && typeof setTimeout !== "undefined"
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;
  try {
    return await fetch(url, {
      ...init,
      signal: controller?.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  options?: { timeoutMs?: number },
): Promise<T> {
  const url = `${envApiUrl()}${path}`;
  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  let response: Response;
  try {
    response = await fetchOnce(url, init, timeoutMs);
  } catch (err) {
    // A dropped connection (frequent in Facebook/Instagram in-app browsers)
    // means the request never reached the server, so one retry is safe.
    // A timeout abort is ambiguous, so we surface it without retrying.
    if (isAbortError(err)) {
      throw new SignupApiError(0, "The checkout timed out. Please try again.");
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      response = await fetchOnce(url, init, timeoutMs);
    } catch {
      throw new SignupApiError(0, "Could not reach checkout. Please try again.");
    }
  }

  const json = (await response.json().catch(() => null)) as
    Envelope<T> | { message?: string | string[]; statusCode?: number } | null;

  if (!response.ok) {
    const raw = json && typeof json === "object" && "message" in json ? json.message : null;
    const message = Array.isArray(raw)
      ? raw.join(" ")
      : typeof raw === "string" && raw.trim()
        ? raw
        : `Request failed (${response.status})`;
    throw new SignupApiError(response.status, message);
  }

  if (json && typeof json === "object" && "data" in json && json.data != null) {
    return json.data as T;
  }
  return json as T;
}

export const landingSignupApi = {
  getConfig(): Promise<LovablePublicConfig> {
    return request<LovablePublicConfig>(`${PREFIX}/config`);
  },

  startEmail(payload: {
    email: string;
    /** The /start join token: links this signup to her free call. */
    leadToken?: string | null;
    coachId: string;
    coachProgramConfigId?: string | null;
    billingInterval?: SignupBillingInterval | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    smsConsent?: boolean | null;
    marketingAttribution?: SignupMarketingAttribution | null;
  }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/email/start`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me(intentToken: string): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/me`, {
      method: "POST",
      body: JSON.stringify({ intentToken }),
    });
  },

  pingActivity(intentToken: string): Promise<{ ok: true; lastActivityAt: string }> {
    return request<{ ok: true; lastActivityAt: string }>(`${PREFIX}/activity`, {
      method: "POST",
      body: JSON.stringify({ intentToken }),
    });
  },

  verifyDiscount(payload: {
    intentToken: string;
    discountCode: string;
    coachProgramConfigId?: string | null;
    billingInterval?: SignupBillingInterval | null;
  }): Promise<VerifiedDiscount> {
    return request<VerifiedDiscount>(`${PREFIX}/discount/verify`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createCheckout(payload: {
    intentToken: string;
    /** The /start join token: links this signup to her free call. */
    leadToken?: string | null;
    coachProgramConfigId?: string | null;
    discountCode?: string | null;
    billingInterval?: SignupBillingInterval | null;
    marketingAttribution?: SignupMarketingAttribution | null;
    returnUrl?: string | null;
  }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/checkout`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyCheckout(payload: {
    intentToken: string;
    paymentIntentId?: string;
    checkoutSessionId?: string;
  }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(
      `${PREFIX}/checkout/verify`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      { timeoutMs: 20000 },
    );
  },

  setPassword(payload: { intentToken: string; password: string }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/password`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateProfile(payload: {
    intentToken: string;
    firstName: string;
    lastName?: string | null;
  }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/profile`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  requestPhoneOtp(payload: {
    intentToken: string;
    phoneNumber: string;
  }): Promise<{ message?: string }> {
    return request(`${PREFIX}/phone/request-otp`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyPhone(payload: {
    intentToken: string;
    phoneNumber: string;
    otpCode: string;
    countryId?: string | null;
  }): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/phone/verify`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  complete(intentToken: string): Promise<SignupIntentResponse> {
    return request<SignupIntentResponse>(`${PREFIX}/complete`, {
      method: "POST",
      body: JSON.stringify({ intentToken }),
    });
  },
};

/** @deprecated Use landingSignupApi — kept so older imports still type-check during the swap. */
export const lovableSignupApi = landingSignupApi;
