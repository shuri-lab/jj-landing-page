# In-page signup checkout card

Plan and implementation for hosting Yobody signup **on** `jjsmithonline-com` after the visitor chooses a plan — instead of sending them to `app.yobody.ai/signup`.

Source of truth for in-app steps: `yobody-hot-fixes/client/app/(auth)/signup/page.tsx`.  
Landing-only APIs: `POST /public/landing/signup/*` on `yobody-hot-fixes/backend`.

---

## Goal

1. Keep the existing pricing block under **Your comeback starts at $1.57 a day**.
2. When the visitor clicks **Start today · $47/month** or **Start today · $127 for 3 months**, reveal a checkout card **below** that block.
3. Style the card like The Lady Change checkout (two columns, order summary on the left, form on the right, magenta CTA).
4. Run the **full Yobody tabbed process** inside the card (segmented progress, one step at a time).
5. After **phone verification succeeds**, show a success message and **email the user**. Do **not** show the onboarding / scheduling screen.

The card must not appear until a plan is chosen. The left-column package summary is the plan they just picked.

---

## Design

Pick the **structure**, not the Lady Change brand.

| Element | Use |
|---|---|
| Two-column card | Left = order summary, right = current wizard step |
| Progress | 6 segments (contact → payment → password → phone → verify → success), same pattern as Yobody’s `SignupOnboardingProgress` |
| Product row | JJ logo + **Yobody By JJ Smith** + selected price cadence |
| Contact | Email, **first name + last name** (side-by-side from 520px, stacked on small screens), terms |
| Payment | Stripe Payment Element (Card + wallets). Magenta `Pay $X.XX USD` |
| Password | Min 6 characters, no leading/trailing spaces, show/hide |
| Phone | Country dial-code select + national number |
| Verify | 6-digit OTP, resend countdown, change number |
| Success | Check + “You’re in!” + we emailed you. Sign-in link. **No schedule / no redirect to Yobody signup** |
| Footer | Lock icon + “Transactions are secure and encrypted” |
| Change plan | Only before payment is confirmed |

---

## Plans

| Tile | Billing interval sent to Yobody | Why |
|---|---|---|
| $47 / month | `MONTHLY` | Recurring monthly |
| $127 for 3 months | `MULTI_MONTH` | $127 every 3 months (not `FULL_PROGRAM`) |

Program id still comes from landing config (`PREMIUM` is what this landing already uses).

---

## Steps

Yobody’s in-app wizard:

`account → checkout → create-password → name-entry → phone-entry → phone-verify → schedule → completed`

What this landing card owns:

| Step | Card | What happens |
|---|---|---|
| `contact` | Email, first, last, terms | `POST /public/landing/signup/email/start` |
| `payment` | Stripe | `POST .../checkout` → confirm → `POST .../checkout/verify` |
| `password` | Create password | `POST .../password` then `POST .../profile` with stored first/last |
| `phone` | Number + country | `POST .../phone/request-otp` |
| `verify` | 6-digit code | `POST .../phone/verify` — verifies **and** completes (skips schedule, sends email) |
| `success` | Stay on this site | Confirmation copy + sign-in link. No onboarding |

If email start returns **409 already registered**, send the visitor to Yobody sign-in.

If a resumed intent is already phone-verified (`schedule` in the in-app model), `POST .../complete` activates the account without scheduling.

---

## Navigation

```
Pricing tiles (card hidden)
        │ click Start today
        ▼
contact → payment → password → phone → verify → success
```

- **Change plan**: only while unpaid; hide the card and return to `#offer`.
- Intent token lives in `localStorage` (`yobody-signup-intent`) with email / names / phone so refresh can resume.
- Paid visitors stay on the landing page through success. They are **not** sent to `app.yobody.ai/signup`.

---

## Tracking (FB ads / Meta Pixel + GA4 + Clarity)

Pixel `920675803850327` is already in `__root.tsx`. Do not fire a second `PageView` / `fbq('init')`.

| User action | GA4 | Meta | Notes |
|---|---|---|---|
| Plan CTA click | `select_plan`, `cta_click` | `InitiateCheckout` | Shared `meta_event_id` |
| Card shown | `signup_screen_view` | — | |
| Email intent created | `signup_method_select`, `continue_to_payment` | `Lead`, `AddToCart` | |
| Stripe confirm starts | — | `AddPaymentInfo` | Once per session |
| Payment verified | `purchase` | `Purchase` | Backend `purchaseTracking.eventId` / `orderId` |

Attribution on landing API calls uses `sourceSurface=landing`.

---

## APIs (landing-site public, no Bearer header)

Base URL: `VITE_API_URL` (local `http://localhost:4000`, prod `https://api.yoplatform.ai`).

These routes are **for jjsmithonline-com and similar marketing sites**. The in-app `/auth/signup-intents/*` flow (Bearer `SignupIntentGuard`, schedule after phone) is unchanged. Existing Lovable Stripe routes (`/stripe/public/lovable/*`) stay for other checkouts.

Prefix: `/public/landing/signup`

| Method | Path | When |
|---|---|---|
| GET | `/config` | coachId, programs, Stripe key, countries, `loginUrl` |
| POST | `/email/start` | contact step (`intentToken` in JSON body) |
| POST | `/me` | resume from localStorage |
| POST | `/discount/verify` | optional `?discount-code=` |
| POST | `/checkout` | create PaymentIntent |
| POST | `/checkout/verify` | after Stripe confirm |
| POST | `/password` | after pay |
| POST | `/profile` | first / last name |
| POST | `/phone/request-otp` | send SMS |
| POST | `/phone/verify` | verify OTP, **skip schedule**, email welcome, activate |
| POST | `/complete` | already phone-verified; same completion + email |

Unwrap Nest `{ data: ... }` envelopes the same way the Yobody client does.

Welcome email template: `landing-signup-complete` (idempotent via `metadata.landingWelcomeEmailSentAt`).

---

## Env

| Key | Notes |
|---|---|
| `VITE_API_URL` | Backend origin |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Fallback; prefer landing `/config` |
| `VITE_META_PIXEL_ID` | Already used by the root pixel |
| `VITE_YOBODY_AUTH_URL` | Sign-in link on success / 409 |
| `VITE_YOBODY_SIGNUP_URL` | Unused by this card now (kept for other CTAs) |
| `VITE_GOOGLE_CLIENT_ID` | Reserved; unused |

Never put `META_CAPI_ACCESS_TOKEN` on this site.

---

## Checklist

### Docs / env

- [x] This plan written to `docs/signup-checkout-card.md`
- [x] `.env.example` with `VITE_*` keys
- [x] `.env` updated from Yobody `.env` (keep existing VAPI keys)

### Tracking

- [x] Meta click-id hydration (`fbclid` → `_fbc`)
- [x] Shared `meta_event_id` for InitiateCheckout + Purchase
- [x] Plan-select events
- [x] Lead / AddToCart on email start
- [x] AddPaymentInfo on Stripe confirm
- [x] Purchase once, using backend `purchaseTracking`
- [x] No duplicate PageView / ViewContent

### Checkout card

- [x] Hidden until a pricing CTA is clicked
- [x] Lady Change two-column layout, JJ magenta CTA
- [x] First / last name, responsive
- [x] Segmented progress (6 steps)
- [x] Stripe Payment Element
- [x] Password, phone, OTP in-card
- [x] Success + email, no onboarding schedule
- [x] 409 → Yobody sign-in
- [x] Resume from localStorage

### Backend landing APIs

- [x] `PublicLandingSignupController` at `/public/landing/signup`
- [x] `completeLandingSignup` activates without `onboardingScheduledAt`
- [x] Welcome email `landing-signup-complete`

### Follow-up

- [ ] Same card on `design-v2`, `monthly-v2`, `monthly-v3`, `challenge-v1`, `qr-a`, `vapi-demo`
- [ ] Google SSO on the card

---

## Test plan

1. Load `/` with no plan selected — no checkout card.
2. Click **Start today · $47/month** — card appears; first + last name sit side by side on desktop and stack on a narrow viewport.
3. Continue with email + first name + terms — progress advances to payment; Network shows `/public/landing/signup/email/start` then `/checkout`.
4. Stripe test card `4242…` pays; Meta `Purchase` fires once; card stays on this site and asks for a password (no redirect to Yobody signup).
5. Password → phone → OTP. After a valid code, success copy appears and a `landing-signup-complete` email is sent. No schedule UI.
6. Already-registered email shows sign-in, does not open Stripe.
7. Refresh mid-flow restores the unpaid or paid intent from localStorage.
8. Facebook click URL (`?fbclid=…`) still forwards `fbclid` / `fbc` / `fbp` / `meta_event_id`.
9. `?discount-code=CODE` applies when the code is valid.
