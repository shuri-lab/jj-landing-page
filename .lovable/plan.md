## Goal

Replace the external `https://yoplatform.ai/signup` link on the two priced "Reserve my spot, $197 / $347" buttons in `/a` with an internal in-app checkout/signup screen at a new route. The screen mirrors the visual style of the `/a` hero section and acts as a mock pre-payment step (no real auth, no real payment).

Only `/a` is affected. `/b`, `/`, and `/no-video` keep their current behavior.

## Route & navigation

- New route file: `src/routes/checkout.tsx` → URL `/checkout`.
- It accepts a `plan` search param: `essential` (default) or `plus`.
- In `src/routes/a.tsx`, change the two `BigCta` priced buttons (currently `href="https://yoplatform.ai/signup"`) to use TanStack `<Link to="/checkout" search={{ plan: p.id }}>` instead, so the BigCta renders as an internal link. The `BigCta` component gets a small extension to support an internal `to`/`search` target in addition to (or replacing) `href`.
- `head()` for `/checkout` sets a distinct title and `noindex`.

## Screen layout (top to bottom)

All sections use the same tokens, fonts, brand color, gradients, and spacing scale already used in the `/a` hero so it feels like a continuation.

1. **Top bar** — same container, padding, and border treatment as the landing top bar, but content is just two logos centered side by side: existing `jjSmithLogo` and the new YoPlatform logo. No nav links, no CTA. Sticky behavior matches the landing.

2. **Order Summary card** — compact card, same surface/radius/shadow language as the bottom sticky reservation card on mobile in `/a`. Contents:
   - Program: "12-Week Body Transformation"
   - Plan: "Essential" or "Plus" (driven by `plan` search param)
   - Price line: `$197 total · or $77/month` (Essential) / `$347 total · or $127/month` (Plus) — pulled from the same plan data already defined in `a.tsx`, extracted into a tiny shared module so both files stay in sync.
   - Trust row: `✓ 14-day money-back guarantee · ✓ Only 500 spots`

3. **Headline + subhead** — same typography as the `/a` hero `<h1>` and subhead (same font sizes, leading, tracking, colors, mobile/desktop scaling).
   - H1: "You're almost in. Let's get you set up."
   - Sub: "We just need your email to send your program access and receipt."

4. **JJ hero image** — reuse `heroA` with the exact same gradient/background treatment as in the `/a` hero block (same wrapper, same gradient layer, same sizing). No play button overlay.

5. **Sign-in block** (positioned so the hero image sits flush on top of the Google button, no gap — matching how the hero sits on top of the "Yes JJ, I want you in my corner" CTA in `/a`):
   - **Google button** (primary, white background, Google "G" logo, dark text). Mock behavior:
     - Click → swap label to "Signed in as test@email.com", swap the Google "G" for a green check icon, mark Google-auth state = true.
     - Once in this state, the email field is hidden/disabled and the primary CTA is enabled.
   - **Divider**: thin rule with centered "OR CONTINUE WITH EMAIL" label, styled like the reference screenshot (muted color, uppercase, letter-spacing).
   - **Email input** — large rounded white field, placeholder `your@email.com`, matches the reference screenshot.
     - Real-time typo detection: simple in-file mailcheck-style suggester for common domains (`gmail.com`, `yahoo.com`, `hotmail.com`, `outlook.com`, `icloud.com`, `aol.com`). When the typed domain is close (Levenshtein ≤ 2) but not exact, render a small line under the field: `Did you mean test@gmail.com?` (clickable to accept). Plain TS, no extra deps.

6. **Primary CTA** — "Continue to Payment →"
   - Disabled visual state until either Google mock-signed-in OR the email field has at least one character (per spec: "if they enter just a letter the button becomes active").
   - Active state uses the exact same styling as the `/a` "Reserve my spot" `BigCta` (deep brand color, same radius, shadow, hover).
   - On click in mock mode: no real navigation — just keep it inert (or, optionally, log to console). Spec doesn't require a destination; we leave it as a non-functional mock so the screen reads as the final pre-payment step.

7. **Trust footer** — small muted line directly under the CTA: `🔒 Secure checkout · Powered by Stripe · 14-day money-back guarantee`.

No global footer, no FAQ, no testimonials — this screen is intentionally focused.

## Assets

- New logo: copy `user-uploads://black_letters.png` → `src/assets/landing/yoplatform-logo.png` and import as ES module.
- Reuse `heroA`, `jjSmithLogo`, brand tokens, and existing gradient utility classes — no new colors added to `src/styles.css`.
- Google "G" icon: small inline SVG (no new dependency). Green check uses `lucide-react`'s `Check` (already in the project's icon set).

## Technical notes

- File created: `src/routes/checkout.tsx` (single self-contained component with the small `Mailcheck`-style helper inline).
- File edited: `src/routes/a.tsx` — only the two priced BigCta usages and a minor `BigCta` prop addition to support internal `to` + `search` (keeps existing `href` and onClick paths intact for the other variants and pages).
- Plan data (`Essential` / `Plus` name + price + monthly) is duplicated minimally in `checkout.tsx` keyed by the `plan` search param to avoid a larger refactor; values match `a.tsx` exactly.
- All styling via existing Tailwind tokens and brand classes already in `src/styles.css`. No design-token additions.
- Responsive: layout is mobile-first (matches `/a` viewport behavior the user is currently in), scales up to desktop with the same max-widths used in the `/a` hero column.
- TanStack: `validateSearch` on the route narrows `plan` to `"essential" | "plus"` with `essential` default.