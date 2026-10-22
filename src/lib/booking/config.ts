/**
 * /free-call constants.
 *
 * COACH_LABEL is the single place this page names the person who makes the
 * call. David owns that wording, so changing it here changes the hero, the
 * FAQ, the confirmation screen and the label the backend is handed.
 */

/** [CONFIRM with David] "JJ's coach" is the draft label. */
export const COACH_LABEL = "JJ's coach";

/** [CONFIRM with David] draft call length. Drives the copy and the calendar event. */
export const CALL_MINUTES = 15;

/** [CONFIRM with David] draft "free, no card" framing used in the trust chips. */
export const NO_CARD_COPY = "Free, no card needed";

/** Route path. Also sent to the backend as `pagePath`. */
export const FREE_CALL_PATH = "/free-call";

/** id of the booking card. Every CTA on the page scrolls here. */
export const BOOKING_ANCHOR_ID = "book";

/** The one CTA label on the page. */
export const BOOKING_CTA_LABEL = "Book my free call";
