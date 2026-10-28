# /free-call backend handoff

The front end for the "Book a Free Call" page is built and lives at `/free-call`.
Nothing behind it is. This page sends no request, stores nothing, and sends no
text or email. Everything below is what still needs connecting.

Owner of this page: David. Backend: Christophe.

## What changed in v2

Nothing in this document's contract changed. The payload, the stub, the slot
source and the analytics event are all the same as v1. What moved is the copy
and the layout:

- **Two labels, and the difference matters.** `COACH_LABEL` ("JJ Smith") is
  the brand, the story and the method: the hero, the founder section, the page
  title. `CALLER_LABEL` ("JJ's coach") is who is actually on the phone, which
  is JJ's AI coach, built from her voice and her method. Both are in
  `src/lib/booking/config.ts`. **Anywhere the copy says who makes the call it
  uses `CALLER_LABEL`,** including the whole booking form and the
  confirmation. The SMS and the email have to follow the same rule.
- The consent line reads "I agree that JJ's team can call and text me about my
  session. Message and data rates may apply." It is required, unticked by
  default, and `consentAt` is recorded. **Worth a legal read before launch**,
  since the default path books an immediate outbound call and text.
- The booking form moved out of the hero and into the closing section, and it
  is now **two steps**. Step 1 asks when (Now, Later today, Tomorrow), step 2
  asks for her details. Every button on the page scrolls to it.
- **"Now" is the default.** It means "call me as soon as you can" and carries
  no timestamp. The submit button reads "Call me now" on that path and "Book
  my free call" on a scheduled one.
- The payload's `slot` field is now **`when`**, and it carries a `mode`. See
  section 1.
- The hero is ported from the Hormone Focus landing page (the cut-out, the
  photo carousel, the logo slider, the display:contents mobile reflow). The
  founder section is the main landing page's "My body turned on me, too."
  component with first person v2 copy.

## What is already built

| Piece | Where |
| --- | --- |
| The page | [`src/routes/free-call.tsx`](../src/routes/free-call.tsx) |
| The booking form and the confirmation state | [`src/components/free-call/BookingForm.tsx`](../src/components/free-call/BookingForm.tsx) |
| Submit stub | [`src/lib/booking/api.ts`](../src/lib/booking/api.ts) |
| Payload types | [`src/lib/booking/types.ts`](../src/lib/booking/types.ts) |
| Call times and the "now" option | [`src/lib/booking/slots.ts`](../src/lib/booking/slots.ts) |
| UTM / referrer capture | [`src/lib/booking/attribution.ts`](../src/lib/booking/attribution.ts) |
| Add to calendar (.ics and Google) | [`src/lib/booking/calendar.ts`](../src/lib/booking/calendar.ts) |
| Shared labels (`COACH_LABEL`, call length, caller ID) | [`src/lib/booking/config.ts`](../src/lib/booking/config.ts) |

Each integration point is also marked in the code with an `INTEGRATION POINT`
comment, so grepping for that string finds them all.

## 1. The `submitBooking` payload and where the real call goes

`submitBooking(payload)` in `src/lib/booking/api.ts` is the single seam. It
waits 900ms and returns success. Replace the body, keep the signature:

```ts
const { data } = await apiClient.post("/public/free-call/bookings", payload);
return { ok: true, bookingId: data.id };
```

Return `{ ok: false, reason }` for a handled failure, or throw for an
unexpected one. The form treats both the same way: it keeps everything she
typed and shows a friendly retry message, so a failed submit never loses a
lead.

The payload is exactly this shape:

```json
{
  "when": {
    "mode": "now | scheduled",
    "iso": "ISO 8601 datetime, or null when mode is now",
    "label": "Now | Today at 4:30 PM | Tomorrow at 9:00 AM"
  },
  "firstName": "string",
  "phone": "string (E.164)",
  "email": "string",
  "consent": true,
  "consentAt": "ISO 8601 datetime",
  "utm": {
    "source": "string or null",
    "medium": "string or null",
    "campaign": "string or null",
    "content": "string or null",
    "term": "string or null"
  },
  "referrer": "string or null",
  "pagePath": "/free-call",
  "submittedAt": "ISO 8601 datetime"
}
```

Notes on individual fields:

- **`when.mode` is the branch that matters.** `"now"` means she asked to be
  called as soon as possible and there is no timestamp: `iso` is `null` and
  `label` is `"Now"`. Whatever "now" turns into operationally is the backend's
  call. `"scheduled"` carries a real UTC instant in `iso`.
- `when.label` is the human string she actually saw. The SMS and the email
  should reuse it verbatim so the words match everywhere.
- `phone` is already normalised to E.164 by `libphonenumber-js`, the same
  library the signup checkout card uses. It is validated before submit, so an
  invalid number never reaches you.
- `consent` is always `true`. The form cannot be submitted with the box
  unticked. `consentAt` is the moment she ticked it, which is the timestamp a
  TCPA record needs.
- The optional "goal" field from v1 is gone. The form is now the five things
  the call cannot happen without: when, first name, phone, email, consent.

## 2. Real slot availability

`buildDayTimes(day)` in `src/lib/booking/slots.ts` generates every half hour
between 8:00 AM and 9:00 PM in her own time zone, for today or tomorrow.
Today drops anything inside a 30 minute buffer, so a call is never booked for
a minute from now. If nothing is left today, the picker says "No more times
today" and points her at Now or Tomorrow. There is no calendar behind any of
it.

To wire it up, replace that function with a fetch of JJ's open times for that
day and return the same `CallTime[]` shape (`{ iso, label }`). The form stores
both halves and sends them untouched, so the form itself does not change.

Three things worth deciding at the same time:

- what "now" actually means operationally, and what happens outside calling
  hours. The page promises a call "in the next few minutes" on that path.
- whether a time should be held while she finishes step 2
- what happens when a time is taken between render and submit (the form can
  show that as a handled `{ ok: false }` failure)

## 2b. The caller ID

The confirmation screen tells her which number to expect the call from.
`CALLER_ID_NUMBER` in `src/lib/booking/config.ts` is currently
`(555) 012-3456`, a reserved fictional number. **It has to be swapped for the
phone system's real outbound caller ID before launch**, or she will not
recognise the call.

## 2c. After she books: a missed call, and "Call me now"

The confirmation no longer stays "You're booked" forever. The booking
response also carries `statusToken` (her reschedule-link token, the same one
her texts carry, good for 7 days) and `rescheduleUrl` (her reschedule page on
the coach's site). The page keeps `{ firstName, when, token, rescheduleUrl }`
in `localStorage` (`jj-free-call-booking`, never her phone or email), so a
reload or a phone that dropped the tab comes back to her call, not an empty
form.

While the confirmation is on screen it asks
`GET /public/free-call/reschedule?t=<token>` on load, every 15 seconds while
the tab is visible, and the moment she switches back to the tab:

| Backend says | She sees |
| --- | --- |
| `missedAt` set, `state: scheduled` | "We missed you": when we tried, when we'll try again, **Call me now**, Pick another time |
| `missedAt` set, `state: calling` | "We missed you", trying again now (no button: a dial is due) |
| `missedAt` set, `state: open` (all dials used) | "We missed you", your call is still yours, **Call me now**, Pick another time |
| `state: open`, `reason: cut_off` / `callback` | "Our call got cut off" / "When's a better time?", **Call me back now** |
| `state: done` / `member` | Thanks for your call / You're already in |
| `state: closed`, `reason: unreachable` | "We can't call this number", book with another number |
| `state: closed` | This free call is closed, book a new call |
| anything else | the original "You're booked" card |

**Call me now** is `POST /public/free-call/reschedule { t, when: { mode: "now" } }`:
a fresh "now" booking with the same rules as the form (three dials, the hourly
limit per phone, never while a call is live, never to a suppressed number).
A 429 shows "You've asked for a lot of calls in the last hour". An expired
link forgets the booking and shows the form again.

## 3. Create the person as a lead, not a customer

She has not paid. Create her in Yobody as a **lead**, kept separate from
customers, until she does. The booking itself, the chosen slot and the consent
timestamp should hang off that lead record.

Worth confirming: what happens if the same phone or email books twice, and
whether an existing customer booking a call should be matched to their
existing record rather than creating a duplicate lead.

## 4. SMS confirmation and reminder

Sent by the phone system, not by this page. The page already tells her to
expect them.

Confirmation, right after booking:

> Hi [First name], you're booked. [CALLER_LABEL] will call you [when.label].
> Find a quiet spot where you can talk for about 15 minutes. Reply R to
> reschedule.

`CALLER_LABEL` is "JJ's coach", so that reads "JJ's coach will call you
Tomorrow at 9:00 AM", which is what the page's confirmation screen says too.
**Do not substitute "JJ Smith" here**: the page is deliberate about saying the
call is taken by her AI coach. On the `"now"` path the label is just "Now", so
that copy needs its own variant.

Reminder, about one hour before:

> Hi [First name], [CALLER_LABEL] calls you in about an hour, at [time]. Be
> somewhere you can talk. Talk soon.

`[when.label]` is `when.label` from the payload, verbatim. `[CALLER_LABEL]` is
`CALLER_LABEL` from `src/lib/booking/config.ts`, so the page and the texts stay
in step when David changes the wording.

The confirmation text promises "Reply R to reschedule", and the FAQ on the
page says she can reschedule from the text, so that reply handler needs to
exist before this goes live.

## 5. Email confirmation and follow up (Klaviyo)

David owns the full sequence. The confirmation email is the first step.

Subject:

> You're booked with JJ's coach

Body:

> Hi [First name], your free call is set for [when.label]. Find a quiet spot
> where you can talk for about 15 minutes, have your goal in mind, and we will
> take it from there. If you need to move it, just reply to this email.

Email is a required field on the form specifically so this can be sent and so
she can be enrolled in the follow up sequence.

## 6. Analytics

On a successful booking the page pushes one event, with no personal data in
it:

```js
dataLayer.push({ event: "free_call_booked" });
```

The wrapper is `pushDataLayer` in `src/lib/analytics/data-layer.ts`. GTM is
already loaded in `__root.tsx`, so the tag just needs a trigger on that event
name.

Not yet done, and worth deciding:

- a PostHog event for the same step. Everything `yobody_*` is declared in
  `src/lib/analytics/events.ts` and documented in `TRACKING_PLAN.md`, so adding
  one means adding it in both places. It was left out of v1 deliberately rather
  than half done.
- the server side conversion. The dataLayer event is browser side and will
  under count, exactly like `yobody_purchase_completed_clientside` does today.

UTM forwarding is already handled on the page: `readBookingContext()` reads the
query string first and falls back to the persisted first/latest touch store
(`yb_attr_v1`), so a reload, a back button or an in app browser hand off cannot
drop the campaign that paid for the click. The values arrive in the payload as
`utm`, `referrer` and `pagePath`.

## Open items for David

1. **`COACH_LABEL`.** Now "JJ Smith", set in `src/lib/booking/config.ts`. It is
   used in the headline, the form, the FAQ, the confirmation, the page title
   and the share card, so changing it there changes everything at once. The
   page is written on the promise that JJ herself makes the call.
2. **Call length.** `CALL_MINUTES` is 15, also in `config.ts`. It drives the
   copy, the FAQ answer, the sticky bar and the length of the calendar event.
3. **The reassurance line.** `REASSURANCE` ("Free · about 15 minutes") in
   `config.ts`. It sits under every button, under the booking form and in the
   FAQ strip.
4. **Email required.** Set to required for v1, because of the confirmation
   email and the follow up sequence.
5. **The submit button opens on three fields,** first name, a valid phone and
   consent, as specified. Email is still required and is validated inline on
   blur and on submit, so an empty email blocks the booking with a message
   rather than a dead button.
6. **Share image.** `/free-call` reuses the site's current share image. If this
   page deserves its own, it is one constant (`SHARE_IMAGE`) in
   `src/routes/free-call.tsx`.
7. **Indexing.** The page is `index, follow`, matching the main page. If this
   should be an ads only page, flip it to `noindex`.
8. **Privacy and Terms.** The footer links are `#` placeholders, which is what
   the main landing page does today. They need real URLs on both pages.
9. **No count of women helped.** Deliberately left off the page until the team
   verifies a figure. The only claims about JJ on the page are: certified
   nutritionist, author of the 10-Day Green Smoothie Cleanse (number one
   national, USA Today and New York Times bestseller), featured on The Steve
   Harvey Show and in The Washington Post.
10. **The Washington Post has no logo in the repo.** The credibility row says
   it in words. The logo slider runs the eight press logos we do have (New York
   Times, Dr. Oz, The View, Steve Harvey, NBC, Fox, Essence, Woman's World).
   Add `washingtonpost.png` to `src/assets/landing/partners/` and it can join
   the slider.
11. **No standalone book cover asset either.** The founder section uses
   `jj-smith-on-tv-v3.png`, the approved composite that already contains the
   10-Day Green Smoothie Cleanse and Green Smoothies for Life covers alongside
   the Steve Harvey and Dr. Oz stills. A clean cover shot would be better if
   one exists.
12. **Consent wording.** "I agree that JJ's team can call and text me about my
   session. Message and data rates may apply." Carries the standard SMS
   disclosure, since the default path books an immediate outbound call and
   text. Still worth a legal read before launch.
13. **The caller ID is a placeholder.** `(555) 012-3456` must be swapped for
   the phone system's real outbound number. See section 2b. Not guessed at
   here: Christophe and David own it.
14. **The AI disclosure.** The page says plainly, in the FAQ and in the "A
   word from me" section, that the call is taken by JJ's AI coach built from
   her voice and her method. The hero, the founder section and the page title
   stay JJ Smith, which is the brand and the method and is true. If legal or
   marketing wants that worded differently, `CALLER_LABEL` and the two FAQ
   answers are where it lives.
15. **What "now" means outside calling hours** is undecided and deliberately
   left open. The page promises a call "in the next few minutes" on that path,
   so it needs an operational answer before launch. See section 2.

## What this page deliberately does not do

No backend, no scheduling, no database, no SMS, no email. No invented
testimonials, press mentions or statistics: every result, logo and credibility
claim on the page is reused verbatim from the main landing page.
