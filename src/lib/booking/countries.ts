import type { LandingCountry } from "@/lib/signup/types";

/**
 * Country list for the phone field on /free-call.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * INTEGRATION POINT (backend, Christophe)
 *
 * The signup checkout card reads its list from the backend config endpoint
 * (`LovablePublicConfig.countries`). /free-call deliberately ships a static
 * list instead, so the page renders with no backend at all. The shape is
 * identical, so swapping in the config list later is a one line change.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const BOOKING_COUNTRIES: LandingCountry[] = [
  { id: "US", name: "United States", countryCode: "US", countryDialCode: "+1", flagEmoji: "🇺🇸" },
  { id: "CA", name: "Canada", countryCode: "CA", countryDialCode: "+1", flagEmoji: "🇨🇦" },
  { id: "GB", name: "United Kingdom", countryCode: "GB", countryDialCode: "+44", flagEmoji: "🇬🇧" },
  { id: "AU", name: "Australia", countryCode: "AU", countryDialCode: "+61", flagEmoji: "🇦🇺" },
  { id: "NZ", name: "New Zealand", countryCode: "NZ", countryDialCode: "+64", flagEmoji: "🇳🇿" },
  { id: "IE", name: "Ireland", countryCode: "IE", countryDialCode: "+353", flagEmoji: "🇮🇪" },
  { id: "ZA", name: "South Africa", countryCode: "ZA", countryDialCode: "+27", flagEmoji: "🇿🇦" },
  { id: "JM", name: "Jamaica", countryCode: "JM", countryDialCode: "+1", flagEmoji: "🇯🇲" },
  {
    id: "TT",
    name: "Trinidad and Tobago",
    countryCode: "TT",
    countryDialCode: "+1",
    flagEmoji: "🇹🇹",
  },
  { id: "BS", name: "Bahamas", countryCode: "BS", countryDialCode: "+1", flagEmoji: "🇧🇸" },
  { id: "BB", name: "Barbados", countryCode: "BB", countryDialCode: "+1", flagEmoji: "🇧🇧" },
  { id: "NG", name: "Nigeria", countryCode: "NG", countryDialCode: "+234", flagEmoji: "🇳🇬" },
  { id: "GH", name: "Ghana", countryCode: "GH", countryDialCode: "+233", flagEmoji: "🇬🇭" },
  { id: "KE", name: "Kenya", countryCode: "KE", countryDialCode: "+254", flagEmoji: "🇰🇪" },
  { id: "DE", name: "Germany", countryCode: "DE", countryDialCode: "+49", flagEmoji: "🇩🇪" },
  { id: "FR", name: "France", countryCode: "FR", countryDialCode: "+33", flagEmoji: "🇫🇷" },
  { id: "ES", name: "Spain", countryCode: "ES", countryDialCode: "+34", flagEmoji: "🇪🇸" },
  { id: "IT", name: "Italy", countryCode: "IT", countryDialCode: "+39", flagEmoji: "🇮🇹" },
  { id: "NL", name: "Netherlands", countryCode: "NL", countryDialCode: "+31", flagEmoji: "🇳🇱" },
  { id: "PT", name: "Portugal", countryCode: "PT", countryDialCode: "+351", flagEmoji: "🇵🇹" },
  { id: "MX", name: "Mexico", countryCode: "MX", countryDialCode: "+52", flagEmoji: "🇲🇽" },
  { id: "BR", name: "Brazil", countryCode: "BR", countryDialCode: "+55", flagEmoji: "🇧🇷" },
  { id: "IN", name: "India", countryCode: "IN", countryDialCode: "+91", flagEmoji: "🇮🇳" },
  { id: "PH", name: "Philippines", countryCode: "PH", countryDialCode: "+63", flagEmoji: "🇵🇭" },
  {
    id: "AE",
    name: "United Arab Emirates",
    countryCode: "AE",
    countryDialCode: "+971",
    flagEmoji: "🇦🇪",
  },
];

/** Most of this traffic is American, so the picker opens on the US. */
export const DEFAULT_BOOKING_COUNTRY = "US";
