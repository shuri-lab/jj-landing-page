import { useCallback, useEffect, useRef, useState } from "react";
import "./social-proof.css";

/* ──────────────────────────────────────────────────────────────────────────
 * Social-proof notification widget (recent sign-ups popup).
 *
 * EDIT ME: add / swap / reorder entries below. Each entry pairs a name with a
 * location and its coordinates (used to render a matching map thumbnail).
 * ────────────────────────────────────────────────────────────────────────── */
type ProofEntry = { name: string; location: string; lat: number; lng: number };

const SOCIAL_PROOF_ENTRIES: ProofEntry[] = [
  { name: "Maya", location: "Griffin, GA", lat: 33.2468, lng: -84.2641 },
  { name: "Lori", location: "Sacramento, CA", lat: 38.5816, lng: -121.4944 },
  { name: "Tywanna", location: "Hattiesburg, MS", lat: 31.3271, lng: -89.2903 },
  { name: "Lily", location: "Raymond, MS", lat: 32.2582, lng: -90.4176 },
  { name: "Ulanda", location: "Waco, TX", lat: 31.5493, lng: -97.1467 },
  { name: "Neola", location: "Bowie, MD", lat: 38.9427, lng: -76.7302 },
  { name: "Cheryl", location: "Monterey, CA", lat: 36.6002, lng: -121.8947 },
  { name: "Lynda", location: "Richmond, VA", lat: 37.5407, lng: -77.436 },
  { name: "Valerie", location: "Columbia, SC", lat: 34.0007, lng: -81.0348 },
  { name: "Kali", location: "Montgomery, AL", lat: 32.3668, lng: -86.3 },
  { name: "TieSha", location: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
  { name: "Carol", location: "Bel Air, MD", lat: 39.5359, lng: -76.3483 },
  { name: "Ella", location: "Newark, NJ", lat: 40.7357, lng: -74.1724 },
  { name: "Sharlene", location: "Phoenix, AZ", lat: 33.4484, lng: -112.074 },
  { name: "LaShina", location: "Indianapolis, IN", lat: 39.7684, lng: -86.1581 },
  { name: "Nile", location: "Orlando, FL", lat: 28.5383, lng: -81.3792 },
];

// ── Master on/off switch ──────────────────────────────────────────────────────
// Deactivated for now because the mobile bar was covering the sticky CTA.
// Flip to `true` to re-activate the widget (all its code is kept intact).
const WIDGET_ENABLED = false;

const ACTION_TEXT = "Joined JJ Smith's coaching";

/* Timing (ms). Tweak here to match a reference widget. */
const INITIAL_DELAY = 4000; // wait before the first notification (hero gets focus)
const VISIBLE_MIN = 8000; // notification stays on screen: 8–10s (readable)
const VISIBLE_MAX = 10000;

/* Cadence decays over the session so it never nags visitors who linger 5+ min.
 * The gap between notifications GROWS each time: gap = GAP_BASE * GAP_GROWTH^n,
 * capped at GAP_MAX. Front-loaded (active early), then calmer.
 * Roughly: ~8s, 12s, 18s, 27s, 40s, 60s, then ~75s apart. */
const GAP_BASE = 8000; // first gap ≈ 8s
const GAP_GROWTH = 1.5; // each gap ≈ 1.5× the previous
const GAP_MAX = 75000; // never more than ~75s apart

const EXIT_ANIM = 480; // must stay in sync with the CSS transition duration
const ENTER_TICK = 40; // let the hidden card paint before sliding it in

/* "Time ago" simulates a chronological list of recent buyers: the first popup is
 * the most recent (a few minutes), then each later one is a realistically older
 * purchase. Gaps between purchases widen as we go further back (minutes → hours). */
const AGO_START_MIN = 3; // first (most recent) purchase: 3–6 min ago
const AGO_START_MAX = 6;
const AGO_STEP_BASE = 16; // gap to the next-oldest purchase (~16 min at first)…
const AGO_STEP_GROWTH = 1.3; // …widening for older purchases in the list

/* Static map thumbnail matching the location.
 * Uses Google Static Maps when a key is provided (best quality, includes a pin);
 * otherwise falls back to a real OpenStreetMap raster tile for the location.
 * Set VITE_GOOGLE_STATIC_MAPS_KEY in the env to enable Google maps. Never hardcode a key. */
function mapThumbUrl(e: ProofEntry): string {
  const env = import.meta.env as Record<string, string | undefined>;
  const key = env.VITE_GOOGLE_STATIC_MAPS_KEY;
  if (key) {
    return (
      `https://maps.googleapis.com/maps/api/staticmap?center=${e.lat},${e.lng}` +
      `&zoom=11&size=120x120&scale=2&markers=color:0x7C3AA6%7C${e.lat},${e.lng}&key=${key}`
    );
  }
  const z = 11;
  const n = 2 ** z;
  const x = Math.floor(((e.lng + 180) / 360) * n);
  const latRad = (e.lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function formatAgo(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "an hour ago" : `${hours} hours ago`;
}

export default function SocialProofWidget() {
  const [entry, setEntry] = useState<ProofEntry | null>(null);
  const [agoLabel, setAgoLabel] = useState("");
  const [shown, setShown] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [suppressed, setSuppressed] = useState(false); // hidden for good once checkout/payment shows

  const timers = useRef<number[]>([]);
  const queue = useRef<ProofEntry[]>([]);
  const lastName = useRef<string | null>(null);
  const shownCount = useRef(0);
  const agoMinutes = useRef(randInt(AGO_START_MIN, AGO_START_MAX));
  const stopped = useRef(false);

  const after = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const nextEntry = useCallback((): ProofEntry => {
    if (queue.current.length === 0) {
      queue.current = shuffle(SOCIAL_PROOF_ENTRIES);
      // never repeat the same entry twice in a row across a reshuffle
      if (queue.current.length > 1 && queue.current[0].name === lastName.current) {
        queue.current.push(queue.current.shift() as ProofEntry);
      }
    }
    const e = queue.current.shift() as ProofEntry;
    lastName.current = e.name;
    return e;
  }, []);

  const cycle = useCallback(() => {
    if (stopped.current) return;
    const e = nextEntry();
    setMapError(false);
    setEntry(e);
    setAgoLabel(formatAgo(agoMinutes.current)); // most recent first…
    const agoStep = AGO_STEP_BASE * AGO_STEP_GROWTH ** shownCount.current;
    agoMinutes.current += Math.round(agoStep * (0.8 + Math.random() * 0.4)); // …then realistically older
    setShown(false);

    const visible = randInt(VISIBLE_MIN, VISIBLE_MAX);
    // Growing gap: front-loaded early in the session, then progressively calmer.
    const baseGap = Math.min(GAP_MAX, GAP_BASE * GAP_GROWTH ** shownCount.current);
    const gap = Math.round(baseGap * (0.9 + Math.random() * 0.2)); // ±10% jitter
    shownCount.current += 1;
    after(ENTER_TICK, () => setShown(true)); // slide/fade in
    after(ENTER_TICK + visible, () => setShown(false)); // slide/fade out
    after(ENTER_TICK + visible + EXIT_ANIM, () => setEntry(null)); // unmount
    after(ENTER_TICK + visible + EXIT_ANIM + gap, cycle); // next one
  }, [after, nextEntry]);

  useEffect(() => {
    if (!WIDGET_ENABLED) return; // deactivated — never start the cycle
    stopped.current = false;
    after(INITIAL_DELAY, cycle);
    return () => {
      stopped.current = true;
      clearTimers();
    };
  }, [after, clearTimers, cycle]);

  // Once the Stripe payment/checkout screen is visible, stop showing notifications
  // for the rest of the session — never distract a buyer who is at the payment step.
  useEffect(() => {
    const paymentVisible = () => !!document.querySelector(".chk-embedded, .chk-pay-loading");
    const check = () => {
      if (paymentVisible()) {
        stopped.current = true;
        clearTimers();
        setShown(false);
        setSuppressed(true);
      }
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [clearTimers]);

  if (!WIDGET_ENABLED || suppressed || !entry) return null;

  return (
    <div className={`jj-sp${shown ? " is-shown" : ""}`} role="status" aria-live="polite">
      <div className="jj-sp-map">
        {mapError ? (
          <span className="jj-sp-pin" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.2 12 21 12 21z"
                fill="currentColor"
                opacity=".16"
              />
              <path
                d="M12 21s6.5-5.8 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.2 12 21 12 21z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="10.2" r="2.4" fill="currentColor" />
            </svg>
          </span>
        ) : (
          <img
            src={mapThumbUrl(entry)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setMapError(true)}
          />
        )}
      </div>

      <div className="jj-sp-body">
        <p className="jj-sp-l1">
          <span className="jj-sp-name">{entry.name}</span>{" "}
          <span className="jj-sp-loc">({entry.location})</span>
        </p>
        <p className="jj-sp-l2">{ACTION_TEXT}</p>
        <p className="jj-sp-l3">
          <span>{agoLabel}</span>
          <svg className="jj-sp-check" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <circle cx="8" cy="8" r="8" fill="var(--purple, #7C3AA6)" />
            <path
              d="M4.6 8.2l2.1 2.1 4.7-4.8"
              fill="none"
              stroke="#fff"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </p>
      </div>
    </div>
  );
}
