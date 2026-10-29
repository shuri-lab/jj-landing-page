import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { Check, Lock } from "lucide-react";
import { landingSignupApi } from "@/lib/signup/api";
import {
  buildEmbeddedReturnUrl,
  buildLandingOfferUrl,
  buildMarketingAttribution,
  readCheckoutSessionIdFromUrl,
  readDiscountCodeFromUrl,
  readLandingPrefill,
} from "@/lib/signup/attribution";
import { buildContinueSignupUrl } from "@/lib/signup/continue-signup";
import { copyText, inAppName, isInAppBrowser, openInSystemBrowser } from "@/lib/signup/inapp";
import { isValidEmail, suggestEmail } from "@/lib/signup/email";
import {
  SMS_CONSENT_COPY,
  nextNationalPhoneInput,
  parseValidE164,
  pickDefaultCountry,
  reformatNationalPhone,
  startEmailPhoneField,
} from "@/lib/signup/phone";
import { envStripePublishableKey, envYobodyAuthUrl, envYobodyTermsUrl } from "@/lib/signup/env";
import { hydrateMetaClickIdsFromUrl } from "@/lib/signup/meta-pixel";
import { amountForInterval, formatUsd, pickLandingProgram } from "@/lib/signup/plans";
import {
  clearSignupIntentSession,
  getSignupIntentSession,
  saveSignupIntentSession,
} from "@/lib/signup/session";
import {
  trackAddPaymentInfo,
  trackCheckoutError,
  trackContinueToPayment,
  trackPaymentScreenView,
  trackPurchase,
  trackSignupLead,
  trackSignupMethodSelect,
  trackSignupScreenView,
} from "@/lib/signup/tracking";
import {
  categorizeCheckoutError,
  trackCheckoutError as trackPhCheckoutError,
  trackCheckoutStepViewed,
  trackLeadCaptured,
  trackLeadFormStarted,
  trackPurchaseConfirmedClientSide,
  trackStripeCheckoutLoaded,
} from "@/lib/analytics/events";
import { identifyLead } from "@/lib/analytics/posthog";
import { SignupApiError } from "@/lib/signup/types";
import type {
  CheckoutCardStep,
  LovablePublicConfig,
  OfferPlan,
  PublicCoachProgram,
  SignupIntentResponse,
  SignupMarketingAttribution,
} from "@/lib/signup/types";
import { mapIntentToWizardStep, wizardIndex } from "@/lib/signup/wizard";
import productMark from "@/assets/yobody-jj-smith-logo.png";
import "./signup-checkout-card.css";

type Props = {
  plan: OfferPlan;
  onChangePlan: () => void;
  /**
   * Attribution overrides for the lead this checkout creates. /start uses it
   * to carry the free-call lead id and its own source context. Omitted
   * everywhere else, so the landing pages behave exactly as before.
   */
  attribution?: Partial<SignupMarketingAttribution>;
  /**
   * Known contact details, when the page already knows who she is. /start
   * fills these from the lead on her join link so she is not asked twice.
   * The URL prefill still wins, since that is an explicit hand-off.
   */
  prefill?: { firstName?: string; lastName?: string; email?: string };
  /** Fired once the browser has seen the payment complete. */
  onPurchaseComplete?: (orderId: string | undefined) => void;
};

const STEP_COPY: Record<CheckoutCardStep, { title: string; sub: string }> = {
  contact: { title: "Create your account", sub: "" },
  payment: { title: "Payment", sub: "" },
  success: {
    title: "Payment successful",
    sub: "Please wait while we redirect you to get set up.",
  },
};

function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function signInUrl(email: string, loginBase?: string): string {
  const base = (loginBase || envYobodyAuthUrl()).replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", "signin");
  params.set("forceAuthMode", "signin");
  params.set("reason", "already-registered");
  if (email.trim()) params.set("email", email.trim());
  return `${base}?${params.toString()}`;
}

const PROGRESS_BARS = 2;

function Progress({ step }: { step: CheckoutCardStep }) {
  const filled = wizardIndex(step) <= 0 ? 1 : PROGRESS_BARS;
  return (
    <div className="chk-progress" aria-hidden="true">
      {Array.from({ length: PROGRESS_BARS }).map((_, i) => (
        <span key={i} className={i < filled ? "is-on" : undefined} />
      ))}
    </div>
  );
}

export function SignupCheckoutCard({
  plan,
  attribution,
  prefill: knownContact,
  onPurchaseComplete,
}: Props) {
  const urlPrefill = useMemo(() => readLandingPrefill(), []);
  // The URL wins: it is an explicit hand-off, for example the in-app browser
  // escape. A known lead only fills what the URL left empty.
  const prefill = useMemo(() => {
    const firstName = urlPrefill.firstName || knownContact?.firstName || "";
    const lastName = urlPrefill.lastName || knownContact?.lastName || "";
    return {
      ...urlPrefill,
      email: urlPrefill.email || knownContact?.email || "",
      firstName,
      lastName,
      fullName: urlPrefill.fullName || [firstName, lastName].filter(Boolean).join(" "),
    };
  }, [urlPrefill, knownContact?.email, knownContact?.firstName, knownContact?.lastName]);
  const urlDiscountCode = useMemo(() => (readDiscountCodeFromUrl() ?? "").trim().toUpperCase(), []);
  const [config, setConfig] = useState<LovablePublicConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [email, setEmail] = useState(prefill.email);
  const [fullName, setFullName] = useState(prefill.fullName);
  const [firstName, setFirstName] = useState(prefill.firstName);
  const [lastName, setLastName] = useState(prefill.lastName);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(() =>
    prefill.email ? suggestEmail(prefill.email) : null,
  );
  const [phone, setPhone] = useState("");
  const [phoneIso, setPhoneIso] = useState("US");
  const [smsConsent, setSmsConsent] = useState(false);
  const [step, setStep] = useState<CheckoutCardStep>("contact");
  const [intentToken, setIntentToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [handoffUrl, setHandoffUrl] = useState("");
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // "Open in your real browser" escape hatch, shown when the embedded checkout
  // fails inside a Facebook / Instagram in-app webview.
  const [escapeUrl, setEscapeUrl] = useState<string | null>(null);
  const [escapeHint, setEscapeHint] = useState<"idle" | "manual" | "copied">("idle");
  const [discountInput, setDiscountInput] = useState(urlDiscountCode);
  const [discountState, setDiscountState] = useState<{
    verified: boolean;
    code?: string;
    amountOff?: number;
    discountedAmount?: number;
    message?: string;
  }>({ verified: false });
  const [isVerifyingDiscount, setIsVerifyingDiscount] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(() => Boolean(urlDiscountCode));
  const [leadId, setLeadId] = useState<string | null>(null);
  const embeddedRef = useRef<HTMLDivElement | null>(null);
  const prepareKeyRef = useRef("");
  const resumedRef = useRef(false);

  const program: PublicCoachProgram | null = useMemo(
    () => pickLandingProgram(config?.programs, plan.billingInterval, plan.price),
    [config, plan.billingInterval, plan.price],
  );
  const liveAmount = amountForInterval(program, plan.billingInterval);
  const amount = typeof liveAmount === "number" ? liveAmount : plan.price;
  const amountOff = discountState.verified ? (discountState.amountOff ?? 0) : 0;
  const totalAmount = Math.max(0, amount - amountOff);
  const appliedDiscountCode =
    discountInput.trim() && discountState.verified
      ? (discountState.code ?? discountInput.trim())
      : null;
  const stripeKey = config?.stripePublishableKey || envStripePublishableKey();
  const stripePromise = useMemo(() => (stripeKey ? loadStripe(stripeKey) : null), [stripeKey]);
  const loginBase = config?.loginUrl || envYobodyAuthUrl();

  const phoneCountries = useMemo(() => {
    const list = (config?.countries ?? []).filter((c) => c.countryCode.trim());
    if (list.length > 0) return list;
    return [
      {
        id: "__default-us__",
        name: "United States",
        countryCode: "US",
        countryDialCode: "+1",
        flagEmoji: null,
      },
    ];
  }, [config?.countries]);
  const effectivePhoneIso = pickDefaultCountry(phoneCountries, phoneIso)?.countryCode ?? "US";
  const phoneE164 = useMemo(
    () => parseValidE164(phone, effectivePhoneIso),
    [phone, effectivePhoneIso],
  );
  const phoneReady = !phone.trim() || phoneE164 !== null;

  const handlePhoneChange = useCallback(
    (value: string) => {
      const next = nextNationalPhoneInput(value, effectivePhoneIso);
      if (next === null) return;
      setPhone(next);
      setError("");
    },
    [effectivePhoneIso],
  );

  const handlePhoneCountryChange = useCallback((iso: string) => {
    setPhoneIso(iso);
    setPhone((prev) => reformatNationalPhone(prev, iso));
    setError("");
  }, []);

  const trackingBase = useMemo(
    () => ({
      billing_interval: plan.billingInterval,
      content_id: program?.id,
      value: totalAmount,
      currency: (program?.priceCurrency || "USD").toUpperCase(),
      selected_plan: plan.cadenceLabel,
      tier: (program?.pricingTier || "standard").toLowerCase(),
    }),
    [plan, program, totalAmount],
  );

  // PostHog: first meaningful interaction with the contact step (once/session).
  const noteFormStarted = useCallback(() => {
    trackLeadFormStarted({
      billing_interval: plan.billingInterval,
      offer_id: program?.id,
    });
  }, [plan.billingInterval, program?.id]);

  const persistIntent = useCallback(
    (response: SignupIntentResponse, extras?: { firstName?: string; lastName?: string }) => {
      const token = response.intentToken ?? intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token) return;
      setIntentToken(token);
      if (response.checkoutSessionId) {
        setCheckoutSessionId(response.checkoutSessionId);
      }
      const existing = getSignupIntentSession();
      if (response.intentId) setLeadId(response.intentId);
      saveSignupIntentSession({
        intentId: response.intentId,
        intentToken: token,
        email: response.email || email || existing?.email,
        firstName: extras?.firstName || response.firstName || firstName || existing?.firstName,
        lastName: extras?.lastName || response.lastName || lastName || existing?.lastName,
        checkoutSessionId: response.checkoutSessionId || existing?.checkoutSessionId,
      });
    },
    [email, firstName, intentToken, lastName],
  );

  const rememberHandoff = useCallback(
    (response: SignupIntentResponse, nextEmail = email) => {
      const url = buildContinueSignupUrl({
        response,
        email: nextEmail || response.email,
        config,
      });
      setHandoffUrl(url);
      return url;
    },
    [config, email],
  );

  useEffect(() => {
    hydrateMetaClickIdsFromUrl();
    trackSignupScreenView(trackingBase);
  }, [trackingBase]);

  // PostHog: which checkout step the visitor reached. "payment" is recorded as
  // soon as the step opens, so the gap to yobody_stripe_checkout_loaded
  // measures payment UIs that never actually rendered.
  useEffect(() => {
    if (step !== "contact" && step !== "payment") return;
    trackCheckoutStepViewed(step, {
      billing_interval: plan.billingInterval,
      offer_id: program?.id,
    });
  }, [plan.billingInterval, program?.id, step]);

  // PostHog: Stripe Embedded Checkout has no onReady callback, so treat "the
  // iframe is in the DOM" as the ready signal rather than guessing from state.
  useEffect(() => {
    if (step !== "payment" || !clientSecret) return;
    const host = embeddedRef.current;
    if (!host) return;

    let fired = false;
    const check = () => {
      if (fired || !host.querySelector("iframe")) return;
      fired = true;
      observer.disconnect();
      trackStripeCheckoutLoaded({
        lead_id: leadId ?? getSignupIntentSession()?.intentId,
        offer_id: program?.id,
        billing_interval: plan.billingInterval,
        value: totalAmount,
        currency: (program?.priceCurrency || "USD").toUpperCase(),
        discount_applied: Boolean(discountState.verified),
      });
    };

    const observer = new MutationObserver(check);
    observer.observe(host, { childList: true, subtree: true });
    check();
    return () => observer.disconnect();
  }, [
    clientSecret,
    discountState.verified,
    leadId,
    plan.billingInterval,
    program?.id,
    program?.priceCurrency,
    step,
    totalAmount,
  ]);

  useEffect(() => {
    let cancelled = false;
    void landingSignupApi
      .getConfig()
      .then((payload) => {
        if (cancelled) return;
        setConfig(payload);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setConfigError(
          err instanceof SignupApiError ? err.message : "Checkout is unavailable right now.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recordPurchase = useCallback(
    (response: SignupIntentResponse, fallbackId?: string) => {
      if (!response.paymentComplete && !response.purchaseTracking) return;
      trackPurchase({
        transaction_id: response.purchaseTracking?.orderId ?? fallbackId ?? response.intentId,
        value: response.purchaseTracking?.value ?? totalAmount,
        currency: response.purchaseTracking?.currency ?? "USD",
        content_id: response.purchaseTracking?.contentId ?? program?.id,
        event_id: response.purchaseTracking?.eventId,
      });
      // Browser-side only. The authoritative purchase event is
      // yobody_purchase_completed, emitted from the Stripe webhook (see
      // TRACKING_PLAN.md — currently a backend dependency).
      trackPurchaseConfirmedClientSide({
        lead_id: response.intentId,
        order_id: response.purchaseTracking?.orderId ?? fallbackId ?? response.intentId,
        value: response.purchaseTracking?.value ?? totalAmount,
        currency: response.purchaseTracking?.currency ?? "USD",
        offer_id: response.purchaseTracking?.contentId ?? program?.id,
      });
      onPurchaseComplete?.(
        response.purchaseTracking?.orderId ?? fallbackId ?? response.intentId ?? undefined,
      );
    },
    [onPurchaseComplete, program?.id, totalAmount],
  );

  const enterPaidSuccess = useCallback(
    (response: SignupIntentResponse, fallbackId?: string) => {
      persistIntent(response);
      rememberHandoff(response);
      recordPurchase(response, fallbackId);
      clearSignupIntentSession();
      setStep("success");
    },
    [persistIntent, recordPurchase, rememberHandoff],
  );

  useEffect(() => {
    if (step !== "success" || !handoffUrl) return;
    const redirect = window.setTimeout(() => {
      window.location.assign(handoffUrl);
    }, 4500);
    return () => window.clearTimeout(redirect);
  }, [handoffUrl, step]);

  // Keep lastActivityAt fresh while the prospect is on contact/payment so the
  // 30-minute cart-abandon clock does not fire mid-checkout.
  useEffect(() => {
    if (step !== "contact" && step !== "payment") return;
    const token = intentToken ?? getSignupIntentSession()?.intentToken;
    if (!token) return;

    let cancelled = false;
    const ping = () => {
      if (cancelled || document.visibilityState === "hidden") return;
      void landingSignupApi.pingActivity(token).catch(() => undefined);
    };

    ping();
    const intervalId = window.setInterval(ping, 45_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intentToken, step]);

  const applyIntent = useCallback(
    async (response: SignupIntentResponse) => {
      const session = getSignupIntentSession();
      const nextFirst = response.firstName || session?.firstName || firstName;
      const nextLast = response.lastName || session?.lastName || lastName;
      persistIntent(response, { firstName: nextFirst, lastName: nextLast });
      if (response.email) setEmail(response.email);
      if (nextFirst) setFirstName(nextFirst);
      if (nextLast) setLastName(nextLast);
      if (nextFirst && !fullName.trim()) {
        setFullName([nextFirst, nextLast].filter(Boolean).join(" "));
      }
      if (response.paymentComplete) {
        enterPaidSuccess(response);
        return;
      }
      setStep(mapIntentToWizardStep(response));
    },
    [enterPaidSuccess, firstName, fullName, lastName, persistIntent],
  );

  useEffect(() => {
    if (!config || resumedRef.current) return;
    const session = getSignupIntentSession();
    const urlEmail = prefill.email.trim().toLowerCase();
    if (urlEmail && session?.email && session.email.trim().toLowerCase() !== urlEmail) {
      clearSignupIntentSession();
      resumedRef.current = true;
      return;
    }
    if (!session?.intentToken) {
      resumedRef.current = true;
      return;
    }
    resumedRef.current = true;
    setIntentToken(session.intentToken);
    if (session.checkoutSessionId) setCheckoutSessionId(session.checkoutSessionId);
    if (session.email && !prefill.email) setEmail(session.email);
    if (session.firstName && !prefill.firstName) setFirstName(session.firstName);
    if (session.lastName && !prefill.lastName) setLastName(session.lastName);
    if (!prefill.fullName && (session.firstName || session.lastName)) {
      setFullName([session.firstName, session.lastName].filter(Boolean).join(" "));
    }
    void landingSignupApi
      .me(session.intentToken)
      .then(async (response) => {
        await applyIntent(response);
        if (!response.paymentComplete && mapIntentToWizardStep(response) === "payment") {
          const returningSessionId = readCheckoutSessionIdFromUrl();
          if (returningSessionId) {
            const verified = await landingSignupApi.verifyCheckout({
              intentToken: session.intentToken,
              checkoutSessionId: returningSessionId,
            });
            persistIntent(verified);
            rememberHandoff(verified);
            if (verified.paymentComplete) {
              enterPaidSuccess(verified, returningSessionId);
              return;
            }
          }
          const checkout = await landingSignupApi.createCheckout({
            intentToken: session.intentToken,
            coachProgramConfigId: program?.id,
            discountCode: appliedDiscountCode,
            billingInterval: plan.billingInterval,
            returnUrl: buildEmbeddedReturnUrl({
              plan: plan.id,
              email: session.email || email,
              firstName: session.firstName || firstName,
              lastName: session.lastName || lastName,
            }),
            marketingAttribution: buildMarketingAttribution({
              sourceSurface: "landing",
              sourceContext: "checkout",
              buttonPosition: plan.buttonPosition,
              ctaText: plan.ctaLabel,
              tier: trackingBase.tier,
            }),
          });
          persistIntent(checkout);
          rememberHandoff(checkout);
          if (checkout.paymentComplete) {
            enterPaidSuccess(checkout);
            return;
          }
          if (checkout.checkoutSessionId) {
            setCheckoutSessionId(checkout.checkoutSessionId);
          }
          if (checkout.clientSecret) setClientSecret(checkout.clientSecret);
        }
      })
      .catch(() => {
        clearSignupIntentSession();
        setIntentToken(null);
      });
  }, [
    appliedDiscountCode,
    applyIntent,
    config,
    email,
    enterPaidSuccess,
    firstName,
    lastName,
    persistIntent,
    plan,
    prefill.email,
    prefill.firstName,
    prefill.fullName,
    prefill.lastName,
    program?.id,
    rememberHandoff,
    trackingBase.tier,
  ]);

  const handleExistingEmail = useCallback(
    (value: string) => {
      clearSignupIntentSession();
      setIntentToken(null);
      setError("This email is already registered. Please sign in instead.");
      window.setTimeout(() => {
        window.location.assign(signInUrl(value, loginBase));
      }, 1200);
    },
    [loginBase],
  );

  const ensureSignupIntent = useCallback(
    async (contactFirst: string, contactLast: string, opts?: { includePhone?: boolean }) => {
      if (!config?.coachId) {
        throw new Error("No coaching program is available right now.");
      }
      let token = intentToken ?? getSignupIntentSession()?.intentToken ?? null;
      const hadSession = Boolean(token);
      const started = await landingSignupApi.startEmail({
        email: email.trim(),
        coachId: config.coachId,
        coachProgramConfigId: program?.id,
        billingInterval: plan.billingInterval,
        firstName: contactFirst,
        lastName: contactLast || undefined,
        ...startEmailPhoneField(opts?.includePhone, phoneE164, smsConsent),
        marketingAttribution: buildMarketingAttribution({
          sourceSurface: "landing",
          sourceContext: "landing-page",
          buttonPosition: plan.buttonPosition,
          ctaText: plan.ctaLabel,
          tier: trackingBase.tier,
          ...attribution,
        }),
      });
      persistIntent(started, { firstName: contactFirst, lastName: contactLast });
      rememberHandoff(started);
      // PostHog: Step 1 accepted. `intentId` is the durable backend lead id, so
      // it becomes the person identity — never the email address.
      if (started.intentId) {
        const hasPhone = Boolean(opts?.includePhone !== false && phoneE164);
        identifyLead(started.intentId, {
          lead_created: true,
          has_phone: hasPhone,
          sms_consent: Boolean(hasPhone && smsConsent),
        });
        trackLeadCaptured({
          lead_id: started.intentId,
          has_phone: hasPhone,
          sms_consent: Boolean(hasPhone && smsConsent),
          billing_interval: plan.billingInterval,
          offer_id: program?.id,
          value: totalAmount,
          currency: (program?.priceCurrency || "USD").toUpperCase(),
        });
      }
      token = started.intentToken ?? token;
      if (!token) throw new Error("Missing signup session.");
      return { token, started, hadSession };
    },
    [
      attribution,
      config?.coachId,
      email,
      intentToken,
      persistIntent,
      phoneE164,
      smsConsent,
      plan.billingInterval,
      plan.buttonPosition,
      plan.ctaLabel,
      program?.id,
      rememberHandoff,
      trackingBase.tier,
    ],
  );

  const handleVerifyDiscount = useCallback(async () => {
    const code = discountInput.trim();
    if (!code) return;
    const { firstName: contactFirst, lastName: contactLast } = splitFullName(fullName);
    if (!isValidEmail(email) || !contactFirst) {
      setDiscountState({
        verified: false,
        message: "Enter your email and full name before applying a discount.",
      });
      return;
    }
    if (!config?.coachId) {
      setDiscountState({
        verified: false,
        message: "No coaching program is available right now.",
      });
      return;
    }

    setIsVerifyingDiscount(true);
    setError("");
    try {
      setFirstName(contactFirst);
      setLastName(contactLast);
      const { token } = await ensureSignupIntent(contactFirst, contactLast, {
        includePhone: false,
      });
      // No coachProgramConfigId: the intent already carries the
      // server-resolved program from start, and a price-matched guess here
      // can point at a different coach's program and fail verification.
      const verified = await landingSignupApi.verifyDiscount({
        intentToken: token,
        discountCode: code,
        billingInterval: plan.billingInterval,
      });
      setDiscountState({
        verified: true,
        code: verified.discount.code,
        amountOff: verified.discount.amountOff,
        discountedAmount: verified.discount.discountedAmount,
        message: "Discount applied.",
      });
      setDiscountInput(verified.discount.code);
      setDiscountOpen(false);
      setClientSecret(null);
      prepareKeyRef.current = "";
    } catch (err) {
      if (err instanceof SignupApiError && err.statusCode === 409) {
        handleExistingEmail(email);
        return;
      }
      setDiscountState({
        verified: false,
        message: err instanceof SignupApiError ? err.message : "Invalid or expired discount code.",
      });
    } finally {
      setIsVerifyingDiscount(false);
    }
  }, [
    config?.coachId,
    discountInput,
    email,
    ensureSignupIntent,
    fullName,
    handleExistingEmail,
    plan.billingInterval,
    program?.id,
  ]);

  const prepareCheckout = useCallback(async () => {
    const { firstName: contactFirst, lastName: contactLast } = splitFullName(fullName);
    if (!isValidEmail(email) || !contactFirst) return;
    if (phone.trim() && !phoneE164) {
      setError("Please enter a valid phone number, or leave it blank.");
      return;
    }
    if (!config?.coachId) {
      setError("No coaching program is available right now.");
      return;
    }
    const trimmedDiscount = discountInput.trim();
    if (trimmedDiscount && !discountState.verified) {
      setError("Please apply your discount code before continuing.");
      return;
    }

    setFirstName(contactFirst);
    setLastName(contactLast);
    const prepareKey = `${email.trim().toLowerCase()}|${plan.billingInterval}|${program?.id ?? "auto"}|${appliedDiscountCode ?? ""}`;
    if (prepareKeyRef.current === prepareKey && clientSecret) {
      setStep("payment");
      return;
    }

    setIsPreparing(true);
    setError("");
    setEscapeUrl(null);
    setEscapeHint("idle");
    setStep("payment");
    let stage: "start_email" | "create_checkout" = "start_email";
    try {
      const { token, started, hadSession } = await ensureSignupIntent(contactFirst, contactLast);
      if (!hadSession) {
        trackSignupMethodSelect("email", trackingBase);
        trackSignupLead(trackingBase);
        trackContinueToPayment(trackingBase);
      }
      if (started.paymentComplete) {
        enterPaidSuccess(started);
        return;
      }

      stage = "create_checkout";
      // Same as verify above: let the server price the intent's own
      // resolved program instead of overriding it with a local guess.
      const checkout = await landingSignupApi.createCheckout({
        intentToken: token,
        discountCode: appliedDiscountCode,
        billingInterval: plan.billingInterval,
        returnUrl: buildEmbeddedReturnUrl({
          plan: plan.id,
          email: email.trim(),
          firstName: contactFirst,
          lastName: contactLast,
        }),
        marketingAttribution: buildMarketingAttribution({
          sourceSurface: "landing",
          sourceContext: "checkout",
          buttonPosition: plan.buttonPosition,
          ctaText: plan.ctaLabel,
          tier: trackingBase.tier,
        }),
      });
      persistIntent(checkout, { firstName: contactFirst, lastName: contactLast });
      rememberHandoff(checkout);
      if (checkout.paymentComplete) {
        enterPaidSuccess(checkout);
        return;
      }
      if (!checkout.clientSecret) {
        throw new Error(checkout.message || "Unable to initialize payment.");
      }
      prepareKeyRef.current = prepareKey;
      if (checkout.checkoutSessionId) {
        setCheckoutSessionId(checkout.checkoutSessionId);
      }
      setClientSecret(checkout.clientSecret);
      setStep("payment");
      trackPaymentScreenView(trackingBase);
    } catch (err) {
      if (err instanceof SignupApiError && err.statusCode === 409) {
        handleExistingEmail(email);
        return;
      }
      const statusCode = err instanceof SignupApiError ? err.statusCode : undefined;
      const message = err instanceof Error ? err.message : "Unable to start checkout.";
      const inApp = isInAppBrowser();
      trackCheckoutError(trackingBase, {
        stage,
        statusCode,
        message,
        inApp,
      });
      trackPhCheckoutError({
        error_category: categorizeCheckoutError({ stage, statusCode, message }),
        checkout_step: stage === "start_email" ? "contact" : "payment",
        status_code: statusCode,
        in_app_browser: inApp,
      });
      setStep("contact");
      setError(message);
      if (inApp && typeof window !== "undefined") {
        setEscapeUrl(
          window.location.origin +
            buildLandingOfferUrl({
              plan: plan.id,
              email: email.trim() || undefined,
              firstName: contactFirst || undefined,
              lastName: contactLast || undefined,
            }),
        );
        setEscapeHint("idle");
      }
    } finally {
      setIsPreparing(false);
    }
  }, [
    appliedDiscountCode,
    clientSecret,
    config?.coachId,
    discountInput,
    discountState.verified,
    email,
    ensureSignupIntent,
    enterPaidSuccess,
    fullName,
    handleExistingEmail,
    persistIntent,
    phone,
    phoneE164,
    plan,
    program,
    rememberHandoff,
    trackingBase,
  ]);

  const handlePaymentCompleted = useCallback(
    async (sessionId: string) => {
      const token = intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token) {
        setError("Signup session missing. Please try again.");
        return;
      }
      setIsBusy(true);
      setError("");
      trackAddPaymentInfo(trackingBase);
      try {
        const verified = await landingSignupApi.verifyCheckout({
          intentToken: token,
          checkoutSessionId: sessionId,
        });
        persistIntent(verified, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        if (firstName.trim()) {
          await landingSignupApi
            .updateProfile({
              intentToken: token,
              firstName: firstName.trim(),
              lastName: lastName.trim() || undefined,
            })
            .catch(() => undefined);
        }
        if (!verified.paymentComplete) {
          throw new Error(
            verified.message || "Payment is still confirming. Please wait a moment and try again.",
          );
        }
        enterPaidSuccess(verified, sessionId);
      } catch (err) {
        setError(
          err instanceof SignupApiError
            ? err.message
            : "Payment confirmed but we could not finish signup. Please contact support.",
        );
      } finally {
        setIsBusy(false);
      }
    },
    [enterPaidSuccess, firstName, intentToken, lastName, persistIntent, trackingBase],
  );

  const canContinueContact =
    isValidEmail(email) &&
    splitFullName(fullName).firstName.length > 0 &&
    phoneReady &&
    !isPreparing &&
    !isVerifyingDiscount &&
    !configError &&
    !(discountInput.trim() && !discountState.verified);

  const embeddedOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? undefined,
      onComplete: () => {
        const sessionId = checkoutSessionId ?? getSignupIntentSession()?.checkoutSessionId;
        if (sessionId) void handlePaymentCompleted(sessionId);
      },
    }),
    [checkoutSessionId, clientSecret, handlePaymentCompleted],
  );

  const handleOpenInBrowser = () => {
    if (!escapeUrl) return;
    trackCheckoutError(trackingBase, { stage: "open_external", inApp: true });
    const result = openInSystemBrowser(escapeUrl);
    if (result === "manual") {
      setEscapeHint("manual");
      void copyText(escapeUrl).then((ok) => {
        if (ok) setEscapeHint("copied");
      });
    }
  };

  const renderEscape = () =>
    escapeUrl ? (
      <div className="chk-escape">
        <p className="chk-escape-title">Payment couldn’t load in the {inAppName()} browser.</p>
        <p className="chk-escape-sub">
          Open this page in your phone’s browser to finish securely — your spot and details carry
          over.
        </p>
        <button type="button" className="chk-pay chk-escape-btn" onClick={handleOpenInBrowser}>
          Open in your phone browser →
        </button>
        {escapeHint === "manual" ? (
          <p className="chk-escape-hint">
            Tap the <strong>•••</strong> (or <strong>Aa</strong>) menu at the top and choose{" "}
            <strong>“Open in Browser”</strong>. We copied the link too — paste it into Safari if
            needed.
          </p>
        ) : escapeHint === "copied" ? (
          <p className="chk-escape-hint">
            Link copied. Open Safari or Chrome and paste it to finish.
          </p>
        ) : null}
      </div>
    ) : null;

  const renderRight = () => {
    if (step === "success") {
      return (
        <div className="chk-success">
          <div className="chk-success-icon">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="chk-title">Payment successful</h3>
          <p className="chk-sub">Please wait while we redirect you to get set up.</p>
          {handoffUrl ? (
            <div className="chk-actions">
              <a
                className="chk-pay"
                href={handoffUrl}
                style={{
                  display: "grid",
                  placeItems: "center",
                  textDecoration: "none",
                  color: "white",
                }}
              >
                Continue
              </a>
            </div>
          ) : (
            <p className="chk-hint">Preparing your next step…</p>
          )}
        </div>
      );
    }

    if (step === "payment") {
      const termsAmount = Number.isInteger(totalAmount)
        ? `$${totalAmount}`
        : formatUsd(totalAmount);
      const termsCadence =
        plan.billingInterval === "FULL_PROGRAM"
          ? `One payment of ${termsAmount} for the full program — no renewal.`
          : plan.billingInterval === "MULTI_MONTH"
            ? `${termsAmount} every 3 months, cancel anytime.`
            : `${termsAmount}/month, cancel anytime.`;
      return (
        <>
          {clientSecret && stripePromise ? (
            <div className="chk-embedded" ref={embeddedRef}>
              <EmbeddedCheckoutProvider stripe={stripePromise} options={embeddedOptions}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
              {isBusy ? (
                <p className="chk-hint" role="status" aria-live="polite">
                  Verifying payment…
                </p>
              ) : null}
              {/*
                Stripe Embedded Checkout always places custom_text.submit ABOVE
                the Pay button (no API to move it). We own the disclosure here
                so it sits below the iframe / Pay button instead.
              */}
              <p className="chk-terms chk-terms--below-pay">
                By continuing, you agree to our{" "}
                <a href={envYobodyTermsUrl()} target="_blank" rel="noopener noreferrer">
                  Terms &amp; Conditions
                </a>
                . {termsCadence}
              </p>
            </div>
          ) : (
            <div className="chk-pay-loading" role="status" aria-live="polite">
              <span className="chk-pay-spinner" aria-hidden="true" />
              <p>Loading secure payment…</p>
            </div>
          )}
          {error ? <p className="chk-error">{error}</p> : null}
          {renderEscape()}
        </>
      );
    }

    return (
      <>
        <div className="chk-field">
          <label htmlFor="chk-email">Email</label>
          <input
            id="chk-email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              noteFormStarted();
              setEmail(e.target.value);
              setEmailSuggestion(suggestEmail(e.target.value));
              setError("");
            }}
            onBlur={() => setEmailSuggestion(suggestEmail(email))}
          />
          {emailSuggestion ? (
            <p className="chk-hint">
              Did you mean{" "}
              <button
                type="button"
                className="chk-link"
                onClick={() => {
                  setEmail(emailSuggestion);
                  setEmailSuggestion(null);
                }}
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          ) : null}
        </div>

        <div className="chk-field">
          <label htmlFor="chk-fullname">Full name</label>
          <input
            id="chk-fullname"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => {
              noteFormStarted();
              setFullName(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="chk-field">
          <label htmlFor="chk-phone">
            Phone number <span className="chk-optional">(optional)</span>
          </label>
          <div className="chk-phone-row">
            <select
              className="chk-country"
              aria-label="Country code"
              value={effectivePhoneIso}
              onChange={(e) => handlePhoneCountryChange(e.target.value)}
              disabled={isPreparing || isVerifyingDiscount}
            >
              {phoneCountries.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.flagEmoji ? `${c.flagEmoji} ` : ""}
                  {c.countryDialCode} · {c.name}
                </option>
              ))}
            </select>
            <input
              id="chk-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => {
                noteFormStarted();
                handlePhoneChange(e.target.value);
              }}
              disabled={isPreparing || isVerifyingDiscount}
            />
          </div>
          {phone.trim() && !phoneE164 ? (
            <p className="chk-error" style={{ margin: 0 }}>
              Enter a valid phone number, or leave it blank.
            </p>
          ) : null}
          {/* The phone number is optional, so with the field empty there is
              nothing to consent to and the checkbox only reads as another
              required step. startEmailPhoneField already refuses to send
              consent without a valid number, so hiding it changes nothing
              that reaches the server. */}
          {phone.trim() ? (
            <label htmlFor="chk-sms-consent" className="chk-consent">
              <input
                id="chk-sms-consent"
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                disabled={isPreparing || isVerifyingDiscount}
              />
              <span>{SMS_CONSENT_COPY}</span>
            </label>
          ) : null}
        </div>

        {urlDiscountCode ? (
          <div className="chk-discount">
            {discountState.verified && !discountOpen ? (
              <div className="chk-discount-applied">
                <p className="chk-discount-ok">
                  Code <strong>{discountState.code ?? discountInput}</strong> applied
                  {amountOff > 0 ? ` · save ${formatUsd(amountOff)}` : ""}.
                </p>
                <button
                  type="button"
                  className="chk-discount-toggle"
                  onClick={() => setDiscountOpen(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="chk-discount-toggle"
                  aria-expanded={discountOpen}
                  onClick={() => {
                    setDiscountOpen((open) => {
                      if (open && !discountState.verified) {
                        setDiscountState({ verified: false });
                        setClientSecret(null);
                        prepareKeyRef.current = "";
                        setError("");
                      }
                      return !open;
                    });
                  }}
                >
                  {discountOpen ? "Hide discount code" : "Have a discount code?"}
                </button>
                {discountOpen ? (
                  <div className="chk-field chk-discount-fields">
                    <label htmlFor="chk-discount">Discount code</label>
                    <div className="chk-discount-row">
                      <input
                        id="chk-discount"
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Enter code"
                        value={discountInput}
                        onChange={(e) => {
                          setDiscountInput(e.target.value.toUpperCase());
                          if (discountState.verified || discountState.message) {
                            setDiscountState({ verified: false });
                          }
                          setClientSecret(null);
                          prepareKeyRef.current = "";
                          setError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleVerifyDiscount();
                          }
                        }}
                        disabled={isPreparing || isVerifyingDiscount}
                      />
                      <button
                        type="button"
                        className="chk-discount-apply"
                        disabled={
                          !discountInput.trim() ||
                          isVerifyingDiscount ||
                          discountState.verified ||
                          isPreparing
                        }
                        onClick={() => void handleVerifyDiscount()}
                      >
                        {isVerifyingDiscount
                          ? "Applying…"
                          : discountState.verified
                            ? "Applied"
                            : "Apply"}
                      </button>
                    </div>
                    {discountState.message ? (
                      <p className={discountState.verified ? "chk-discount-ok" : "chk-error"}>
                        {discountState.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {configError ? <p className="chk-error">{configError}</p> : null}
        {error ? <p className="chk-error">{error}</p> : null}
        {renderEscape()}

        <div className="chk-actions">
          <button
            type="button"
            className="chk-pay"
            disabled={!canContinueContact || !stripePromise}
            onClick={() => void prepareCheckout()}
          >
            {isPreparing ? "Opening checkout…" : "Continue to checkout"}
          </button>
        </div>
        {/* Same short disclosure as the payment step (shown below the CTA). */}
        <p className="chk-terms">
          By continuing, you agree to our{" "}
          <a href={envYobodyTermsUrl()} target="_blank" rel="noopener noreferrer">
            Terms &amp; Conditions
          </a>
          . Cancel anytime.
        </p>
        {!stripePromise && !configError ? (
          <p className="chk-error">Stripe publishable key is missing.</p>
        ) : null}
      </>
    );
  };

  return (
    <div className="chk" id="checkout-card">
      <div className="chk-shell">
        <div className="chk-body">
          <div className="chk-package">
            <img src={productMark} alt="" className="chk-thumb" />
            <div className="chk-product-copy">
              <div className="chk-product-name">Yobody By JJ Smith</div>
              <p className="chk-package-plan">
                {formatUsd(amount)} {plan.cadenceLabel}
                {amountOff > 0 ? ` · save ${formatUsd(amountOff)}` : ""}
              </p>
            </div>
            <div className="chk-package-due">
              <span>Due now</span>
              <strong>USD {formatUsd(totalAmount)}</strong>
            </div>
          </div>

          {step !== "success" ? (
            <>
              <Progress step={step} />
              <header className="chk-header">
                <h2 className="chk-title">{STEP_COPY[step].title}</h2>
                {STEP_COPY[step].sub ? <p className="chk-sub">{STEP_COPY[step].sub}</p> : null}
              </header>
            </>
          ) : null}

          {renderRight()}
          {step !== "success" ? (
            <p className="chk-secure">
              <Lock size={13} />
              Transactions are secure and encrypted
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
