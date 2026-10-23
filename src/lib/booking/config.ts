/**
 * /free-call constants.
 *
 * COACH_LABEL is the single place this page names the person who makes the
 * call. v2 puts JJ herself on the phone, so the page, the confirmation and
 * the label handed to the backend all say "JJ Smith". Change it here and
 * every one of them follows.
 */

/** v2: the call is with JJ personally, not an unnamed coach. */
export const COACH_LABEL = "JJ Smith";

/** [CONFIRM with David] draft call length. Drives the copy and the calendar event. */
export const CALL_MINUTES = 15;

/**
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * The number the confirmation tells her to expect the call from. A reserved
 * fictional number until the phone system's real caller ID is known. Swap it
 * here and the confirmation screen follows.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const CALLER_ID_NUMBER = "(555) 012-3456";

/** The reassurance line under every CTA, under the booking button and in the FAQ strip. */
export const REASSURANCE = `Free · about ${CALL_MINUTES} minutes`;

/** Route path. Also sent to the backend as `pagePath`. */
export const FREE_CALL_PATH = "/free-call";

/** id of the booking card. Every CTA on the page scrolls here. */
export const BOOKING_ANCHOR_ID = "book";

/** The one CTA label on the page. */
export const BOOKING_CTA_LABEL = "Book my free call";

/** The submit label when she has asked for an immediate call. */
export const BOOKING_CTA_NOW_LABEL = "Call me now";
