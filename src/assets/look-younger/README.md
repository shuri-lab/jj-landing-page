# Look Younger After 40 — image catalog

Shared image assets for the "Look Younger After 40" funnel, extracted from the
live page (`mycoach.jjsmithonline.com/look-younger-improved`) and named by their
role so every landing-page version reuses the same source of truth.

Import them from the index:

```ts
import { hero, secrets, jjPortrait } from "@/assets/look-younger";
```

Format: WebP, ~1600px wide (as served by the source CDN).

| File | Role on the page | Source media id |
|---|---|---|
| `logo.webp` | Brand logo ("Look Younger After 40"), top of hero | `0300bc73…d8949d` |
| `hero.webp` | Hero image (beside the headline) | `6a55545b…0423` |
| `product-truth.webp` | Product image in the "The Truth?" reveal section | `6a554e24…29a9` |
| `secret-1.webp` | Secret 1 card — The Overnight Repair Secret | `6a44409e…465a` |
| `secret-2.webp` | Secret 2 card — The Gut-Glow Connection | `6a44409e…d7ae` |
| `secret-3.webp` | Secret 3 card — The Plump & Flush Method | `6a44409e…821b` |
| `secret-4.webp` | Secret 4 card — The Hormone Youth Formula | `6a44409e…4663` |
| `secret-5.webp` | Secret 5 card — The Craving Control Secret | `6a44409e…8217` |
| `secret-6.webp` | Secret 6 card — The Strength = Youth Secret | `6a44409e…d7a9` |
| `jj-guide.webp` | Image in "Why learn From JJ Smith?" | `6a554f8e…faa4` |
| `jj-portrait.webp` | JJ portrait near the "57" / Meet JJ block (small file — verify res) | `fb89ce65…f78d` |
| `jj-credentials.webp` | Credentials graphic near "2.9 million women" (small file) | `154da55a…9e61` |
| `product-everything.webp` | Product mockup in "Everything you get today" | `6a4eb130…2368` |
| `order-bump-thumbnail.webp` | Original order-bump thumbnail | `6a46d1fd…bfe1` |
| `style-guide.webp` | Style Guide bump image (alt account) | `64386fd7…0b0d` |
| `guarantee.webp` | Guarantee badge / seal image | `6a5431d0…9ac8` |
| `why-start-now.webp` | "Why Start Now" graphic ("Every week you stay stuck") | `d3ba4b24…a68de` |

Notes:
- `jj-portrait.webp`, `jj-credentials.webp`, and `why-start-now.webp` came back small
  (~8–10 KB). They may be low-resolution or small/decorative graphics on the source
  page. Swap for higher-res originals if they look soft when used large.
- New order-bump art added separately lives in `public/` (`order-bump-1.png`,
  `order-bump-2.png`).
