## Problem

The "Yes JJ, I want you in my corner" buttons call `scrollToOffer()` which does a single `scrollIntoView({ behavior: "smooth" })` to `#offer`. Between the click and the moment smooth-scroll finishes, images further down the page (notably the transformation photos section, which sits between the CTA and the offer) finish loading and push the offer's final Y position downward. The browser already committed to the originally-computed target, so the user lands on the transformation photos instead of the offer.

This affects all four landing routes (`a.tsx`, `index.tsx`, `b.tsx`, `no-video.tsx`) — they each define an identical `scrollToOffer()`.

## Fix

Replace the one-shot smooth scroll with a robust scroll that re-targets after layout settles:

1. Wait for any pending images above the offer (transformations) to finish loading or fail, with a short timeout fallback (~600ms).
2. Use instant scroll for the final correction so the user always ends exactly on `#offer`, but keep an initial smooth scroll for the visual feel.
3. Add `scroll-margin-top` to the `#offer` Section so it accounts for any sticky header.

Implementation in `scrollToOffer()`:
- Grab `el = document.getElementById("offer")`.
- Smooth-scroll immediately.
- Then in a loop (e.g. via `requestAnimationFrame` for ~800ms, or after `Promise.all(imgs.map(decode))`), re-call `el.scrollIntoView({ block: "start" })` (instant) so any layout shift is corrected.

Apply the same fix in all four route files. No visual or pricing changes.

## Files

- `src/routes/a.tsx` — update `scrollToOffer`, add `scroll-mt-*` to offer Section
- `src/routes/index.tsx` — same
- `src/routes/b.tsx` — same
- `src/routes/no-video.tsx` — same

Optionally extract the helper to `src/lib/scroll-to-offer.ts` to avoid four copies.
