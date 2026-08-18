import type { OfferPlan, PublicCoachProgram, SignupBillingInterval } from "./types";

export const MEMBER_PRICE = 47;
export const QUARTER_PRICE = 127;

export const OFFER_PLANS: Record<"monthly" | "quarter", OfferPlan> = {
  monthly: {
    id: "monthly",
    billingInterval: "MONTHLY",
    name: "Yobody By JJ Smith",
    price: MEMBER_PRICE,
    priceLabel: `USD $${MEMBER_PRICE.toFixed(2)}`,
    cadenceLabel: "Monthly",
    dueLabel: `USD $${MEMBER_PRICE.toFixed(2)}`,
    ctaLabel: `Start today · $${MEMBER_PRICE}/month`,
    buttonPosition: "offer-monthly",
  },
  quarter: {
    id: "quarter",
    billingInterval: "MULTI_MONTH",
    name: "Yobody By JJ Smith",
    price: QUARTER_PRICE,
    priceLabel: `USD $${QUARTER_PRICE.toFixed(2)}`,
    cadenceLabel: "for 3 months",
    dueLabel: `USD $${QUARTER_PRICE.toFixed(2)}`,
    ctaLabel: `Start today · $${QUARTER_PRICE} for 3 months`,
    buttonPosition: "offer-quarter",
  },
};

export function amountForInterval(
  program: PublicCoachProgram | null | undefined,
  interval: SignupBillingInterval,
): number | null {
  if (!program) return null;
  if (interval === "MULTI_MONTH") return program.multiMonthPriceAmount ?? null;
  if (interval === "FULL_PROGRAM") return program.fullProgramPriceAmount ?? null;
  return program.monthlyPriceAmount ?? program.priceAmount ?? null;
}

function programSupportsInterval(
  program: PublicCoachProgram,
  interval: SignupBillingInterval,
): boolean {
  if (
    Array.isArray(program.supportedBillingIntervals) &&
    program.supportedBillingIntervals.length > 0
  ) {
    return program.supportedBillingIntervals.includes(interval);
  }
  const amount = amountForInterval(program, interval);
  return typeof amount === "number" && amount > 0;
}

/**
 * Pick the coach program that can actually be charged for this landing tile.
 * Matches in-app SignupCheckoutStep: only programs with a price for the
 * selected interval, preferring the advertised $47 / $127 amounts.
 */
export function pickLandingProgram(
  programs: PublicCoachProgram[] | null | undefined,
  interval: SignupBillingInterval,
  expectedPrice?: number,
): PublicCoachProgram | null {
  if (!programs?.length) return null;
  const priced = programs.filter((program) =>
    programSupportsInterval(program, interval),
  );
  if (!priced.length) return null;

  if (typeof expectedPrice === "number") {
    const exact = priced.find((program) => {
      const amount = amountForInterval(program, interval);
      return (
        typeof amount === "number" &&
        Math.round(amount * 100) === Math.round(expectedPrice * 100)
      );
    });
    if (exact) return exact;
  }

  return (
    priced.find((p) => (p.pricingTier ?? "").toUpperCase() === "PREMIUM") ??
    priced.find((p) => (p.pricingTier ?? "").toUpperCase() === "STANDARD") ??
    priced.find((p) => (p.pricingTier ?? "").toUpperCase() === "BASIC") ??
    priced[0]
  );
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
