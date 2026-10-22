# /free-call backend handoff

The front end for the "Book a Free Call" page is built and lives at `/free-call`.
Nothing behind it is. This page sends no request, stores nothing, and sends no
text or email. Everything below is what still needs connecting.

Owner of this page: David. Backend: Christophe.

## What is already built

| Piece | Where |
| --- | --- |
| The page | [`src/routes/free-call.tsx`](../src/routes/free-call.tsx) |
| The booking form and the confirmation state | [`src/components/free-call/BookingForm.tsx`](../src/components/free-call/BookingForm.tsx) |
| Submit stub | [`src/lib/booking/api.ts`](../src/lib/booking/api.ts) |
| Payload types | [`src/lib/booking/types.ts`](../src/lib/booking/types.ts) |
| Placeholder slots | [`src/lib/booking/slots.ts`](../src/lib/booking/slots.ts) |
| UTM / referrer capture | [`src/lib/booking/attribution.ts`](../src/lib/booking/attribution.ts) |
| Add to calendar (.ics and Google) | [`src/lib/booking/calendar.ts`](../src/lib/booking/calendar.ts) |
| Shared labels (`COACH_LABEL`, call length) | [`src/lib/booking/config.ts`](../src/lib/booking/config.ts) |

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
  "firstName": "string",
  "phone": "string (E.164)",
  "email": "string",
  "goal": "string or null (optional)",
  "slot": { "iso": "ISO 8601 datetime or null", "label": "Tomorrow 9:00 AM" },
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

- `phone` is already normalised to E.164 by `libphonenumber-js`, the same
  library the signup checkout card uses. It is validated before submit, so an
  invalid number never reaches you.
- `slot.iso` is an absolute instant (UTC). `slot.label` is the human string
  shown on the page, and it is the string the SMS and the email should reuse
  so she sees the same words everywhere.
- `slot.iso` is `null` when she chose "Other time". In that case the page
  tells her you will text to find a slot, so that branch needs handling.
- `consent` is always `true`. The form cannot be submitted with the box
  unticked. `consentAt` is the moment she ticked it, which is the timestamp a
  TCPA record needs.
- `goal` is the optional free text answer. It can be `null`.

## 2. Real slot availability

`buildPlaceholderSlots()` in `src/lib/booking/slots.ts` invents four friendly
times from the browser clock (9am, 12pm, 3pm, 6pm, at least an hour out,
rolling forward across up to three days). There is no calendar behind it.

To wire it up, replace that function with a fetch of the coach's open slots
and return the same `CallSlot[]` shape (`{ id, iso, label }`). The form stores
both halves of the slot and sends them untouched, so the form itself does not
need to change. Keep the "Other time" option.

Two things worth deciding at the same time:

- whether a slot should be held or locked while she finishes the form
- what happens when the slot is taken between render and submit (the form can
  show that as a handled `{ ok: false }` failure)

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

> Hi [First name], you're booked. [COACH_LABEL] will call you [slot label].
> Find a quiet spot where you can talk for about 15 minutes. Reply R to
> reschedule.

Reminder, about one hour before:

> Hi [First name], [COACH_LABEL] calls you in about an hour, at [time]. Be
> somewhere you can talk. Talk soon.

`[slot label]` is `slot.label` from the payload, verbatim. `[COACH_LABEL]` is
`COACH_LABEL` from `src/lib/booking/config.ts`, so the page and the texts stay
in step when David changes the wording.

The confirmation text promises "Reply R to reschedule", and the FAQ on the
page says she can reschedule from the text, so that reply handler needs to
exist before this goes live.

## 5. Email confirmation and follow up (Klaviyo)

David owns the full sequence. The confirmation email is the first step.

Subject:

> You're booked with JJ's coach

Body:

> Hi [First name], your free call is set for [slot label]. Find a quiet spot
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

1. **`COACH_LABEL`.** Currently "JJ's coach", set in
   `src/lib/booking/config.ts`. It is used in the headline, the form, the FAQ,
   the confirmation, the page title and the share card, so changing it there
   changes everything at once.
2. **Call length.** `CALL_MINUTES` is 15, also in `config.ts`. It drives the
   copy, the FAQ answer, the sticky bar and the length of the calendar event.
3. **"Free, no card needed".** `NO_CARD_COPY` in `config.ts`.
4. **Email required.** Set to required for v1, because of the confirmation
   email and the follow up sequence.
5. **Preferred time required.** Not specified either way, so it is required,
   with "Other time" as the escape hatch. A booking with no time at all is not
   worth much, and the escape hatch costs one tap.
6. **Share image.** `/free-call` reuses the site's current share image. If this
   page deserves its own, it is one constant (`SHARE_IMAGE`) in
   `src/routes/free-call.tsx`.
7. **Indexing.** The page is `index, follow`, matching the main page. If this
   should be an ads only page, flip it to `noindex`.
8. **Privacy and Terms.** The footer links are `#` placeholders, which is what
   the main landing page does today. They need real URLs on both pages.
9. **Step card copy.** The four "what happens on your free call" lines are
   David's draft, used verbatim with no headings added.

## What this page deliberately does not do

No backend, no scheduling, no database, no SMS, no email. No invented
testimonials, press mentions or statistics: every result, logo and credibility
claim on the page is reused verbatim from the main landing page.
