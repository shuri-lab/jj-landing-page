/**
 * Her booking, kept on her own device so the confirmation survives a reload.
 *
 * Phones drop background tabs: she misses the call, comes back, and the page
 * reloads. Without this she would see the empty form and book again just to
 * be called. Only what the confirmation needs is kept: her first name, the
 * time she picked, and her link token. Never her phone number or email.
 */

import type { WhenSelection } from "./slots";

export interface SavedBooking {
  firstName: string;
  when: WhenSelection;
  /** Her free-call link token (GET/POST /public/free-call/reschedule). */
  token: string;
  /** Her reschedule page on the coach's site, when the backend sent one. */
  rescheduleUrl: string | null;
  /** ISO 8601, when she booked. */
  savedAt: string;
}

const KEY = "jj-free-call-booking";
const VERSION = 1;
/** The token's own life on the backend. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    // Private modes and locked-down webviews can throw on access.
    return null;
  }
}

export function saveBooking(booking: SavedBooking): void {
  try {
    storage()?.setItem(KEY, JSON.stringify({ v: VERSION, ...booking }));
  } catch {
    // Full or blocked storage: the confirmation still works for this visit.
  }
}

export function loadBooking(now: Date = new Date()): SavedBooking | null {
  const raw = storage()?.getItem(KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as Partial<SavedBooking> & { v?: number };
    const age = now.getTime() - Date.parse(saved.savedAt ?? "");
    if (
      saved.v !== VERSION ||
      typeof saved.token !== "string" ||
      typeof saved.firstName !== "string" ||
      !saved.when ||
      !(age >= 0 && age < MAX_AGE_MS)
    ) {
      clearBooking();
      return null;
    }
    return {
      firstName: saved.firstName,
      when: saved.when,
      token: saved.token,
      rescheduleUrl: typeof saved.rescheduleUrl === "string" ? saved.rescheduleUrl : null,
      savedAt: saved.savedAt!,
    };
  } catch {
    clearBooking();
    return null;
  }
}

export function clearBooking(): void {
  try {
    storage()?.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
