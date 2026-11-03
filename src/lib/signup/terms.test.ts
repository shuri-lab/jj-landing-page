import { describe, expect, it } from "vitest";
import { checkoutTermsCadence } from "./terms";

describe("checkoutTermsCadence", () => {
  it("without a code, says what the plan costs each month", () => {
    expect(
      checkoutTermsCadence({ billingInterval: "MONTHLY", planAmount: 47, totalAmount: 47 }),
    ).toBe("$47/month, cancel anytime.");
  });

  it("with a 100% code, says $0 today and then the plan's price", () => {
    expect(
      checkoutTermsCadence({ billingInterval: "MONTHLY", planAmount: 47, totalAmount: 0 }),
    ).toBe("$0 today, then $47/month, cancel anytime.");
  });

  it("takes both amounts from the plan, so another price reads right too", () => {
    expect(
      checkoutTermsCadence({ billingInterval: "MONTHLY", planAmount: 77, totalAmount: 0 }),
    ).toBe("$0 today, then $77/month, cancel anytime.");
    expect(
      checkoutTermsCadence({ billingInterval: "MONTHLY", planAmount: 47, totalAmount: 23.5 }),
    ).toBe("$23.50 today, then $47/month, cancel anytime.");
  });

  it("never says $0/month, with or without a code", () => {
    for (const totalAmount of [0, 47]) {
      expect(
        checkoutTermsCadence({ billingInterval: "MONTHLY", planAmount: 47, totalAmount }),
      ).not.toContain("$0/month");
    }
  });

  it("keeps the quarterly plan's wording, with a code too", () => {
    expect(
      checkoutTermsCadence({ billingInterval: "MULTI_MONTH", planAmount: 129, totalAmount: 129 }),
    ).toBe("$129 every 3 months, cancel anytime.");
    expect(
      checkoutTermsCadence({ billingInterval: "MULTI_MONTH", planAmount: 129, totalAmount: 0 }),
    ).toBe("$0 today, then $129 every 3 months, cancel anytime.");
  });

  it("keeps the full program's one payment, with no renewal", () => {
    expect(
      checkoutTermsCadence({ billingInterval: "FULL_PROGRAM", planAmount: 297, totalAmount: 297 }),
    ).toBe("One payment of $297 for the full program — no renewal.");
    expect(
      checkoutTermsCadence({ billingInterval: "FULL_PROGRAM", planAmount: 297, totalAmount: 0 }),
    ).toBe("One payment of $0 for the full program — no renewal.");
  });
});
