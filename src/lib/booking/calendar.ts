/**
 * "Add to calendar" for the confirmation screen.
 *
 * Everything here runs in the browser from the slot she already picked. The
 * backend is not involved: the real confirmation text and email are sent
 * server side (see docs/free-call-backend-handoff.md).
 */

import { CALL_MINUTES, COACH_LABEL } from "./config";

export const CALENDAR_TITLE = `Your free call with ${COACH_LABEL}`;
export const CALENDAR_DETAILS = `Find a quiet spot where you can talk for about ${CALL_MINUTES} minutes. Have your goal in mind and be ready to get started.`;

/** 20261023T190000Z, the only timestamp format iCalendar and Google agree on. */
function toCalendarStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

function endOf(startIso: string): Date {
  return new Date(new Date(startIso).getTime() + CALL_MINUTES * 60_000);
}

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 asks for lines of at most 75 octets, continued with a leading space. */
function foldIcsLine(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [line.slice(0, 73)];
  for (let i = 73; i < line.length; i += 72) parts.push(` ${line.slice(i, i + 72)}`);
  return parts.join("\r\n");
}

export function buildIcs(
  slotIso: string,
  uid = `free-call-${Date.now()}@jjsmithonline.com`,
): string {
  const start = new Date(slotIso);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JJ Smith//Free Call//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalendarStamp(new Date())}`,
    `DTSTART:${toCalendarStamp(start)}`,
    `DTEND:${toCalendarStamp(endOf(slotIso))}`,
    `SUMMARY:${escapeIcsText(CALENDAR_TITLE)}`,
    `DESCRIPTION:${escapeIcsText(CALENDAR_DETAILS)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}

export function buildGoogleCalendarUrl(slotIso: string): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: CALENDAR_TITLE,
    details: CALENDAR_DETAILS,
  });
  // `dates` is appended by hand: Google wants a literal slash between the two
  // stamps, and URLSearchParams would percent encode it.
  const dates = `${toCalendarStamp(new Date(slotIso))}/${toCalendarStamp(endOf(slotIso))}`;
  return `https://calendar.google.com/calendar/render?${params.toString()}&dates=${dates}`;
}

/** Hands the .ics to the browser as a download. Safari and iOS open it directly. */
export function downloadIcs(slotIso: string, filename = "jj-free-call.ics"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildIcs(slotIso)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a tick to start the download before the blob disappears.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
