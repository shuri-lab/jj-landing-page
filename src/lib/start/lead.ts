/**
 * The lead behind a /start visit.
 *
 * /start is the page every join link in the post-call flow points at. The
 * woman reading it has already taken the free call and already has her plan,
 * so the page greets her by name, refers to that plan and fills the checkout
 * with the details she gave on the call.
 *
 * Everything here degrades: no token, an expired or tampered token, a failed
 * or slow lookup all end in the same clean generic page. The warm page must
 * never look broken because a lookup went wrong.
 */

import { apiBase as freeCallApiBase } from "@/lib/booking/api";

/**
 * The join link carries one signed, expiring token and nothing else:
 * /start?t=<token>. The backend signs it per lead (lead id + expiry, and for a
 * texted link a tag of the number it was texted to). It never carries her
 * email or phone; those come back from the lookup below.
 *
 * A coach's join-page setting can also place the token in `lead`
 * (…/start?lead={token}), so a token-shaped `lead` value is read the same way.
 */
const TOKEN_PARAM = "t";
const LEAD_PARAMS = ["lead", "leadId", "lead_id"] as const;
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

export interface StartLead {
  /** Used to greet her. null renders the generic headline. */
  firstName: string | null;
  /**
   * A short, human reference to what was built on her call, for example
   * "Your 10-Day Green Smoothie Cleanse". Shown as "Your plan from our call"
   * when absent.
   */
  planReference: string | null;
  /** Checkout prefill from the join-link lookup. All editable, all optional. */
  lastName?: string | null;
  email?: string | null;
  /** E.164. */
  phone?: string | null;
}

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

/**
 * A first name carried on the link itself (?firstName=).
 *
 * Not a replacement for the lookup: it is the tier between a real lead and
 * the generic page, and it is what lets the team preview the warm version
 * without a token. It also prefills the checkout, since `readLandingPrefill`
 * reads the same parameter.
 */
export function readFirstNameFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = (params.get("firstName") ?? params.get("first_name") ?? "").trim();
  return value || null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** "10-Day Green Smoothie Cleanse" → "Your 10-Day Green Smoothie Cleanse"; "Lifestyle" → "Your Lifestyle plan". */
function planReferenceFor(name: string | null): string | null {
  if (!name) return null;
  return /\b(cleanse|reset|detox|plan|program)$/i.test(name) ? `Your ${name}` : `Your ${name} plan`;
}

/**
 * The backend's answer, mapped to what the page uses. This is the only place
 * that knows the response shape (POST /public/free-call/join/prefill, backend
 * PR #2900): { firstName, lastName, email, phone, textedToPhone, coach, plan }.
 */
function toStartLead(body: unknown): StartLead | null {
  if (!body || typeof body !== "object") return null;
  const raw =
    "data" in body &&
    (body as { data?: unknown }).data &&
    typeof (body as { data?: unknown }).data === "object"
      ? ((body as { data: Record<string, unknown> }).data as Record<string, unknown>)
      : (body as Record<string, unknown>);
  const plan =
    raw.plan && typeof raw.plan === "object" ? (raw.plan as Record<string, unknown>) : null;
  const lead: StartLead = {
    firstName: text(raw.firstName),
    lastName: text(raw.lastName),
    email: text(raw.email),
    phone: text(raw.phone),
    planReference: planReferenceFor(text(plan?.name)),
  };
  return lead.firstName || lead.email || lead.phone ? lead : null;
}

/**
 * What her join link fills in. The token travels in the POST body, never in
 * a URL path a log could keep, and goes to the free call's API (the API that
 * signed it), not the payment API.
 *
 * Returns null on anything but a clean answer within 2.5 s: an expired or
 * tampered token (404), a network error, a timeout. null renders generic.
 */
export async function fetchLead(token: string): Promise<StartLead | null> {
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
    return toStartLead(await response.json().catch(() => null));
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
