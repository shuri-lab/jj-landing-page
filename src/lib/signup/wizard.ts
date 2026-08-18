import type { CheckoutCardStep, SignupIntentResponse } from "./types";

const WIZARD_STEPS: CheckoutCardStep[] = ["contact", "payment", "success"];

export function wizardIndex(step: CheckoutCardStep): number {
  return Math.max(0, WIZARD_STEPS.indexOf(step));
}

export function mapIntentToWizardStep(
  response: Pick<SignupIntentResponse, "step" | "paymentComplete">,
): CheckoutCardStep {
  if (response.paymentComplete) return "success";
  if (response.step === "checkout") return "payment";
  return "contact";
}
