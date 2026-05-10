## 1. Hero subheader bigger (mobile fits 4 lines max)

In `src/routes/index.tsx`, the paragraph:

> "But this time… I'm with you every step of the way. Not in a group. Not from a distance. Actually right there with you."

Currently `text-[17px]`. Bump it to `text-[20px] sm:text-[26px]` (with current `leading-snug` and `max-w-[560px]`) — at 390px viewport this lands on 4 lines and stops just before wrapping to a 5th. If 4 lines is hit on a slightly narrower phone, fall back to `text-[19px]`.

## 2. Restore the original coral palette

The previously published site used a warm light-coral background and a coral-red highlight. Update `src/styles.css`:

- `--background`: `oklch(0.96 0.022 20)` (light coral / blush — was the page bg before)
- `--bg-soft`:    `oklch(0.94 0.028 18)`
- `--bg-warm`:    `oklch(0.92 0.035 20)`
- `--line`:       `oklch(0.88 0.025 20)`

Keep `--foreground / --ink* / --brand` (the plum `#5d5074`) exactly as they are now — body text stays plum.

## 3. Highlight color back to the original coral

Currently every highlight uses inline `style={{ color: "oklch(0.6 0.12 355)" }}` (a mauve). Replace every occurrence in `src/routes/index.tsx` with the original coral `oklch(0.62 0.18 5)` so all `<em>` highlights (Hero "Lose up to 30 pounds", "Sister to sister", "12 weeks together", "Sister,", "answer", "next 12 weeks", JJReveal heading, etc.) show in the coral that was on the live site. The plum-colored highlights (`text-brand`) stay plum, giving the same coral + plum pairing the original page had.

No other text colors, fonts, or layout change.