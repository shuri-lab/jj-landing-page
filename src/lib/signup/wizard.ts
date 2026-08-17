import type { CheckoutCardStep, SignupIntentResponse } from "./types";

const WIZARD_STEPS: CheckoutCardStep[] = [
  "contact",
  "payment",
  "password",
  "phone",
  "success",
];

export function wizardIndex(step: CheckoutCardStep): number {
  if (step === "verify") return WIZARD_STEPS.indexOf("phone");
  return Math.max(0, WIZARD_STEPS.indexOf(step));
}

export function mapIntentToWizardStep(
  response: Pick<
    SignupIntentResponse,
    "step" | "paymentComplete" | "hasPassword" | "phoneVerified"
  >,
): CheckoutCardStep {
  if (response.step === "completed" || response.step === "schedule") {
    return "success";
  }
  if (response.step === "phone-verify" || response.phoneVerified) return "verify";
  if (response.step === "phone-entry") return "phone";
  if (response.step === "name-entry" || response.step === "create-password") {
    return "password";
  }
  if (response.paymentComplete || response.hasPassword) return "password";
  if (response.step === "checkout") return "payment";
  return "contact";
}
