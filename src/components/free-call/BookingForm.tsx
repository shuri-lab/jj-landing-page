import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, CalendarPlus, Check, Clock, Zap } from "lucide-react";
import { isValidEmail, suggestEmail } from "@/lib/signup/email";
import { nextNationalPhoneInput, parseValidE164, reformatNationalPhone } from "@/lib/signup/phone";
import { pushDataLayer } from "@/lib/analytics/data-layer";
import {
  trackFcBooked,
  trackFcBookingStarted,
  trackFcTimeSelected,
} from "@/lib/analytics/free-call";
import { submitBooking } from "@/lib/booking/api";
import { readBookingContext } from "@/lib/booking/attribution";
import { buildGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar";
import {
  BOOKING_ANCHOR_ID,
  BOOKING_CTA_LABEL,
  BOOKING_CTA_NOW_LABEL,
  CALLER_ID_NUMBER,
  CALLER_LABEL,
  CALL_MINUTES,
  FREE_CALL_PATH,
  REASSURANCE,
} from "@/lib/booking/config";
import { BOOKING_COUNTRIES, DEFAULT_BOOKING_COUNTRY } from "@/lib/booking/countries";
import {
  WHEN_NOW,
  buildDayTimes,
  scheduledLabel,
  spokenWhen,
  timeZoneLabel,
} from "@/lib/booking/slots";
import type { CallTime, WhenSelection } from "@/lib/booking/slots";
import type { BookingContext } from "@/lib/booking/attribution";
import type { BookingPayload } from "@/lib/booking/types";
import "./booking-form.css";

/**
 * The default path books an immediate outbound call and text, so the consent
 * carries the standard SMS disclosure. [Pending a legal read before launch.]
 */
export const CONSENT_COPY =
  "I agree that JJ's team can call and text me about my session. Message and data rates may apply.";

const RETRY_COPY =
  "Something went wrong on our end. Everything you typed is still here, please try again.";

/** Step 1's three choices. "today" and "tomorrow" open the time list. */
type DayChoice = "now" | "today" | "tomorrow";

const DAY_OPTIONS: { id: DayChoice; title: string; sub: string; tag?: string }[] = [
  {
    id: "now",
    title: "Now",
    sub: `${CALLER_LABEL} calls you in the next few minutes`,
    tag: "Fastest",
  },
  { id: "today", title: "Later today", sub: "Choose any time this afternoon or evening" },
  { id: "tomorrow", title: "Tomorrow", sub: "Choose any time, 8am to 9pm" },
];

type FieldName = "firstName" | "phone" | "email" | "consent";
type Errors = Partial<Record<FieldName, string>>;

const FIELD_IDS: Record<FieldName, string> = {
  firstName: "fc-first-name",
  phone: "fc-phone",
  email: "fc-email",
  consent: "fc-consent",
};

/** Order decides which field we jump to when a submit is rejected. */
const FIELD_ORDER: FieldName[] = ["firstName", "phone", "email", "consent"];

export function BookingForm() {
  const [step, setStep] = useState<1 | 2>(1);

  // ── step 1: when ──────────────────────────────────────────────────────────
  // "Now" is the default: it is the fastest path for her and the one that
  // converts, so it stays pre-selected and first.
  const [day, setDay] = useState<DayChoice>("now");
  const [timeIso, setTimeIso] = useState<string | null>(null);
  const [times, setTimes] = useState<CallTime[]>([]);
  const [tz, setTz] = useState("");

  // Her clock and her time zone only exist in the browser, so both are read
  // after mount. The server renders the three cards and nothing time-based.
  useEffect(() => setTz(timeZoneLabel()), []);
  useEffect(() => {
    setTimeIso(null);
    if (day === "now") {
      setTimes([]);
      return;
    }
    setTimes(buildDayTimes(day === "today" ? 0 : 1));
  }, [day]);

  const selectedTime = useMemo(
    () => times.find((t) => t.iso === timeIso) ?? null,
    [times, timeIso],
  );

  const when: WhenSelection | null = useMemo(() => {
    if (day === "now") return WHEN_NOW;
    if (!selectedTime) return null;
    return {
      mode: "scheduled",
      iso: selectedTime.iso,
      label: scheduledLabel(day === "today" ? 0 : 1, selectedTime),
    };
  }, [day, selectedTime]);

  // ── step 2: her details ───────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneIso, setPhoneIso] = useState(DEFAULT_BOOKING_COUNTRY);
  const [email, setEmail] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [booked, setBooked] = useState<{ firstName: string; when: WhenSelection } | null>(null);

  const phoneE164 = useMemo(() => parseValidE164(phone, phoneIso), [phone, phoneIso]);

  // Captured on load, so a slow filler still sends the campaign she arrived on.
  const context = useRef<BookingContext | null>(null);
  useEffect(() => {
    context.current = readBookingContext();
  }, []);

  /** The moment she ticked the box, which is what a consent record needs. */
  const consentAt = useRef<string | null>(null);

  const stepHeading = useRef<HTMLHeadingElement>(null);
  const movedStep = useRef(false);
  useEffect(() => {
    // Only after a real step change, never on first paint.
    if (movedStep.current) stepHeading.current?.focus();
    movedStep.current = true;
  }, [step]);

  const validate = useCallback(
    (field: FieldName): string | undefined => {
      switch (field) {
        case "firstName":
          return firstName.trim().length >= 2
            ? undefined
            : "Please add your first name so we know who we are calling.";
        case "phone":
          if (!phone.trim()) return "We need your number, this is a phone call.";
          return phoneE164 ? undefined : "That number does not look right. Please check it.";
        case "email":
          if (!email.trim()) return "We need your email to send your confirmation.";
          return isValidEmail(email)
            ? undefined
            : "Please enter a valid email, like you@example.com.";
        case "consent":
          return consent ? undefined : "Please tick the box so JJ's team can call and text you.";
      }
    },
    [consent, email, firstName, phone, phoneE164],
  );

  /** The submit button opens once the three things the call cannot happen without are set. */
  const canSubmit = firstName.trim().length >= 2 && Boolean(phoneE164) && consent;
  const canContinue = day === "now" || selectedTime !== null;

  const buildPayload = useCallback((): BookingPayload => {
    const ctx = context.current ?? readBookingContext();
    const now = new Date().toISOString();
    return {
      when: when ?? WHEN_NOW,
      firstName: firstName.trim(),
      phone: phoneE164 ?? "",
      email: email.trim(),
      consent: true,
      consentAt: consentAt.current ?? now,
      utm: ctx.utm,
      referrer: ctx.referrer,
      pagePath: ctx.pagePath || FREE_CALL_PATH,
      submittedAt: now,
    };
  }, [email, firstName, phoneE164, when]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const next: Errors = {};
      for (const field of FIELD_ORDER) next[field] = validate(field);
      setErrors(next);

      const firstBad = FIELD_ORDER.find((field) => next[field]);
      if (firstBad) {
        document.getElementById(FIELD_IDS[firstBad])?.focus();
        return;
      }

      setSubmitting(true);
      setFormError("");
      try {
        const payload = buildPayload();
        const result = await submitBooking(payload);
        if (!result.ok) {
          setFormError(RETRY_COPY);
          return;
        }
        // No personal data in either: the dataLayer push is the hook marketing
        // attaches its conversion tags to, and fc_booked is the funnel's
        // conversion step on the "Free Call Funnel" dashboard.
        pushDataLayer({ event: "free_call_booked" });
        trackFcBooked({ when_mode: day, had_time: payload.when.iso !== null });
        setBooked({ firstName: payload.firstName, when: payload.when });
      } catch {
        setFormError(RETRY_COPY);
      } finally {
        setSubmitting(false);
      }
    },
    [buildPayload, day, submitting, validate],
  );

  if (booked) {
    return <BookedCard firstName={booked.firstName} when={booked.when} />;
  }

  return (
    <div className="fcb" id={BOOKING_ANCHOR_ID}>
      <div className="fcb-card">
        {step === 1 ? (
          <>
            <div className="fcb-head">
              <h2 className="fcb-h" ref={stepHeading} tabIndex={-1}>
                When works for you?
              </h2>
              <p className="fcb-sub">
                Your free {CALL_MINUTES} minute call with {CALLER_LABEL}.
              </p>
            </div>

            <fieldset className="fcb-days">
              <legend className="fcb-sr">Choose when JJ should call you</legend>
              {DAY_OPTIONS.map((option) => (
                <label key={option.id} className={`fcb-day ${day === option.id ? "is-on" : ""}`}>
                  <input
                    type="radio"
                    name="fc-day"
                    value={option.id}
                    checked={day === option.id}
                    onChange={() => {
                      trackFcBookingStarted();
                      setDay(option.id);
                      // "Now" needs no time, so choosing it completes the when
                      if (option.id === "now") trackFcTimeSelected("now");
                    }}
                  />
                  <span className="fcb-day-mark" aria-hidden>
                    <Check size={13} strokeWidth={3.5} />
                  </span>
                  <span className="fcb-day-main">
                    <span className="fcb-day-title">
                      {option.title}
                      {option.tag ? <span className="fcb-tag">{option.tag}</span> : null}
                    </span>
                    <span className="fcb-day-sub">{option.sub}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {day !== "now" ? (
              <div className="fcb-times">
                <div className="fcb-times-head">
                  <span className="fcb-times-lbl">Pick a time</span>
                  {tz ? (
                    <span className="fcb-tz">
                      <Clock size={13} aria-hidden /> Times in your time zone ({tz})
                    </span>
                  ) : null}
                </div>

                {times.length ? (
                  <fieldset className="fcb-times-list">
                    <legend className="fcb-sr">
                      Available times {day === "today" ? "today" : "tomorrow"}
                    </legend>
                    {times.map((time) => (
                      <label
                        key={time.iso}
                        className={`fcb-time ${timeIso === time.iso ? "is-on" : ""}`}
                      >
                        <input
                          type="radio"
                          name="fc-time"
                          value={time.iso}
                          checked={timeIso === time.iso}
                          onChange={() => {
                            trackFcBookingStarted();
                            setTimeIso(time.iso);
                            // inside this branch day is today or tomorrow
                            trackFcTimeSelected(day);
                          }}
                        />
                        <span>{time.label}</span>
                        <span className="fcb-time-mark" aria-hidden>
                          <Check size={15} strokeWidth={3} />
                        </span>
                      </label>
                    ))}
                  </fieldset>
                ) : (
                  <p className="fcb-empty">
                    No more times today. Pick <strong>Now</strong> and {CALLER_LABEL} calls you in
                    the next few minutes, or choose <strong>Tomorrow</strong>.
                  </p>
                )}
              </div>
            ) : null}

            <button
              type="button"
              className="fcb-submit"
              disabled={!canContinue}
              onClick={() => {
                trackFcBookingStarted();
                setStep(2);
              }}
            >
              Continue
              <span className="fcb-submit-arw" aria-hidden>
                &rarr;
              </span>
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="fcb-head">
              <h2 className="fcb-h" ref={stepHeading} tabIndex={-1}>
                Where should {CALLER_LABEL} call you?
              </h2>
            </div>

            <div className="fcb-summary">
              <span>
                <span className="fcb-summary-k">When:</span> {when?.label ?? WHEN_NOW.label}
              </span>
              <button type="button" className="fcb-link" onClick={() => setStep(1)}>
                Change
              </button>
            </div>

            {formError ? (
              <p className="fcb-alert" role="alert">
                <AlertCircle size={17} aria-hidden />
                {formError}
              </p>
            ) : null}

            <div className="fcb-field">
              <label htmlFor={FIELD_IDS.firstName}>First name</label>
              <input
                id={FIELD_IDS.firstName}
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={errors.firstName ? `${FIELD_IDS.firstName}-error` : undefined}
                disabled={submitting}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setFormError("");
                  if (errors.firstName && e.target.value.trim().length >= 2) {
                    setErrors((p) => ({ ...p, firstName: undefined }));
                  }
                }}
                onBlur={() => setErrors((p) => ({ ...p, firstName: validate("firstName") }))}
              />
              <FieldError id={FIELD_IDS.firstName} message={errors.firstName} />
            </div>

            <div className="fcb-field">
              <label htmlFor={FIELD_IDS.phone}>Mobile number</label>
              <div className="fcb-phone-row">
                <select
                  className="fcb-country"
                  aria-label="Country code"
                  value={phoneIso}
                  disabled={submitting}
                  onChange={(e) => {
                    setPhoneIso(e.target.value);
                    setPhone((prev) => reformatNationalPhone(prev, e.target.value));
                  }}
                >
                  {BOOKING_COUNTRIES.map((country) => (
                    <option key={country.countryCode} value={country.countryCode}>
                      {country.flagEmoji ? `${country.flagEmoji} ` : ""}
                      {country.countryDialCode}
                    </option>
                  ))}
                </select>
                <input
                  id={FIELD_IDS.phone}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={
                    errors.phone ? `${FIELD_IDS.phone}-error` : `${FIELD_IDS.phone}-hint`
                  }
                  disabled={submitting}
                  onChange={(e) => {
                    // Formats as she types and refuses digits past a full number.
                    const formatted = nextNationalPhoneInput(e.target.value, phoneIso);
                    if (formatted === null) return;
                    setPhone(formatted);
                    setFormError("");
                    if (errors.phone && parseValidE164(formatted, phoneIso)) {
                      setErrors((p) => ({ ...p, phone: undefined }));
                    }
                  }}
                  onBlur={() => setErrors((p) => ({ ...p, phone: validate("phone") }))}
                />
              </div>
              <FieldError id={FIELD_IDS.phone} message={errors.phone} />
              {!errors.phone ? (
                <p className="fcb-hint" id={`${FIELD_IDS.phone}-hint`}>
                  We only use this for your call. No spam, ever.
                </p>
              ) : null}
            </div>

            <div className="fcb-field">
              <label htmlFor={FIELD_IDS.email}>Email</label>
              <input
                id={FIELD_IDS.email}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={
                  errors.email ? `${FIELD_IDS.email}-error` : `${FIELD_IDS.email}-hint`
                }
                disabled={submitting}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailSuggestion(suggestEmail(e.target.value));
                  setFormError("");
                  if (errors.email && isValidEmail(e.target.value)) {
                    setErrors((p) => ({ ...p, email: undefined }));
                  }
                }}
                onBlur={() => {
                  setEmailSuggestion(suggestEmail(email));
                  setErrors((p) => ({ ...p, email: validate("email") }));
                }}
              />
              <FieldError id={FIELD_IDS.email} message={errors.email} />
              {emailSuggestion && !errors.email ? (
                <p className="fcb-hint">
                  Did you mean{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(emailSuggestion);
                      setEmailSuggestion(null);
                    }}
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </p>
              ) : null}
              {!errors.email && !emailSuggestion ? (
                <p className="fcb-hint" id={`${FIELD_IDS.email}-hint`}>
                  We&rsquo;ll send your plan and your confirmation here.
                </p>
              ) : null}
            </div>

            <label className="fcb-consent" htmlFor={FIELD_IDS.consent}>
              <input
                id={FIELD_IDS.consent}
                name="consent"
                type="checkbox"
                checked={consent}
                disabled={submitting}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? `${FIELD_IDS.consent}-error` : undefined}
                onChange={(e) => {
                  if (e.target.checked) consentAt.current = new Date().toISOString();
                  setConsent(e.target.checked);
                  setFormError("");
                  if (e.target.checked) setErrors((p) => ({ ...p, consent: undefined }));
                }}
              />
              <span>{CONSENT_COPY}</span>
            </label>
            {errors.consent ? (
              <div className="fcb-consent-error">
                <FieldError id={FIELD_IDS.consent} message={errors.consent} />
              </div>
            ) : null}

            <button type="submit" className="fcb-submit" disabled={submitting || !canSubmit}>
              {submitting ? (
                <>
                  <span className="fcb-spinner" aria-hidden />
                  Booking your call...
                </>
              ) : (
                <>
                  {when?.mode === "now" ? BOOKING_CTA_NOW_LABEL : BOOKING_CTA_LABEL}
                  <span className="fcb-submit-arw" aria-hidden>
                    &rarr;
                  </span>
                </>
              )}
            </button>
            <p className="fcb-foot">{REASSURANCE}</p>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="fcb-error" id={`${id}-error`} role="alert">
      <AlertCircle size={15} aria-hidden />
      {message}
    </p>
  );
}

/**
 * Confirmation, shown in place of the form.
 *
 * The text and the email she is promised here are sent by the backend, not by
 * this page, and the caller ID is a placeholder until the phone system's real
 * number is known. See docs/free-call-backend-handoff.md.
 */
function BookedCard({ firstName, when }: { firstName: string; when: WhenSelection }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const iso = when.iso;

  // Land screen readers and keyboard users on the confirmation rather than
  // wherever the submit button used to be.
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="fcb" id={BOOKING_ANCHOR_ID}>
      <div className="fcb-card fcb-done">
        <span className="fcb-done-ico" aria-hidden>
          <Check strokeWidth={3} />
        </span>
        <h2 className="fcb-done-h" ref={heading} tabIndex={-1}>
          You&rsquo;re booked, {firstName}!
        </h2>

        <p className="fcb-done-when">
          {CALLER_LABEL} will call you {spokenWhen(when)} from {CALLER_ID_NUMBER}.
        </p>

        <p className="fcb-done-p">
          Find a quiet spot where you can talk for about {CALL_MINUTES} minutes. We just texted you
          to confirm.
        </p>

        {iso ? (
          <div className="fcb-cal">
            <button type="button" className="fcb-cal-btn" onClick={() => downloadIcs(iso)}>
              <CalendarPlus aria-hidden />
              Add to calendar
            </button>
            <a
              className="fcb-cal-btn"
              href={buildGoogleCalendarUrl(iso)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarDays aria-hidden />
              Add to Google Calendar
            </a>
          </div>
        ) : (
          <p className="fcb-done-soon">
            <Zap size={15} aria-hidden /> Keep your phone close.
          </p>
        )}
      </div>
    </div>
  );
}
