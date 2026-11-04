import { formatUsd } from "./plans";
import type { SignupBillingInterval } from "./types";

const money = (amount: number) => (Number.isInteger(amount) ? `$${amount}` : formatUsd(amount));

/**
 * The billing line under the pay button.
 *
 * A discount code applies to the first payment only, so with a code the line
 * says what she pays today and what the plan costs after that. Both amounts
 * come from the plan (`planAmount` is the plan's own price, `totalAmount` is
 * what today's payment is after the code); nothing here knows a price.
 */
export function checkoutTermsCadence(args: {
  billingInterval: SignupBillingInterval;
  planAmount: number;
  totalAmount: number;
}): string {
  const { billingInterval, planAmount, totalAmount } = args;
  if (billingInterval === "FULL_PROGRAM") {
    return `One payment of ${money(totalAmount)} for the full program — no renewal.`;
  }
  const renews = (amount: number) =>
    billingInterval === "MULTI_MONTH"
      ? `${money(amount)} every 3 months`
      : `${money(amount)}/month`;
  if (totalAmount < planAmount) {
    return `${money(totalAmount)} today, then ${renews(planAmount)}, cancel anytime.`;
  }
  return `${renews(totalAmount)}, cancel anytime.`;
}
