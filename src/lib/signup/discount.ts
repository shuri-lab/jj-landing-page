import type { VerifiedDiscount } from "./types";

/** What the checkout card shows for the discount code in its box. */
export interface DiscountState {
  verified: boolean;
  code?: string;
  amountOff?: number;
  discountedAmount?: number;
  message?: string;
}

/** The card state for a code the server just verified. */
export function verifiedDiscountState(verified: VerifiedDiscount): DiscountState {
  return {
    verified: true,
    code: verified.discount.code,
    amountOff: verified.discount.amountOff,
    discountedAmount: verified.discount.discountedAmount,
    message: "Discount applied.",
  };
}

/**
 * A reload clears the card's state, but the code she applied was remembered
 * with her signup. Verify it again so the card shows the same price and the
 * resumed checkout is created with it: a checkout created with no code
 * clears the discount saved on her signup and charges the full price.
 *
 * Resolves null when there is nothing to restore or the code does not verify
 * any more (a code that expired, or a lookup that failed). The resumed
 * checkout then runs without a discount, as a plain checkout would.
 */
export async function restoreRememberedDiscount(args: {
  rememberedCode: string | null | undefined;
  verify: (code: string) => Promise<VerifiedDiscount>;
}): Promise<{ code: string; state: DiscountState } | null> {
  const code = args.rememberedCode?.trim().toUpperCase();
  if (!code) return null;
  try {
    const verified = await args.verify(code);
    return { code: verified.discount.code, state: verifiedDiscountState(verified) };
  } catch {
    return null;
  }
}
