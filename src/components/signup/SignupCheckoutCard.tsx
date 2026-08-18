import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type {
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementReadyEvent,
  StripePaymentElementOptions,
} from "@stripe/stripe-js";
import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Check, Lock } from "lucide-react";
import { landingSignupApi } from "@/lib/signup/api";
import {
  buildMarketingAttribution,
  readDiscountCodeFromUrl,
  readLandingPrefill,
} from "@/lib/signup/attribution";
import { buildContinueSignupUrl } from "@/lib/signup/continue-signup";
import { isValidEmail, suggestEmail } from "@/lib/signup/email";
import { envStripePublishableKey, envYobodyAuthUrl } from "@/lib/signup/env";
import { hydrateMetaClickIdsFromUrl } from "@/lib/signup/meta-pixel";
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

function billingDetailsForConfirm(
  email: string,
  name: string,
  expressEvent?: StripeExpressCheckoutElementConfirmEvent,
) {
  const fromExpress = expressEvent?.billingDetails;
  const address = fromExpress?.address;
  return {
    email: fromExpress?.email?.trim() || email.trim() || "",
    name: fromExpress?.name?.trim() || name.trim() || "",
    phone: fromExpress?.phone ?? "",
    address: {
      line1: address?.line1 ?? "",
      line2: address?.line2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postal_code: address?.postal_code ?? "",
      country: address?.country || "US",
    },
  };
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

export function SignupCheckoutCard({ plan }: Props) {
  const prefill = useMemo(() => readLandingPrefill(), []);
  const [config, setConfig] = useState<LovablePublicConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [email, setEmail] = useState(prefill.email);
  const [fullName, setFullName] = useState(prefill.fullName);
  const [firstName, setFirstName] = useState(prefill.firstName);
  const [lastName, setLastName] = useState(prefill.lastName);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(() =>
    prefill.email ? suggestEmail(prefill.email) : null,
  );
  const [step, setStep] = useState<CheckoutCardStep>("contact");
  const [intentToken, setIntentToken] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [handoffUrl, setHandoffUrl] = useState("");
  const [error, setError] = useState("");
  const [isPreparing, setIsPreparing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [discountCode] = useState<string | null>(() => readDiscountCodeFromUrl());
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amountOff: number;
    discountedAmount: number;
  } | null>(null);
  const prepareKeyRef = useRef("");
  const resumedRef = useRef(false);

  const program: PublicCoachProgram | null = useMemo(
    () => pickLandingProgram(config?.programs, plan.billingInterval, plan.price),
    [config, plan.billingInterval, plan.price],
  );
  const liveAmount = amountForInterval(program, plan.billingInterval);
  const amount = typeof liveAmount === "number" ? liveAmount : plan.price;
  const amountOff = appliedDiscount?.amountOff ?? 0;
  const totalAmount = Math.max(0, amount - amountOff);
  const stripeKey = config?.stripePublishableKey || envStripePublishableKey();
  const stripePromise = useMemo(
    () => (stripeKey ? loadStripe(stripeKey) : null),
    [stripeKey],
  );
  const nameOnCard = `${firstName} ${lastName}`.trim() || fullName.trim();
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
      extras?: { firstName?: string; lastName?: string },
    ) => {
      const token = response.intentToken ?? intentToken ?? getSignupIntentSession()?.intentToken;
      if (!token) return;
      setIntentToken(token);
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
          err instanceof SignupApiError
            ? err.message
            : "Checkout is unavailable right now.",
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
    if (
      urlEmail &&
      session?.email &&
      session.email.trim().toLowerCase() !== urlEmail
    ) {
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
          rememberHandoff(checkout);
          if (checkout.paymentComplete) {
            enterPaidSuccess(checkout);
            return;
          }
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
    enterPaidSuccess,
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

  const prepareCheckout = useCallback(async () => {
    const { firstName: contactFirst, lastName: contactLast } = splitFullName(fullName);
    if (!isValidEmail(email) || !contactFirst) return;
    if (!config?.coachId) {
      setError("No coaching program is available right now.");
      return;
    }
    setFirstName(contactFirst);
    setLastName(contactLast);
    const prepareKey = `${email.trim().toLowerCase()}|${plan.billingInterval}|${program?.id ?? "auto"}|${discountCode ?? ""}`;
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
          coachProgramConfigId: program?.id,
          billingInterval: plan.billingInterval,
          firstName: contactFirst,
          lastName: contactLast || undefined,
          marketingAttribution: buildMarketingAttribution({
            sourceSurface: "landing",
            sourceContext: "landing-page",
            buttonPosition: plan.buttonPosition,
            ctaText: plan.ctaLabel,
            tier: trackingBase.tier,
          }),
        });
        persistIntent(started, { firstName: contactFirst, lastName: contactLast });
        rememberHandoff(started);
        token = started.intentToken ?? null;
        trackSignupLead(trackingBase);
        trackContinueToPayment(trackingBase);
        if (started.paymentComplete) {
          enterPaidSuccess(started);
          return;
        }
      }
      if (!token) throw new Error("Missing signup session.");

      if (discountCode && !appliedDiscount) {
        try {
          const verified = await landingSignupApi.verifyDiscount({
            intentToken: token,
            discountCode,
            coachProgramConfigId: program?.id,
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
    appliedDiscount,
    clientSecret,
    config,
    discountCode,
    email,
    enterPaidSuccess,
    fullName,
    handleExistingEmail,
    intentToken,
    persistIntent,
    plan,
    program,
    rememberHandoff,
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
        enterPaidSuccess(verified, paymentIntentId);
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
    [enterPaidSuccess, firstName, intentToken, lastName, persistIntent],
  );

  const canContinueContact =
    isValidEmail(email) &&
    splitFullName(fullName).firstName.length > 0 &&
    !isPreparing &&
    !configError;
  const payLabel = `Pay ${formatUsd(totalAmount)} USD`;

  const renderRight = () => {
    if (step === "success") {
      return (
        <div className="chk-success">
          <div className="chk-success-icon">
            <Check size={32} strokeWidth={3} />
          </div>
          <h3 className="chk-title">Payment successful</h3>
          <p className="chk-sub">
            Please wait while we redirect you to get set up.
          </p>
          {handoffUrl ? (
            <div className="chk-actions">
              <a
                className="chk-pay"
                href={handoffUrl}
                style={{ display: "grid", placeItems: "center", textDecoration: "none" }}
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
                    borderRadius: "13px",
                    colorPrimary: "#7C3AA6",
                    colorText: "#2A2036",
                    colorTextSecondary: "#6C6180",
                  },
                },
              }}
            >
              <CheckoutStripeForm
                email={email}
                nameOnCard={nameOnCard}
                payLabel={payLabel}
                amount={totalAmount}
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

        <div className="chk-field">
          <label htmlFor="chk-fullname">Full name</label>
          <input
            id="chk-fullname"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setError("");
            }}
          />
        </div>

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
                {STEP_COPY[step].sub ? (
                  <p className="chk-sub">{STEP_COPY[step].sub}</p>
                ) : null}
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

function CheckoutStripeForm({
  email,
  nameOnCard,
  payLabel,
  amount,
  isVerifying,
  tracking,
  onCompleted,
  onError,
}: {
  email: string;
  nameOnCard: string;
  payLabel: string;
  amount: number;
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
  const [hasExpressMethods, setHasExpressMethods] = useState(false);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
    wallets: { applePay: "auto", googlePay: "auto", link: "auto" },
    fields: {
      billingDetails: {
        name: "never",
        email: "never",
        phone: "never",
        address: "never",
      },
    },
    defaultValues: {
      billingDetails: {
        email: email || undefined,
        name: nameOnCard || undefined,
      },
    },
  };

  const handleConfirm = async (
    expressEvent?: StripeExpressCheckoutElementConfirmEvent,
  ) => {
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    onError("");
    trackAddPaymentInfo(tracking);
    const submitResult = await elements.submit();
    if (submitResult.error) {
      const message =
        submitResult.error.message ?? "Please check your payment details.";
      onError(message);
      expressEvent?.paymentFailed({ reason: "invalid_payment_data", message });
      setIsSubmitting(false);
      return;
    }
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        payment_method_data: {
          billing_details: billingDetailsForConfirm(
            email,
            nameOnCard,
            expressEvent,
          ),
        },
      },
    });
    if (result.error) {
      const message = result.error.message ?? "Payment failed.";
      onError(message);
      expressEvent?.paymentFailed({ reason: "fail", message });
      setIsSubmitting(false);
      return;
    }
    const paymentIntentId = result.paymentIntent?.id;
    if (!paymentIntentId) {
      const message = "Payment confirmed but no payment intent id was returned.";
      onError(message);
      expressEvent?.paymentFailed({ reason: "fail", message });
      setIsSubmitting(false);
      return;
    }
    onCompleted(paymentIntentId);
  };

  const handleExpressReady = (
    event: StripeExpressCheckoutElementReadyEvent,
  ) => {
    setHasExpressMethods(Boolean(event.availablePaymentMethods));
  };

  const disabled = !stripe || !elements || isSubmitting || isVerifying;

  return (
    <div className="space-y-3">
      <div style={{ display: hasExpressMethods ? "block" : "none" }}>
        <ExpressCheckoutElement
          options={{
            buttonHeight: 48,
            buttonTheme: { applePay: "black", googlePay: "black" },
            buttonType: { applePay: "plain", googlePay: "pay" },
            layout: { maxColumns: 1, maxRows: 2, overflow: "auto" },
            lineItems: [
              {
                name: "Yobody By JJ Smith",
                amount: Math.round(Number(amount) * 100),
              },
            ],
            paymentMethods: {
              applePay: "auto",
              googlePay: "auto",
              link: "auto",
              klarna: "auto",
            },
          }}
          onReady={handleExpressReady}
          onConfirm={handleConfirm}
        />
        {hasExpressMethods ? <div className="chk-pay-or">or pay with card</div> : null}
      </div>
      <PaymentElement options={paymentElementOptions} />
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
