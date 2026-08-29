# Checkout Failing in Facebook/Instagram In-App Browsers

## Issue, Diagnosis, and Fix

**Repository:** `github.com/shuri-lab/jj-landing-page`  
**Landing page backend:** `api.yobody.ai`

---

## 1. TL;DR

Almost half of our traffic opens the landing page inside the Facebook or Instagram in-app browser, which is a stripped-down webview rather than full Safari or Chrome.

Our checkout works correctly in normal browsers, but for many in-app users it fails immediately after they tap **Continue to checkout**. The request that prepares the payment flow either fails or hangs, so roughly half of those users never reach the payment form and drop off.

Until now, this failure was not tracked, so it was effectively invisible.

### Where it breaks

The failure occurs on:

```http
POST /public/landing/signup/checkout
```

This request happens **before Stripe's payment UI renders**.

### Why this matters

- ~47% of sessions are Meta in-app webviews.
- ~58% of all JavaScript errors are webview bridge failures.
- The largest funnel drop happens exactly between:
  - `continue_to_payment`
  - `payment_screen_view`

### Already shipped

Client-side mitigations are live:

- 10-second request timeout
- One safe retry on dropped connections
- `checkout_error` tracking
- An **Open in your phone browser →** fallback for in-app users

### Real fix

Replace the current custom Stripe Payment Element implementation with **Stripe Embedded Checkout** using:

```ts
ui_mode: 'embedded'
```

The checkout remains embedded on the page with no redirect, but Stripe owns the entire payment flow.

At the same time, the checkout-session API call must be made reliable in in-app webviews.

---

## 2. The Symptom

### Clarity funnel — last 30 days

| Event | Sessions |
|---|---:|
| `sessions` | 1,997 |
| `signup_screen_view` | 166 |
| `cta_click` | 86 |
| `select_plan` | 84 |
| `signup_method_select` | 62 |
| `continue_to_payment` | 61 |
| `payment_screen_view` | 30 |
| `purchase` | 29 |

Two things stand out.

### The only major cliff is before the payment screen

The funnel drops from:

```text
continue_to_payment: 61
payment_screen_view: 30
```

That is a **51% drop**.

Everywhere else in the funnel is relatively healthy.

Of the 30 users who reach the payment screen, 29 purchase.

That means:

> The payment form itself is not the primary problem. The loss happens before the payment screen appears.

### This is a webview-heavy audience

Approximately:

- **FacebookApp:** 41.4%
- **InstagramApp:** 5.5%
- **Combined Meta in-app traffic:** ~47%

At the same time, about **58% of all JavaScript errors** are webview bridge failures such as:

```text
error invoking postmessage: java object is gone
```

Android webview.

And:

```text
undefined is not an object
(evaluating 'window.webkit.messagehandlers')
```

iOS webview.

This makes the failure pattern strongly consistent with a technical webview issue rather than a copy, persuasion, or checkout-offer problem.

---

## 3. How We Identified the Failure

### A. Event timing isolates the exact operation

In `SignupCheckoutCard.tsx`:

- `continue_to_payment` fires immediately after:

```http
POST /signup/email/start
```

succeeds.

Location:

```text
SignupCheckoutCard.tsx:437
```

- `payment_screen_view` fires only after:

```http
POST /signup/checkout
```

returns a Stripe `clientSecret`.

Location:

```text
SignupCheckoutCard.tsx:489
```

So these two analytics events bracket exactly one operation:

```text
createCheckout()
→ POST /public/landing/signup/checkout
```

The users who fire `continue_to_payment` but never fire `payment_screen_view` are therefore the users for whom `createCheckout()` fails or never returns.

This is not an instrumentation artifact because `payment_screen_view` only fires after a real signal: the Stripe client secret has been received.

---

### B. Empirical probe with a Facebook in-app user agent

The production checkout was tested using a spoofed Facebook in-app browser user agent.

The real flow is:

1. `POST api.yobody.ai/public/landing/signup/email/start`
2. `POST api.yobody.ai/public/landing/signup/checkout`
3. Mount Stripe Payment Element
4. Mount Stripe Express Checkout Element
5. Render Stripe cross-origin iframes from `js.stripe.com`

The current integration is:

- Embedded
- Live Stripe key (`pk_live_...`)
- Live API
- No redirect or popup

The Stripe UI includes:

- Card entry
- Apple Pay
- Google Pay
- Link
- Cross-origin iframes
- Cross-window messaging

---

### C. The existing API layer had no resilience

Before the mitigation work, `api.ts` had:

- No request timeout
- No retry

That meant that inside an unstable webview:

- A dropped request failed immediately
- A hung request could spin forever

---

## 4. Root Cause

There are two layers to the problem.

---

### Primary root cause: the checkout API call fails or hangs

The request:

```http
POST /public/landing/signup/checkout
```

fails or hangs inside the Facebook/Instagram in-app browser before Stripe's UI loads.

Because the old implementation had no timeout or retry, the user would typically experience one of two outcomes:

#### Hung state

The user stays on:

```text
Loading secure payment…
```

indefinitely.

#### Error state

The user is bounced back to the email/name step with a generic error.

In both cases:

- `payment_screen_view` never fires
- The user abandons

### What exactly causes the API failure?

The frontend alone cannot determine the exact network-level cause yet.

The leading possibilities are:

1. The webview aborts or drops the fetch request
2. A CORS/preflight issue occurs on the production landing-page origin
3. The backend is slow or timing out
4. The webview JavaScript context becomes unstable

The errors:

```text
java object is gone
```

and:

```text
window.webkit.messagehandlers
```

show that the native webview bridge is unstable for a meaningful share of users.

The new `checkout_error` tracking should reveal the actual failure distribution.

---

### Secondary root cause: the current Stripe integration is fragile in webviews

Even when `createCheckout()` succeeds, the current custom Stripe integration is still fragile inside Facebook and Instagram webviews.

The implementation uses:

- Stripe Payment Element
- Stripe Express Checkout Element
- Cross-origin iframes
- Third-party storage
- `postMessage`
- Apple Pay / Google Pay / Link

All of those depend on browser behaviors that are more restricted or unstable inside Meta's in-app webviews.

Apple Pay and Google Pay are especially important here:

> They do not work inside Facebook/Instagram in-app browsers because of Apple, Google, and Meta platform restrictions.

This is why the current embedded Payment Element approach should be replaced.

---

## 5. Client-Side Mitigations Already Shipped

These changes are already live.

They are additive to the failure path and do not alter the working checkout behavior.

All were verified through build checks and simulated failures.

---

### A. Request timeout

**File:**

```text
src/lib/signup/api.ts
```

**Constant:**

```ts
REQUEST_TIMEOUT_MS = 10000
```

Location:

```text
line 15
```

`request()` now aborts after 10 seconds.

Location:

```text
line 47
```

Normal requests usually complete in 1–3 seconds, so 10 seconds is the hard ceiling.

This prevents the checkout from spinning forever.

---

### B. One safe retry

**File:**

```text
src/lib/signup/api.ts
```

On an outright dropped connection:

- Wait 600 ms
- Retry once

A timeout is **not retried** because a timeout is ambiguous and retrying an ambiguous payment-related request could create duplicate side effects.

This retry is intended only to recover transient webview network failures.

---

### C. Failure tracking

**File:**

```text
src/lib/signup/tracking.ts
```

Function:

```ts
trackCheckoutError()
```

Location:

```text
line 125
```

The event is fired from the catch block in:

```text
SignupCheckoutCard.tsx:500
```

It sends a new:

```text
checkout_error
```

event to GA4 and Clarity.

### Event fields

```text
error_stage
error_status
error_message
in_app_browser
lead_email
lead_name
```

Possible `error_stage` values:

```text
start_email
create_checkout
```

`error_status` values:

```text
0 = network/dropped
HTTP status code = backend response
```

### Why this event matters

This is the main diagnostic tool going forward.

Filter `checkout_error` by:

```text
in_app_browser
error_status
error_stage
```

to see exactly where the failure happens and which browser population is affected.

### PII warning

The event currently includes:

```text
lead_email
lead_name
```

Raw email addresses in Google Analytics violate Google's PII policy and can create account-level risk.

The safer recovery source already exists:

> `/signup/email/start` captures the lead before checkout fails.

So the recommended path is to remove raw email and name from GA4 and use the lead database for recovery.

---

### D. "Open in your phone browser →" fallback

**Files:**

```text
src/components/signup/SignupCheckoutCard.tsx
src/components/signup/signup-checkout-card.css
src/lib/signup/inapp.ts
```

When checkout fails inside a Meta in-app webview, the user sees a message similar to:

> Payment couldn't load in the Facebook/Instagram browser. Open this page in your phone's browser to finish securely.

CTA:

```text
Open in your phone browser →
```

The fallback reopens the same landing page using a deep link with:

```text
?plan=…&email=…
```

The landing page then:

- Auto-scrolls to checkout
- Auto-opens the checkout
- Prefills the email

The `index.tsx` auto-open behavior was updated to support scrolling.

### Android

Android can open the device browser using an intent URL.

### iOS

iOS does not allow a website to programmatically open Safari from an in-app browser.

The fallback therefore:

- Copies the link
- Shows instructions to tap the `•••` menu
- Tells the user to choose **Open in Browser**

`inapp.ts` contains:

- In-app user-agent detection
- Open-in-browser helpers
- Clipboard behavior

### Important

This is a safety net, not the actual fix.

It should remain in place even after Embedded Checkout is implemented because it is also the path that allows in-app users to reach Apple Pay or Google Pay in a real browser.

---

## 6. The Reliable Fix to Build

The intended solution keeps the checkout embedded on the landing page.

No redirect is required.

---

### Replace Payment Element with Stripe Embedded Checkout

Current approach:

```text
Our app builds the payment form
Our app mounts Payment Element
Our app mounts Express Checkout Element
Our app drives confirmation
Our app owns more of the payment lifecycle
```

Recommended approach:

```text
Stripe Embedded Checkout
ui_mode: 'embedded'
```

Stripe then owns the full payment experience:

- Email
- Card entry
- Apple Pay
- Google Pay
- Link
- Validation
- 3D Secure
- Errors
- Payment-state handling

The user remains on the landing page.

---

## 6.1 Backend work — `api.yobody.ai`

Create a Stripe Checkout Session using:

```ts
ui_mode: 'embedded'
mode: 'subscription'
```

The session should include:

- The $47/month subscription price
- Line items
- Automatic payment methods
- Customer email prefill
- A completion return URL
- Existing intent/token context

Example configuration shape:

```ts
const session = await stripe.checkout.sessions.create({
  ui_mode: 'embedded',
  mode: 'subscription',

  line_items: [
    {
      price: STRIPE_PRICE_ID,
      quantity: 1,
    },
  ],

  customer_email: leadEmail,

  automatic_payment_methods: {
    enabled: true,
  },

  return_url: `${LANDING_URL}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
});
```

Return:

```ts
session.client_secret
```

to the frontend.

---

## 6.2 Make the checkout-session endpoint reliable in webviews

This is the part that actually fixes the 51% funnel drop.

The API endpoint must be hardened.

### CORS

The production landing origin must be explicitly allowed.

For example:

```text
https://mycoach.jjsmithonline.com
```

The `OPTIONS` preflight should respond quickly with:

```http
200 OK
Access-Control-Allow-Origin: https://mycoach.jjsmithonline.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

Avoid slow middleware or dependency chains before returning the preflight response.

---

### No dependency on third-party cookies

The endpoint should not require browser state that may be unavailable in a webview.

Continue passing the existing intent token in the request, as the current flow already does.

---

### Fast response

The create-session path should be kept lean.

Avoid:

- Slow external calls
- Nonessential database lookups
- Long middleware chains
- Blocking downstream dependencies

---

### Idempotency

The endpoint should behave safely if the same checkout creation request is retried.

Use a deterministic idempotency key tied to the lead or checkout intent.

For example:

```ts
stripe.checkout.sessions.create(payload, {
  idempotencyKey: checkoutIntentId,
});
```

This prevents duplicate Checkout Sessions if the webview drops the first response and the client retries.

---

## 6.3 Register the Apple Pay domain

In Stripe Dashboard:

```text
Payment methods
→ Apple Pay
→ Add domain
```

Add:

```text
mycoach.jjsmithonline.com
```

Without this, Apple Pay will not appear even in Safari.

---

## 6.4 Verify completion server-side

Do not rely only on frontend success state.

Use one or both of:

```text
checkout.session.completed
```

webhook

and:

```text
return_url
```

session verification.

The backend should treat Stripe as the source of truth for successful subscription creation.

---

## 6.5 Frontend work — `jj-landing-page`

Once the backend returns an Embedded Checkout client secret:

### Keep the lightweight lead-capture step

The email/name step should remain before payment.

That preserves:

- Lead recovery
- Funnel tracking
- Abandoned-checkout follow-up

### Replace the current Stripe elements

Remove:

```tsx
<Elements>
<PaymentElement />
<ExpressCheckoutElement />
```

and replace them with:

```tsx
<EmbeddedCheckoutProvider
  stripe={stripePromise}
  options={{ clientSecret }}
>
  <EmbeddedCheckout />
</EmbeddedCheckoutProvider>
```

### Keep existing resilience

Retain:

- 10-second request timeout
- One safe retry
- In-app browser fallback
- Error tracking

### Preserve analytics events

Continue firing:

```text
continue_to_payment
payment_screen_view
checkout_error
```

around the new flow.

That keeps the pre-fix and post-fix funnels directly comparable.

---

## 7. Important Caveats

### Apple Pay and Google Pay will not appear inside Meta webviews

This is expected.

Regardless of whether we use Embedded Checkout, Apple Pay and Google Pay are restricted inside Facebook and Instagram in-app browsers.

This is a platform limitation, not a Stripe integration bug.

In-app users should still be able to enter card details.

The **Open in your phone browser →** fallback should remain because it gives users access to:

- Apple Pay in Safari
- Google Pay in Chrome

---

### Embedded Checkout is still an iframe

Stripe Embedded Checkout still uses an iframe.

It is therefore not completely immune to webview quirks.

However, it is materially more robust than the current custom Payment Element flow because Stripe owns:

- Form rendering
- Wallet handling
- State transitions
- Validation
- 3D Secure
- Messaging
- Error handling

This removes a large amount of custom integration surface area.

---

### The API-call reliability work cannot be skipped

Switching from Payment Element to Embedded Checkout alone does **not** fix the main problem if:

```http
POST /public/landing/signup/checkout
```

is still being dropped or blocked.

The server-side reliability work is the highest-priority part of the fix.

---

## 8. Validation Plan

### 1. Real-device testing

Test on actual devices first.

Use:

- Real Android phone
- Real iPhone
- Facebook app
- Instagram app

Flow:

1. Open the ad inside Facebook
2. Land on the page inside the in-app browser
3. Complete signup
4. Tap **Continue to checkout**
5. Complete a purchase without opening Chrome/Safari
6. Repeat in Instagram
7. Repeat on both Android and iPhone

Chrome DevTools and user-agent spoofing are not sufficient because they cannot reproduce native webview bridge failures.

---

### 2. Monitor `checkout_error`

Segment by:

```text
in_app_browser
error_stage
error_status
browser
```

After the fix, in-app errors should collapse.

If failures remain, the event data should reveal whether the issue is:

- Network/drop
- CORS
- Backend error
- Timeout
- Another stage

---

### 3. Build a browser-split funnel

Compare:

```text
continue_to_payment
→ payment_screen_view
→ purchase
```

for:

```text
FacebookApp
InstagramApp
Chrome
Safari
```

Before the fix, Meta webviews should diverge heavily at the payment-screen step.

After the fix, the gap should narrow substantially.

---

### 4. Reconcile purchases against Stripe

At current volume, this can be checked manually.

Compare:

```text
Tracked purchases
vs.
Stripe successful subscriptions
```

The counts should closely match.

Also monitor:

- Refund rate
- Failed-payment rate
- Subscription churn

The offer is $47/month and includes a weight-loss guarantee, so conversion rate alone should not be the only success metric.

---

### 5. Upgrade high-value Clarity sessions

When the user reaches checkout, add:

```js
clarity('upgrade')
```

This reduces the chance that checkout sessions are excluded from recordings or sampling.

---

## 9. File Map

### `src/components/signup/SignupCheckoutCard.tsx`

Primary checkout flow.

Relevant areas:

```text
prepareCheckout                 ~393
continue_to_payment             ~437
stage = "create_checkout"       ~463
payment_screen_view             ~489
failure catch                   ~490–530
trackCheckoutError              ~500
escape URL build                ~515
Stripe confirmPayment           ~884
ExpressCheckoutElement          ~926
PaymentElement                  ~950
```

This is where the Embedded Checkout swap should happen.

---

### `src/lib/signup/api.ts`

Network layer.

Relevant areas:

```text
REQUEST_TIMEOUT_MS              ~15
request()                       ~47
startEmail()                    ~97
createCheckout()                ~131
```

This contains the request timeout and retry behavior.

`createCheckout()` is the request currently failing in webviews.

---

### `src/lib/signup/tracking.ts`

Analytics and diagnostics.

Relevant functions:

```text
trackPaymentScreenView()        ~114
trackCheckoutError()            ~125
trackContinueToPayment()        ~174
```

---

### `src/lib/signup/inapp.ts`

New file.

Contains:

- Meta in-app browser detection
- Android system-browser opening
- iOS fallback behavior
- Clipboard helpers

---

### `src/components/signup/signup-checkout-card.css`

Contains:

```text
.chk-escape*
```

styles for the in-app browser fallback panel.

---

### `src/lib/signup/env.ts`

Environment resolution.

Relevant values:

```text
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
VITE_YOBODY_SIGNUP_URL
VITE_YOBODY_AUTH_URL
```

`VITE_API_URL` resolves to environments such as:

```text
api.yoplatform.ai
api.yobody.ai
```

The Stripe publishable key can also be loaded at runtime from:

```http
GET /public/landing/signup/config
```

---

## 10. Recommended Implementation Order

1. **Harden the backend create-session endpoint**
   - CORS
   - Fast preflight
   - Fast response
   - No cookie dependency
   - Idempotency

2. **Create Stripe Embedded Checkout Sessions**
   - `ui_mode: 'embedded'`
   - `mode: 'subscription'`
   - Automatic payment methods
   - Customer email
   - Return URL

3. **Register the Apple Pay domain**

4. **Swap the frontend UI**
   - `EmbeddedCheckoutProvider`
   - `EmbeddedCheckout`

5. **Keep the existing fallback and diagnostics**
   - Timeout
   - Retry
   - `checkout_error`
   - Open-in-browser escape

6. **Test on real Facebook and Instagram webviews**

7. **Compare pre-fix vs post-fix funnel by browser**

---

## 11. Success Criteria

The fix should be considered successful when:

- `continue_to_payment → payment_screen_view` no longer loses ~50% of users
- FacebookApp and InstagramApp funnel performance approaches Safari/Chrome performance
- `checkout_error` events from in-app browsers drop materially
- Card checkout works inside Meta webviews
- Apple Pay and Google Pay work when the user opens the page in a real browser
- Purchase tracking matches Stripe successful subscriptions
- No duplicate subscriptions are created during retry conditions
