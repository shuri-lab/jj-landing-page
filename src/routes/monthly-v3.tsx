import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check, Award, TrendingDown, ShieldCheck, Phone, MessageCircle, UtensilsCrossed,
  Users, Zap, HeartPulse, Quote, Lock, X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCoachPrograms, signupUrl } from "@/lib/coach-programs";
import { scrollToOffer } from "@/lib/scroll-to-offer";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import quizHeroDesktop from "@/assets/landing/quiz-hero-image-desktop.png";
import quizHeroMobile from "@/assets/landing/quiz-hero-image-mobile.png";
import jjOwnTransformation from "@/assets/landing/jj-own-transformation.png";
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

export const Route = createFileRoute("/monthly-v3")({
  head: () => ({
    meta: [
      { title: "Get Your Sexy Back After 40 — JJ Smith Personal Coaching" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Lose up to 15 pounds in your first 30 days with JJ Smith by your side every day. A plan built for a body over 40, no starving, never alone.",
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
const PLUM = "#2a1020"; // dark plum for the story + pricing blocks

// Ongoing-membership working numbers (TJ to confirm).
const MEMBER_PRICE = 47;
const MEMBER_WAS = 67;
const MEMBER_DAILY = "1.57";

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
        <PainQuestions />
        <JJStory />
        <SocialWall />
        <ValueProps />
        <HowItWorks />
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

// Bold scan-anchor inside body copy. Dark-aware.
function B({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return <strong className={`font-bold ${onDark ? "text-white" : "text-ink"}`}>{children}</strong>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] font-bold uppercase tracking-[0.22em] mb-4" style={{ color: BERRY }}>{children}</p>;
}

// One string to update everywhere if the price moves off $1.57/day.
const CTA_SUB = "Only $1.57/day · 14-day money back guarantee";

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

// Three reassurance ticks that sit under a hero/section CTA.
function FudReducers({ onDark = false }: { onDark?: boolean }) {
  const items = ["$1.57 a day", "14-day money-back guarantee"];
  return (
    <div className={`flex flex-nowrap items-center justify-center gap-x-4 whitespace-nowrap text-[12.5px] font-semibold sm:text-[14px] ${onDark ? "text-white/75" : "text-ink-soft"}`}>
      {items.map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 shrink-0" style={{ color: BERRY }} strokeWidth={3} /> {t}
        </span>
      ))}
    </div>
  );
}

// ── Announcement bar ─────────────────────────────────────────────────────────
function AnnouncementBar() {
  return (
    <div className="relative w-full overflow-hidden text-white" style={{ background: "linear-gradient(90deg, #2a1020 0%, #8c2a52 50%, #2a1020 100%)" }}>
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-5 py-2.5 text-center text-[12px] font-semibold sm:text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-[0.12em]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f39bc4]" />
          🌸 14-Day Money Back Guarantee
        </span>
        <span className="text-white/30 max-sm:hidden">·</span>
        <span className="text-white/85 max-sm:hidden">Join today with zero risk</span>
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
          Join now →
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
            <HeroTrustBar />
            <HeroHeadline className="mt-5" />
            <HeroSubhead className="mt-5" />
            <div className="mt-8 max-w-[440px]"><HeroPrimaryCta /></div>
            <div className="mt-4 max-w-[440px]"><FudReducers /></div>
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
          <HeroSubhead className="mt-5" />
          <div className="mt-7"><HeroPrimaryCta /></div>
          <div className="mt-4"><FudReducers /></div>
          <img src={quizHeroMobile} alt="JJ Smith, your personal coach" className="mx-auto mt-8 block h-auto w-full max-w-[230px]" width={2000} height={2000} />
        </div>

        <HeroTransformationsMarquee />
        <PressLogos className="mt-10 lg:mt-12" />
      </div>
    </section>
  );
}

function HeroHeadline({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <h1
        className="text-left text-[30px] leading-[1.1] tracking-[-0.015em] text-[#15102a] sm:text-[40px] lg:text-[46px]"
        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
      >
        Get your <span style={{ color: BERRY }}>sexy back</span> after 40 and lose up to <span style={{ color: BERRY }}>15 pounds</span> in your first 30 days.
      </h1>
    </div>
  );
}

function HeroSubhead({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-[580px] text-left text-[18px] font-medium leading-[1.5] text-ink sm:text-[20px] ${className}`}>
      A plan built for a body over 40, food you actually love, and weekly 1-on-1 calls and daily texts from JJ. <B>No starving. Never alone.</B>
    </p>
  );
}

function HeroPrimaryCta() {
  return <CtaButton label="Start today" position="hero-top" />;
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
      <p className={`text-center text-[11px] font-bold uppercase tracking-[0.22em] ${dark ? "text-white/50 lg:text-left" : "text-ink-faint"}`}>As seen on</p>
      {/* On the dark section, the logos keep their original colors on a white band. */}
      <div className={`relative mt-4 overflow-hidden ${dark ? "rounded-2xl bg-white px-2 py-4" : ""}`}>
        <div className="flex w-max items-center gap-10 animate-marquee sm:gap-12">
          {track.map((l, i) => (
            <img key={i} src={l.src} alt={l.alt} className="h-10 w-auto shrink-0 object-contain opacity-80 sm:h-12" loading="eager" />
          ))}
        </div>
        <div className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r ${dark ? "from-white" : "from-background"} to-transparent`} />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l ${dark ? "from-white" : "from-background"} to-transparent`} />
      </div>
    </div>
  );
}

// ── 2a. Pain — Sound familiar? (Problem) ─────────────────────────────────────
function PainQuestions() {
  const questions = [
    "Do you eat less and less, and the weight still will not move?",
    "Have you started over so many Mondays you have lost count?",
    "Are you tired of doing all of this on your own?",
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[760px]">
        <div className="text-center">
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">
            Sound <Berry>familiar?</Berry>
          </h2>
        </div>
        <ul className="mx-auto mt-10 max-w-[640px] space-y-4">
          {questions.map((q) => (
            <li key={q} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-[0_18px_40px_-30px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0] sm:p-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbe0ee]"><X className="h-5 w-5 text-[#c41e6a]" strokeWidth={3} /></span>
              <span className="text-[18px] font-semibold leading-[1.4] text-ink sm:text-[20px]">{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── 2b. JJ's story (Agitate + Solve) ─────────────────────────────────────────
function JJStory() {
  return (
    <section className="px-5 py-16 lg:py-24" style={{ backgroundColor: PLUM }}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="lg:grid lg:grid-cols-[0.85fr_1fr] lg:items-start lg:gap-12">
          <div className="mb-8 min-w-0 lg:mb-0">
            <div className="mx-auto max-w-[440px] overflow-hidden rounded-3xl shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/10 lg:mx-0 lg:max-w-none">
              <img src={jjOwnTransformation} alt="JJ Smith's own transformation" className="block h-auto w-full" width={2000} height={2000} loading="lazy" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="font-[Montserrat] font-bold text-[30px] leading-[1.14] tracking-[-0.02em] text-white sm:text-[40px] lg:text-[46px]">I know that feeling. I lived it.</h2>
            <div className="mt-6 space-y-5 text-[19px] font-medium leading-[1.65] text-white/90 sm:text-[21px]">
              <p>In my late 30s my body turned on me. The weight came out of nowhere. I was exhausted, foggy, and some mornings <B onDark>I did not recognize the woman in the mirror</B>.</p>
              <p>I did everything they tell you. <B onDark>Skipped meals. Cut carbs. Dragged myself to the gym.</B> Nothing moved.</p>
            </div>
            <p className="mt-7 border-l-2 pl-5 font-serif italic text-[19px] leading-[1.45] sm:text-[22px]" style={{ color: "#f39bc4", borderColor: "rgba(243,155,196,0.5)" }}>
              "The advice was always eat less, move more. Nobody warned me my body had changed, and those old rules would never work for me again."
            </p>
            <div className="mt-8 space-y-5 text-[19px] font-medium leading-[1.65] text-white/90 sm:text-[21px]">
              <p>Maybe you know how that goes. You cut back, and by nine at night you are standing at the fridge, <B onDark>starving</B>.</p>
              <p>You start strong on Monday. <B onDark>By Wednesday, you are back.</B></p>
              <p>And every time it happens, that quiet voice gets a little louder. <span className="italic text-white">Maybe this is just how it is now.</span></p>
              <p>Meanwhile the clothes you love stay in the back of the closet. You dodge the camera. Another year goes by, waiting to feel like yourself again.</p>
              <p className="font-bold text-white">Here is what finally changed it for me.</p>
              <p><B onDark>I stopped fighting my body and started working with it.</B> My hormones, my blood sugar, and the muscle that keeps you burning.</p>
              <p>The weight came off. <B onDark>My energy came roaring back.</B> In my 40s, I felt better than I did at 30.</p>
              <p>That is exactly what we do together now. We reset your body first. We build your meals around the food you already love. And <B onDark>I am with you every single day</B>, a text every morning and a call with me every week.</p>
              <p>That is the part you have never had. <B onDark>And that is the part that makes it stick.</B></p>
            </div>
            <div className="mt-8 max-w-[380px]"><CtaButton label="Start today" sub={CTA_SUB} position="story" onDark /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 3. Social proof wall ─────────────────────────────────────────────────────
// NOTE: pounds-lost figures and quotes are directional placeholders pending verifiable data (Meka).
function SocialWall() {
  const cards = [
    { src: t12, quote: "My waist came back, and my belly fat finally let go.", lbs: 32 },
    { src: t4, quote: "I got my curves back. Snatched, not skinny.", lbs: 41 },
    { src: t10, quote: "My clothes fit again, and I look 10 years younger.", lbs: 27 },
    { src: t8, quote: "My energy is back, and my confidence came with it.", lbs: 19 },
    { src: t7, quote: "My health came back. Pre-diabetes reversed, blood pressure normal.", lbs: 54 },
    { src: t1, quote: "Down a size I have not worn in a decade.", lbs: 23 },
    { src: t9, quote: "I am smiling in pictures again. Dressing up again.", lbs: 16 },
    { src: t11, quote: "I finally lost the baby weight.", lbs: 21 },
  ];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1150px]">
        <div className="text-center">
          <h2 className="mx-auto max-w-[900px] font-[Montserrat] font-bold text-[30px] leading-[1.12] tracking-[-0.02em] text-ink sm:text-[40px] lg:text-[44px]">
            Join thousands of women over 40 who stopped starting over and <Berry>finally got their bodies back.</Berry>
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {cards.map((c, i) => (
            <figure key={i} className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_44px_-28px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              <div className="relative">
                <img src={c.src} alt="A woman's before and after transformation" className="block h-auto w-full object-cover" loading="lazy" />
                {/* Before / after split labels. */}
                <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-[11px]">Before</span>
                <span className="absolute right-3 top-3 rounded-md px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-white sm:text-[11px]" style={{ background: BERRY }}>After</span>
                {/* Pounds-lost badge. */}
                <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-white/95 px-4 py-1.5 text-[16px] font-extrabold text-[#15102a] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.45)] sm:text-[14px]">
                  Down {c.lbs} lbs
                </span>
              </div>
              <figcaption className="relative overflow-hidden p-6 sm:p-5">
                <Quote className="pointer-events-none absolute -left-1 -top-2 h-16 w-16 opacity-[0.06]" style={{ color: BERRY }} fill="currentColor" aria-hidden />
                <p className="relative text-[19px] font-semibold leading-[1.5] text-ink sm:text-[16px]">"{c.quote}"</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[440px]"><CtaButton label="Start today" sub={CTA_SUB} position="social-wall" /></div>
      </div>
    </section>
  );
}

// ── 4. Value props ───────────────────────────────────────────────────────────
function ValueProps() {
  const items = [
    { Icon: Phone, title: "Weekly 1-on-1 calls with JJ", text: <>Get on a call with JJ every week and fix what got in your way, so <B>you never lose another month</B>.</> },
    { Icon: MessageCircle, title: "Daily texts from JJ", text: <>Wake up to a text from JJ every morning and <B>never start another day alone</B> or wondering what to do.</> },
    { Icon: Zap, title: "Your reset", text: <>A reset that quiets your cravings and <B>drops up to 15 pounds</B>, so you feel it working in your first days.</> },
    { Icon: UtensilsCrossed, title: "Meals built around the food you love", text: <>Eat the food you already love, planned for you and simple to make, with <B>grocery lists that save you up to $75 a month</B>.</> },
    { Icon: HeartPulse, title: "A plan built for a body over 40", text: <>Work with your hormones and blood sugar instead of against them, so <B>your effort finally shows on the scale</B>.</> },
    { Icon: Users, title: "The Circle", text: <>Walk in beside hundreds of women on the same journey, so <B>you never feel like the only one again</B>.</> },
  ];
  return (
    <section className="px-5 py-16 bg-bg-soft lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[1050px]">
        <div className="text-center">
          <h2 className="mx-auto max-w-[820px] font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[46px]">
            Everything you need to finally do this, and <Berry>someone who makes sure you do.</Berry>
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-3 sm:grid-cols-2">
          {items.map(({ Icon, title, text }) => (
            <div key={title} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_44px_-28px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0]">
              {/* Image placeholder: gradient + icon until real product shots are ready. */}
              <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden" style={{ background: "linear-gradient(150deg, #fbe0ee 0%, #ef9cc4 55%, #c93f86 100%)" }}>
                <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 30% 25%, #fff 0, transparent 40%)" }} aria-hidden />
                <Icon className="relative h-11 w-11 text-white drop-shadow-[0_6px_16px_rgba(140,17,74,0.5)]" strokeWidth={1.7} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-[Montserrat] text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink sm:text-[22px]">{title}</h3>
                <p className="mt-2.5 text-[15.5px] font-normal leading-[1.55] text-ink-soft sm:text-[16px]">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Start today" sub={CTA_SUB} position="value-props" /></div>
      </div>
    </section>
  );
}

// ── 5. How it works ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { title: "Jump on a call with JJ", text: <>The moment you join, you and I get on a call. You tell me what you have tried, what never worked, what you actually want, the foods you love, and where you struggle. <B>I get to know you</B>, so your plan is <B>built around your real life</B>.</> },
    { title: "Reset your body", text: <>You start with your reset. <B>The bloat drops, the cravings quiet</B>, and you <B>feel it working right away</B>.</> },
    { title: "Eat the food you love", text: <>Your meals get planned around your real life, so <B>the weight keeps coming off</B>, <B>without starving</B>.</> },
    { title: "Keep going, every single day", text: <>A text from me <B>every morning</B>. And a 1-on-1 call <B>every week</B> to fix what is not working, sort out what got in your way, and <B>keep you going on the days you would have quit</B>.</> },
  ];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[760px]">
        <div className="text-center">
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">
            Feel like yourself again in <Berry>four simple steps.</Berry>
          </h2>
        </div>
        <div className="relative mx-auto mt-10 max-w-[680px] lg:mt-12">
          {/* Vertical connecting line running through the number nodes. */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-[#f0c9d8]" aria-hidden />
          <ol className="space-y-5">
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex items-start gap-4 sm:gap-5">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-[Montserrat] text-[22px] font-extrabold text-white shadow-[0_12px_24px_-10px_rgba(184,24,96,0.7)] ring-4 ring-background" style={{ background: PINK }}>{i + 1}</span>
                <div className="flex-1 rounded-2xl bg-bg-soft p-6 shadow-[0_18px_40px_-32px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0] sm:p-7">
                  <h3 className="font-[Montserrat] text-[20px] font-bold leading-[1.15] tracking-[-0.01em] text-ink sm:text-[23px]">{s.title}</h3>
                  <p className="mt-2 text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Start today" sub={CTA_SUB} position="how-it-works" /></div>
      </div>
    </section>
  );
}

// ── 6. Pricing and value stack ───────────────────────────────────────────────
const VALUE_STACK = [
  { label: "Weekly one-on-one calls with JJ", value: 1200 },
  { label: "A text from JJ every morning", value: 400 },
  { label: "Your reset, lose up to 15 pounds in your first 30 days", value: 97 },
  { label: "A done-for-you meal plan, built around the food you love", value: 300 },
  { label: "A plan made for your body and your life", value: 200 },
  { label: "Grocery lists that save you up to $75 a month", value: 150 },
  { label: "The Recipe Vault", value: 97 },
  { label: "The Circle of Women", value: 200 },
];

function Pricing() {
  const { basic } = useCoachPrograms();
  const totalValue = VALUE_STACK.reduce((n, it) => n + it.value, 0);
  const monthlyHref = basic ? signupUrl(basic.id, "MONTHLY", { durationWeeks: basic.durationWeeks }) : "/checkout";

  return (
    <section id="offer" className="scroll-mt-16 px-5 py-16 lg:py-24" style={{ backgroundColor: PLUM }}>
      <div className="mx-auto max-w-[600px]">
        {/* Aspirational per-day header. */}
        <div className="text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-white/50">Get started</p>
          <h2 className="mt-4 font-[Montserrat] font-bold text-[30px] leading-[1.12] tracking-[-0.02em] text-white sm:text-[40px] lg:text-[44px]">
            Your comeback starts at <span style={{ color: "#f39bc4" }}>${MEMBER_DAILY} a day</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-[17px] leading-[1.55] text-white/70 sm:text-[18px]">
            Less than a coffee ☕. A price with no excuse left in it, and a guarantee with no risk in it.
          </p>
        </div>

        <div className="relative mt-9 rounded-[1.9rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-8">
          {/* Was / now price. */}
          <div className="text-center">
            <p className="text-[15px] font-semibold text-ink-faint">Was <span className="line-through">${MEMBER_WAS}</span> &nbsp; Now</p>
            <div className="mt-1 flex items-end justify-center">
              <span className="font-[Montserrat] text-[56px] font-extrabold leading-none tracking-[-0.02em] text-ink sm:text-[64px]">${MEMBER_PRICE}</span>
              <span className="mb-1.5 ml-1 text-[20px] font-bold text-ink-soft">/month</span>
            </div>
            <p className="mt-2 text-[14px] font-semibold text-ink-soft">per month · billed monthly · cancel anytime</p>
            <p className="mt-2 text-[16px] font-bold" style={{ color: BERRY }}>That's just ${MEMBER_DAILY} a day, less than a coffee ☕.</p>
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
          <p className="mt-3 text-center text-[16px] font-semibold text-[#1c7a3f]">You pay just <span className="text-ink">${MEMBER_PRICE}/month</span>. Cancel anytime.</p>

          <div className="mt-6"><CtaButton label="Join JJ today" position="pricing" href={monthlyHref} /></div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-[#c41e6a]" /> 14-day money-back guarantee · zero risk · cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 7. Guarantee ─────────────────────────────────────────────────────────────
function Guarantee() {
  const pills = ["14-Day Money Back", "No Questions Asked", "Cancel Anytime", "Zero Risk"];
  return (
    <section className="px-5 py-16 lg:py-24">
      <div className="mx-auto max-w-[640px] lg:max-w-[820px]">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_30px_70px_-40px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0] sm:p-12">
          {/* Circular 14-day badge with a soft glow. */}
          <div className="relative mx-auto h-[90px] w-[90px] sm:h-[100px] sm:w-[100px]">
            <div className="absolute inset-0 rounded-full opacity-45 blur-2xl" style={{ background: "radial-gradient(circle, #d9628f 0%, transparent 70%)" }} aria-hidden />
            <div className="relative flex h-[90px] w-[90px] flex-col items-center justify-center rounded-full text-white shadow-[0_16px_34px_-12px_rgba(140,17,74,0.7)] sm:h-[100px] sm:w-[100px]" style={{ background: "linear-gradient(160deg, #b8386a 0%, #8c2a52 100%)" }}>
              <span className="font-[Montserrat] text-[30px] font-extrabold leading-none sm:text-[32px]">14</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]">Day</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">Guarantee</span>
            </div>
          </div>
          <h2 className="mx-auto mt-6 max-w-[620px] font-[Montserrat] font-bold text-[26px] leading-[1.14] tracking-[-0.02em] text-ink sm:text-[42px]">
            You Either See Results
            <br />
            <span className="italic" style={{ color: BERRY }}>or Your Money Back</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-[1.65] text-ink-soft sm:text-[19px] sm:leading-[1.7]">
            Give me 14 days. Do the work with me, and if you do not feel different, more hopeful, more in control, like this is finally the thing, just tell me. I send back every penny. No questions. No guilt. I only want your money if you are glad you are here. That is my promise to you.
          </p>
          <p className="mt-4 text-[14px] font-semibold tracking-[0.16em] text-ink-faint">JJ</p>
          <div className="mt-7 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:justify-center">
            {pills.map((p) => (
              <span key={p} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#f0c9d8] bg-white px-3 py-2 text-[13px] font-semibold text-ink sm:px-3.5 sm:py-1.5">
                <Check className="h-3.5 w-3.5 shrink-0" style={{ color: BERRY }} strokeWidth={3} /> {p}
              </span>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-[400px]"><CtaButton label="Start today, risk-free" sub="Only $1.57/day · cancel anytime" position="guarantee" /></div>
        </div>
      </div>
    </section>
  );
}

// ── 8. The close ─────────────────────────────────────────────────────────────
function Close() {
  const recap = [
    "Lose up to 15 pounds in your first 30 days",
    "Weekly 1-on-1 calls and daily texts from JJ",
    "Meals built around the food you love. No starving.",
    "$1.57 a day. Cancel anytime.",
  ];
  return (
    <section className="px-5 py-20 lg:py-28" style={{ backgroundColor: "#15102a" }}>
      <div className="mx-auto max-w-[1050px] lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
        {/* Left: the promise. */}
        <div className="text-center lg:text-left">
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.06] tracking-[-0.02em] text-white sm:text-[44px] lg:text-[50px]">The next 30 days are <Berry>coming either way.</Berry></h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-[1.65] text-white/85 sm:text-[21px] lg:mx-0">
            You can spend them like the last ones. Or you can spend them with me beside you, and <B onDark>finally feel like yourself again</B>.
          </p>
          <p className="mt-7 text-[14px] font-semibold uppercase tracking-[0.16em] text-white/60">800K+ women helped · 5M+ pounds lost</p>
        </div>

        {/* Right: recap + action. */}
        <div className="mt-10 rounded-3xl bg-white/[0.06] p-7 ring-1 ring-white/10 sm:p-8 lg:mt-0">
          <ul className="space-y-3.5">
            {recap.map((r) => (
              <li key={r} className="flex items-start gap-3 text-[17px] font-medium leading-[1.4] text-white sm:text-[18px]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: PINK }}><Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /></span> {r}
              </li>
            ))}
          </ul>
          <div className="mt-7"><CtaButton label="Yes, I'm in" position="close" onDark /></div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-white/70">
            <Lock className="h-3.5 w-3.5" /> 14-day guarantee · cancel anytime · secure checkout
          </p>
        </div>
      </div>
    </section>
  );
}

// ── 9. FAQ ──────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
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
          <h2 className="font-[Montserrat] font-bold text-[32px] leading-[1.1] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[48px]">Questions women <Berry>ask me</Berry>.</h2>
        </div>
        <Accordion type="single" collapsible defaultValue="q-0" className="mt-10 w-full space-y-3.5">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="overflow-hidden rounded-2xl border-0 bg-white px-5 shadow-[0_18px_40px_-32px_rgba(140,17,74,0.5)] ring-1 ring-[#f3d3e0] sm:px-6">
              <AccordionTrigger className="py-5 text-left font-[Montserrat] text-[19px] font-bold leading-[1.3] tracking-[-0.01em] text-ink hover:no-underline sm:text-[21px]">{it.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[17px] leading-[1.75] text-ink-soft sm:text-[18px]">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mx-auto mt-10 max-w-[440px]"><CtaButton label="Start today" sub={CTA_SUB} position="faq" /></div>
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
          <span style={{ color: BERRY }}>${MEMBER_DAILY} a day</span> · cancel anytime
        </div>
        <button onClick={scrollToOffer} data-cta="yes-jj" data-position="sticky" className="rounded-xl px-5 py-3 text-[14px] font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_-8px_rgba(184,24,96,0.6)]" style={{ background: PINK }}>
          Start today →
        </button>
      </div>
    </div>
  );
}
