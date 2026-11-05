# YoBody JJ — Tracking Plan

Source of truth for acquisition and conversion tracking on
**https://mycoach.jjsmithonline.com** (this repo).

PostHog is the analytics layer: funnels, behaviour, attribution, replay.
It does **not** replace Stripe, Klaviyo, ManyChat or the application database.

---

## 1. Architecture

```
visitor
  │  lib/analytics/attribution.ts     first-touch + latest-touch, localStorage "yb_attr_v1"
  │  lib/analytics/posthog.ts         single init, privacy rules, identity
  │  lib/analytics/events.ts          every yobody_* event name lives here
  │  lib/analytics/use-landing-behavior.ts   section reach + scroll depth
  ▼
routes/__root.tsx        initPostHog() — the ONLY initialization site
routes/index.tsx         data-yb-section markers, CTA tracking
components/signup/SignupCheckoutCard.tsx   checkout funnel events + identify
lib/signup/attribution.ts   buildMarketingAttribution() — payload sent to the backend
```

Analytics already on the page, all left intact and unchanged:

| Tool                           | Where                      | Notes                                                                                                   |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| Meta Pixel `920675803850327`   | `__root.tsx` head + body   | inline bootstrap, ViewContent in `RootComponent`, InitiateCheckout on `[data-cta="yes-jj"]` link clicks |
| GA4 `G-PYRYHREW2F`             | `__root.tsx` body          |                                                                                                         |
| GA4 `G-6NTF2GY6XX`             | `__root.tsx` body          | second property; `select_plan` also sends to `GT-PLT5P7MB`                                              |
| Microsoft Clarity `wu4kkcr0lk` | `__root.tsx` body          |                                                                                                         |
| HYROS `224254`                 | `__root.tsx` head          |                                                                                                         |
| Cloudflare Web Analytics       | `__root.tsx` body          |                                                                                                         |

HYROS, Meta, Clarity and both GA libraries download once the app is interactive, or after 4 s if it is not (`lib/analytics/early-page.ts`). Their inline bootstraps still run at once, so events queue from the first moment. HYROS keeps its place first, with the address read in `<head>`.
| PostHog `phc_kTK9…`            | `lib/analytics/posthog.ts` | added here                                                                                              |

`lib/signup/tracking.ts` fans funnel events out to GA4 + Clarity + Meta. PostHog
events are emitted separately through `lib/analytics/events.ts` so the two
systems can never double-count each other.

---

## 2. PostHog configuration

| Setting                         | Value                      | Why                                                                                                                                                         |
| ------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_host`                      | `https://us.i.posthog.com` | US cloud                                                                                                                                                    |
| `defaults`                      | `2025-05-24`               | turns on `capture_pageview: "history_change"` — SPA navigations are captured without hooking the router                                                     |
| `person_profiles`               | `identified_only`          | anonymous visitors are still counted by `distinct_id`; a person profile is only created at lead capture                                                     |
| `autocapture`                   | on                         | exploratory clicks, rage clicks, dead clicks                                                                                                                |
| `capture_pageleave`             | on                         | needed for bounce / time-on-page                                                                                                                            |
| session replay                  | on, `maskAllInputs: true`  | see privacy below                                                                                                                                           |
| `mask_personal_data_properties` | **off**                    | it rewrites `fbclid`/`gclid` to `<masked>`, which breaks Meta/Google reconciliation. Personal fields are removed precisely by `sanitize_properties` instead |

### Environment

`detectEnvironment()` derives from `window.location.hostname`:

- `localhost` / `127.0.0.1` / `*.local` → `development`
- `mycoach.jjsmithonline.com`, `jjsmithonline.com`, `www.jjsmithonline.com` → `production`
- anything else (preview deploys, `*.workers.dev`) → `preview`

`environment` and `funnel: "yobody_jj"` are registered as **super properties**, so
every event carries them. Filter dashboards on `environment = production`.

---

## 3. Privacy rules

Non-negotiable: name, email, phone and payment data never reach PostHog.

1. **Session replay** — `maskAllInputs: true` masks the _value_ of every input,
   so `#chk-email`, `#chk-fullname`, `#chk-phone` and `#chk-discount` are all
   recorded as `***`. Stripe's card fields live in a cross-origin iframe and are
   never recorded at all.
2. **URL scrubbing** — the landing page accepts `?email=`, `?firstName=`,
   `?lastName=`, `?name=`, `?phone=` as prefill (and `buildEmbeddedReturnUrl()`
   writes them back into the Stripe return URL). `scrubUrl()` rewrites those
   params to `redacted` in every URL-shaped property (`$current_url`,
   `$referrer`, `$initial_current_url`, `$session_entry_url`, `landing_url`, …)
   and in replay network-request URLs. `?t=` (the /start join token, which
   looks up her name, email and phone) is scrubbed the same way; on /start an
   inline script at the top of `<head>` also moves it out of the address bar
   before HYROS, the Meta Pixel, GA or PostHog read the URL.
3. **Property scrubbing** — `sanitize_properties` deletes any property keyed
   `email`, `phone`, `name`, `first_name`, `last_name`, `card_number`, `cvc`,
   `iban`, `ssn`, `password` (and `*_email` / `*_phone` / `*_first_name` style
   suffixes), whatever set it. `has_*` booleans are explicitly allowed.
   Keys like `section_name`, `cta_name` and `offer_name` are deliberately kept —
   a loose `name` rule silently ate them in the first implementation.
4. **Identity** — the PostHog `distinct_id` becomes the backend lead id
   (`intentId`). Never the email address.
5. **`$ip` is collected** (PostHog default) for country-level geo. Turn it off
   with `mask_personal_data_properties: true` if that is not wanted — accepting
   that it also masks click ids.

Analytics consent is **not** marketing consent: the SMS opt-in checkbox
(`#chk-sms-consent`) still drives `smsConsent` to the backend exactly as before.
Only the boolean `sms_consent` is sent to PostHog, never the number.

---

## 4. Attribution

`lib/analytics/attribution.ts`, localStorage key **`yb_attr_v1`** (deliberately
distinct from the legacy `yb_attr` key owned by the inline Meta script).

Two touches are kept:

- **first** — written once, never overwritten.
- **last** — refreshed only when the visit is _attributable_: it carries one of
  `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`,
  `fbclid`, `gclid`, or an off-site referrer. A plain direct return visit does
  **not** overwrite it.

Each touch stores raw values plus `referrer`, `landing_url` (scrubbed),
`landing_path`, `at`. Raw values are never normalised away.

On every event: latest touch as `utm_source`…, first touch prefixed
`first_utm_source`…, plus derived `traffic_channel` / `first_traffic_channel`.

### `traffic_channel` derivation

| Value                    | Rule                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `manychat`               | source/medium contains `manychat`, or medium `dm`                                       |
| `email`                  | medium `email`, or source contains `klaviyo`                                            |
| `google` / `google_paid` | `gclid`, or source contains `google` (paid when medium is cpc/ppc/paid*)                |
| `meta_paid`              | facebook/instagram source with a paid medium or an `fbclid`; or `fbclid` with no source |
| `instagram_organic`      | instagram source, non-paid — or an instagram.com referrer with no UTMs                  |
| `facebook_organic`       | facebook source, non-paid — or a facebook.com referrer with no UTMs                     |
| `referral`               | any other off-site referrer                                                             |
| `direct`                 | no source, no medium, no referrer                                                       |
| `other`                  | anything left                                                                           |

### Surviving to the backend

`lib/signup/attribution.ts` → `buildMarketingAttribution()` is the payload sent
to `POST /public/landing/signup/email/start` and `…/checkout`.

It previously read **only the live URL**, so a reload, an in-app-browser
hand-off, or simply reaching step 2 dropped the campaign before the lead and the
Stripe session existed. It now falls back to the persisted store:

```
overrides  →  current URL  →  persisted latest touch  →  persisted first touch
```

**Field names are unchanged**, so the backend contract is untouched. First-touch
fields, `gclid` and `posthog_distinct_id` are _not_ sent yet — that needs a
backend DTO change, see §8.

---

## 5. Event schema

`$pageview` is PostHog's own (`history_change`); we never emit a duplicate.
Every custom event also carries the super properties from §2 and §4.

| Event                                  | When                                                                         | Properties                                                                                 | Dedupe                         |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------ |
| `yobody_cta_clicked`                   | any primary CTA click                                                        | `cta_name`, `section_name`, `destination_type` (`scroll`/`external`/`checkout`), `tier`    | none                           |
| `yobody_section_viewed`                | section substantially visible — ≥50% of it, or it fills ≥50% of the viewport | `section_name`                                                                             | once per section per session   |
| `yobody_scroll_depth_reached`          | page scrolled                                                                | `percent` ∈ 25/50/75/90                                                                    | once per threshold per session |
| `yobody_checkout_step_viewed`          | checkout step opens                                                          | `step` ∈ `contact`/`payment`, `billing_interval`, `offer_id`                               | once per step per session      |
| `yobody_lead_form_started`             | first real interaction with email / name / phone                             | `billing_interval`, `offer_id`                                                             | once per session               |
| `yobody_lead_captured`                 | backend accepted step 1                                                      | `lead_id`, `has_phone`, `sms_consent`, `billing_interval`, `offer_id`, `value`, `currency` | once per `lead_id`             |
| `yobody_stripe_checkout_loaded`        | Stripe's iframe is actually in the DOM                                       | `lead_id`, `offer_id`, `billing_interval`, `value`, `currency`, `discount_applied`         | once per mount                 |
| `yobody_checkout_error`                | checkout failed                                                              | `error_category`, `checkout_step`, `status_code`, `in_app_browser`                         | none                           |
| `yobody_purchase_completed_clientside` | browser saw Stripe report success                                            | `lead_id`, `order_id`, `value`, `currency`, `offer_id`                                     | once per order                 |
| `yobody_purchase_completed`            | **not implemented — backend**                                                | see §9                                                                                     | must be idempotent             |

`error_category` buckets (raw messages are never sent — backend text can echo
user input): `email_already_registered`, `network_unreachable`, `rate_limited`,
`server_error`, `validation_rejected`, `timeout`, `stripe_init_failed`,
`lead_create_failed`, `checkout_create_failed`, `in_app_browser_escape`,
`unknown`.

### `yobody_checkout_payment_started` — deliberately NOT implemented

Stripe **Embedded Checkout** renders the Pay button inside a cross-origin
iframe. There is no `onReady`, no submit callback, and no way to observe the
click. `EmbeddedCheckoutProvider` exposes only `onComplete`,
`onShippingDetailsChange` and `onLineItemsChange`. Emitting this event from
"Stripe is visible" would be inventing it, so it is omitted. To get it, either:

- move to Stripe Elements, where we own the submit handler, or
- emit it server-side from the `payment_intent.created` webhook.

### `/free-call` — the `fc_*` prefix

One project, one key, one init. Pages are kept apart by **event prefix and by
path**, never by a second project: a second project would fragment visitors
and lose data when the SPA switches routes. `/` sends `yobody_*`, the Hormone
Focus page sends `hf_*`, and `/free-call` sends `fc_*` from
`lib/analytics/free-call.ts`.

Every `fc_*` event carries `page: "free-call"` as an **event property, never a
registered super property**, so it cannot bleed onto `/` in a session that
visits both.

| Event                | When                                                      | Properties                 | Dedupe              |
| -------------------- | --------------------------------------------------------- | -------------------------- | ------------------- |
| `fc_cta_clicked`     | any "Book my free call" button                            | `location`                 | none                |
| `fc_booking_started` | first touch of the booking form — **funnel step 2**       | none                       | once per page load  |
| `fc_time_selected`   | the "when" becomes a real choice                          | `when_mode`                | none                |
| `fc_booked`          | successful booking submit — **funnel step 3, conversion** | `when_mode`, `had_time`    | none                |
| `fc_call_missed_shown` | the confirmation turns into "We missed you" (a dial went unanswered) | none            | once per page load  |
| `fc_call_me_now`     | "Call me now" / "Call me back now" on the confirmation    | `after`, `ok`              | none                |

`location` ∈ `hero`, `pain`, `jj`, `howitworks`, `valueprops`, `faq`,
`everyday`, `header`, `sticky`. There is no `closer` value: the closing
section *is* the form, so it has no button of its own.

`when_mode` ∈ `now`, `today`, `tomorrow` — the day she picked in step 1, not
the `when.mode` in the booking payload (which is `now` or `scheduled`).
`had_time` is true only when a specific time was chosen, so it is always false
on the `now` path.

`after` ∈ `missed`, `cut_off`, `callback`, `open` — what the confirmation
showed when she asked for the call. `ok` is false when the backend refused it
(the hourly limit per phone, a closed call, or an error).

`fc_time_selected` fires when the choice is actually complete: immediately for
`now`, which needs no time, and on the time row for `today` and `tomorrow`.
Picking the day alone does not fire it.

Funnel step 1 is `$pageview` where `$pathname` contains `/free-call`, which
PostHog captures automatically (`history_change`, §2). The page emits no
pageview of its own.

`/free-call` also still emits `yobody_section_viewed` and
`yobody_scroll_depth_reached` from the shared `useLandingBehaviorTracking`
hook. That is deliberate and harmless: those are filterable by `$pathname`,
and the `fc_*` funnel is independent of them.

### Section names

Render order on `/`, set via `data-yb-section` in `routes/index.tsx`:

`hero`, `press_features`, `research_support`, `why_nothing_works`,
`method_4_steps`, `jj_story`, `real_results`, `what_you_get`, `clarity`,
`pricing_offer`, `guarantee`, `final_close`, `faq`, plus `sticky_bar` for the
sticky CTA.

Per-button instrumentation is intentionally avoided — autocapture and replay
cover exploratory clicks. Custom events are reserved for funnel steps.

---

## 6. Identity

1. Anonymous visitor → PostHog `distinct_id` (uuid), full browsing history.
2. Step 1 accepted → `identifyLead(intentId, …)`. PostHog links the anonymous
   id to the lead id, so pre-lead browsing stays attached to the person.
3. Person properties set: `funnel: "yobody_jj"`, `lead_created: true`,
   `has_phone`, `sms_consent`, `environment`, and the full first/latest touch.

`intentId` is the durable id returned by the backend — not React state, not the
email address. It is also persisted in localStorage under
`yobody-signup-intent` by the pre-existing `lib/signup/session.ts`.

---

## 7. Where step 1 leads actually go

Answered from the code — see the report for the full trace.

`SignupCheckoutCard.prepareCheckout()` → `ensureSignupIntent()` →
`POST {VITE_API_URL}/public/landing/signup/email/start` with
`{ email, firstName, lastName, coachId, coachProgramConfigId, billingInterval,
phoneNumber?, smsConsent?, marketingAttribution }`.

Production `VITE_API_URL` is **`https://api.yoplatform.ai`**.

The backend responds with `intentId` + `intentToken`, so **the lead is persisted
server-side before Stripe ever appears** — it is not frontend-only, and
abandoned leads are not lost at the browser.

There is also an abandonment heartbeat: `POST …/signup/activity` every 45s while
the visitor sits on contact/payment, described in code as keeping a **30-minute
cart-abandon clock** from firing mid-checkout. So the backend already models
abandonment.

What this repo **cannot** tell you (needs backend access — §11): the lead table
shape, how to query/export leads, how long they are retained, whether a
notification or Klaviyo sync fires on create, and what the abandon clock
triggers when it does fire.

---

## 8. Stripe

**Mechanism: Stripe Embedded Checkout** — `EmbeddedCheckoutProvider` +
`EmbeddedCheckout` from `@stripe/react-stripe-js`, driven by a `clientSecret`
the backend returns from `POST …/signup/checkout`. The session is created
**server-side at `api.yoplatform.ai`**, which is not in this repo. There is no
Stripe code, no secret key and no webhook handler here — `src/server.ts` is only
an SSR error wrapper for Cloudflare Workers.

Return URL: `buildEmbeddedReturnUrl()` → the landing page with
`session_id={CHECKOUT_SESSION_ID}`; on return the card calls
`…/checkout/verify`, and the backend confirms payment and hands back
`purchaseTracking { eventId, orderId, value, currency, contentId }`.

### What the backend owner needs to add (metadata contract)

The landing page already sends `marketingAttribution` on both `email/start` and
`checkout`. Copy it onto the Stripe object so finance/ads can reconcile.
Stripe allows 50 keys, ≤40 chars per key, ≤500 chars per value.

On `stripe.checkout.sessions.create(...)`:

```js
{
  client_reference_id: intent.id,            // the YoBody lead id
  metadata: {
    yb_lead_id:      intent.id,
    utm_source:      attr.utmSource,
    utm_medium:      attr.utmMedium,
    utm_campaign:    attr.utmCampaign,
    utm_content:     attr.utmContent,
    utm_term:        attr.utmTerm,
    f_utm_source:    attr.firstUtmSource,    // needs the DTO fields below
    f_utm_medium:    attr.firstUtmMedium,
    f_utm_campaign:  attr.firstUtmCampaign,
    landing_path:    attr.landingPath,
    traffic_channel: attr.trafficChannel,
    ph_distinct_id:  attr.posthogDistinctId,
    fbclid:          attr.fbclid,
    gclid:           attr.gclid,
  },
  // mirror onto the PaymentIntent so card-level reporting carries it too
  payment_intent_data: { metadata: { yb_lead_id: intent.id, utm_campaign: attr.utmCampaign } },
}
```

Never put name, email, phone or card data in metadata.

New optional fields the `marketingAttribution` DTO must accept before the
frontend can send them (all strings, all optional):

```
firstUtmSource, firstUtmMedium, firstUtmCampaign, firstUtmContent, firstUtmTerm,
firstReferrer, firstLandingPath, landingPath, trafficChannel,
posthogDistinctId, posthogSessionId, gclid
```

> The frontend deliberately does **not** send these yet. If the backend DTO
> validates with `forbidNonWhitelisted`, an unknown field would make checkout
> return 400 — i.e. break revenue. Confirm the DTO accepts them, then add them
> to `SignupMarketingAttribution` in `lib/signup/types.ts` and populate them in
> `buildMarketingAttribution()`; the values are already available from
> `attributionProperties()` / `posthogDistinctId()`.

---

## 9. Purchase event (backend)

`yobody_purchase_completed` must come from Stripe, not the browser. A redirect
or success screen is not proof of payment. Emit it from the webhook handler on
`checkout.session.completed` / `payment_intent.succeeded`:

```js
// posthog-node
posthog.capture({
  distinctId: session.metadata.yb_lead_id, // same id the browser identified with
  event: "yobody_purchase_completed",
  properties: {
    lead_id: session.metadata.yb_lead_id,
    order_id: session.id,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    stripe_customer_id: session.customer,
    value: session.amount_total / 100,
    currency: session.currency,
    offer_id: session.metadata.offer_id,
    utm_source: session.metadata.utm_source,
    utm_medium: session.metadata.utm_medium,
    utm_campaign: session.metadata.utm_campaign,
    traffic_channel: session.metadata.traffic_channel,
    first_utm_source: session.metadata.f_utm_source,
    environment: "production",
    funnel: "yobody_jj",
  },
  uuid: `purchase:${session.id}`, // idempotency — Stripe retries webhooks
});
```

`uuid` keyed on the Stripe session id makes retries deduplicate in PostHog.
Using `distinctId = yb_lead_id` is what joins the purchase back to the
anonymous browsing session the person started with.

The browser-side `yobody_purchase_completed_clientside` already exists and is
useful as a cross-check, but must never be used as the revenue number.

---

## 10. Future integrations

### 10a. ManyChat / Moses DM (Mac mini — no access)

Send server-side with `posthog-node`. Use a stable id — the ManyChat subscriber
id — as `distinctId`, then `identify` to the YoBody lead id once an email is
captured, so DM activity and landing activity merge into one person.

| Event                            | Properties                                                        |
| -------------------------------- | ----------------------------------------------------------------- |
| `yobody_dm_conversation_started` | `platform` (`instagram`/`facebook`), `manychat_subscriber_id`     |
| `yobody_dm_email_captured`       | `lead_id` if known, `has_email: true`                             |
| `yobody_dm_purchase_intent`      | `purchase_intent` (`low`/`medium`/`high`)                         |
| `yobody_dm_checkout_link_sent`   | `link_campaign`, `utm_campaign`                                   |
| `yobody_dm_objection_detected`   | `objection_type` (`price`/`trust`/`timing`/`product_fit`/`other`) |
| `yobody_dm_handoff`              | `handoff_reason`, `handoff_to`                                    |

Never send conversation transcripts or message content. Intent and objection
must arrive as the enum only.

Checkout links from DMs must carry
`?utm_source=manychat&utm_medium=dm&utm_campaign=<campaign>` so the landing page
attributes them — that alone makes `traffic_channel = manychat` work end to end.

Target funnel: DM started → email captured → high intent → link sent →
landing `$pageview` → `yobody_lead_captured` → `yobody_purchase_completed`.

### 10b. app.yobody.ai (no access)

Use the **same PostHog project** and the **same `distinct_id`** — the YoBody
lead/customer id. Then purchase → activation is one funnel.

Carry identity across the hand-off. `buildContinueSignupUrl()` already builds
the post-purchase URL; add the id to it and `identify()` with it on arrival.

Events to add there: `yobody_app_signup_started`,
`yobody_app_signup_completed`, `yobody_app_onboarding_started`,
`yobody_app_onboarding_completed`, `yobody_app_phone_verified`,
`yobody_app_first_call_scheduled`, `yobody_app_activated`.

Do not change landing-page signup hand-off behaviour to achieve this — it is
revenue-critical and currently works.

### 10c. Klaviyo (not integrated)

**There is no Klaviyo, Mailchimp or any ESP code in this repo.** The landing
page sends leads only to `api.yoplatform.ai`. Any lead→Klaviyo sync, if it
exists, happens in the backend.

Wanted later:

- lead captured, no purchase → abandoned-lead sequence
- Stripe checkout loaded, no purchase → stronger checkout-abandon sequence
- purchased → drop from recovery, start onboarding

The backend already has the 30-minute abandon clock (§7), which is the natural
trigger point. Klaviyo should be driven from backend state (the authority), with
PostHog used to measure the sequences — not as the trigger.

---

## 11. Unresolved dependencies

See "EXTERNAL ACCESS NEEDED FOR PHASE 2" in the handover report. Summary:

1. PostHog **personal** API key (`phx_…`) or a connected PostHog MCP — to create
   the dashboard (`scripts/posthog-setup.mjs` does it in one run) and to query
   events back for verification.
2. `api.yoplatform.ai` backend repo — Stripe metadata, the webhook purchase
   event, the lead table, the abandon clock, any Klaviyo sync.
3. `app.yobody.ai` repo — post-purchase activation events.
4. Moses / ManyChat Mac mini — DM events.
5. Klaviyo account — list ids and flow triggers.

---

## 12. Conventions

- Add an event? Add it to `lib/analytics/events.ts` **and** the table in §5.
  Nothing else may name a `yobody_*` string. `fc_*` events live in
  `lib/analytics/free-call.ts` and are documented in the same section.
- One project, one key, one init. Never add a second PostHog project for a new
  page — give it a prefix and filter by path.
- Never pass raw email / phone / name / card data into an event helper.
- Never call `posthog.init` outside `lib/analytics/posthog.ts`.
- New landing section? Give it `data-yb-section="<stable_snake_name>"` and list
  it in §5. Renaming one breaks historical reporting — prefer adding.
