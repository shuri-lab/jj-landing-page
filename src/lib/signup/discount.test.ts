import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { restoreRememberedDiscount } from "./discount";
import {
  clearSignupIntentSession,
  forgetSignupDiscountCode,
  getRememberedSignupDiscountCode,
  getSignupIntentSession,
  rememberSignupDiscountCode,
  saveSignupIntentSession,
} from "./session";
import type { VerifiedDiscount } from "./types";

const verifiedDiscount = (code = "SUMMER100"): VerifiedDiscount => ({
  valid: true,
  discount: {
    code,
    type: "PERCENTAGE",
    value: 100,
    amountOff: 47,
    originalAmount: 47,
    discountedAmount: 0,
    currency: "USD",
  },
});

describe("restoreRememberedDiscount", () => {
  it("verifies the remembered code again and returns the card state for it", async () => {
    const verify = vi.fn().mockResolvedValue(verifiedDiscount());
    const restored = await restoreRememberedDiscount({ rememberedCode: "SUMMER100", verify });
    expect(verify).toHaveBeenCalledWith("SUMMER100");
    expect(restored).toEqual({
      code: "SUMMER100",
      state: {
        verified: true,
        code: "SUMMER100",
        amountOff: 47,
        discountedAmount: 0,
        message: "Discount applied.",
      },
    });
  });

  it("verifies the code in upper case and returns the server's spelling of it", async () => {
    const verify = vi.fn().mockResolvedValue(verifiedDiscount("SUMMER100"));
    const restored = await restoreRememberedDiscount({ rememberedCode: " summer100 ", verify });
    expect(verify).toHaveBeenCalledWith("SUMMER100");
    expect(restored?.code).toBe("SUMMER100");
  });

  it.each([null, undefined, "", "   "])("restores nothing for %j", async (rememberedCode) => {
    const verify = vi.fn();
    expect(await restoreRememberedDiscount({ rememberedCode, verify })).toBeNull();
    expect(verify).not.toHaveBeenCalled();
  });

  it("restores nothing when the code no longer verifies, instead of failing the resume", async () => {
    const verify = vi.fn().mockRejectedValue(new Error("Invalid or expired discount code."));
    expect(await restoreRememberedDiscount({ rememberedCode: "OLD", verify })).toBeNull();
  });
});

describe("the remembered discount code", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("comes back for the signup it was applied to, after the session is saved again", () => {
    rememberSignupDiscountCode("intent-1", "SUMMER100");
    // Every step of the checkout saves the session again.
    saveSignupIntentSession({ intentId: "intent-1", intentToken: "token-1" });
    saveSignupIntentSession({ intentId: "intent-1", intentToken: "token-1", email: "a@b.co" });
    expect(getSignupIntentSession()?.intentId).toBe("intent-1");
    expect(getRememberedSignupDiscountCode("intent-1")).toBe("SUMMER100");
  });

  it("is not another signup's", () => {
    rememberSignupDiscountCode("intent-1", "SUMMER100");
    expect(getRememberedSignupDiscountCode("intent-2")).toBeNull();
  });

  it("is gone once she changes the code", () => {
    rememberSignupDiscountCode("intent-1", "SUMMER100");
    forgetSignupDiscountCode();
    expect(getRememberedSignupDiscountCode("intent-1")).toBeNull();
  });

  it("is gone when the signup session is cleared", () => {
    rememberSignupDiscountCode("intent-1", "SUMMER100");
    clearSignupIntentSession();
    expect(getRememberedSignupDiscountCode("intent-1")).toBeNull();
  });

  it("is ignored when what is stored is not a remembered code", () => {
    store.set("yobody-signup-discount", "not json");
    expect(getRememberedSignupDiscountCode("intent-1")).toBeNull();
    store.set("yobody-signup-discount", JSON.stringify({ intentId: "intent-1", code: 7 }));
    expect(getRememberedSignupDiscountCode("intent-1")).toBeNull();
  });
});
