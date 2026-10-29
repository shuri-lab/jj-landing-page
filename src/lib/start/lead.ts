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
 * The same names are read by lib/signup/attribution.ts, which is how the id
 * reaches the backend with the signup.
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
 * TODO backend: replace the body with the real lookup, keeping the signature
 * and the "null means render generic" contract:
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
