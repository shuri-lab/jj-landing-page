/**
 * /free-call constants.
 *
 * COACH_LABEL is the single place this page names the person who makes the
 * call. v2 puts JJ herself on the phone, so the page, the confirmation and
 * the label handed to the backend all say "JJ Smith". Change it here and
 * every one of them follows.
 */

/**
 * Two labels, and the difference matters.
 *
 * COACH_LABEL is the brand, the story and the method: the hero, the founder
 * section, the page title. All of that is JJ herself and all of it is true.
 *
 * CALLER_LABEL is who is actually on the phone. The call is taken by JJ's AI
 * coach, built from her voice and her method, so anywhere the page says who
 * makes the call it has to say this instead. Never mix the two inside one
 * sentence about the call.
 */
export const COACH_LABEL = "JJ Smith";
export const CALLER_LABEL = "JJ's coach";

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

/** id of the booking card itself. */
export const BOOKING_ANCHOR_ID = "book";

/**
 * id of the whole closing band. This is what a CTA scrolls to, so she lands
 * on "Your plan is one short call away" and reads the close before the form,
 * rather than on the bare top of the card.
 */
export const BOOKING_SECTION_ID = "book-section";

/** The one CTA label on the page. */
export const BOOKING_CTA_LABEL = "Book my free call";

/** The submit label when she has asked for an immediate call. */
export const BOOKING_CTA_NOW_LABEL = "Call me now";
