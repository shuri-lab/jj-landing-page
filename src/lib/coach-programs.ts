import { useEffect, useState } from "react";

export type PricingTier = "BASIC" | "PREMIUM" | "VIP";

export interface CoachProgram {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricingTier: PricingTier;
  priceAmount: number | null;
  priceCurrency: string;
  durationWeeks?: number;
  monthlyPriceAmount?: number | null;
  multiMonthPriceAmount?: number | null;
  multiMonthIntervalCount?: number | null;
  fullProgramPriceAmount?: number | null;
  supportedBillingIntervals?: SignupBillingInterval[];
  programLabel?: string | null;
}

const ENDPOINT = "https://api.yoplatform.ai/helpers/public/coach-programs";

let cache: CoachProgram[] | null = null;
let inflight: Promise<CoachProgram[]> | null = null;

function fetchPrograms(): Promise<CoachProgram[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch(ENDPOINT)
    .then((r) => r.json())
    .then((j) => {
      const programs: CoachProgram[] = j?.data?.programs ?? [];
      cache = programs;
      return programs;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function useCoachPrograms() {
  const [programs, setPrograms] = useState<CoachProgram[] | null>(cache);

  useEffect(() => {
    if (cache) return;
    let active = true;
    fetchPrograms()
      .then((p) => {
        if (active) setPrograms(p);
      })
      .catch(() => {
        if (active) setPrograms([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const byTier = (tier: PricingTier) => programs?.find((p) => p.pricingTier === tier) ?? null;

  return { programs, basic: byTier("BASIC"), premium: byTier("PREMIUM") };
}

export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export type SignupBillingInterval = "MONTHLY" | "MULTI_MONTH" | "FULL_PROGRAM";

const SIGNUP_BASE = "https://yobody.ai/signup";

export function signupUrl(
  programId: string,
  billingInterval: SignupBillingInterval = "MONTHLY",
) {
  const params = new URLSearchParams();
  params.set("coachProgramConfigId", programId);
  if (billingInterval !== "MONTHLY") {
    params.set("billingInterval", billingInterval);
  }
  return `${SIGNUP_BASE}?${params.toString()}`;
}

export function monthlyAmount(program: CoachProgram): number | null {
  return program.monthlyPriceAmount ?? program.priceAmount ?? null;
}

export function supportedIntervals(program: CoachProgram): SignupBillingInterval[] {
  if (program.supportedBillingIntervals?.length) {
    return program.supportedBillingIntervals;
  }
  const intervals: SignupBillingInterval[] = [];
  const monthly = monthlyAmount(program);
  if (monthly != null && monthly > 0) intervals.push("MONTHLY");
  if (program.multiMonthPriceAmount != null && program.multiMonthPriceAmount > 0) {
    intervals.push("MULTI_MONTH");
  }
  if (program.fullProgramPriceAmount != null && program.fullProgramPriceAmount > 0) {
    intervals.push("FULL_PROGRAM");
  }
  return intervals.length ? intervals : ["MONTHLY"];
}

export function billingLabel(
  program: CoachProgram,
  interval: SignupBillingInterval,
): string {
  if (interval === "MULTI_MONTH") {
    const months =
      program.multiMonthIntervalCount && program.multiMonthIntervalCount >= 2
        ? program.multiMonthIntervalCount
        : 3;
    return `every ${months} months`;
  }
  if (interval === "FULL_PROGRAM") {
    const weeks = program.durationWeeks && program.durationWeeks > 0 ? program.durationWeeks : 12;
    const months = Math.max(1, Math.round(weeks / 4));
    return `for ${months} month${months === 1 ? "" : "s"} (paid in full)`;
  }
  return "billed monthly";
}

export function amountForInterval(
  program: CoachProgram,
  interval: SignupBillingInterval,
): number | null {
  if (interval === "MULTI_MONTH") return program.multiMonthPriceAmount ?? null;
  if (interval === "FULL_PROGRAM") return program.fullProgramPriceAmount ?? null;
  return monthlyAmount(program);
}
