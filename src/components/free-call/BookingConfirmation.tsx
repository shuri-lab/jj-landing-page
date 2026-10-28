import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CalendarDays,
  CalendarPlus,
  Check,
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneOff,
  Zap,
} from "lucide-react";
import { trackFcCallMeNow, trackFcCallMissedShown } from "@/lib/analytics/free-call";
import type { FcCallNowAfter } from "@/lib/analytics/free-call";
import { requestCallNow } from "@/lib/booking/api";
import { buildGoogleCalendarUrl, downloadIcs } from "@/lib/booking/calendar";
import { callCard, clockTime, inSentence } from "@/lib/booking/call-card";
import type { AskedNow, CallCard } from "@/lib/booking/call-card";
import {
  BOOKING_ANCHOR_ID,
  CALLER_ID_NUMBER,
  CALLER_LABEL,
  CALL_MINUTES,
} from "@/lib/booking/config";
import { spokenWhen } from "@/lib/booking/slots";
import type { WhenSelection } from "@/lib/booking/slots";
import { useCallStatus } from "@/lib/booking/use-call-status";

export interface ConfirmedBooking {
  firstName: string;
  when: WhenSelection;
  /** Her free-call link token; null from an older backend, which keeps the plain card. */
  token: string | null;
  rescheduleUrl: string | null;
  /** Read back from this device on load, rather than booked just now. */
  restored: boolean;
}

const CALL_NOW_ERRORS = {
  limit: "You've asked for a lot of calls in the last hour. Please try again a little later.",
  unavailable: "A call right now isn't available. Please pick a time instead.",
  error: "Something went wrong on our end. Please try again.",
} as const;

/**
 * The confirmation, shown in place of the form, kept up to date with how her
 * call went. A missed call turns it into "We missed you" with "Call me now",
 * the way the member app's missed-call screen works, so she never has to book
 * again just to be called.
 *
 * The texts and email she is promised are sent by the backend, not by this
 * page. See docs/free-call-backend-handoff.md.
 */
export function BookingConfirmation({
  booking,
  onStartOver,
}: {
  booking: ConfirmedBooking;
  /** Forget this booking and show the form again. */
  onStartOver: () => void;
}) {
  const { status, checkedAt, refresh } = useCallStatus(booking.token, onStartOver);
  const [asked, setAsked] = useState<AskedNow | null>(null);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState("");
  const card = callCard(status, asked, checkedAt);
  const cardKey = card.kind === "missed" ? `missed-${card.retry}` : card.kind;

  // Focus follows her: onto the confirmation right after she books, and onto
  // the new card after she presses a button. A card restored on load, or one
  // a status check changes, never moves focus or scrolls; the live region
  // announces it instead.
  const heading = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef(!booking.restored);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    heading.current?.focus();
  }, [cardKey]);

  useEffect(() => {
    if (card.kind === "missed") trackFcCallMissedShown();
  }, [card.kind]);

  const callNow = useCallback(async () => {
    if (!booking.token || calling) return;
    const after: FcCallNowAfter =
      card.kind === "cut_off" || card.kind === "callback" || card.kind === "open"
        ? card.kind
        : "missed";
    setCalling(true);
    setError("");
    const missedBefore = status?.missedAt ?? null;
    const result = await requestCallNow(booking.token);
    trackFcCallMeNow({ after, ok: result.ok });
    setCalling(false);
    focusNext.current = true;
    if (result.ok) {
      setAsked({ at: Date.now(), missedBefore });
      void refresh();
      return;
    }
    if (result.kind === "expired") return onStartOver();
    if (result.kind === "closed") return void refresh();
    setError(
      result.kind === "unavailable" && result.message
        ? result.message
        : CALL_NOW_ERRORS[result.kind],
    );
  }, [booking.token, calling, card.kind, onStartOver, refresh, status?.missedAt]);

  // The next dial on her own clock when one is booked; else the time she picked.
  const when: WhenSelection =
    status?.state === "scheduled" && status.scheduledFor
      ? { mode: "scheduled", iso: status.scheduledFor.iso, label: status.scheduledFor.label }
      : booking.when;

  return (
    <div className="fcb" id={BOOKING_ANCHOR_ID}>
      <div className="fcb-card fcb-done" aria-live="polite">
        <CardBody
          card={card}
          heading={heading}
          restored={booking.restored}
          firstName={booking.firstName}
          when={when}
          nextLabel={status?.scheduledFor?.label ?? null}
          callNowAvailable={status?.slots.now.available ?? false}
          rescheduleUrl={booking.rescheduleUrl}
          calling={calling}
          error={error}
          onCallNow={callNow}
          onStartOver={onStartOver}
        />
      </div>
    </div>
  );
}

function CardBody({
  card,
  heading,
  restored,
  firstName,
  when,
  nextLabel,
  callNowAvailable,
  rescheduleUrl,
  calling,
  error,
  onCallNow,
  onStartOver,
}: {
  card: CallCard;
  heading: React.RefObject<HTMLHeadingElement | null>;
  restored: boolean;
  firstName: string;
  when: WhenSelection;
  nextLabel: string | null;
  callNowAvailable: boolean;
  rescheduleUrl: string | null;
  calling: boolean;
  error: string;
  onCallNow: () => void;
  onStartOver: () => void;
}) {
  const getBack = (label: string, pickLabel = "Pick another time") => (
    <Actions
      callNowLabel={callNowAvailable ? label : null}
      pickUrl={rescheduleUrl}
      pickLabel={pickLabel}
      calling={calling}
      error={error}
      onCallNow={onCallNow}
    />
  );
  // Only a booking read back from this device offers to start over: someone
  // else on the same phone or laptop may want their own call.
  const startOver = restored ? <StartOver firstName={firstName} onStartOver={onStartOver} /> : null;
  const head = (icon: ReactNode, text: ReactNode, tone?: "soft" | "ring") => (
    <Head icon={icon} tone={tone} heading={heading}>
      {text}
    </Head>
  );

  switch (card.kind) {
    case "booked":
      return (
        <>
          {head(<Check strokeWidth={3} />, <>You&rsquo;re booked, {firstName}!</>)}
          <p className="fcb-done-when">
            {CALLER_LABEL} will call you {spokenWhen(when)} from {CALLER_ID_NUMBER}.
          </p>
          <p className="fcb-done-p">
            Find a quiet spot where you can talk for about {CALL_MINUTES} minutes. We just texted
            you to confirm.
          </p>
          {when.iso ? (
            <div className="fcb-cal">
              <button type="button" className="fcb-cal-btn" onClick={() => downloadIcs(when.iso!)}>
                <CalendarPlus aria-hidden />
                Add to calendar
              </button>
              <a
                className="fcb-cal-btn"
                href={buildGoogleCalendarUrl(when.iso)}
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
          {startOver}
        </>
      );

    case "calling":
      return (
        <>
          {head(<PhoneCall />, <>Calling you now, {firstName}</>, "ring")}
          <p className="fcb-done-when">
            {CALLER_LABEL} is calling you from {CALLER_ID_NUMBER}.
          </p>
          <p className="fcb-done-p">
            Find a quiet spot where you can talk for about {CALL_MINUTES} minutes.
          </p>
          <p className="fcb-done-soon">
            <Zap size={15} aria-hidden /> Keep your phone close.
          </p>
        </>
      );

    case "missed": {
      const tried = card.missedAt ? clockTime(card.missedAt) : "";
      if (card.retry === "now") {
        return (
          <>
            {head(<PhoneMissed />, <>We missed you, {firstName}</>, "soft")}
            <p className="fcb-done-when">
              {CALLER_LABEL} is trying you again now from {CALLER_ID_NUMBER}.
            </p>
            <p className="fcb-done-soon">
              <Zap size={15} aria-hidden /> Keep your phone close.
            </p>
            {startOver}
          </>
        );
      }
      return (
        <>
          {head(<PhoneMissed />, <>We missed you, {firstName}</>, "soft")}
          <p className="fcb-done-when">
            {tried ? `${CALLER_LABEL} tried you at ${tried}.` : "We couldn't reach you."}{" "}
            {card.retry === "later" && nextLabel
              ? `We'll try again ${inSentence(nextLabel)}.`
              : "Your free call is still yours."}
          </p>
          <p className="fcb-done-p">Free now? We&rsquo;ll call you straight back.</p>
          {getBack("Call me now")}
          {startOver}
        </>
      );
    }

    case "cut_off":
      return (
        <>
          {head(<PhoneOff />, <>Our call got cut off</>, "soft")}
          <p className="fcb-done-when">Let&rsquo;s pick up where we left off, {firstName}.</p>
          <p className="fcb-done-p">
            {CALLER_LABEL} can call you right back, or pick a time that suits you.
          </p>
          {getBack("Call me back now")}
          {startOver}
        </>
      );

    case "callback":
    case "open":
      return (
        <>
          {head(
            <Phone />,
            card.kind === "callback"
              ? `When's a better time, ${firstName}?`
              : `Ready for your free call, ${firstName}?`,
            "soft",
          )}
          <p className="fcb-done-p">
            {CALLER_LABEL} can call you right now, or pick a time that suits you.
          </p>
          {getBack("Call me now", card.kind === "callback" ? "Pick a time" : "Pick another time")}
          {startOver}
        </>
      );

    case "done":
      return (
        <>
          {head(<Check strokeWidth={3} />, <>Thanks for your call, {firstName}!</>)}
          <p className="fcb-done-p">
            Your free call is done. Keep an eye on your texts and email for your next step.
          </p>
        </>
      );

    case "member":
      return (
        <>
          {head(<Check strokeWidth={3} />, <>You&rsquo;re already in, {firstName}!</>)}
          <p className="fcb-done-p">Your plan is waiting for you in the app.</p>
        </>
      );

    case "closed":
      return (
        <>
          {head(<Phone />, <>This free call is closed</>, "soft")}
          <p className="fcb-done-p">Want to talk with {CALLER_LABEL}? Book a new call.</p>
          <div className="fcb-done-actions">
            <button type="button" className="fcb-submit" onClick={onStartOver}>
              Book a new call
            </button>
          </div>
        </>
      );

    case "unreachable":
      return (
        <>
          {head(<PhoneOff />, <>We can&rsquo;t call this number</>, "soft")}
          <p className="fcb-done-p">
            Calls to the number you gave can&rsquo;t go through from our side. Book again with a
            different number.
          </p>
          <div className="fcb-done-actions">
            <button type="button" className="fcb-submit" onClick={onStartOver}>
              Use a different number
            </button>
          </div>
        </>
      );
  }
}

/** The card's icon and heading; the heading takes focus when she acts. */
function Head({
  icon,
  tone,
  heading,
  children,
}: {
  icon: ReactNode;
  tone?: "soft" | "ring";
  heading: React.RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  return (
    <>
      <span className={`fcb-done-ico${tone ? ` is-${tone}` : ""}`} aria-hidden>
        {icon}
      </span>
      <h2 className="fcb-done-h" ref={heading} tabIndex={-1}>
        {children}
      </h2>
    </>
  );
}

function Actions({
  callNowLabel,
  pickUrl,
  pickLabel,
  calling,
  error,
  onCallNow,
}: {
  callNowLabel: string | null;
  pickUrl: string | null;
  pickLabel: string;
  calling: boolean;
  error: string;
  onCallNow: () => void;
}) {
  return (
    <div className="fcb-done-actions">
      {error ? (
        <p className="fcb-alert" role="alert">
          <AlertCircle size={16} aria-hidden />
          {error}
        </p>
      ) : null}
      {callNowLabel ? (
        <button type="button" className="fcb-submit" onClick={onCallNow} disabled={calling}>
          {calling ? (
            <>
              <span className="fcb-spinner" aria-hidden />
              Calling you...
            </>
          ) : (
            <>
              <Phone size={19} aria-hidden />
              {callNowLabel}
            </>
          )}
        </button>
      ) : null}
      {pickUrl ? (
        <a className="fcb-cal-btn" href={pickUrl}>
          <CalendarDays aria-hidden />
          {pickLabel}
        </a>
      ) : null}
      <p className="fcb-done-note">Calls come from {CALLER_ID_NUMBER}.</p>
    </div>
  );
}

/** Saved on this device: someone else on it can start their own booking. */
function StartOver({ firstName, onStartOver }: { firstName: string; onStartOver: () => void }) {
  return (
    <p className="fcb-done-reset">
      Not {firstName}?{" "}
      <button type="button" onClick={onStartOver}>
        Book a new call
      </button>
    </p>
  );
}
