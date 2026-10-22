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
  await new Promise((resolve) => setTimeout(resolve, 900));

  // Dev-only, so the team can read the exact payload while reviewing v1.
  if (import.meta.env.DEV) {
    console.info("[free-call] submitBooking (stub) payload", payload);
  }

  return { ok: true, bookingId: null };
}
