## JJ Smith — 12-Week Body Transformation Landing Page

A single, long-scroll, mobile-first landing page at `/` that uses the supplied copy verbatim (in JJ's "sister to sister" voice), styled with the warm, editorial Jynfits look (cream/ivory background, serif display type, soft coral accent), and structured around the high-converting Petra Fitness layout (urgency bar, multi-CTA, week-by-week roadmap, value stack, comparison, guarantee, sticky mobile CTA).

### Visual direction (Jynfits-inspired)

- Background `#faf7f2` cream, warm card surfaces, `#b85042` coral accent, deep ink `#1a1715` for primary buttons
- Display: Fraunces serif (italic for emotional pulls). Body: Inter
- Generous whitespace, thin separators, big editorial H1, photo-led
- All tokens added to `src/styles.css` as oklch CSS variables (`--accent`, `--accent-deep`, `--bg-warm`, `--ink-soft`, etc.); no hardcoded colors in components
- Mobile-first: single column max-w ~760px, sticky bottom CTA on mobile

### Page sections (in order)

1. **Sticky urgency bar** — "Spring cohort closes in HH:MM:SS · Only 500 spots" with live countdown
2. **Nav** — JJ SMITH wordmark + minimal links
3. **Hero** — Eyebrow, H1 ("12-Week Body Transformation Challenge — lose up to 30 pounds in 12 weeks"), subhead, italic twist line, hero image (`new_JJ_hero_image.png`), primary CTA, scarcity line, trust strip ("5M+ pounds lost", "#1 NYT bestseller", "As seen on Dr. Oz, Steve Harvey, The View")
4. **"This is for you if…"** checklist (Petra tactic, JJ voice) — 4–5 bullets + CTA
5. **Real Talk** — full "Tuesday night" copy block from the file
6. **Promise pull-quote** — "Sister, I've spent 15 years giving you the information. This time, I'm giving you me."
7. **How it works — the 4 steps** (Welcome call → Personalized plan → Weekly calls → Daily texts)
8. **Week-by-week roadmap** (Petra-style, JJ voice): Wk 1–3 Foundation · Wk 4–6 Momentum · Wk 7–9 Transformation · Wk 10–12 Lifestyle
9. **Soft reveal / from JJ** — circular JJ portrait (`jj_tight_weist_1.jpg`), the personal letter, signoff
10. **Transformations grid** — five themed groups, using `transformation_1/4/7/8.jpg` and `jj_own_body_transformation_photos.PNG`; lazy-loaded, responsive 2/3-col grid
11. **What's included** — icon grid (welcome call, personal plan, weekly calls, daily texts, private community, accountability)
12. **Comparison table** — "Other programs vs. JJ's 12-Week Challenge" (Petra tactic)
13. **Community proof** — `jj_photo_with_fans.jpg` + `jj_hugging_client.jpg` collage with caption
14. **Offer card** — stacked value ($1,000+ value), strikethrough, $497 or 3×$179, included list with check rows, full-width CTA, cohort start + spots remaining
15. **Guarantee** — 14-day money-back card in JJ's voice
16. **FAQ** — 5 questions from the file (accordion, first one open)
17. **Last call** — "Your next 12 weeks are happening either way." + final CTA
18. **Footer** — copyright, contact, terms/privacy links
19. **Sticky mobile CTA bar** — appears after hero scrolled past: "Reserve my spot — $497"

### Conversion tactics applied (from Petra)

- Countdown timer in top bar + repeated near each CTA
- 6+ CTA buttons throughout, each with a microcopy reassurance ("14-day guarantee · Only 500 spots")
- "This is for you if" qualifier
- Week-by-week roadmap to reduce uncertainty
- Visual value-stack with crossed-out anchor price
- Comparison table
- Risk reversal (guarantee box)
- Sticky bottom CTA on mobile
- Social proof clusters (transformations + fans photo + trust strip)

### Technical implementation

- Route: replace placeholder `src/routes/index.tsx` with the landing page; full SEO `head()` (title, description, og:title, og:description, og:image using hero)
- Components in `src/components/landing/`: `UrgencyBar`, `Hero`, `ForYou`, `RealTalk`, `Promise`, `Steps`, `Roadmap`, `JJReveal`, `Transformations`, `Included`, `Comparison`, `OfferCard`, `Guarantee`, `Faq`, `LastCall`, `StickyCta`, `Footer`
- `useCountdown` hook for the timer (target date constant, falls back to 24h rolling if past)
- FAQ uses existing `src/components/ui/accordion.tsx`
- Buttons via existing `src/components/ui/button.tsx` with a custom `cta` variant added (ink bg, coral hover)
- Images copied from uploads to `src/assets/landing/` and imported as ES6 modules; `loading="lazy"` on all below-the-fold images, explicit `width`/`height` to prevent CLS
- All copy from the attached HTML used verbatim; new sections (For-you checklist, Roadmap, Comparison, Included grid) written in the same "sister to sister" voice
- Semantic HTML: single `<h1>`, `<section>` per block, alt text on every image

### Out of scope (this pass)

- Real checkout / Stripe wiring (CTA buttons scroll to offer card; can be wired later)
- CMS / admin
- A/B testing infrastructure
