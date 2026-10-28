import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCallStatus } from "./api";
import type { CallState, CallStatus } from "./types";

/** How often the confirmation asks how her call went while she is looking at it. */
export const CALL_STATUS_POLL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 10_000;
/** Nothing changes after these, so the page stops asking (until she acts again). */
const FINAL_STATES: CallState[] = ["done", "member", "closed"];

/**
 * Where her free call stands, kept fresh while the confirmation is on screen.
 *
 * It asks on mount, every 15 seconds while the tab is visible, and the moment
 * she comes back to the tab (she saw the missed call and switched back). A
 * hidden tab never polls. A failed request is simply tried again on the next
 * tick; an expired link calls `onExpired` once.
 *
 * Around an action (her "Call me now"), `hold` drops any answer to a question
 * asked before it and asks nothing while the action is in flight; `release`
 * then asks again from scratch, even after a final state, so the answer on
 * screen always comes from after the action.
 */
export function useCallStatus(token: string | null, onExpired: () => void) {
  const [current, setCurrent] = useState<{ status: CallStatus; checkedAt: number } | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const finished = useRef(false);
  const held = useRef(false);
  /** Bumped by hold/release and a new token: older answers are not applied. */
  const generation = useRef(0);
  const expired = useRef(onExpired);
  expired.current = onExpired;

  const refresh = useCallback(async () => {
    if (!token || finished.current || held.current || inFlight.current) return;
    const asked = generation.current;
    const controller = new AbortController();
    inFlight.current = controller;
    const checkedAt = Date.now();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const result = await fetchCallStatus(token, controller.signal);
      if (controller.signal.aborted || asked !== generation.current) return;
      if (result.ok) {
        setCurrent({ status: result.status, checkedAt });
        if (FINAL_STATES.includes(result.status.state)) finished.current = true;
      } else if (result.expired) {
        finished.current = true;
        expired.current();
      }
    } catch {
      // Offline or slow: the next tick tries again.
    } finally {
      clearTimeout(timer);
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, [token]);

  const hold = useCallback(() => {
    generation.current += 1;
    held.current = true;
    inFlight.current?.abort();
    inFlight.current = null;
  }, []);

  const release = useCallback(() => {
    generation.current += 1;
    held.current = false;
    finished.current = false;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    generation.current += 1;
    finished.current = false;
    held.current = false;
    void refresh();
    const whenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const tick = window.setInterval(whenVisible, CALL_STATUS_POLL_MS);
    document.addEventListener("visibilitychange", whenVisible);
    window.addEventListener("focus", whenVisible);
    // iOS restores a backgrounded page from its cache without a reload.
    window.addEventListener("pageshow", whenVisible);
    return () => {
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", whenVisible);
      window.removeEventListener("focus", whenVisible);
      window.removeEventListener("pageshow", whenVisible);
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [token, refresh]);

  return {
    status: current?.status ?? null,
    checkedAt: current?.checkedAt ?? null,
    hold,
    release,
  };
}
