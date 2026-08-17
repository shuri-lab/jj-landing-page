import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import {
  AddressElement,
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { landingSignupApi } from "@/lib/signup/api";
import { buildMarketingAttribution, readDiscountCodeFromUrl } from "@/lib/signup/attribution";
import { isValidEmail, suggestEmail } from "@/lib/signup/email";
import { envStripePublishableKey, envYobodyAuthUrl } from "@/lib/signup/env";
import { hydrateMetaClickIdsFromUrl } from "@/lib/signup/meta-pixel";
import { getPasswordPolicyError, hasPasswordEdgeWhitespace, isPasswordValid } from "@/lib/signup/password";
import {
  guessIsoCountry,
  isValidNationalPhone,
  maskPhone,
  nextNationalPhoneInput,
  pickDefaultCountry,
  reformatNationalPhone,
  toE164FromNational,
} from "@/lib/signup/phone";
import { amountForInterval, formatUsd, pickLandingProgram } from "@/lib/signup/plans";
import {
  clearSignupIntentSession,
  getSignupIntentSession,
  saveSignupIntentSession,
} from "@/lib/signup/session";
import {
  trackAddPaymentInfo,
  trackContinueToPayment,
  trackPaymentScreenView,
  trackPurchase,
  trackSignupLead,
  trackSignupMethodSelect,
  trackSignupScreenView,
} from "@/lib/signup/tracking";
import { SignupApiError } from "@/lib/signup/types";
import type {
  CheckoutCardStep,
  LandingCountry,
  LovablePublicConfig,
  OfferPlan,
  PublicCoachProgram,
  SignupIntentResponse,
} from "@/lib/signup/types";
import { mapIntentToWizardStep, wizardIndex } from "@/lib/signup/wizard";
import productMark from "@/assets/yobody-jj-smith-logo.png";
import "./signup-checkout-card.css";

type Props = {
  plan: OfferPlan;
  onChangePlan: () => void;
};

const WIZARD_TOTAL = 5;

const STEP_COPY: Record<CheckoutCardStep, { title: string; sub: string }> = {
  contact: {
    title: "Create your account",
    sub: "Enter your email and name so we can set up your Yobody coaching.",
  },
  payment: {
    title: "Complete your payment",
    sub: "Stripe is ready with your plan total. Pay by card, Apple Pay, or Google Pay.",
  },
  password: {
    title: "Personal information",
    sub: "Confirm your name and choose a password you will use to sign in.",
  },
  phone: {
    title: "Verify your phone",
    sub: "We will send a quick code so JJ can keep you on track.",
  },
  verify: {
    title: "Verify your phone",
    sub: "Enter the 6-digit code we just sent you.",
  },
  success: {
    title: "You're in!",
    sub: "Your coaching account is ready.",
  },
};

function signInUrl(email: string, loginBase?: string): string {
  const base = (loginBase || envYobodyAuthUrl()).replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("mode", "signin");
  params.set("forceAuthMode", "signin");
  params.set("reason", "already-registered");
  if (email.trim()) params.set("email", email.trim());
  return `${base}?${params.toString()}`;
}

function Progress({ step }: { step: CheckoutCardStep }) {
  const filled = wizardIndex(step) + 1;
  return (
    <div className="chk-progress" aria-hidden="true">
      {Array.from({ length: WIZARD_TOTAL }).map((_, i) => (
        <span key={i} className={i < filled ? "is-on" : undefined} />
      ))}
    </div>
  );
}

export function SignupCheckoutCard({ plan, onChangePlan }: Props) {
  const [config, setConfig] = useState<LovablePublicConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutCardStep>("contact");
  const [intentToken, setIntentToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [countryId, setCountryId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [showAuthRedirect, setShowAuthRedirect] = useState(false);
  const [discountCode] = useState<string | null>(() => readDiscountCodeFromUrl());
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amountOff: number;
    discountedAmount: number;
  } | null>(null);
  const prepareKeyRef = useRef("");
  const resumedRef = useRef(false);
  const otpAutoRef = useRef(false);

  const program: PublicCoachProgram | null = useMemo(
    () => pickLandingProgram(config?.programs, plan.billingInterval, plan.price),
    [config, plan.billingInterval, plan.price],
  );
  const countries: LandingCountry[] = config?.countries ?? [];
  const selectedCountry =
    countries.find((c) => c.id === countryId) ??
    pickDefaultCountry(countries, guessIsoCountry());
  const liveAmount = amountForInterval(program, plan.billingInterval);
  const amount = typeof liveAmount === "number" ? liveAmount : plan.price;
  const amountOff = appliedDiscount?.amountOff ?? 0;
  const totalAmount = Math.max(0, amount - amountOff);
  const stripeKey = config?.stripePublishableKey || envStripePublishableKey();
  const stripePromise = useMemo(
    () => (stripeKey ? loadStripe(stripeKey) : null),
    [stripeKey],
  );
  const nameOnCard = `${firstName} ${lastName}`.trim();
  const passwordError = getPasswordPolicyError(password);
  const loginBase = config?.loginUrl || envYobodyAuthUrl();

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

  const persistIntent = useCallback(
    (
      response: SignupIntentResponse,
      extras?: {
        firstName?: string;
        lastName?: string;
        phoneE164?: string;
        countryId?: string;
      },
    ) => {
      const token = response.intentToken ?? intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token) return;
      setIntentToken(token);
      if (response.hasPassword) setHasPassword(true);
      const existing = getSignupIntentSession();
      saveSignupIntentSession({
        intentId: response.intentId,
        intentToken: token,
        email: response.email || email || existing?.email,
        firstName:
          extras?.firstName ||
          response.firstName ||
          firstName ||
          existing?.firstName,
        lastName:
          extras?.lastName ||
          response.lastName ||
          lastName ||
          existing?.lastName,
        phoneE164: extras?.phoneE164 || phoneE164 || existing?.phoneE164,
        countryId: extras?.countryId || countryId || existing?.countryId,
      });
    },
    [countryId, email, firstName, intentToken, lastName, phoneE164],
  );

  useEffect(() => {
    hydrateMetaClickIdsFromUrl();
    trackSignupScreenView(trackingBase);
  }, [trackingBase]);

  useEffect(() => {
    let cancelled = false;
    void landingSignupApi
      .getConfig()
      .then((payload) => {
        if (cancelled) return;
        setConfig(payload);
        const fallback = pickDefaultCountry(payload.countries, guessIsoCountry());
        if (fallback) setCountryId((current) => current || fallback.id);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setConfigError(
          err instanceof SignupApiError
            ? err.message
            : "Checkout is unavailable right now.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = window.setTimeout(() => setOtpCountdown((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCountdown]);

  const authRedirectUrl = signInUrl(email, envYobodyAuthUrl());

  useEffect(() => {
    if (step !== "success") {
      setShowAuthRedirect(false);
      return;
    }
    const reveal = window.setTimeout(() => setShowAuthRedirect(true), 2500);
    const redirect = window.setTimeout(() => {
      window.location.assign(authRedirectUrl);
    }, 5500);
    return () => {
      window.clearTimeout(reveal);
      window.clearTimeout(redirect);
    };
  }, [authRedirectUrl, step]);

  const recordPurchase = useCallback(
    (response: SignupIntentResponse, fallbackId?: string) => {
      if (!response.paymentComplete && !response.purchaseTracking) return;
      trackPurchase({
        transaction_id:
          response.purchaseTracking?.orderId ?? fallbackId ?? response.intentId,
        value: response.purchaseTracking?.value ?? totalAmount,
        currency: response.purchaseTracking?.currency ?? "USD",
        content_id: response.purchaseTracking?.contentId ?? program?.id,
        event_id: response.purchaseTracking?.eventId,
      });
    },
    [program?.id, totalAmount],
  );

  const finishLanding = useCallback(
    async (token: string) => {
      const completed = await landingSignupApi.complete(token);
      persistIntent(completed);
      setEmailSent(completed.emailSent ?? true);
      setStep("success");
      clearSignupIntentSession();
    },
    [persistIntent],
  );

  const applyIntent = useCallback(
    async (response: SignupIntentResponse) => {
      const session = getSignupIntentSession();
      const nextFirst = response.firstName || session?.firstName || firstName;
      const nextLast = response.lastName || session?.lastName || lastName;
      persistIntent(response, {
        firstName: nextFirst,
        lastName: nextLast,
      });
      if (response.email) setEmail(response.email);
      if (nextFirst) setFirstName(nextFirst);
      if (nextLast) setLastName(nextLast);
      const next = mapIntentToWizardStep(response);
      if (next === "success") {
        const token = response.intentToken ?? getSignupIntentSession()?.intentToken;
        if (token && response.step !== "completed") {
          await finishLanding(token);
          return;
        }
        setEmailSent(response.emailSent ?? true);
        setStep("success");
        clearSignupIntentSession();
        return;
      }
      if (next === "verify") {
        const storedPhone =
          getSignupIntentSession()?.phoneE164 || phoneE164;
        setStep(storedPhone ? "verify" : "phone");
        return;
      }
      setStep(next);
    },
    [finishLanding, firstName, lastName, persistIntent, phoneE164],
  );

  useEffect(() => {
    if (!config || resumedRef.current) return;
    const session = getSignupIntentSession();
    if (!session?.intentToken) return;
    resumedRef.current = true;
    setIntentToken(session.intentToken);
    if (session.email) setEmail(session.email);
    if (session.firstName) setFirstName(session.firstName);
    if (session.lastName) setLastName(session.lastName);
    if (session.phoneE164) setPhoneE164(session.phoneE164);
    if (session.countryId) setCountryId(session.countryId);
    void landingSignupApi
      .me(session.intentToken)
      .then(async (response) => {
        await applyIntent(response);
        if (mapIntentToWizardStep(response) === "payment" && !response.paymentComplete) {
          const checkout = await landingSignupApi.createCheckout({
            intentToken: session.intentToken,
            coachProgramConfigId: program?.id,
            discountCode: appliedDiscount?.code ?? discountCode,
            billingInterval: plan.billingInterval,
            marketingAttribution: buildMarketingAttribution({
              sourceSurface: "landing",
              sourceContext: "checkout",
              buttonPosition: plan.buttonPosition,
              ctaText: plan.ctaLabel,
              tier: trackingBase.tier,
            }),
          });
          persistIntent(checkout);
          if (checkout.clientSecret) setClientSecret(checkout.clientSecret);
        }
      })
      .catch(() => {
        clearSignupIntentSession();
        setIntentToken(null);
      });
  }, [
    appliedDiscount?.code,
    applyIntent,
    config,
    discountCode,
    persistIntent,
    plan,
    program?.id,
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

  const prepareCheckout = useCallback(async () => {
    if (!isValidEmail(email) || !firstName.trim() || !lastName.trim() || !acceptedTerms) return;
    if (!config?.coachId || !program?.id) {
      setError("No coaching program is available right now.");
      return;
    }
    const prepareKey = `${email.trim().toLowerCase()}|${plan.billingInterval}|${program.id}|${discountCode ?? ""}`;
    if (prepareKeyRef.current === prepareKey && clientSecret) {
      setStep("payment");
      return;
    }

    setIsPreparing(true);
    setError("");
    setStep("payment");
    try {
      let token = intentToken ?? getSignupIntentSession()?.intentToken ?? null;
      if (!token) {
        trackSignupMethodSelect("email", trackingBase);
        const started = await landingSignupApi.startEmail({
          email: email.trim(),
          coachId: config.coachId,
          coachProgramConfigId: program.id,
          billingInterval: plan.billingInterval,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          marketingAttribution: buildMarketingAttribution({
            sourceSurface: "landing",
            sourceContext: "landing-page",
            buttonPosition: plan.buttonPosition,
            ctaText: plan.ctaLabel,
            tier: trackingBase.tier,
          }),
        });
        persistIntent(started, { firstName: firstName.trim(), lastName: lastName.trim() });
        token = started.intentToken ?? null;
        trackSignupLead(trackingBase);
        trackContinueToPayment(trackingBase);
        if (started.paymentComplete) {
          recordPurchase(started);
          setStep("password");
          return;
        }
      }
      if (!token) throw new Error("Missing signup session.");

      if (discountCode && !appliedDiscount) {
        try {
          const verified = await landingSignupApi.verifyDiscount({
            intentToken: token,
            discountCode,
            coachProgramConfigId: program.id,
            billingInterval: plan.billingInterval,
          });
          setAppliedDiscount({
            code: verified.discount.code,
            amountOff: verified.discount.amountOff,
            discountedAmount: verified.discount.discountedAmount,
          });
        } catch {
          /* invalid promo — continue at list price */
        }
      }

      const checkout = await landingSignupApi.createCheckout({
        intentToken: token,
        coachProgramConfigId: program.id,
        discountCode: appliedDiscount?.code ?? discountCode,
        billingInterval: plan.billingInterval,
        marketingAttribution: buildMarketingAttribution({
          sourceSurface: "landing",
          sourceContext: "checkout",
          buttonPosition: plan.buttonPosition,
          ctaText: plan.ctaLabel,
          tier: trackingBase.tier,
        }),
      });
      persistIntent(checkout, { firstName: firstName.trim(), lastName: lastName.trim() });
      if (checkout.paymentComplete) {
        recordPurchase(checkout);
        setStep("password");
        return;
      }
      if (!checkout.clientSecret) {
        throw new Error(checkout.message || "Unable to initialize payment.");
      }
      prepareKeyRef.current = prepareKey;
      setClientSecret(checkout.clientSecret);
      setStep("payment");
      trackPaymentScreenView(trackingBase);
    } catch (err) {
      if (err instanceof SignupApiError && err.statusCode === 409) {
        handleExistingEmail(email);
        return;
      }
      setStep("contact");
      setError(
        err instanceof SignupApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unable to start checkout.",
      );
    } finally {
      setIsPreparing(false);
    }
  }, [
    acceptedTerms,
    appliedDiscount,
    clientSecret,
    config,
    discountCode,
    email,
    firstName,
    handleExistingEmail,
    intentToken,
    lastName,
    persistIntent,
    plan,
    program,
    recordPurchase,
    trackingBase,
  ]);

  const handlePaymentCompleted = useCallback(
    async (paymentIntentId: string) => {
      const token = intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token) {
        setError("Signup session missing. Please try again.");
        return;
      }
      setIsBusy(true);
      setError("");
      try {
        const verified = await landingSignupApi.verifyCheckout({
          intentToken: token,
          paymentIntentId,
        });
        persistIntent(verified, { firstName: firstName.trim(), lastName: lastName.trim() });
        recordPurchase(verified, paymentIntentId);
        setStep("password");
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
    [firstName, intentToken, lastName, persistIntent, recordPurchase],
  );

  const handlePasswordContinue = useCallback(async () => {
    const token = intentToken ?? getSignupIntentSession()?.intentToken;
    if (!token) {
      setError("Signup session missing. Please try again.");
      return;
    }
    if (!hasPassword && !isPasswordValid(password)) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setIsBusy(true);
    setError("");
    try {
      if (!hasPassword) {
        try {
          const saved = await landingSignupApi.setPassword({
            intentToken: token,
            password,
          });
          persistIntent(saved);
          setHasPassword(true);
        } catch (err) {
          if (!(err instanceof SignupApiError && err.statusCode === 409)) throw err;
          setHasPassword(true);
        }
      }
      const profiled = await landingSignupApi.updateProfile({
        intentToken: token,
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
      });
      persistIntent(profiled, { firstName: firstName.trim(), lastName: lastName.trim() });
      setStep("phone");
    } catch (err) {
      setError(
        err instanceof SignupApiError
          ? err.message
          : "Unable to save your account details.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [firstName, hasPassword, intentToken, lastName, password, persistIntent]);

  const sendPhoneCode = useCallback(async () => {
    const token = intentToken ?? getSignupIntentSession()?.intentToken;
    if (!token) {
      setError("Signup session missing. Please try again.");
      return;
    }
    if (!selectedCountry) {
      setError("Please wait a moment while we load country codes.");
      return;
    }
    if (!isValidNationalPhone(phoneNational, selectedCountry.countryCode)) {
      setError("Enter a valid phone number for the selected country.");
      return;
    }
    const e164 = toE164FromNational(
      phoneNational,
      selectedCountry.countryCode,
      selectedCountry.countryDialCode,
    );
    setIsBusy(true);
    setError("");
    try {
      await landingSignupApi.requestPhoneOtp({
        intentToken: token,
        phoneNumber: e164,
      });
      setPhoneE164(e164);
      const session = getSignupIntentSession();
      if (session) {
        saveSignupIntentSession({
          ...session,
          phoneE164: e164,
          countryId: selectedCountry?.id,
        });
      }
      setOtpCode("");
      otpAutoRef.current = false;
      setOtpCountdown(30);
      setStep("verify");
    } catch (err) {
      setError(
        err instanceof SignupApiError
          ? err.message
          : "Unable to send a verification code.",
      );
    } finally {
      setIsBusy(false);
    }
  }, [intentToken, phoneNational, selectedCountry]);

  const handleCountryChange = useCallback(
    (nextCountryId: string) => {
      setCountryId(nextCountryId);
      const next = countries.find((c) => c.id === nextCountryId);
      if (!next) return;
      setPhoneNational((prev) => reformatNationalPhone(prev, next.countryCode));
      setError("");
    },
    [countries],
  );

  const handlePhoneInputChange = useCallback(
    (value: string) => {
      const next = nextNationalPhoneInput(value, selectedCountry?.countryCode);
      if (next == null) return;
      setPhoneNational(next);
      setError("");
    },
    [selectedCountry?.countryCode],
  );

  const verifyPhoneCode = useCallback(
    async (code = otpCode) => {
      const token = intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token || !phoneE164) {
        setError("Signup session missing. Please try again.");
        return;
      }
      if (!/^\d{6}$/.test(code)) {
        setError("Enter the 6-digit code.");
        return;
      }
      setIsBusy(true);
      setError("");
      try {
        const verified = await landingSignupApi.verifyPhone({
          intentToken: token,
          phoneNumber: phoneE164,
          otpCode: code,
          countryId: selectedCountry?.id ?? null,
        });
        persistIntent(verified);
        setEmailSent(verified.emailSent ?? true);
        setStep("success");
        clearSignupIntentSession();
      } catch (err) {
        otpAutoRef.current = false;
        setError(
          err instanceof SignupApiError
            ? err.message
            : "That code did not match. Try again.",
        );
      } finally {
        setIsBusy(false);
      }
    },
    [intentToken, otpCode, persistIntent, phoneE164, selectedCountry?.id],
  );

  const canContinueContact =
    isValidEmail(email) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    acceptedTerms &&
    !isPreparing &&
    !configError;
  const payLabel = `Pay ${formatUsd(totalAmount)} USD`;
  const paidSteps: CheckoutCardStep[] = ["password", "phone", "verify", "success"];
  const showChangePlan = !paidSteps.includes(step);

  const renderRight = () => {
    if (step === "success") {
      return (
        <div className="chk-success">
          <div className="chk-success-icon">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="chk-title">Success</h3>
          <p className="chk-sub">
            {emailSent === false
              ? "Your account is ready. We could not send the confirmation email just now."
              : `You're in. We emailed ${email || "you"} with a sign-in link.`}
          </p>
          {showAuthRedirect ? (
            <>
              <p className="chk-hint">Taking you to YoBody to sign in…</p>
              <a
                className="chk-pay"
                href={authRedirectUrl}
                style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
              >
                Continue to YoBody
              </a>
            </>
          ) : (
            <p className="chk-hint">Hang tight — we are preparing your sign-in link.</p>
          )}
        </div>
      );
    }

    if (step === "password") {
      const longEnough = password.length >= 6;
      const noEdgeSpace = !hasPasswordEdgeWhitespace(password);
      return (
        <>
          <div className="chk-name-row">
            <div className="chk-field">
              <label htmlFor="chk-first-pw">First name</label>
              <input
                id="chk-first-pw"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="chk-field">
              <label htmlFor="chk-last-pw">Last name</label>
              <input
                id="chk-last-pw"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>
          {!hasPassword ? (
            <div className="chk-field chk-password-field">
              <label htmlFor="chk-password">Password</label>
              <div className="chk-password-wrap">
                <input
                  id="chk-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  className="chk-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="chk-req">
                <span className={longEnough ? "is-ok" : undefined}>At least 6 characters</span>
                <span className={password.length > 0 && noEdgeSpace ? "is-ok" : undefined}>
                  No spaces at the start or end
                </span>
              </div>
              {passwordError ? <p className="chk-error">{passwordError}</p> : null}
            </div>
          ) : (
            <p className="chk-hint">Password saved. Confirm your name to continue.</p>
          )}
          {error ? <p className="chk-error">{error}</p> : null}
          <div className="chk-actions">
            <button
              type="button"
              className="chk-pay"
              disabled={
                isBusy ||
                (!hasPassword && !isPasswordValid(password)) ||
                !firstName.trim() ||
                !lastName.trim()
              }
              onClick={() => void handlePasswordContinue()}
            >
              {isBusy ? "Saving…" : "Continue"}
            </button>
          </div>
        </>
      );
    }

    if (step === "phone") {
      const countryLabel = selectedCountry
        ? [selectedCountry.flagEmoji ?? selectedCountry.countryCode, selectedCountry.countryDialCode]
            .filter(Boolean)
            .join(" ")
        : "Code";
      return (
        <>
          <div className="chk-phone-row">
            <Select
              value={selectedCountry?.id ?? ""}
              onValueChange={handleCountryChange}
              disabled={isBusy || countries.length === 0}
            >
              <SelectTrigger className="chk-country">
                <SelectValue placeholder={countries.length ? "Code" : "…"}>
                  {countryLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      {c.flagEmoji ? <span>{c.flagEmoji}</span> : null}
                      <span>{c.countryDialCode}</span>
                      <span className="max-w-[8rem] truncate text-muted-foreground">{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="chk-field">
              <label htmlFor="chk-phone" className="sr-only">
                Phone number
              </label>
              <input
                id="chk-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="Your phone number"
                value={phoneNational}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                disabled={isBusy || !selectedCountry}
              />
            </div>
          </div>
          {error ? <p className="chk-error">{error}</p> : null}
          <div className="chk-actions">
            <button
              type="button"
              className="chk-pay"
              disabled={isBusy || countries.length === 0 || !selectedCountry || !phoneNational.trim()}
              onClick={() => void sendPhoneCode()}
            >
              {isBusy
                ? "Sending…"
                : countries.length === 0 || !selectedCountry
                  ? "Loading country…"
                  : "Send code"}
            </button>
          </div>
        </>
      );
    }

    if (step === "verify") {
      return (
        <>
          <p className="chk-sub">
            Sent to <strong>{maskPhone(phoneE164) || "your phone"}</strong>
          </p>
          <div className="chk-otp">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => {
                setOtpCode(value);
                setError("");
                if (value.length === 6 && !otpAutoRef.current && !isBusy) {
                  otpAutoRef.current = true;
                  void verifyPhoneCode(value);
                }
              }}
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} className="chk-otp-slot" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error ? <p className="chk-error">{error}</p> : null}
          <div className="chk-actions">
            <button
              type="button"
              className="chk-pay"
              disabled={isBusy || otpCode.length !== 6}
              onClick={() => void verifyPhoneCode()}
            >
              {isBusy ? "Verifying…" : "Continue"}
            </button>
          </div>
          <div className="chk-alt">
            {otpCountdown > 0 ? (
              <p className="chk-hint">Resend code in {otpCountdown}s</p>
            ) : (
              <button type="button" onClick={() => void sendPhoneCode()} disabled={isBusy}>
                Resend code
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOtpCode("");
                setError("");
                setStep("phone");
              }}
              disabled={isBusy}
            >
              Use a different number
            </button>
          </div>
        </>
      );
    }

    if (step === "payment") {
      return (
        <>
          {clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    borderRadius: "8px",
                    colorPrimary: "#e11d8f",
                    colorText: "#111827",
                    colorTextSecondary: "#6b7280",
                  },
                },
              }}
            >
              <CheckoutStripeForm
                email={email}
                nameOnCard={nameOnCard}
                payLabel={payLabel}
                isVerifying={isBusy}
                tracking={trackingBase}
                onCompleted={handlePaymentCompleted}
                onError={setError}
              />
            </Elements>
          ) : (
            <div className="chk-pay-loading" role="status" aria-live="polite">
              <span className="chk-pay-spinner" aria-hidden="true" />
              <p>Loading secure payment…</p>
            </div>
          )}
          <p className="chk-pay-note">
            <Lock size={14} />
            Your payment information will be stored on a secure server for future purchases.
          </p>
          {error ? <p className="chk-error">{error}</p> : null}
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

        <div className="chk-name-row">
          <div className="chk-field">
            <label htmlFor="chk-first">First name</label>
            <input
              id="chk-first"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="chk-field">
            <label htmlFor="chk-last">Last name</label>
            <input
              id="chk-last"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <label className="chk-terms">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>I accept Terms of Service and Privacy Policy.</span>
        </label>

        {configError ? <p className="chk-error">{configError}</p> : null}
        {error ? <p className="chk-error">{error}</p> : null}

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
                <p className="chk-sub">{STEP_COPY[step].sub}</p>
              </header>
            </>
          ) : null}

          {renderRight()}
          <p className="chk-secure">
            <Lock size={13} />
            Transactions are secure and encrypted
          </p>
          {showChangePlan ? (
            <button type="button" className="chk-change" onClick={onChangePlan}>
              Change plan
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CheckoutStripeForm({
  email,
  nameOnCard,
  payLabel,
  isVerifying,
  tracking,
  onCompleted,
  onError,
}: {
  email: string;
  nameOnCard: string;
  payLabel: string;
  isVerifying: boolean;
  tracking: {
    content_id?: string;
    value: number;
    currency: string;
  };
  onCompleted: (paymentIntentId: string) => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    wallets: { applePay: "auto", googlePay: "auto", link: "auto" },
    fields: {
      billingDetails: { name: "auto", email: "never", phone: "never" },
    },
    defaultValues: {
      billingDetails: {
        email: email || undefined,
        name: nameOnCard || undefined,
      },
    },
  };

  const handleConfirm = async () => {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    onError("");
    trackAddPaymentInfo(tracking);
    const submitResult = await elements.submit();
    if (submitResult.error) {
      onError(submitResult.error.message ?? "Please check your payment details.");
      setIsSubmitting(false);
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: {
            ...(email ? { email } : {}),
            ...(nameOnCard ? { name: nameOnCard } : {}),
          },
        },
      },
    });
    if (result.error) {
      onError(result.error.message ?? "Payment failed.");
      setIsSubmitting(false);
      return;
    }
    const paymentIntentId = result.paymentIntent?.id;
    if (!paymentIntentId) {
      onError("Payment confirmed but no payment intent id was returned.");
      setIsSubmitting(false);
      return;
    }
    onCompleted(paymentIntentId);
  };

  const disabled = !stripe || !elements || isSubmitting || isVerifying;

  return (
    <div className="space-y-3">
      <PaymentElement options={paymentElementOptions} />
      <AddressElement
        options={{
          mode: "billing",
          defaultValues: { name: nameOnCard || undefined },
          fields: { phone: "never" },
          display: { name: "full" },
        }}
      />
      <div className="chk-actions">
        <button
          type="button"
          className="chk-pay"
          disabled={disabled}
          onClick={() => void handleConfirm()}
        >
          {isVerifying ? "Verifying payment…" : isSubmitting ? "Processing…" : payLabel}
        </button>
      </div>
    </div>
  );
}
