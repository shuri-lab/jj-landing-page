## Add horizontal-scroll transformations strip

Insert a new section directly above the trust strip ("5+ million pounds lost in our community") on the home page (`src/routes/index.tsx`).

### What it looks like
- Full-bleed dark band (uses `--brand-deep` / deep wine background to match the reference screenshot and contrast the warm page background).
- A single horizontally scrollable row of transformation cards (snap-scrolling, hides scrollbar, swipeable on mobile, drag/scroll on desktop).
- Each card: rounded photo with a white caption pill at the bottom (e.g. "-17.6 lbs in 6 weeks", "-12.2 lbs in 6 weeks", "-10.3 lbs in 6 weeks", "-7.6 lbs in 6 weeks").
- Edge fade on the right so users can tell there's more to scroll.
- No heading above it — it acts as a visual proof band, just like the reference.

### Images & captions
Reuse the existing transformation assets already in `src/assets/landing/` (`transformation-1/4/7/8.jpg`). Captions will be:
- -17.6 lbs in 6 weeks
- -12.2 lbs in 6 weeks
- -10.3 lbs in 6 weeks
- -7.6 lbs in 6 weeks

(If you'd prefer different numbers/order, tell me and I'll swap.)

### Placement
Right before the existing trust strip section ("5+ million pounds lost in our community / #1 NY Times bestselling author / As seen on Dr. Oz…").

### Technical notes
- New `TransformationsStrip` component inside `src/routes/index.tsx` (keeping the file's single-file pattern).
- Implemented with `overflow-x-auto`, `snap-x snap-mandatory`, `scrollbar-hide` utility (add a tiny CSS rule in `src/styles.css` if not present), and fixed-width cards (`w-[260px]` mobile-friendly).
- No new dependencies, no business-logic changes — purely presentational.
