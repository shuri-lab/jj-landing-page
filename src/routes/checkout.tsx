import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Lock } from "lucide-react";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import yoplatformLogo from "@/assets/landing/yoplatform-logo.png";
import heroA from "@/assets/landing/jj-hero-checkout.png";

type PlanId = "essential" | "plus";

const PLANS: Record<PlanId, { name: string; price: string; perMonth: string }> = {
  essential: { name: "Essential", price: "$197", perMonth: "$77/month" },
  plus: { name: "Plus", price: "$347", perMonth: "$147/month" },
};

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): { plan: PlanId } => {
    const p = search.plan === "plus" ? "plus" : "essential";
    return { plan: p };
  },
  head: () => ({
    meta: [
      { title: "Checkout — 12-Week Body Transformation" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "aol.com",
];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp: number[] = Array(n + 1).fill(0).map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[n];
}

function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();
  if (COMMON_DOMAINS.includes(domain)) return null;
  let best: { d: string; dist: number } | null = null;
  for (const d of COMMON_DOMAINS) {
    const dist = levenshtein(domain, d);
    if (dist > 0 && dist <= 2 && (!best || dist < best.dist)) {
      best = { d, dist };
    }
  }
  return best ? `${local}@${best.d}` : null;
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.4-11.2-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.2 5.2C41.1 35.3 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function CheckoutPage() {
  const { plan } = Route.useSearch() as { plan: PlanId };
  const planInfo = PLANS[plan];
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const [email, setEmail] = useState("");

  const suggestion = useMemo(() => suggestEmail(email), [email]);
  const canContinue = googleSignedIn || email.trim().length > 0;

  return (
    <div className="bg-background text-foreground overflow-x-hidden min-h-screen">
      {/* Top bar */}
      <div className="border-b border-line bg-background">
        <div className="mx-auto max-w-[640px] lg:max-w-[1200px] px-5 py-4 flex items-center justify-center gap-4">
          <img src={jjSmithLogo} alt="JJ Smith" className="h-5 sm:h-6 w-auto" />
          <span className="h-5 w-px bg-line" aria-hidden />
          <img src={yoplatformLogo} alt="YoPlatform" className="h-8 sm:h-9 w-auto" />
        </div>
      </div>

      {/* Order summary — flush with top bar */}
      <div className="border-b border-line bg-card">
        <div className="mx-auto max-w-[640px] lg:max-w-[1200px] px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-[16px] sm:text-[18px] leading-tight truncate min-w-0">
              12-Week Body Transformation
            </h2>
            <div className="font-serif text-[22px] sm:text-[24px] leading-none shrink-0">
              {planInfo.price}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] sm:text-[12px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-brand font-bold">✓</span> 14-day money-back guarantee
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-brand font-bold">✓</span> Limited spots
            </span>
          </div>
        </div>
      </div>

      <main className="px-5 pt-6 pb-16 sm:pt-8 sm:pb-20 lg:pt-10">
        <div className="mx-auto max-w-[640px]">

          {/* Headline */}
          <div className="text-center">
            <h1 className="font-serif font-medium text-[34px] sm:text-[52px] leading-[1.08] tracking-[-0.025em] mb-5">
              You're almost in.{" "}
              <em className="not-italic" style={{ color: "#c9635c" }}>
                Let's get you set up.
              </em>
            </h1>
            <p className="font-serif italic text-[18px] sm:text-[22px] leading-snug text-ink max-w-[520px] mx-auto">
              We just need your email to send your program access and receipt.
            </p>
          </div>

          {/* Hero image */}
          <div className="relative -mt-10 sm:-mt-14 aspect-square max-w-[260px] sm:max-w-[320px] mx-auto">
            <div
              aria-hidden
              className="absolute -inset-[40%] pointer-events-none z-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255, 182, 193, 0.7) 0%, rgba(255, 200, 210, 0.45) 30%, rgba(255, 220, 228, 0.2) 55%, rgba(255, 255, 255, 0) 80%)",
              }}
            />
            <img
              src={heroA}
              alt="JJ Smith"
              className="relative z-10 w-full h-full object-contain object-bottom"
            />
          </div>

          {/* Sign-in block, flush with hero */}
          <div className="relative z-20 -mt-4 sm:-mt-6">
            <button
              type="button"
              onClick={() => setGoogleSignedIn(true)}
              className="block w-full rounded-full bg-white border border-line text-ink px-6 py-5 text-[16px] sm:text-[18px] font-semibold shadow-[0_18px_36px_-18px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 text-center"
            >
              <span className="inline-flex items-center justify-center gap-3">
                {googleSignedIn ? (
                  <Check className="h-5 w-5 text-green-600" strokeWidth={3} />
                ) : (
                  <GoogleG className="h-5 w-5" />
                )}
                <span>
                  {googleSignedIn
                    ? "Signed in as test@email.com"
                    : "Continue with Google"}
                </span>
              </span>
            </button>

            {!googleSignedIn && (
              <>
                <div className="flex items-center gap-3 my-6">
                  <span className="h-px flex-1 bg-line" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-ink-faint font-semibold">
                    or continue with email
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="block w-full rounded-2xl bg-white border border-line px-5 py-4 text-[16px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-brand shadow-[0_10px_24px_-18px_rgba(0,0,0,0.15)]"
                />

                {suggestion && (
                  <p className="mt-2 text-[13px] text-ink-soft">
                    Did you mean{" "}
                    <button
                      type="button"
                      onClick={() => setEmail(suggestion)}
                      className="text-brand font-semibold underline underline-offset-2"
                    >
                      {suggestion}
                    </button>
                    ?
                  </p>
                )}
              </>
            )}

            {/* Primary CTA */}
            <button
              type="button"
              disabled={!canContinue}
              className={`mt-6 block w-full rounded-full px-6 py-6 text-[18px] sm:text-[20px] font-semibold tracking-wide text-center transition-all ${
                canContinue
                  ? "bg-brand text-white shadow-[0_18px_36px_-12px_rgba(184,80,66,0.6)] hover:-translate-y-0.5 hover:bg-brand-deep"
                  : "bg-brand/40 text-white/80 cursor-not-allowed"
              }`}
            >
              Continue to Payment →
            </button>

            <p className="mt-5 text-center text-[12px] text-ink-faint inline-flex items-center justify-center gap-1.5 w-full">
              <Lock className="h-3.5 w-3.5" />
              Secure checkout · Powered by Stripe · 14-day money-back guarantee
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}