import type { BookingPayload, BookingResult } from "./types";

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
  // Yobody's dev API until the free-call engine launches on production.
  const base = (
    import.meta.env.VITE_FREE_CALL_API_URL ?? "https://api-dev.yobyinfra.cloud"
  ).replace(/\/$/, "");
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
    data?: { id?: string; moved?: boolean; when?: BookingPayload["when"] };
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
  return { ok: true, bookingId: data.id };
}
