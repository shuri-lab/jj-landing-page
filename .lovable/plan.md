## What's wrong now

I (a) added sections that aren't in your copy doc, and (b) leaned on the doc's HTML styling instead of taking design cues from Petra + Jynfits. Fixing both.

## Copy fixes (verbatim from your HTML)

Remove these invented sections entirely:
- "Sister, this is for you if…" qualifier checklist
- "Your 12-week roadmap" (WK 1–3, 4–6, 7–9, 10–12)
- "What's included" 6-card icon grid
- "Why this is different" comparison table
- "The sisterhood" community-proof block (jjFans / jjHug)
- Stacked value-stack pricing ($2,791 strikethrough, per-line dollar values)

Keep ONLY the sections that exist in your HTML, in this order:

1. Top urgency bar / Nav
2. Hero (eyebrow, H1, sub, italic twist, video, CTA, scarcity line, trust strip)
3. "Something brand new" pull line
4. Promise block ("Sister, I've spent 15 years…")
5. Real talk — **change H2 to: "Sister to sister — why im doing this"** (per your note)
6. Second promise pull ("This time, I'm giving you me… and I'm not leaving.")
7. The 4 steps (01–04, copy unchanged)
8. JJ reveal letter (heading stays: "Sister to sister — why and how I'm doing this.")
9. Transformations — 5 themed groups (restore the 5th: "My health came back — pre-diabetes reversed…"); 6 photos per group as in HTML
10. Offer card — simple version from HTML: $497 / "or 3 payments of $179", 4-item checklist (welcome call, personalized plan, weekly calls, daily texts), full-width CTA, "Only 500 spots · Cohort starts March 3". No strikethrough, no value stack.
11. Guarantee box (heart icon + JJ quote)
12. FAQ (5 Qs verbatim)
13. Last call
14. Footer + sticky mobile CTA

All body copy, headings, eyebrows, button labels: word-for-word from the HTML. No paraphrasing, no additions.

## Design direction (Petra structure, Jynfits palette)

Take from **Petra**:
- Centered single-column layout (no max-w 760 left-aligned editorial feel)
- Big bold display headlines with one or two emphasized words (italic serif accent on key words like *Confident* / *20 Pounds*)
- Prominent pill-shaped countdown badge above the H1 ("● SIGN-UPS CLOSE IN: 07:59:53")
- Large video/hero image block, rounded, with soft glow/shadow
- Row of small check-pill badges under the hero ("✓ For Women 40+", "✓ 5M+ Pounds Lost", "✓ JJ in your corner daily")
- Big, bright, full-width pill CTA button repeated frequently with sub-line ("Cancel Anytime + 14-Day Money Back")
- "Doors close in HH:MM:SS" line beneath every CTA
- Before/after photos as a flowing tilted-card collage rather than a strict editorial grid
- Generous vertical rhythm, lots of breathing room, centered text

Take from **Jynfits**:
- Soft warm palette: cream/blush background `#faf3f0`, deep ink `#1a1715`, dusty-rose accent `#d4a5a0` / coral `#b85042` for emphasis words and badges
- Oversized serif display headlines (Fraunces) mixed with bold sans for emphasis words
- Soft rounded cards, subtle pink shadows, no harsh borders
- Pastel section backgrounds alternating cream / blush
- Decorative serif italic pull-quotes
- Friendly, editorial, light — NOT dark/neon like Petra's actual look

Net result: Petra's conversion-page *structure and rhythm* (countdown pill, centered hero, big CTA, badge row, collage) wrapped in Jynfits' *cream + blush + serif* aesthetic.

Mobile-first, single column always. Desktop just centers the same column at ~640px max width.

## Files I'll touch

- `src/routes/index.tsx` — delete ForYou, Roadmap, Included, Comparison, CommunityProof; restore 5th transformation group; rewrite Hero, Offer, RealTalk heading; restructure layout to centered Petra rhythm
- `src/styles.css` — adjust palette toward Jynfits blush/cream, add countdown-pill + check-badge + big-CTA utilities
- No new assets needed (reuse existing landing images; jjFans/jjHug become unused — leave files in place)

## Out of scope

Real Stripe checkout, video player wiring (still placeholder), CMS.
