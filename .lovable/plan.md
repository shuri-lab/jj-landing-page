# /no-video A/B Variant Landing Page

Create a duplicate landing page at `/no-video` for A/B testing. Identical to the current `/` page except the hero swaps the video-style image+play-button for a hero image (the JJ photo you uploaded) sitting in front of a repeating, faded "JJ SMITH" wordmark backdrop — same vibe as the reference screenshot and jynfits.com.

## Files

1. **Add hero image asset**
   - Copy `user-uploads://Yobody_logos_4.png` → `src/assets/landing/hero-jj-no-video.png`

2. **Create `src/routes/no-video.tsx`**
   - Duplicate of `src/routes/index.tsx` (route path `/no-video`).
   - Distinct `head()` metadata (title suffix " — v2 / no-video", noindex meta so the A/B variant doesn't compete in SEO).
   - Same `Landing` composition; only the `Hero` component differs.

3. **Route auto-registers** via TanStack file-based routing — no edits to `routeTree.gen.ts`.

## Hero changes (only difference vs. `/`)

Replace the `aspect-video` card containing `heroJJ` + the Play button with:

```text
┌─────────────────────────────────┐
│  JJ SMITH JJ SMITH JJ SMITH ... │  ← repeating wordmark, very faded
│  SMITH JJ SMITH JJ SMITH JJ ... │     (brand color, ~8–12% opacity)
│  JJ SMITH JJ SMITH JJ SMITH ... │
│         ┌──────────┐            │
│         │  JJ      │            │  ← cut-out hero photo on top,
│         │  photo   │            │     no card/shadow background
│         └──────────┘            │
│  SMITH JJ SMITH JJ SMITH JJ ... │
└─────────────────────────────────┘
```

Implementation:
- Outer wrapper: `relative` container, transparent background (no rounded card, no shadow), preserves current responsive sizing.
- Background layer: absolutely-positioned div containing the text "JJ SMITH" repeated many times across multiple rows, wrapping to fill the box. Uppercase, bold, tight letter-spacing, large font (~clamp 56–96px), color = brand with low opacity (~0.10), `pointer-events-none`, `select-none`, `overflow-hidden`, slight rotation (-6deg) like the reference. Use a `mask-image` linear gradient so edges fade out softly.
- Foreground layer: the new `hero-jj-no-video.png` (transparent PNG of JJ), `relative z-10`, `object-contain`, anchored bottom-center, sized to fill the hero column height.
- No play button overlay (this is the no-video variant).
- Keep all surrounding hero layout (countdown pill, headline, subhead, CTA, "Doors close in…", warm callout, transformations strip, partners marquee) identical to `/`.

## Notes

- All other sections (`HugQuote`, `RealTalk`, `Steps`, `JJReveal`, `Transformations`, `Offer`, `Guarantee`, `Faq`, `LastCall`, `Footer`, `StickyCta`) are reused as-is from the duplicate file.
- Both CTAs continue to scroll to `#offer` on the same page.
- Add `{ name: "robots", content: "noindex" }` on `/no-video` to keep the variant out of search results during testing.
