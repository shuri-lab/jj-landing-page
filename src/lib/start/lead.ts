import { apiBase as freeCallApiBase } from "@/lib/booking/api";

/**
 * The lead behind a /start visit.
 *
 * /start is the page every join link in the post-call flow points at. The
 * woman reading it has already taken the free call and already has her plan,
 * so the page greets her by name and refers to that plan.
 *
 * Everything here degrades: no lead id, a failed fetch, or a lead the backend
 * does not know all end in the same clean generic page. The warm page must
 * never look broken because a lookup went wrong.
 */

/**
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * [CONFIRM] the parameter the join links carry. These three are accepted so
 * the links work whichever spelling ships; `lead` is the documented default.
 *
 * Update 2026-10-29: the join links carry a signed token, `?t=` (see "Join
 * token" below), and the signup links her free call through that token
 * (`leadToken`). A token-shaped `lead` value is read as the token. A bare id
 * is no longer sent with the signup: the production API rejects
 * marketingAttribution.freeCallLeadId.
 * ──────────────────────────────────────────────────────────────────────────
 */
const LEAD_PARAMS = ["lead", "leadId", "lead_id"] as const;

export interface StartLead {
  /** Used to greet her. null renders the generic headline. */
  firstName: string | null;
  /**
   * A short, human reference to what was built on her call, for example
   * "your 7 day reset". Shown as "your plan from our call" when absent.
   */
  planReference: string | null;
}

export function readLeadIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  for (const key of LEAD_PARAMS) {
    const value = params.get(key)?.trim();
    if (value) return value;
  }
  return null;
}

/**
 * A first name carried on the join link itself.
 *
 * Not a replacement for the lookup: it is the tier between a real lead and
 * the generic page, and it is what lets the team preview the warm version
 * before the endpoint below exists. It also prefills the checkout, since
 * `readLandingPrefill` reads the same parameter.
 */
export function readFirstNameFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = (params.get("firstName") ?? params.get("first_name") ?? "").trim();
  return value || null;
}

/**
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * v1 stub. No request leaves the browser, so every visit currently falls back
 * to the link's own first name, and then to the generic page.
 *
 * Decision 2026-10-29 (Christophe): the page copy stays generic for every
 * visitor, so this stays a stub. Her join token is looked up only to fill the
 * checkout fields (fetchJoinPrefill below), never to change the page.
 *
 * If it is ever wired: replace the body with the real lookup, keeping the
 * signature and the "null means render generic" contract:
 *
 *   const { data } = await apiClient.get(`/public/free-call/leads/${leadId}`);
 *   return { firstName: data.firstName ?? null, planReference: data.planLabel ?? null };
 *
 * Return null, or throw, and the page renders generic. It must never return
 * anything that would let a guessed id leak another woman's details: the
 * endpoint should serve only the name and plan label, never contact details.
 * ──────────────────────────────────────────────────────────────────────────
 */
export async function fetchLead(leadId: string): Promise<StartLead | null> {
  if (import.meta.env.DEV) {
    console.info("[start] fetchLead (stub) for lead", leadId);
  }
  return null;
}

/**
 * ──────────────────────────────────────────────────────────────────────────
 * Join token
 *
 * The post-call join link is /start?t=<token>: one signed, expiring token
 * (lead id + expiry, and for a texted link a tag of the number it was texted
 * to) and nothing else. Her email and phone are never in the URL; they come
 * back from fetchJoinPrefill and only fill the checkout card.
 * ──────────────────────────────────────────────────────────────────────────
 */
const TOKEN_PARAM = "t";
const TOKEN_PREFIX = "l1.";
const TOKEN_MAX_LENGTH = 512;
const TOKEN_STORAGE_KEY = "yb_start_join_token";
const TOKEN_WINDOW_KEY = "__ybJoinToken";

const LOOKUP_TIMEOUT_MS = 2500;

/**
 * Runs inline at the top of <head> (see __root.tsx), before HYROS, the Meta
 * Pixel, GA and Clarity read the address bar. On /start it moves the token
 * out of the URL into this tab's sessionStorage (and a window global for this
 * page load), so no analytics script, referrer or saved landing URL ever sees
 * it. Every other route returns on the first line.
 */
export const JOIN_TOKEN_EARLY_SCRIPT = `(function(){try{var l=window.location;if(!/^\\/start\\/?$/.test(l.pathname))return;var q=new URLSearchParams(l.search),k=${JSON.stringify([TOKEN_PARAM, ...LEAD_PARAMS])},v="",i,x;for(i=0;i<k.length;i++){x=(q.get(k[i])||"").trim();if(x&&(k[i]===${JSON.stringify(TOKEN_PARAM)}||x.indexOf(${JSON.stringify(TOKEN_PREFIX)})===0)){v=v||x;q.delete(k[i]);}}if(!v)return;window[${JSON.stringify(TOKEN_WINDOW_KEY)}]=v;try{sessionStorage.setItem(${JSON.stringify(TOKEN_STORAGE_KEY)},v);}catch(e){}var s=q.toString();history.replaceState(history.state,"",l.pathname+(s?"?"+s:"")+l.hash);}catch(e){}})();`;

function isJoinToken(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= TOKEN_MAX_LENGTH;
}

function tokenInUrl(params: URLSearchParams): { key: string; value: string } | null {
  const direct = params.get(TOKEN_PARAM)?.trim();
  if (direct) return { key: TOKEN_PARAM, value: direct };
  for (const key of LEAD_PARAMS) {
    const value = params.get(key)?.trim();
    if (value?.startsWith(TOKEN_PREFIX)) return { key, value };
  }
  return null;
}

/**
 * Her join token: from the URL if it is still there, else where the early
 * script put it. The sessionStorage copy keeps it through a reload or the
 * Stripe return in the same tab.
 */
export function readJoinToken(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = tokenInUrl(new URLSearchParams(window.location.search))?.value;
  const fromWindow = (window as unknown as Record<string, unknown>)[TOKEN_WINDOW_KEY];
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage blocked: the URL or the window copy still works for this load */
  }
  const token = fromUrl || (typeof fromWindow === "string" ? fromWindow : "") || stored || null;
  return isJoinToken(token) ? token : null;
}

/**
 * Fallback for when the early script did not run (for example a client-side
 * navigation to /start?t=…): move the token out of the address bar.
 */
export function hideJoinTokenFromUrl(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const found = tokenInUrl(url.searchParams);
  if (!found) return;
  try {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, found.value);
  } catch {
    /* ignore */
  }
  (window as unknown as Record<string, unknown>)[TOKEN_WINDOW_KEY] = found.value;
  url.searchParams.delete(found.key);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

/** What her join token fills in on the checkout card. All editable, all optional. */
export interface JoinPrefill {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  /** E.164. */
  phone: string | null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * The backend's answer, mapped to the card's fields. This is the only place
 * that knows the response shape (POST /public/free-call/join/prefill, backend
 * PR #2900). Its coach and plan are deliberately not used: the page stays the
 * same for everyone.
 */
function toJoinPrefill(body: unknown): JoinPrefill | null {
  if (!body || typeof body !== "object") return null;
  const inner = (body as { data?: unknown }).data;
  const raw = (inner && typeof inner === "object" ? inner : body) as Record<string, unknown>;
  const prefill: JoinPrefill = {
    firstName: text(raw.firstName),
    lastName: text(raw.lastName),
    email: text(raw.email),
    phone: text(raw.phone),
  };
  return prefill.firstName || prefill.lastName || prefill.email || prefill.phone ? prefill : null;
}

/**
 * The checkout fields her join token fills in. The token travels in the POST
 * body, never in a URL path a log could keep, and goes to the free call's API
 * (the API that signed it), not the payment API.
 *
 * Returns null on anything but a clean answer within 2.5 s: an expired or
 * tampered token (404), a network error, a timeout. null leaves the card empty.
 */
export async function fetchJoinPrefill(token: string): Promise<JoinPrefill | null> {
  if (!isJoinToken(token)) return null;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS) : null;
  try {
    const response = await fetch(`${freeCallApiBase()}/public/free-call/join/prefill`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ t: token }),
      cache: "no-store",
      signal: controller?.signal,
    });
    if (!response.ok) return null;
    return toJoinPrefill(await response.json().catch(() => null));
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
