## Scope

All changes are in `src/routes/checkout.tsx`. No other files affected. Mobile and tablet layouts remain visually unchanged except for the explicit text-content tweaks (1, 2, 3, 5, 6).

## Changes

### 1. Top bar — "powered by" branding
Replace the vertical divider line between the JJ Smith logo and the YoPlatform "black letters" logo with the text "powered by", and shrink the YoPlatform logo slightly.

- Remove `<span className="h-5 w-px bg-line" />`.
- Insert `<span className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">powered by</span>`.
- Reduce YoPlatform logo from `h-10 sm:h-11 ... scale-150` to roughly `h-7 sm:h-8 w-auto` (no scale), keep alt text.

### 2. Headline line break
Currently: `You're almost in. Let's get you set up.` on one flowing line.
Change to two explicit lines:
```
You're almost in.
Let's get you set up.   (in brand color, italic styling kept)
```
Insert `<br />` (or split into two block spans) between the two sentences. The `em`/color treatment on the second sentence stays.

### 3. Order summary card simplification
Remove the price on the right and the "14-day money-back guarantee · Limited spots" row. Keep only two lines stacked:
- Line 1: `12-Week Body Transformation` (existing serif styling)
- Line 2: `STANDARD — Pay in full $197` (smaller, ink-soft) for Essential, or `PLUS — Pay in full $347` for Plus.

The plan label uses the existing `PLANS[plan]` data. "STANDARD" maps to Essential, "PLUS" maps to Plus. Price comes from `planInfo.price`.

### 4. Desktop two-column layout (≥ lg, 1024px+)
Mobile/tablet layout stays exactly as-is. At `lg:` and above, restructure `<main>` into a 2-column grid:

```text
┌─────────────────────────┬─────────────────────────┐
│  LEFT COLUMN            │  RIGHT COLUMN           │
│  - Headline             │  - Hero image (smaller, │
│  - Subtext              │    contained in column) │
│  - Google button        │                         │
│  - Divider + email      │                         │
│  - Continue to Payment  │                         │
│  - Secure footer text   │                         │
└─────────────────────────┴─────────────────────────┘
```

Implementation:
- Wrap inner content in a `lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center` container with `lg:max-w-[1100px] mx-auto`.
- Move the headline + subtext + sign-in block into the left column (`lg:text-left`, remove `text-center` only at `lg`).
- Move the hero image into the right column; on `lg` drop the negative margin (`lg:mt-0`) and increase max width to fit the column (~`lg:max-w-[440px]`).
- Sign-in block: remove negative top margin at `lg` (`lg:mt-0`); buttons stay full-width within their column.

Order summary card on desktop: constrain to a sensible width (e.g. `lg:max-w-[1100px] mx-auto`) so it does not stretch full-screen, matching the main content container width. The full-bleed border-bottom band stays, only the inner content is constrained — this matches the existing pattern (`max-w-[640px] lg:max-w-[1200px]`), tightened to `lg:max-w-[1100px]` to align with the new grid.

Top bar inner container similarly aligns to `lg:max-w-[1100px]` for visual consistency (optional polish, no behavioral change).

### 5. Continue with Google — larger text
Bump the button label font size. Change the button's text classes from `text-[16px] sm:text-[18px]` to `text-[18px] sm:text-[20px]`. Padding/height unchanged.

### 6. Mobile secure-checkout footer break
Currently one long line. Split into two lines on mobile, keep single line on `sm+`:
- Line 1: `Secure checkout · Powered by Stripe`
- Line 2: `14-day money-back guarantee`

Implementation: replace the single `<p>` content with two `<span className="block sm:inline">` segments (with the `·` separator only shown on `sm+`), or use `<br className="sm:hidden" />`. Keep the lock icon at the start of line 1.

## Files
- `src/routes/checkout.tsx` — all six changes above.

## Out of scope
- No logic, routing, validation, or pricing changes.
- No tablet/mobile visual changes beyond items 1, 2, 3, 5, 6.
