import { useEffect, useState } from "react";

export type PricingTier = "BASIC" | "PREMIUM" | "VIP";

export interface CoachProgram {
  id: string;
  name: string;
  slug: string;
  description: string;
  pricingTier: PricingTier;
  priceAmount: number;
  priceCurrency: string;
  durationWeeks?: number;
  monthlyPriceAmount?: number;
  fullProgramPriceAmount?: number;
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

export type SignupBillingInterval = "MONTHLY" | "FULL_PROGRAM";

export function signupUrl(
  programId: string,
  billingInterval: SignupBillingInterval,
  opts?: { durationWeeks?: number },
) {
  const params = new URLSearchParams();
  params.set("coachProgramConfigId", programId);
  params.set("billingInterval", billingInterval);
  if (opts?.durationWeeks) params.set("durationWeeks", String(opts.durationWeeks));
  return `https://yobody.ai/signup?${params.toString()}`;
}
