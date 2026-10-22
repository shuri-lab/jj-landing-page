import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, CalendarPlus, Check } from "lucide-react";
import { isValidEmail, suggestEmail } from "@/lib/signup/email";
import { nextNationalPhoneInput, parseValidE164, reformatNationalPhone } from "@/lib/signup/phone";
import { pushDataLayer } from "@/lib/analytics/data-layer";
import { submitBooking } from "@/lib/booking/api";
import { readBookingContext } from "@/lib/booking/attribution";
import { buildGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar";
import {
  BOOKING_ANCHOR_ID,
  BOOKING_CTA_LABEL,
  CALL_MINUTES,
  COACH_LABEL,
  FREE_CALL_PATH,
} from "@/lib/booking/config";
import { BOOKING_COUNTRIES, DEFAULT_BOOKING_COUNTRY } from "@/lib/booking/countries";
import { DEFAULT_SLOTS, OTHER_SLOT, buildPlaceholderSlots } from "@/lib/booking/slots";
import type { BookingContext } from "@/lib/booking/attribution";
import type { BookingPayload, BookingSlot } from "@/lib/booking/types";
import "./booking-form.css";

export const CONSENT_COPY =
  "By booking, I agree that JJ's coaching team can call and text me about my session and my results. Message and data rates may apply.";

const RETRY_COPY =
  "Something went wrong on our end. Everything you typed is still here, please try again.";

type FieldName = "firstName" | "phone" | "email" | "slot" | "consent";
type Errors = Partial<Record<FieldName, string>>;

const FIELD_IDS: Record<FieldName, string> = {
  firstName: "fc-first-name",
  phone: "fc-phone",
  email: "fc-email",
  slot: "fc-slot-0",
  consent: "fc-consent",
};

/** Order matters: it decides which field we jump to when a submit is rejected. */
const FIELD_ORDER: FieldName[] = ["firstName", "phone", "email", "slot", "consent"];

interface Values {
  firstName: string;
  phone: string;
  phoneIso: string;
  email: string;
  slotId: string;
  goal: string;
  consent: boolean;
}

const EMPTY_VALUES: Values = {
  firstName: "",
  phone: "",
  phoneIso: DEFAULT_BOOKING_COUNTRY,
  email: "",
  slotId: "",
  goal: "",
  consent: false,
};

export function BookingForm() {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [booked, setBooked] = useState<{ firstName: string; slot: BookingSlot } | null>(null);

  // Real instants need the visitor's own clock and time zone, which the server
  // does not have. DEFAULT_SLOTS renders identically on both sides, then this
  // swaps in live times on mount.
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  useEffect(() => setSlots(buildPlaceholderSlots()), []);

  // Captured on load, so a slow filler who has navigated the URL clean still
  // sends the campaign she arrived on.
  const context = useRef<BookingContext | null>(null);
  useEffect(() => {
    context.current = readBookingContext();
  }, []);

  // The moment she ticked the box, which is what consent records need.
  const consentAt = useRef<string | null>(null);

  const options = useMemo(() => [...slots, OTHER_SLOT], [slots]);
  const selectedSlot = useMemo(
    () => options.find((slot) => slot.id === values.slotId) ?? null,
    [options, values.slotId],
  );

  const phoneE164 = useMemo(
    () => parseValidE164(values.phone, values.phoneIso),
    [values.phone, values.phoneIso],
  );

  const validate = useCallback((field: FieldName, state: Values): string | undefined => {
    switch (field) {
      case "firstName":
        return state.firstName.trim().length >= 2
          ? undefined
          : "Please add your first name so we know who we are calling.";
      case "phone":
        if (!state.phone.trim()) return "We need your number, this is a phone call.";
        return parseValidE164(state.phone, state.phoneIso)
          ? undefined
          : "That number does not look right. Please check it and try again.";
      case "email":
        if (!state.email.trim()) return "We need your email to send your confirmation.";
        return isValidEmail(state.email)
          ? undefined
          : "Please enter a valid email, like you@example.com.";
      case "slot":
        return state.slotId ? undefined : "Pick a time that works, or choose Other time.";
      case "consent":
        return state.consent
          ? undefined
          : "Please tick the box so we can call and text you about your call.";
      default:
        return undefined;
    }
  }, []);

  const setValue = useCallback(<K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFormError("");
  }, []);

  /** Validate on blur, but only ever to clear or set that one field. */
  const handleBlur = useCallback(
    (field: FieldName) => {
      setErrors((prev) => ({ ...prev, [field]: validate(field, values) }));
    },
    [validate, values],
  );

  /** Clear an error as soon as the field becomes valid. Never nag while typing. */
  const clearIfFixed = useCallback(
    (field: FieldName, state: Values) => {
      setErrors((prev) =>
        prev[field] && !validate(field, state) ? { ...prev, [field]: undefined } : prev,
      );
    },
    [validate],
  );

  const buildPayload = useCallback((): BookingPayload => {
    const ctx = context.current ?? readBookingContext();
    const slot = selectedSlot ?? OTHER_SLOT;
    const now = new Date().toISOString();
    return {
      firstName: values.firstName.trim(),
      phone: phoneE164 ?? "",
      email: values.email.trim(),
      goal: values.goal.trim() || null,
      slot: { iso: slot.iso, label: slot.label },
      consent: true,
      consentAt: consentAt.current ?? now,
      utm: ctx.utm,
      referrer: ctx.referrer,
      pagePath: ctx.pagePath || FREE_CALL_PATH,
      submittedAt: now,
    };
  }, [phoneE164, selectedSlot, values.email, values.firstName, values.goal]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const next: Errors = {};
      for (const field of FIELD_ORDER) next[field] = validate(field, values);
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
        // No personal data in the event: this is the hook marketing attaches
        // its conversion tags to.
        pushDataLayer({ event: "free_call_booked" });
        setBooked({ firstName: payload.firstName, slot: payload.slot });
      } catch {
        setFormError(RETRY_COPY);
      } finally {
        setSubmitting(false);
      }
    },
    [buildPayload, submitting, validate, values],
  );

  if (booked) {
    return <BookedCard firstName={booked.firstName} slot={booked.slot} />;
  }

  return (
    <div className="fcb" id={BOOKING_ANCHOR_ID}>
      <form className="fcb-card" onSubmit={handleSubmit} noValidate>
        <div className="fcb-head">
          <p className="fcb-kicker">Your free call</p>
          <h2 className="fcb-h">Pick a time and we will call you</h2>
          <p className="fcb-sub">
            It takes about {CALL_MINUTES} minutes, and you leave with a plan.
          </p>
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
            value={values.firstName}
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? `${FIELD_IDS.firstName}-error` : undefined}
            disabled={submitting}
            onChange={(e) => {
              const next = { ...values, firstName: e.target.value };
              setValue("firstName", e.target.value);
              clearIfFixed("firstName", next);
            }}
            onBlur={() => handleBlur("firstName")}
          />
          <FieldError id={FIELD_IDS.firstName} message={errors.firstName} />
        </div>

        <div className="fcb-field">
          <label htmlFor={FIELD_IDS.phone}>Phone number</label>
          <div className="fcb-phone-row">
            <select
              className="fcb-country"
              aria-label="Country code"
              value={values.phoneIso}
              disabled={submitting}
              onChange={(e) => {
                const iso = e.target.value;
                const reformatted = reformatNationalPhone(values.phone, iso);
                setValues((prev) => ({ ...prev, phoneIso: iso, phone: reformatted }));
                clearIfFixed("phone", { ...values, phoneIso: iso, phone: reformatted });
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
              value={values.phone}
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? `${FIELD_IDS.phone}-error` : undefined}
              disabled={submitting}
              onChange={(e) => {
                // Formats as she types and refuses extra digits past a full number.
                const formatted = nextNationalPhoneInput(e.target.value, values.phoneIso);
                if (formatted === null) return;
                setValue("phone", formatted);
                clearIfFixed("phone", { ...values, phone: formatted });
              }}
              onBlur={() => handleBlur("phone")}
            />
          </div>
          <FieldError id={FIELD_IDS.phone} message={errors.phone} />
        </div>

        <div className="fcb-field">
          <label htmlFor={FIELD_IDS.email}>Email</label>
          <input
            id={FIELD_IDS.email}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${FIELD_IDS.email}-error` : undefined}
            disabled={submitting}
            onChange={(e) => {
              const next = { ...values, email: e.target.value };
              setValue("email", e.target.value);
              setEmailSuggestion(suggestEmail(e.target.value));
              clearIfFixed("email", next);
            }}
            onBlur={() => {
              setEmailSuggestion(suggestEmail(values.email));
              handleBlur("email");
            }}
          />
          <FieldError id={FIELD_IDS.email} message={errors.email} />
          {emailSuggestion && !errors.email ? (
            <p className="fcb-hint">
              Did you mean{" "}
              <button
                type="button"
                onClick={() => {
                  setValue("email", emailSuggestion);
                  setEmailSuggestion(null);
                }}
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          ) : null}
        </div>

        <fieldset className="fcb-slots">
          <legend className="fcb-legend">Preferred time</legend>
          <div className="fcb-slot-grid">
            {options.map((slot, index) => (
              <label
                key={slot.id}
                className={`fcb-slot ${values.slotId === slot.id ? "is-on" : ""} ${
                  slot.id === OTHER_SLOT.id ? "fcb-slot-other" : ""
                }`}
              >
                <input
                  id={index === 0 ? FIELD_IDS.slot : undefined}
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={values.slotId === slot.id}
                  disabled={submitting}
                  aria-describedby={errors.slot ? `${FIELD_IDS.slot}-error` : undefined}
                  onChange={() => {
                    setValue("slotId", slot.id);
                    clearIfFixed("slot", { ...values, slotId: slot.id });
                  }}
                />
                <span>{slot.label}</span>
              </label>
            ))}
          </div>
          <FieldError id={FIELD_IDS.slot} message={errors.slot} />
          {!errors.slot ? <p className="fcb-hint">Times are shown in your own time zone.</p> : null}
        </fieldset>

        <div className="fcb-field">
          <label htmlFor="fc-goal">
            What is your number one goal right now?
            <span className="fcb-optional">Optional</span>
          </label>
          <input
            id="fc-goal"
            name="goal"
            type="text"
            placeholder="Lose 20 pounds, get my energy back..."
            maxLength={140}
            value={values.goal}
            disabled={submitting}
            onChange={(e) => setValue("goal", e.target.value)}
          />
        </div>

        <label className="fcb-consent" htmlFor={FIELD_IDS.consent}>
          <input
            id={FIELD_IDS.consent}
            name="consent"
            type="checkbox"
            checked={values.consent}
            disabled={submitting}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${FIELD_IDS.consent}-error` : undefined}
            onChange={(e) => {
              if (e.target.checked) consentAt.current = new Date().toISOString();
              setValue("consent", e.target.checked);
              clearIfFixed("consent", { ...values, consent: e.target.checked });
            }}
          />
          <span>{CONSENT_COPY}</span>
        </label>
        {errors.consent ? (
          <div className="fcb-consent-error">
            <FieldError id={FIELD_IDS.consent} message={errors.consent} />
          </div>
        ) : null}

        <button type="submit" className="fcb-submit" disabled={submitting}>
          {submitting ? (
            <>
              <span className="fcb-spinner" aria-hidden />
              Booking your call...
            </>
          ) : (
            <>
              {BOOKING_CTA_LABEL}
              <span className="fcb-submit-arw" aria-hidden>
                →
              </span>
            </>
          )}
        </button>
        <p className="fcb-foot">{COACH_LABEL} calls you at the time you pick. No card needed.</p>
      </form>
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
 * The confirmation text and email she is promised here are sent by the
 * backend, not by this page. See docs/free-call-backend-handoff.md.
 */
function BookedCard({ firstName, slot }: { firstName: string; slot: BookingSlot }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const iso = slot.iso;

  // Move focus to the heading so screen readers and keyboard users land on the
  // confirmation rather than wherever the submit button used to be.
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="fcb" id={BOOKING_ANCHOR_ID}>
      <div className="fcb-card fcb-done">
        <span className="fcb-done-ico" aria-hidden>
          <Check strokeWidth={3} />
        </span>
        <h2 className="fcb-done-h" ref={heading} tabIndex={-1}>
          You&rsquo;re booked, {firstName}.
        </h2>

        <p className="fcb-done-when">
          {iso
            ? `${COACH_LABEL} will call you ${slot.label}.`
            : `You picked ${slot.label.toLowerCase()}, so we will text you to find a slot that works.`}
        </p>

        <p className="fcb-done-p">
          Find a quiet spot where you can talk for about {CALL_MINUTES} minutes. Have your goal in
          mind and be ready to get started.
        </p>
        <p className="fcb-done-p">We just sent you a text and an email to confirm.</p>

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
        ) : null}
      </div>
    </div>
  );
}
