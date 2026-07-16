import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check, Award, TrendingDown, ShieldCheck, Phone, MessageCircle, UtensilsCrossed,
  UserCheck, Users, Zap, Sparkles,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCoachPrograms, signupUrl } from "@/lib/coach-programs";
import { useCountdown } from "@/hooks/use-countdown";
import { scrollToOffer } from "@/lib/scroll-to-offer";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import quizHeroDesktop from "@/assets/landing/quiz-hero-image-desktop.png";
import quizHeroMobile from "@/assets/landing/quiz-hero-image-mobile.png";
import jjOwnTransformation from "@/assets/landing/jj-own-transformation.png";
import dailySmsImage from "@/assets/landing/daily-sms-image.png";
import mealsCardImage from "@/assets/landing/meals-card-image.png";
import jjBefore1 from "@/assets/landing/jj-before-1.png";
import jjBefore2 from "@/assets/landing/jj-before-2.png";
import jjAfter1 from "@/assets/landing/jj-after-1.png";
import jjAfter2 from "@/assets/landing/jj-after-2.png";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
import t11 from "@/assets/landing/transformation-11.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import tTammi from "@/assets/landing/transformation-tammi.jpg";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

export const Route = createFileRoute("/challenge-v1")({
  head: () => ({
    meta: [
      { title: "Get Your Sexy Back After 40 — JJ Smith Personal Coaching" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks with JJ Smith in your corner every day. A plan built for the body you have now, no starving, never alone.",
      },
      { property: "og:title", content: "Get Your Sexy Back After 40 — JJ Smith" },
      { property: "og:description", content: "A plan built around the food you love, with JJ in your corner every single day." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const PINK = "linear-gradient(180deg, #d62a7a 0%, #b81860 55%, #8c114a 100%)";
const BLUSH = "#fdebeb";
const BERRY = "#c41e6a";
const PLUM = "#2a1020"; // dark plum for the pricing block

// Ongoing-membership working numbers (TJ to confirm). Member count is a placeholder
// pending a real figure from Meka / TJ.
const MEMBER_PRICE = 47;
const MEMBER_WAS = 67;
const MEMBER_DAILY = "1.57";
const MEMBERS_INSIDE = "10,000+";
const GOLD = "#e3b84a";

// ── Challenge (12 Weeks to Sexy) placeholders — set real values before launch ──
const DOORS_DEADLINE = new Date(Date.now() + ((22 * 60 + 58) * 60 + 20) * 1000); // live countdown target (~22h 58m 20s), placeholder
const PAY_IN_FULL = 127; // one payment for all 12 weeks, TJ to confirm
const PAY_IN_FULL_WAS = MEMBER_PRICE * 3; // $141 monthly total over 12 weeks
const PAY_IN_FULL_SAVINGS = PAY_IN_FULL_WAS - PAY_IN_FULL;

function Landing() {
  return (
    <div
      className="overflow-x-hidden bg-background text-foreground"
      style={{ fontFamily: "'DM Sans', sans-serif", ["--font-serif" as string]: "'Lora', Georgia, serif" }}
    >
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <JJStory />
        <WhyNothing />
        <Method />
        <HowChallengeWorks />
        <RealResults />
        <WhatYouGet />
        <Pricing />
        <Guarantee />
        <Close />
        <Faq />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}

// ── Shared bits ──────────────────────────────────────────────────────────────
function Berry({ children }: { children: React.ReactNode }) {
  return <span style={{ color: BERRY }}>{children}</span>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-bold uppercase tracking-[0.22em] mb-4" style={{ color: BERRY }}>{children}</p>;
}

// Challenge urgency subline, carried under every CTA.
const CTA_SUB = "Limited spots · 14-day money back guarantee";

function CtaButton({ label, sub, href, position = "unknown", className = "", onDark = false, subInside = false }: { label: string; sub?: React.ReactNode; href?: string; position?: string; className?: string; onDark?: boolean; subInside?: boolean }) {
  const cls =
    "block w-full rounded-2xl px-6 py-4 text-center text-[17px] sm:text-[19px] font-bold uppercase tracking-wide text-white shadow-[0_16px_34px_-12px_rgba(184,24,96,0.6)] transition-transform hover:-translate-y-0.5 active:scale-[0.99]";
  const inner = (
    <>
      <span className="inline-flex items-center justify-center gap-2">{label} <span aria-hidden>→</span></span>
      {subInside && sub && <span className="mt-1 block text-[12px] font-semibold normal-case tracking-normal" style={{ color: "#ffe1ef" }}>{sub}</span>}
    </>
  );
  return (
    <div className={`w-full ${className}`}>
      {href ? (
        <a href={href} className={cls} style={{ background: PINK }} data-cta="yes-jj" data-position={position}>{inner}</a>
      ) : (
        <button onClick={scrollToOffer} className={cls} style={{ background: PINK }} data-cta="yes-jj" data-position={position}>{inner}</button>
      )}
      {sub && !subInside && (
        <p className={`mt-2.5 text-center text-[13.5px] font-semibold sm:text-[14px] ${onDark ? "text-white/70" : ""}`} style={onDark ? undefined : { color: "#8c114a" }}>{sub}</p>
      )}
    </div>
  );
}

function Countdown({ className = "" }: { className?: string }) {
  const { days, hours, minutes, seconds } = useCountdown(DOORS_DEADLINE);
  return (
    <span className={`tabular-nums ${className}`}>
      {days > 0 ? `${days}d ` : ""}{hours}h {minutes}m {seconds}s
    </span>
  );
}

// ── Announcement bar (challenge urgency) ─────────────────────────────────────
function AnnouncementBar() {
  return (
    <div className="relative w-full overflow-hidden text-white" style={{ background: "linear-gradient(90deg, #2a1020 0%, #8c2a52 50%, #2a1020 100%)" }}>
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-5 py-2.5 text-center text-[12px] font-semibold sm:text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f39bc4]" />
          12 Weeks to Sexy
        </span>
        <span className="text-white/30">·</span>
        <span className="text-white/85">Doors close in</span>
        <Countdown className="rounded-md bg-white/15 px-2 py-0.5 font-bold tabular-nums ring-1 ring-white/20" />
        <span className="text-white/30 max-sm:hidden">·</span>
        <span className="text-white/85 max-sm:hidden">limited spots</span>
      </div>
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <header style={{ backgroundColor: BLUSH }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-center px-5 py-4 sm:justify-between">
        <img src={jjSmithLogo} alt="JJ Smith" className="h-4 w-auto sm:h-7" width={132} height={25} />
        <button
          onClick={scrollToOffer}
          data-cta="yes-jj"
          data-position="nav"
          className="hidden rounded-full border-2 border-[#d62a7a] px-5 py-2.5 text-[14px] font-bold uppercase tracking-wide text-[#b81860] transition-colors hover:bg-[#d62a7a] hover:text-white sm:inline-flex"
        >
          Join the challenge →
        </button>
      </div>
    </header>
  );
}

// ── 1. Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="px-5 pt-4 pb-2 lg:pb-6" style={{ backgroundColor: BLUSH }}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1200px]">
        {/* Desktop */}
        <div className="hidden lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
          <div className="lg:order-1">
            <HeroHeadline />
            <HeroBullets className="mt-6" />
            <div className="mt-8 max-w-[440px]"><HeroPrimaryCta /></div>
            <div className="mt-7"><HeroTrustBar /></div>
          </div>
          <div className="relative lg:order-2">
            <img src={quizHeroDesktop} alt="JJ Smith, your personal coach" className="h-auto w-full" width={2000} height={2000} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fdebeb] via-[#fdebeb] to-transparent" aria-hidden />
          </div>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <div className="flex justify-center"><HeroTrustPill /></div>
          <div className="mt-6"><HeroHeadline /></div>
          <HeroBullets className="mt-6" textClass="text-[18px]" />
          <div className="mt-7"><HeroPrimaryCta /></div>
          <div className="relative mx-auto mt-8 w-full max-w-[230px]">
            <img src={quizHeroMobile} alt="JJ Smith, your personal coach" className="block h-auto w-full" width={2000} height={2000} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fdebeb] via-[#fdebeb] to-transparent" aria-hidden />
          </div>
        </div>

        <HeroTransformationsMarquee />
      </div>
    </section>
  );
}

function HeroHeadline() {
  return (
    <>
      <h1
        className="text-left text-[34px] leading-[1.08] tracking-[-0.015em] text-[#15102a] sm:text-[46px] lg:text-[54px]"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
      >
        12 Weeks to a <span style={{ color: BERRY }}>Sexier, More Confident You.</span>
      </h1>
      <p
        className="mt-2 text-left text-[20px] font-bold leading-[1.15] tracking-[-0.01em] text-[#15102a] sm:mt-3 sm:text-[26px] lg:text-[28px]"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
      >
        Lose up to <span style={{ color: BERRY }}>30 pounds</span>, with JJ by your side every day.
      </p>
    </>
  );
}

function HeroBullets({ className = "", textClass = "text-[18px] sm:text-[20px]" }: { className?: string; textClass?: string }) {
  const points = ["A plan built around the food you love. No starving.", "Weekly 1-on-1 calls and daily texts from JJ."];
  return (
    <ul className={`max-w-[560px] space-y-3 ${className}`}>
      {points.map((p, i) => (
        <li key={i} className={`flex items-start gap-2.5 text-left font-medium leading-[1.4] text-ink ${textClass}`}>
          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white" style={{ background: PINK }}><Check className="h-4 w-4" strokeWidth={3} /></span>
          <span>{p}</span>
        </li>
      ))}
    </ul>
  );
}

function HeroPrimaryCta() {
  return <CtaButton label="Join the challenge" sub={CTA_SUB} subInside position="hero-top" />;
}

function HeroTrustBar() {
  const avatars = [t8, t10, t4];
  const divider = <span className="h-3.5 w-px shrink-0 bg-[#e6b6cc]" aria-hidden />;
  return (
    <div className="flex items-center gap-2.5 whitespace-nowrap text-[12px] font-semibold sm:gap-3.5 sm:text-[13px]" style={{ color: "#8c114a" }}>
      <span className="inline-flex items-center gap-1.5"><Award className="h-4 w-4 shrink-0 text-[#c41e6a]" strokeWidth={2.2} /> NYT Bestseller</span>
      {divider}
      <span className="inline-flex items-center gap-1.5"><TrendingDown className="h-4 w-4 shrink-0 text-[#c41e6a]" strokeWidth={2.2} /> 5M+ lbs lost</span>
      {divider}
      <span className="inline-flex items-center gap-1.5">
        <span className="flex -space-x-2 shrink-0">{avatars.map((src, i) => <img key={i} src={src} alt="" className="h-6 w-6 rounded-full object-cover object-top ring-2 ring-[#fdebeb]" loading="lazy" />)}</span>
        800K+ women helped
      </span>
    </div>
  );
}

function HeroTrustPill() {
  const avatars = [t8, t10, t4];
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#f2cede] bg-white/85 px-4 py-2 text-[14px] font-semibold shadow-[0_10px_24px_-14px_rgba(184,24,96,0.5)]" style={{ color: "#8c114a" }}>
      <span className="inline-flex shrink-0 items-center gap-1.5"><TrendingDown className="h-[18px] w-[18px] text-[#c41e6a]" strokeWidth={2.2} /> 5M+ lbs lost</span>
      <span className="h-3.5 w-px shrink-0 bg-[#e6b6cc]" aria-hidden />
      <span className="inline-flex shrink-0 items-center gap-1.5">
        <span className="flex -space-x-1.5">{avatars.map((src, i) => <img key={i} src={src} alt="" className="h-5 w-5 rounded-full object-cover object-top ring-1 ring-white" loading="lazy" />)}</span>
        800K+ women helped
      </span>
    </div>
  );
}

// Before/after slider. NOTE: the lbs/weeks figures are placeholders pending real, verifiable results.
const TRANSFORMATIONS = [
  { src: t8, caption: "-19.8 lbs in 8 weeks" },
  { src: t1, caption: "-16 lbs in 6 weeks" },
  { src: t12, caption: "-22 lbs in 8 weeks" },
  { src: t4, caption: "-12.2 lbs in 6 weeks" },
  { src: t10, caption: "-11.6 lbs in 6 weeks" },
  { src: t7, caption: "-24 lbs in 10 weeks" },
  { src: t9, caption: "-15 lbs in 7 weeks" },
  { src: t11, caption: "-18 lbs in 8 weeks" },
  { src: tTammi, caption: "-20 lbs in 8 weeks" },
];

function HeroTransformationsMarquee() {
  const track = [...TRANSFORMATIONS, ...TRANSFORMATIONS];
  return (
    <div className="relative -mx-5 mt-9 overflow-hidden lg:mt-12">
      <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused]">
        {track.map((tr, i) => (
          <figure key={i} className="relative ml-4 shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_40px_-24px_rgba(140,17,74,0.5)]">
            <img src={tr.src} alt="A woman's before and after transformation" loading="lazy" className="block h-[220px] w-[200px] object-cover object-top sm:h-[250px] sm:w-[230px]" />
            <figcaption className="absolute inset-x-0 bottom-2.5 mx-auto w-fit rounded-lg bg-white/95 px-3 py-1 text-[13px] font-extrabold text-[#15102a] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.45)] sm:text-[14px]">{tr.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#fdebeb] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fdebeb] to-transparent" />
    </div>
  );
}

function PressLogos({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const logos = [
    { src: partnerNyTimes, alt: "The New York Times" }, { src: partnerDrOz, alt: "The Dr. Oz Show" },
    { src: partnerSteveHarvey, alt: "Steve Harvey" }, { src: partnerTheView, alt: "The View" },
    { src: partnerNbc, alt: "NBC" }, { src: partnerFox, alt: "FOX" },
    { src: partnerEssence, alt: "Essence" }, { src: partnerWomansWorld, alt: "Woman's World" },
  ];
  const track = [...logos, ...logos];
  return (
    <div className={className}>
      <p className={`text-center text-[11px] font-bold uppercase tracking-[0.22em] lg:text-left ${dark ? "text-white/50" : "text-ink-faint"}`}>As seen on</p>
      {/* On the dark section, the logos keep their original colors on a white band. */}
      <div className={`relative mt-4 overflow-hidden ${dark ? "rounded-2xl bg-white px-2 py-4" : ""}`}>
        <div className="flex w-max items-center gap-10 animate-marquee sm:gap-12">
          {track.map((l, i) => (
            <img key={i} src={l.src} alt={l.alt} className="h-10 w-auto shrink-0 object-contain opacity-80 sm:h-12" loading="eager" />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}

// ── 2. JJ's story ────────────────────────────────────────────────────────────
function JJStory() {
  return (
    <section className="px-5 py-16 lg:py-24" style={{ backgroundColor: PLUM }}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="lg:grid lg:grid-cols-[0.85fr_1fr] lg:items-start lg:gap-12">
          <div className="mb-8 min-w-0 lg:mb-0">
            {/* Mobile/tablet: single before-and-after image + press logos. */}
            <div className="lg:hidden">
              <div className="mx-auto max-w-[440px] overflow-hidden rounded-3xl shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
                <img src={jjOwnTransformation} alt="JJ Smith's own transformation" className="block h-auto w-full" width={2000} height={2000} loading="lazy" />
              </div>
              <PressLogos className="mt-8" dark />
            </div>
            {/* Desktop: four before-and-after images. */}
            <div className="hidden grid-cols-2 gap-4 lg:grid">
              {[jjBefore1, jjAfter1, jjBefore2, jjAfter2].map((src, i) => (
                <div key={i} className="aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
                  <img src={src} alt="JJ Smith before and after" className="h-full w-full object-cover object-top" width={1200} height={1500} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="font-[Montserrat] font-bold text-[30px] leading-[1.14] tracking-[-0.02em] text-white sm:text-[40px] lg:text-[46px]">My body turned on me, too.</h2>
            <div className="mt-6 space-y-5 text-[18px] leading-[1.7] text-white/80 sm:text-[19px]">
              <p>In my late 30s, my body turned on me. The weight came out of nowhere, I was exhausted and foggy, and some mornings I did not recognize the woman in the mirror. So I did everything they tell you. Skipped meals. Cut carbs. Dragged myself to the gym. Nothing moved.</p>
            </div>
            <p className="mt-7 font-serif italic text-[24px] leading-snug sm:text-[30px]" style={{ color: "#f39bc4" }}>
              "The advice was always eat less, move more. Nobody warned me my body had changed, and those old rules would never work for me again."
            </p>
            <div className="mt-6 space-y-5 text-[18px] leading-[1.7] text-white/80 sm:text-[19px]">
              <p>So I stopped fighting my body and started working with it, my hormones, my blood sugar, all of it. The weight came off, my energy came roaring back, and in my 40s I felt better than I had at 30.</p>
              <p>The books I wrote became bestsellers, and hundreds of thousands of women have used them to get themselves back. But what I hold onto is simpler. It is the woman who tells me she came off her medication, or feels like herself again. That is why I do this, and now I want to do it with you. I got you.</p>
            </div>
            <div className="mt-8 max-w-[380px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="story" onDark /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 3. Why nothing has worked ────────────────────────────────────────────────
function WhyNothing() {
  const cards = [
    { title: "Eating less just backfires.", text: "You cut back and skip meals. Then you are starving by night, and it all comes back. Eating less was never the answer." },
    { title: "You can't out-train your plate.", text: "All those workouts, and the scale barely moves. What you eat matters far more than what you burn, and grinding harder only leaves you hungrier." },
    { title: "Every Monday is day one again.", text: "You start strong. By Wednesday, you are back. You have started over more times than you can count, and you are tired of it." },
    { title: "On your own, it never lasts.", text: "You hold it together for a week or two, then life hits and nobody is there to catch you. Willpower runs out. Somebody in your corner does not." },
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="text-center">
          <Eyebrow>Why nothing has worked</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">Sound familiar?</h2>
          <p className="mx-auto mt-5 max-w-[680px] text-[18px] leading-[1.6] text-ink-soft sm:text-[20px]">
            You have tried everything. Here is why none of it stuck.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl bg-white p-6 sm:p-7 shadow-[0_18px_40px_-30px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              <h3 className="font-sans text-[21px] font-bold tracking-tight text-ink sm:text-[23px]">{c.title}</h3>
              <p className="mt-2 text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl p-7 text-center sm:p-9" style={{ backgroundColor: "#15102a" }}>
          <p className="mx-auto max-w-[760px] font-[Montserrat] font-semibold text-[22px] leading-[1.35] tracking-[-0.01em] text-white sm:text-[26px]">
            It was never your willpower. Your body changed after 40, and nobody gave you a plan built for it, or stayed with you through it. That is exactly what I do.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="why" /></div>
      </div>
    </section>
  );
}

// ── 4. The method ────────────────────────────────────────────────────────────
function Method() {
  const shifts = [
    { Icon: Zap, title: "First, we reset your body.", text: "We start with a reset that gets your body working with you again. It quiets your cravings, settles your hormones and your blood sugar, and drops up to 15 pounds. You feel it fast, and it gives you your running start." },
    { Icon: UtensilsCrossed, title: "Then we feed your body, we don't punish it.", text: "No starving. No punishing gym. Real food you actually love, simple to make, planned around your life. The grocery lists alone can save you up to $75 a month." },
    { Icon: Phone, title: "And this time, you've got me.", text: "You already know what to do. You have the books. What you never had is somebody who shows up every day and does not leave. A text every morning. A call every week. That is me, and that is what finally makes it stick." },
  ];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="text-center">
          <Eyebrow>The method</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">The 3 shifts that change everything</h2>
          <p className="mx-auto mt-5 max-w-[680px] text-[18px] leading-[1.6] text-ink-soft sm:text-[20px]">
            The exact shifts that took me from stuck to feeling like myself again. Now they are yours.
          </p>
        </div>
        <div className="mt-10 space-y-5 lg:mt-12 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {shifts.map(({ Icon, title, text }, i) => (
            <div key={title} className="rounded-2xl bg-bg-soft p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: PINK }}><Icon className="h-6 w-6" strokeWidth={2} /></span>
                <span className="text-[26px] font-bold" style={{ color: BERRY }}>{i + 1}</span>
              </div>
              <h3 className="mt-4 text-[20px] font-bold tracking-tight text-ink sm:text-[22px]">{title}</h3>
              <p className="mt-2 text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="method" /></div>
      </div>
    </section>
  );
}

// ── 4b. How the challenge works (week by week) ───────────────────────────────
function HowChallengeWorks() {
  const phases = [
    { weeks: "Weeks 1 to 2", title: "The reset", text: "You start with your reset and feel it fast. The bloat drops, your cravings quiet, the scale starts moving, and for the first time in a long time, you believe this one is different." },
    { weeks: "Weeks 3 to 8", title: "The turning point", text: "The clothes start fitting differently. People begin to notice. And on the days you would normally quit, the morning texts and the weekly calls keep you going, because someone is finally in it with you." },
    { weeks: "Weeks 9 to 12", title: "Feeling like yourself again", text: "Up to 30 pounds lighter. Back in the clothes you were holding onto. Energy you forgot you had. And it does not stop when the 12 weeks do." },
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="text-center">
          <Eyebrow>Your 12 weeks</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">Here is exactly what happens</h2>
        </div>
        <div className="mt-10 space-y-5 lg:mt-12 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
          {phases.map((p) => (
            <div key={p.title} className="rounded-2xl bg-white p-7 shadow-[0_18px_40px_-30px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              <span className="inline-flex rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-[0.1em] text-white" style={{ background: PINK }}>{p.weeks}</span>
              <h3 className="mt-4 text-[21px] font-bold tracking-tight text-ink sm:text-[23px]">{p.title}</h3>
              <p className="mt-2 text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="roadmap" /></div>
      </div>
    </section>
  );
}

// ── 5. What you get ──────────────────────────────────────────────────────────
function WhatYouGet() {
  const items = [
    { Icon: Phone, title: "Weekly one-on-one calls with JJ.", text: "Every week, you and me on a call. We look at your week, fix what got in the way, and set the next one up to win." },
    { Icon: MessageCircle, img: dailySmsImage, title: "A text from JJ every morning.", text: "You wake up to me checking in on you. You never start the day alone again." },
    { Icon: Zap, title: "Your reset.", text: "We start here. It quiets your cravings, kills the bloat, and drops up to 15 pounds, so you feel it working right away." },
    { Icon: UtensilsCrossed, img: mealsCardImage, title: "Meals built around the food you love.", text: "Planned for you, simple to make. No guessing, no wondering what to eat, and food you actually want to eat." },
    { Icon: UserCheck, title: "A plan made for your body.", text: "Built around your life, your schedule, and the season you are in, so it finally fits." },
    { Icon: Users, title: "The Circle of Women.", text: "A private room of women on the same journey, so you are never the only one, and you never feel like it." },
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="text-center">
          <Eyebrow>What is inside</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">Here is everything you get</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {items.map(({ Icon, img, title, text }) => (
            <div key={title} className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_44px_-28px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              {img ? (
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={img} alt={title} className="h-full w-full object-cover object-center" loading="lazy" />
                </div>
              ) : (
                /* Image placeholder: gradient + icon until real product shots are ready. */
                <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden" style={{ background: "linear-gradient(150deg, #fbe0ee 0%, #ef9cc4 55%, #c93f86 100%)" }}>
                  <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 30% 25%, #fff 0, transparent 40%)" }} aria-hidden />
                  <Icon className="relative h-11 w-11 text-white drop-shadow-[0_6px_16px_rgba(140,17,74,0.5)]" strokeWidth={1.7} />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-[18px] font-bold tracking-tight text-ink sm:text-[19px]">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-[1.55] text-ink-soft sm:text-[16px]">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="what-you-get" /></div>
      </div>
    </section>
  );
}

// ── 6. Real results ──────────────────────────────────────────────────────────
// NOTE: result figures/quotes are directional placeholders pending verifiable data (Meka).
function RealResults() {
  const results = [
    { src: t12, num: "Lost 74 lbs.", text: "Off 5 medications. Takes the stairs without stopping. \"I have myself back.\"" },
    { src: t4, num: "Lost 31 lbs.", text: "Back in the dress she kept for three years. Wore it to her daughter's wedding." },
    { src: t7, num: "Lost 22 lbs.", text: "Blood pressure normal. Sleeping through the night. \"First time a plan did not leave me on my own.\"" },
    { src: t10, num: "Lost 28 lbs.", text: "Energy back. In family photos again, front and center." },
    { src: t8, num: "Lost 19 lbs.", text: "Off the couch and back to walking every morning. \"I feel like the woman I forgot I was.\"" },
    { src: t1, num: "Lost 24 lbs.", text: "Not hiding in baggy clothes anymore. Smiling in pictures again." },
  ];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1100px]">
        <div className="text-center">
          <Eyebrow>Real women, real results</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">They got themselves back. So will you.</h2>
        </div>
        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-3">
          {results.map((r, i) => (
            <figure key={i} className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_44px_-28px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              <img src={r.src} alt="A woman's before and after transformation" className="block h-auto w-full object-cover" loading="lazy" />
              <figcaption className="p-5">
                <p className="text-[22px] font-extrabold tracking-tight text-ink">{r.num}</p>
                <p className="mt-1.5 text-[16px] leading-[1.6] text-ink-soft">{r.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="results" /></div>
      </div>
    </section>
  );
}

// ── 7. Pricing and value stack ───────────────────────────────────────────────
const VALUE_STACK = [
  { label: "Weekly one-on-one calls with JJ", value: 1200 },
  { label: "A text from JJ every morning", value: 400 },
  { label: "Your reset", value: 97 },
  { label: "A done-for-you meal plan, built around the food you love", value: 300 },
  { label: "A plan made for your body and your life", value: 200 },
  { label: "Grocery lists that save you up to $75 a month", value: 150 },
  { label: "The Recipe Vault", value: 97 },
  { label: "The Circle of Women", value: 200 },
];

function Pricing() {
  const { premium: basic } = useCoachPrograms();
  const totalValue = VALUE_STACK.reduce((n, it) => n + it.value, 0);
  const monthlyHref = basic ? signupUrl(basic.id, "MONTHLY") : "/checkout";
  const fullHref = basic ? signupUrl(basic.id, "FULL_PROGRAM") : "/checkout";
  const [plan, setPlan] = useState<"full" | "monthly">("full");
  const selectedHref = plan === "full" ? fullHref : monthlyHref;

  return (
    <section id="offer" className="scroll-mt-16 px-5 py-16 lg:py-24" style={{ backgroundColor: PLUM }}>
      <div className="mx-auto max-w-[600px]">
        {/* Aspirational per-day header. */}
        <div className="text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-white/50">Join the challenge</p>
          <h2 className="mt-4 font-[Montserrat] font-bold text-[30px] leading-[1.12] tracking-[-0.02em] text-white sm:text-[40px] lg:text-[44px]">
            Your comeback starts at <span style={{ color: "#f39bc4" }}>${MEMBER_DAILY} a day</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-[17px] leading-[1.55] text-white/70 sm:text-[18px]">
            Less than a coffee. A price with no excuse left in it, and a guarantee with no risk in it.
          </p>
        </div>

        {/* Urgency strip: doors close countdown. */}
        <div className="mx-auto mt-7 flex max-w-[500px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-[14px] font-bold text-white sm:text-[15px]" style={{ background: "linear-gradient(90deg, #b8386a 0%, #8c2a52 100%)" }}>
          🔥 Doors close in <Countdown /> · limited spots
        </div>

        <div className="relative mt-5 rounded-[1.9rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-8">
          {/* Choose your plan: two clearly distinct options. */}
          <p className="text-center text-[13px] font-bold uppercase tracking-[0.14em] text-ink-faint">Choose your plan</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* Pay in full. */}
            <button
              type="button"
              onClick={() => setPlan("full")}
              aria-pressed={plan === "full"}
              className={`relative rounded-2xl border-2 p-5 text-left transition ${plan === "full" ? "border-[#c41e6a] bg-[#fdf2f7] shadow-[0_16px_34px_-20px_rgba(196,30,106,0.6)]" : "border-line bg-white hover:border-[#f0c9d8]"}`}
            >
              <span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: PINK }}>Best value</span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${plan === "full" ? "border-[#c41e6a] bg-[#c41e6a]" : "border-line"}`}>
                {plan === "full" && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
              </span>
              <p className="mt-3 text-[14px] font-bold text-ink">Pay in full</p>
              <div className="mt-1 flex items-end">
                <span className="font-[Montserrat] text-[38px] font-extrabold leading-none tracking-[-0.02em] text-ink">${PAY_IN_FULL}</span>
                <span className="mb-1 ml-1 text-[13px] font-bold text-ink-soft">once</span>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-ink-soft">All 12 weeks, paid upfront.</p>
              <p className="mt-1.5 text-[13px] font-bold" style={{ color: BERRY }}>Save ${PAY_IN_FULL_SAVINGS} vs monthly</p>
            </button>
            {/* Monthly. */}
            <button
              type="button"
              onClick={() => setPlan("monthly")}
              aria-pressed={plan === "monthly"}
              className={`relative rounded-2xl border-2 p-5 text-left transition ${plan === "monthly" ? "border-[#c41e6a] bg-[#fdf2f7] shadow-[0_16px_34px_-20px_rgba(196,30,106,0.6)]" : "border-line bg-white hover:border-[#f0c9d8]"}`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${plan === "monthly" ? "border-[#c41e6a] bg-[#c41e6a]" : "border-line"}`}>
                {plan === "monthly" && <Check className="h-3 w-3 text-white" strokeWidth={4} />}
              </span>
              <p className="mt-3 text-[14px] font-bold text-ink">Monthly</p>
              <div className="mt-1 flex items-end">
                <span className="font-[Montserrat] text-[38px] font-extrabold leading-none tracking-[-0.02em] text-ink">${MEMBER_PRICE}</span>
                <span className="mb-1 ml-1 text-[13px] font-bold text-ink-soft">/month</span>
              </div>
              <p className="mt-1 text-[13px] font-semibold text-ink-soft">Billed monthly. Cancel anytime.</p>
              <p className="mt-1.5 text-[13px] font-bold" style={{ color: BERRY }}>Just ${MEMBER_DAILY} a day</p>
            </button>
          </div>

          {/* Everything included. */}
          <p className="mt-6 text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: BERRY }}>Everything included</p>
          <ul className="mt-2 border-t border-dashed border-[#f0c9d8] pt-1">
            {VALUE_STACK.map((it) => (
              <li key={it.label} className="flex items-start justify-between gap-3 border-b border-dashed border-[#f0c9d8] py-2.5 text-[15px] text-ink last:border-b-0 sm:text-[16px]">
                <span className="flex items-start gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-[#d62a7a]" strokeWidth={3} /> {it.label}</span>
                <span className="shrink-0 text-ink-faint line-through">${it.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-bg-soft px-4 py-3">
            <span className="text-[16px] font-bold text-ink">Total value</span>
            <span className="text-[20px] font-bold text-ink-faint line-through">${totalValue.toLocaleString()}+</span>
          </div>
          <p className="mt-3 text-center text-[16px] font-semibold text-[#1c7a3f]">
            {plan === "full"
              ? <>You pay <span className="text-ink">${PAY_IN_FULL} once</span> for all 12 weeks, and save ${PAY_IN_FULL_SAVINGS}.</>
              : <>You pay just <span className="text-ink">${MEMBER_PRICE}/month</span>, cancel anytime.</>}
          </p>

          <div className="mt-6"><CtaButton label={plan === "full" ? "Join the challenge — pay in full" : "Join the challenge — monthly"} position={`pricing-${plan}`} href={selectedHref} /></div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-[#c41e6a]" /> 14-day money-back guarantee · limited spots · cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 8. Guarantee ─────────────────────────────────────────────────────────────
function Guarantee() {
  const pills = ["14-Day Money Back", "No Questions Asked", "Cancel Anytime", "Zero Risk"];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[820px]">
        <div className="rounded-3xl bg-white p-8 text-center shadow-[0_30px_70px_-40px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0] sm:p-12">
          {/* Circular 14-day badge with a soft glow. */}
          <div className="relative mx-auto h-[100px] w-[100px]">
            <div className="absolute inset-0 rounded-full opacity-45 blur-2xl" style={{ background: "radial-gradient(circle, #d9628f 0%, transparent 70%)" }} aria-hidden />
            <div className="relative flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full text-white shadow-[0_16px_34px_-12px_rgba(140,17,74,0.7)]" style={{ background: "linear-gradient(160deg, #b8386a 0%, #8c2a52 100%)" }}>
              <span className="font-[Montserrat] text-[32px] font-extrabold leading-none">14</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]">Day</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Guarantee</span>
            </div>
          </div>
          <h2 className="mx-auto mt-6 max-w-[620px] font-[Montserrat] font-bold text-[30px] leading-[1.12] tracking-[-0.02em] text-ink sm:text-[42px]">
            You Either See Results
            <br />
            <span className="italic" style={{ color: BERRY }}>or Your Money Back</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[18px] leading-[1.7] text-ink-soft sm:text-[19px]">
            Give me 14 days. Do the work with me, and if you do not feel different, more hopeful, more in control, like this is finally the thing, just tell me. I send back every penny. No questions. No guilt. I only want your money if you are glad you are here. That is my promise to you.
          </p>
          <p className="mt-4 text-[14px] font-semibold tracking-[0.16em] text-ink-faint">JJ</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {pills.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-[#f0c9d8] bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink">
                <Check className="h-3.5 w-3.5 text-[#1c7a3f]" strokeWidth={3} /> {p}
              </span>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-[420px]"><CtaButton label="Join the challenge, risk-free" sub={CTA_SUB} position="guarantee" /></div>
        </div>
      </div>
    </section>
  );
}

// ── 9. The close ─────────────────────────────────────────────────────────────
function Close() {
  return (
    <section className="px-5 py-20 text-center lg:py-28" style={{ backgroundColor: "#15102a" }}>
      <div className="mx-auto max-w-[760px]">
        <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.08] tracking-[-0.02em] text-white sm:text-[44px] lg:text-[52px]">The doors close in <Countdown />.</h2>
        <div className="mx-auto mt-6 max-w-[600px] space-y-4 text-[18px] leading-[1.7] text-white/85 sm:text-[20px]">
          <p>You can keep waiting for the next Monday, the next book, the next fresh start that fizzles by Wednesday.</p>
          <p>Or you can start now, with a group of women already in it, and me beside you the whole way.</p>
          <p>But the doors on this group close soon, and once they do, they do. If you want in, now is the time.</p>
        </div>
        <div className="mx-auto mt-9 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="close" onDark /></div>
      </div>
    </section>
  );
}

// ── 10. FAQ ──────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
    { q: "Can I still join?", a: "If you are reading this, there is still room, but the doors close soon and spots are limited. Once this group starts together, that's it." },
    { q: "What if I miss this one?", a: "Then you wait for the next group, whenever that is. This is one of the few times the doors are open, with a group of women starting at the same time as you." },
    { q: "Can I pay all at once?", a: `Yes. Pay in full at $${PAY_IN_FULL} for all 12 weeks and save $${PAY_IN_FULL_SAVINGS}, or go month to month at $${MEMBER_PRICE} and cancel anytime.` },
    { q: "Why is it monthly if the challenge is 12 weeks?", a: "The challenge runs 12 weeks, but I stay in your corner for as long as you want me there. Monthly keeps it flexible, so you are never locked in and can cancel anytime." },
    { q: "I'm in my 50s and nothing has worked.", a: "That is exactly who this is for. The plan is built for your season, and this time you are not on your own." },
    { q: "I don't have time.", a: "Your meals are planned for you and the check-ins keep it simple. This is one less thing to carry, not one more." },
    { q: "Do I have to drink green smoothies?", a: "No. The reset is a fast start. After it, you keep the food you love." },
    { q: "What makes this different?", a: "Everyone else hands you a plan and leaves. I stay, one on one, every single day." },
    { q: "I'm on a weight-loss shot. Is this for me?", a: "Yes. A shot can quiet your appetite. It cannot build your habits, protect your muscle, or be in your corner. That is the part that lasts, and that is what we do together." },
    { q: "How does billing work?", a: "Monthly. Cancel anytime, no contract." },
    { q: "What if I fall behind?", a: "You pick up right where you left off, and I help you. This was never about being perfect." },
    { q: "What if I change my mind?", a: "The 14-day promise has you covered. Money back, no reason needed." },
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[860px]">
        <div className="text-center">
          <Eyebrow>Questions women ask me</Eyebrow>
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">Let me answer <Berry>what's on your mind</Berry>.</h2>
        </div>
        <Accordion type="single" collapsible defaultValue="q-0" className="mt-8 w-full">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-line">
              <AccordionTrigger className="py-5 text-left text-[18px] font-semibold text-ink hover:no-underline sm:text-[19px]">{it.q}</AccordionTrigger>
              <AccordionContent className="text-[17px] leading-[1.75] text-ink-soft">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Join the challenge" sub={CTA_SUB} position="faq" /></div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <img src={jjSmithLogo} alt="JJ Smith" className="h-5 w-auto" />
        <p className="text-[13px] text-ink-faint">
          © {new Date().getFullYear()} JJ Smith. All rights reserved. · <a href="#" className="underline">Privacy</a> · <a href="#" className="underline">Terms</a>
        </p>
      </div>
    </footer>
  );
}

// ── Sticky CTA ───────────────────────────────────────────────────────────────
function StickyCta() {
  const [show, setShow] = useState(false);
  const [offerVisible, setOfferVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const el = document.getElementById("offer");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOfferVisible(e.isIntersecting), { threshold: 0, rootMargin: "0px 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const visible = show && !offerVisible;
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.18)] transition-opacity duration-200 sm:hidden ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-center gap-3 px-4 pt-3">
        <div className="flex-1 text-[14px] font-semibold leading-tight text-ink">
          Doors close in <span style={{ color: BERRY }}><Countdown /></span> · limited spots
        </div>
        <button onClick={scrollToOffer} data-cta="yes-jj" data-position="sticky" className="rounded-xl px-5 py-3 text-[14px] font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(184,24,96,0.6)]" style={{ background: PINK }}>
          Join the challenge →
        </button>
      </div>
    </div>
  );
}
