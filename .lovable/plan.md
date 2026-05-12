## Scope

All changes in `src/routes/checkout.tsx`. Mobile/tablet untouched except items 1 and 2 (which are content/layout tweaks the user explicitly wants on all viewports).

## Changes

### 1. Bigger YoPlatform "black letters" logo
Top bar currently: `h-6 sm:h-7`. Bump to `h-8 sm:h-10` so the wordmark reads larger next to the JJ Smith logo and "powered by" label. Container height stays 14 (`h-14`); logos still vertically centered.

### 2. Order summary bar — two-line, left/right justified
Replace the current two-line stacked block with a single row that has two stacked lines on each side:

```text
STANDARD PLAN                             $197
12-Week Body Transformation          Pay in full
```

Markup:
```tsx
<div className="flex items-start justify-between gap-4">
  <div className="min-w-0">
    <div className="text-[11px] sm:text-[12px] font-semibold tracking-[0.18em] uppercase text-ink-soft">
      {plan === "plus" ? "PLUS PLAN" : "STANDARD PLAN"}
    </div>
    <div className="font-serif text-[16px] sm:text-[18px] leading-tight">
      12-Week Body Transformation
    </div>
  </div>
  <div className="text-right shrink-0">
    <div className="font-serif text-[20px] sm:text-[22px] leading-tight">
      {planInfo.price}
    </div>
    <div className="text-[12px] sm:text-[13px] text-ink-soft">
      Pay in full
    </div>
  </div>
</div>
```

No "/" separators. Left column left-aligned, right column right-aligned, vertically aligned to the top so the small label and the price line up.

### 3. Desktop two-column rebalance
Currently the desktop grid puts headline + sub-text + Google button + email + CTA + footer all in the LEFT column, hero in the right. User wants the LEFT column to contain ONLY the headline and sub-text (vertically centered), and the RIGHT column to hold hero image + Google button + email + CTA + secure footer.

Restructure `<main>` for `lg:` (mobile/tablet markup unchanged):

- Left column (`lg:order-1`): only `<h1>` + sub-paragraph, with `lg:self-center` (or `lg:items-center` on grid + content vertically centered).
- Right column (`lg:order-2`): hero image stack on top, then sign-in block (Google btn, divider, email, CTA, secure footer).

Implementation approach to avoid duplicating mobile markup:
- Keep the existing single linear column for mobile/tablet. At `lg:` use CSS grid to "pull" the hero + sign-in block into the right column via `lg:col-start-2 lg:row-start-1` and headline into `lg:col-start-1 lg:row-start-1 lg:self-center`. The current desktop-only hero `<div className="hidden lg:flex …">` is removed; instead, the existing hero `<div className="… lg:hidden">` loses `lg:hidden` and gets repositioned via grid placement on its parent wrapper.
- Simpler alternative: keep two separate hero blocks (current mobile one + existing desktop-only one), but move the sign-in block markup into the right column at `lg:` by using `display: contents` style restructuring. To keep this clean, the plan is:
  1. Wrap the headline + sub-paragraph in a `<section>` with `lg:col-start-1 lg:row-start-1 lg:self-center lg:text-left`.
  2. Wrap the (mobile hero + sign-in block) into another `<section>` with `lg:col-start-2 lg:row-start-1`.
  3. In that right section, the existing mobile hero loses `lg:hidden` and instead drops the negative `-mt-*` at `lg:` (`lg:mt-0`) and gets a larger desktop max-width (`lg:max-w-[420px] lg:mx-auto`).
  4. Delete the current standalone `hidden lg:flex` desktop-only hero block (now redundant).
- Sign-in block: remove `lg:mt-8` override (it was added when hero wasn't above it on desktop); restore the natural `-mt-4 sm:-mt-6` flow so the buttons hug the hero on desktop too.
- Secure footer: revert to `text-center` on desktop as well (was `lg:text-left`), since right column content is centered under the hero.

### 4. Order summary container width on desktop
No change required — already constrained to `lg:max-w-[1100px]` from the previous turn, which matches the new main grid width. Verify the new two-column row balances visually inside that width; if it looks too sparse, tighten to `lg:max-w-[960px]` to match a slightly narrower main content area. Decision: keep `lg:max-w-[1100px]` for both the order bar and main grid so they align edge-to-edge.

## Files
- `src/routes/checkout.tsx` — items 1, 2, 3, 4.

## Out of scope
- No pricing, routing, or business-logic changes.
- No tablet/mobile visual changes beyond items 1 and 2 (which are intentional content/layout updates).
