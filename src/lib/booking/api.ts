import type { BookingPayload, BookingResult, CallReason, CallState, CallStatus } from "./types";

/** Yobody's dev API until the free-call engine launches on production. */
export function apiBase(): string {
  return (import.meta.env.VITE_FREE_CALL_API_URL ?? "https://api-dev.yobyinfra.cloud").replace(
    /\/$/,
    "",
  );
}

type ApiBody = {
  code?: string;
  message?: string | string[];
  data?: Record<string, unknown> & { code?: string };
} | null;

function errorCode(json: ApiBody): string | undefined {
  return json?.code ?? json?.data?.code;
}

function errorMessage(json: ApiBody): string | undefined {
  const message = json?.message ?? (json?.data?.message as string | string[] | undefined);
  return Array.isArray(message) ? message.join(" ") : message;
}

/**
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * v1 stub. It waits a moment and reports success. No request leaves the
 * browser, nothing is stored, and no text or email is sent.
 *
 * TODO backend: wired by Christophe. Replace the body with the real call,
 * keeping the signature and the `BookingResult` contract:
 *
 *   const { data } = await apiClient.post("/public/free-call/bookings", payload);
 *   return { ok: true, bookingId: data.id };
 *
 * Return `{ ok: false, reason }` for a handled failure and throw for an
 * unexpected one. The form treats both the same way: it keeps everything she
 * typed and shows a friendly retry message.
 *
 * The payload shape is documented in docs/free-call-backend-handoff.md.
 * ──────────────────────────────────────────────────────────────────────────
 */
export async function submitBooking(payload: BookingPayload): Promise<BookingResult> {
  const base = apiBase();
  // Her browser time zone, so calling hours run on her clock.
  const body = JSON.stringify({
    ...payload,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  let response: Response | null = null;
  for (let attempt = 0; !response; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      response = await fetch(`${base}/public/free-call/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body,
        signal: controller.signal,
      });
    } catch (err) {
      // A dropped connection (in-app browsers) never reached us, so retry it
      // once. A timeout is ambiguous, so it is not retried.
      if (attempt > 0 || (err as { name?: string }).name === "AbortError") throw err;
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      clearTimeout(timer);
    }
  }

  const json = (await response.json().catch(() => null)) as {
    message?: string | string[];
    data?: {
      id?: string;
      moved?: boolean;
      when?: BookingPayload["when"];
      statusToken?: string | null;
      rescheduleUrl?: string | null;
    };
  } | null;
  if (response.status >= 500) throw new Error(`Booking failed (${response.status})`);
  if (!response.ok) {
    const message = Array.isArray(json?.message) ? json.message.join(" ") : json?.message;
    return { ok: false, reason: message || `Booking failed (${response.status})` };
  }
  const data = json?.data;
  if (!data?.id) throw new Error("Booking response had no id");
  // "Now" late at night, or a time past calling hours, is booked for the next
  // opening. The confirmation reads payload.when, so it shows that time.
  if (data.moved && data.when) payload.when = data.when;
  return {
    ok: true,
    bookingId: data.id,
    statusToken: data.statusToken || null,
    rescheduleUrl: data.rescheduleUrl || null,
  };
}

/**
 * Where her call stands, read with her link token. `expired` means the token
 * no longer opens her call (7 days on, or the booking is gone): the page then
 * forgets it and shows the form again.
 */
export async function fetchCallStatus(
  token: string,
  signal?: AbortSignal,
): Promise<{ ok: true; status: CallStatus } | { ok: false; expired: boolean }> {
  const response = await fetch(
    `${apiBase()}/public/free-call/reschedule?t=${encodeURIComponent(token)}`,
    { headers: { Accept: "application/json" }, signal },
  );
  const json = (await response.json().catch(() => null)) as ApiBody;
  if (!response.ok) {
    return { ok: false, expired: errorCode(json) === "LEAD_LINK_INVALID" };
  }
  const status = callStatusFrom(json?.data);
  return status ? { ok: true, status } : { ok: false, expired: false };
}

const CALL_STATES: CallState[] = ["open", "scheduled", "calling", "done", "member", "closed"];
const CALL_REASONS: CallReason[] = [
  "cut_off",
  "missed",
  "callback",
  "booked",
  "unreachable",
  "replaced",
];

/**
 * The status as this page reads it. Anything a backend leaves out (an older
 * one has no `missedAt`) reads as nothing to show, never as a missed call.
 */
export function callStatusFrom(raw: unknown): CallStatus | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const state = CALL_STATES.find((value) => value === data.state);
  if (!state) return null;
  const reason = CALL_REASONS.find((value) => value === data.reason) ?? "booked";
  const scheduled = data.scheduledFor as { iso?: unknown; label?: unknown } | null | undefined;
  const slots = data.slots as { now?: { available?: unknown } } | undefined;
  return {
    state,
    reason,
    missedAt:
      typeof data.missedAt === "string" && Number.isFinite(Date.parse(data.missedAt))
        ? data.missedAt
        : null,
    firstName: typeof data.firstName === "string" ? data.firstName : null,
    caller: typeof data.caller === "string" ? data.caller : "",
    scheduledFor:
      scheduled && typeof scheduled.iso === "string" && typeof scheduled.label === "string"
        ? { iso: scheduled.iso, label: scheduled.label }
        : null,
    slots: { now: { available: slots?.now?.available === true } },
  };
}

/** Longer than the backend needs to book and start dialing; then we check instead. */
const CALL_NOW_TIMEOUT_MS = 15_000;

export type CallNowResult =
  | { ok: true; state: "calling" | "scheduled" }
  | {
      ok: false;
      /**
       * `unknown`: no answer came back (dropped or too slow), so the call may
       * or may not be booked. The page checks the status rather than asking
       * again on its own.
       */
      kind: "closed" | "expired" | "limit" | "unavailable" | "unknown" | "error";
      message?: string;
    };

/**
 * "Call me now" after a missed or cut-off call. The backend books it like a
 * fresh "now" booking (three dials, the hourly limit per phone), never while
 * a call is live, and never to a number it cannot call.
 */
export async function requestCallNow(token: string): Promise<CallNowResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_NOW_TIMEOUT_MS);
  let response: Response;
  let json: ApiBody;
  try {
    response = await fetch(`${apiBase()}/public/free-call/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ t: token, when: { mode: "now" } }),
      signal: controller.signal,
    });
    json = (await response.json().catch(() => null)) as ApiBody;
  } catch {
    return { ok: false, kind: "unknown" };
  } finally {
    clearTimeout(timer);
  }
  if (response.ok) {
    const state = json?.data?.state;
    return { ok: true, state: state === "scheduled" ? "scheduled" : "calling" };
  }
  const code = errorCode(json);
  if (code === "LEAD_LINK_INVALID") return { ok: false, kind: "expired" };
  if (code === "LEAD_LINK_CLOSED") return { ok: false, kind: "closed" };
  if (response.status === 429) return { ok: false, kind: "limit" };
  if (response.status === 400) {
    return { ok: false, kind: "unavailable", message: errorMessage(json) };
  }
  return { ok: false, kind: "error" };
}
