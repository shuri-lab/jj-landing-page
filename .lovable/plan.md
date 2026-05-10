## Updates to landing page

### 1. Trim the "personal" callout
In the hero callout (line ~226), change:
> "Sister, **this is personal for me**, so I'm only opening 500 spots. Once they're gone, they're gone. The next cohort won't open for another 90 days."

to:
> "**This is personal for me**, so I'm only opening 500 spots. Once they're gone, they're gone."

Also update the matching FAQ answer about "What if I miss this cohort?" — keep the answer but drop the "90 days" claim so it stays consistent.

### 2. Two pricing plans
Restructure the Offer section into a side-by-side (stacked on mobile) two-plan layout:

- **Essential — $137** · "One coaching call per week with JJ"
  - Welcome call to get to know you
  - Personalized meal plan & movement plan
  - 1 coaching call / week with JJ
  - Daily text check-ins from JJ
- **Plus — $167** *(highlighted as "Most personal")* · "Two coaching calls per week with JJ"
  - Everything in Essential
  - 2 coaching calls / week with JJ

Each card has its own "Reserve my spot" CTA at the price ($137 / $167). Update the other CTAs around the page that say "Reserve my spot, $497" to a neutral "Reserve my spot" (RealTalk, Transformations, LastCall) since there are now two prices. Remove the old "or 3 payments of $179" line.

### 3. Remove "Spring cohort" mentions everywhere
- Offer card pill "SPRING COHORT · STARTS MARCH 3" → remove
- "Cohort starts March 3" lines under the Offer CTA and in LastCall sub → remove
- StickyCta "Spring cohort · $137" → change to "JJ's 12-Week Transformation"
- Anywhere else the words appear → remove

### 4. Replace trust strip with a logo slider (white background)
Replace the three-card "5+ million pounds lost / #1 NY Times bestselling author / As seen on Dr. Oz, Steve Harvey, The View" block at the bottom of the Hero with a new full-bleed **white** section containing a horizontally scrolling, auto-marquee row of partner logos.

Logos to include (copy uploads into `src/assets/landing/partners/`):
- Essence, Fox, Dr. Oz, NBC, The View, Steve Harvey, NY Times, Woman's World

Behavior:
- White background (only this section), gentle vertical padding, subtle top/bottom hairline borders to separate from the warm page bg.
- Logos rendered at a uniform large height (~h-12 on mobile, h-16 on desktop), `object-contain`, dark-grey tint via opacity, with generous horizontal spacing.
- Auto-scrolling marquee (CSS `@keyframes` translate -50%, duplicated track for seamless loop), pauses on hover, respects `prefers-reduced-motion`. Also horizontally scrollable by touch.
- Tagline above the slider stays small/subtle: "5+ million pounds lost · #1 NY Times bestselling author · As seen on".

### Technical notes
- All edits are in `src/routes/index.tsx` plus 8 new image assets under `src/assets/landing/partners/` (copied from the user uploads).
- Add a small `@keyframes marquee` rule to `src/styles.css` (or use an inline `style` tag-free Tailwind arbitrary animation) for the logo strip.
- No data/business-logic changes; purely presentation + copy.
