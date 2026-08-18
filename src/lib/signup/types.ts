export type SignupBillingInterval = "MONTHLY" | "MULTI_MONTH" | "FULL_PROGRAM";

export type CheckoutCardStep = "contact" | "payment" | "success";

export type OfferPlanId = "monthly" | "quarter";

export interface OfferPlan {
  id: OfferPlanId;
  billingInterval: SignupBillingInterval;
  name: string;
  price: number;
  priceLabel: string;
  cadenceLabel: string;
  dueLabel: string;
  ctaLabel: string;
  buttonPosition: string;
}

export interface SignupMarketingAttribution {
  sourceSurface?: string | null;
  sourceContext?: string | null;
  tier?: string | null;
  buttonPosition?: string | null;
  ctaText?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  pageUrl?: string | null;
  referrer?: string | null;
  fbclid?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  metaEventId?: string | null;
}

export interface PublicCoachProgram {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  pricingTier?: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  durationWeeks?: number | null;
  monthlyPriceAmount?: number | null;
  fullProgramPriceAmount?: number | null;
  multiMonthPriceAmount?: number | null;
  multiMonthIntervalCount?: number | null;
  supportedBillingIntervals?: SignupBillingInterval[];
  programLabel?: string | null;
}

export interface LandingCountry {
  id: string;
  name: string;
  countryCode: string;
  countryDialCode: string;
  flagEmoji: string | null;
  active?: boolean;
}

export interface LovablePublicConfig {
  stripePublishableKey: string | null;
  loginUrl?: string;
  continueSignupBaseUrl: string;
  supportedBillingIntervals: SignupBillingInterval[];
  coachId: string | null;
  coachDisplayName: string | null;
  programs: PublicCoachProgram[];
  countries?: LandingCountry[];
  onboardingCapacity?: {
    onboardedCount: number;
    maxOnboardedCustomers: number | null;
    isAtCapacity: boolean;
  };
}

export interface SignupPurchaseTracking {
  eventId: string;
  orderId: string;
  value: number;
  currency: string;
  contentId?: string;
}

export interface SignupIntentResponse {
  intentId: string;
  intentToken?: string;
  continueSignupUrl?: string;
  authMethod?: "email" | "sso_google";
  status?: string;
  step?: string;
  email: string;
  emailVerified?: boolean;
  paymentComplete?: boolean;
  hasPassword?: boolean;
  phoneVerified?: boolean;
  profileComplete?: boolean;
  firstName?: string;
  lastName?: string;
  clientSecret?: string | null;
  message?: string;
  emailSent?: boolean;
  purchaseTracking?: SignupPurchaseTracking | null;
  discount?: {
    code: string;
    amountOff: number;
    originalAmount: number;
    discountedAmount: number;
    currency: string;
  };
}

export interface VerifiedDiscount {
  valid: true;
  discount: {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    amountOff: number;
    originalAmount: number;
    discountedAmount: number;
    currency: string;
  };
}

export class SignupApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "SignupApiError";
    this.statusCode = statusCode;
  }
}
