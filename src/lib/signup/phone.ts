import {
  formatIncompletePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js/min";
import type { LandingCountry } from "./types";

const TIMEZONE_COUNTRY: Record<string, string> = {
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
};

function asCountryCode(iso: string | null | undefined): CountryCode | undefined {
  const code = iso?.trim().toUpperCase();
  return code && code.length === 2 ? (code as CountryCode) : undefined;
}

function regionFromLocale(tag: string): string | null {
  try {
    const region = new Intl.Locale(tag).region;
    return region && /^[A-Z]{2}$/i.test(region) ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** Guess ISO country from browser locale, then timezone. Falls back to US like in-app signup. */
export function guessIsoCountry(): string {
  if (typeof navigator !== "undefined") {
    const tags = [navigator.language, ...(navigator.languages ?? [])];
    for (const tag of tags) {
      if (!tag) continue;
      const region = regionFromLocale(tag);
      if (region) return region;
    }
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY[tz]) return TIMEZONE_COUNTRY[tz];
  } catch {
    /* ignore */
  }
  return "US";
}

export function pickDefaultCountry(
  countries: LandingCountry[] | undefined,
  preferredIso?: string | null,
): LandingCountry | null {
  if (!countries?.length) return null;
  const preferred = preferredIso?.trim().toUpperCase();
  return (
    (preferred
      ? countries.find((c) => c.countryCode.toUpperCase() === preferred)
      : null) ??
    countries.find((c) => c.countryCode.toUpperCase() === "US") ??
    countries.find((c) => c.countryDialCode.replace(/\D/g, "") === "1") ??
    countries[0]
  );
}

export function nextNationalPhoneInput(
  value: string,
  iso: string | null | undefined,
): string | null {
  const country = asCountryCode(iso);
  if (!country) return value;
  if (validatePhoneNumberLength(value, country) === "TOO_LONG") return null;
  return formatIncompletePhoneNumber(value, country);
}

export function reformatNationalPhone(
  value: string,
  iso: string | null | undefined,
): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const country = asCountryCode(iso);
  if (!country) return digits;
  return formatIncompletePhoneNumber(digits, country);
}

export function isValidNationalPhone(
  value: string,
  iso: string | null | undefined,
): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const country = asCountryCode(iso);
  if (!country) return trimmed.length >= 7 && /^\+?[\d\s\-()]+$/.test(trimmed);
  return isValidPhoneNumber(trimmed, country);
}

export function toE164FromNational(
  value: string,
  iso: string | null | undefined,
  dialCode?: string | null,
): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const parsed = parsePhoneNumberFromString(trimmed, asCountryCode(iso));
  if (parsed?.isValid()) return parsed.format("E.164");
  return toE164(dialCode ?? "+1", trimmed);
}

export function toE164(dialCode: string, national: string): string {
  const trimmed = national.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return `+${trimmed.replace(/\D/g, "")}`;
  }
  const cc = dialCode.replace(/\D/g, "") || "1";
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  if (digits.startsWith(cc) && digits.length > cc.length + 6) {
    return `+${digits}`;
  }
  return `+${cc}${digits}`;
}

export function isLikelyE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function maskPhone(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  if (digits.length < 4) return e164;
  return `•••-•••-${digits.slice(-4)}`;
}
