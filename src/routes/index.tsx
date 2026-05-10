import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Play } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCountdown, pad } from "@/hooks/use-countdown";
import heroJJ from "@/assets/landing/hero-jj.png";
import jjPortrait from "@/assets/landing/jj-portrait.jpg";
import t1 from "@/assets/landing/transformation-1.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t9 from "@/assets/landing/transformation-9.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
import t11 from "@/assets/landing/transformation-11.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import tTammi from "@/assets/landing/transformation-tammi.jpg";
import tGirosalee from "@/assets/landing/transformation-girosalee.jpg";
import jjOwn from "@/assets/landing/jj-own-transformation.png";
import jjHugSignup from "@/assets/landing/jj-hug-signup.webp";
import jjLaughingClient from "@/assets/landing/jj-laughing-client.jpg";
import jjSelfieSun from "@/assets/landing/jj-selfie-sun.jpg";
import jjTightWaist from "@/assets/landing/jj-tight-waist.jpg";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JJ Smith — 12-Week Body Transformation Challenge" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks. JJ Smith's most personal program ever, built around your body, with JJ in your corner every single day.",
      },
      { property: "og:title", content: "JJ Smith — 12-Week Body Transformation Challenge" },
      {
        property: "og:description",
        content:
          "Sister, this time I'm with you every step of the way. A personalized 12-week transformation with JJ Smith.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const COHORT_DEADLINE = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

function scrollToOffer() {
  document.getElementById("offer")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function CountdownInline({ className = "" }: { className?: string }) {
  const { days, hours, minutes, seconds } = useCountdown(COHORT_DEADLINE);
  return (
    <span className={className}>
      {days > 0 ? `${days}d ` : ""}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

function CountdownPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-5 py-3 text-[13px] sm:text-[14px] font-semibold tracking-[0.16em] uppercase shadow-[0_12px_30px_-10px_rgba(184,80,66,0.55)]">
      <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Sign-ups close in:</span>
      <CountdownInline className="tabular-nums" />
    </div>
  );
}

function BigCta({
  children,
  sub,
  className = "",
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      <button
        onClick={scrollToOffer}
        className="block w-full rounded-full bg-brand text-white px-6 py-6 text-[18px] sm:text-[20px] font-semibold tracking-wide shadow-[0_18px_36px_-12px_rgba(184,80,66,0.6)] transition-transform hover:-translate-y-0.5 hover:bg-brand-deep"
      >
        {children}
        {sub && (
          <span className="block text-[12px] sm:text-[13px] font-normal opacity-90 mt-1.5 tracking-normal">
            {sub}
          </span>
        )}
      </button>
    </div>
  );
}

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`text-[12px] uppercase tracking-[0.22em] text-brand font-semibold mb-5 ${
        center ? "text-center" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Section({
  children,
  className = "",
  id,
  bg = "default",
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  bg?: "default" | "soft" | "warm";
}) {
  const bgClass = bg === "soft" ? "bg-bg-soft" : bg === "warm" ? "bg-bg-warm" : "";
  return (
    <section id={id} className={`px-5 py-20 sm:py-24 ${bgClass} ${className}`}>
      <div className="mx-auto max-w-[640px]">{children}</div>
    </section>
  );
}

function Landing() {
  return (
    <div className="bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <HugQuote />
        <PromiseQuote bg="warm" signature>
          Sister, I've spent 15 years giving you the information. This time, I'm giving you me.
        </PromiseQuote>
        <RealTalk />
        <Promise2 />
        <Steps />
        <JJReveal />
        <Transformations />
        <Offer />
        <Guarantee />
        <Faq />
        <LastCall />
      </main>
      <Footer />
      <StickyCta />
    </div>
  );
}

function Nav() {
  return (
    <div className="border-b border-line bg-background">
      <div className="mx-auto max-w-[640px] px-5 py-4 flex items-center justify-center">
        <img
          src={jjSmithLogo}
          alt="JJ Smith"
          className="h-5 sm:h-6 w-auto"
          width={240}
          height={64}
        />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="px-5 pt-3 pb-16 sm:pt-5 sm:pb-20 text-center">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-7 flex justify-center">
          <CountdownPill />
        </div>

        <h1 className="font-serif font-medium text-[40px] sm:text-[58px] leading-[1.02] tracking-[-0.025em] mb-6">
          12-Week Body Transformation.
          <br />
          <em className="not-italic text-brand">Lose up to 30 pounds</em> in 12 weeks.
        </h1>

        <p className="font-serif italic text-[22px] sm:text-[26px] leading-snug text-ink mb-8 max-w-[560px] mx-auto">
          <mark className="bg-brand/15 text-ink px-1 rounded-sm">But this time… I'm with you every step of the way.</mark> Not in a group. Not from a distance. <mark className="bg-brand/15 text-ink px-1 rounded-sm">Actually right there with you.</mark>
        </p>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-bg-soft mb-8 shadow-[0_30px_60px_-30px_rgba(184,80,66,0.4)]">
          <img
            src={heroJJ}
            alt="JJ Smith"
            className="absolute inset-0 w-full h-full object-cover object-top block"
            width={1024}
            height={1024}
          />
          <button
            aria-label="Play intro video"
            className="absolute inset-0 flex items-center justify-center group"
            onClick={scrollToOffer}
          >
            <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105">
              <Play className="h-7 w-7 text-ink fill-ink ml-1" />
            </span>
          </button>
        </div>

        <BigCta sub="14-day money-back · Only 500 spots">
          Yes JJ, I want you in my corner!
        </BigCta>

        <p className="text-[14px] text-ink-faint mt-4">
          Doors close in <CountdownInline className="font-semibold text-ink-soft tabular-nums" />
        </p>

        <div className="mt-8 p-5 sm:p-6 bg-bg-warm border-l-[3px] border-brand rounded-md text-[15px] text-brand-deep font-serif italic leading-relaxed text-left">
          <strong className="not-italic font-semibold font-sans">This is personal for me</strong>, so I'm only opening 500 spots. Once they're gone, they're gone.
        </div>

        <TransformationsStrip />
      </div>
      <PartnersMarquee />
    </section>
  );
}

function PartnersMarquee() {
  const logos = [
    { src: partnerNyTimes, alt: "The New York Times" },
    { src: partnerDrOz, alt: "The Dr. Oz Show" },
    { src: partnerSteveHarvey, alt: "Steve Harvey" },
    { src: partnerTheView, alt: "The View" },
    { src: partnerNbc, alt: "NBC" },
    { src: partnerFox, alt: "FOX" },
    { src: partnerEssence, alt: "Essence" },
    { src: partnerWomansWorld, alt: "Woman's World" },
  ];
  const track = [...logos, ...logos];
  return (
    <div className="bg-white border-y border-line py-8 sm:py-10 mt-12 -mx-5">
      <p className="text-center text-[12px] sm:text-[13px] uppercase tracking-[0.22em] text-ink-faint font-semibold mb-6 px-5">
        5+ million pounds lost · #1 NY Times bestselling author · As seen on
      </p>
      <div className="relative overflow-hidden">
        <div className="flex w-max gap-14 sm:gap-20 animate-marquee items-center">
          {track.map((l, i) => (
            <img
              key={i}
              src={l.src}
              alt={l.alt}
              className="h-16 sm:h-24 w-auto object-contain opacity-90 shrink-0"
              loading="eager"
              decoding="async"
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
      </div>
    </div>
  );
}

function TransformationsStrip() {
  return _TransformationsStripImpl();
}

function HugQuote() {
  return (
    <section className="px-5 py-12 sm:py-16 bg-bg-soft">
      <div className="mx-auto max-w-[640px]">
        <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_60px_-30px_rgba(184,80,66,0.45)]">
          <img
            src={jjHugSignup}
            alt="JJ Smith hugging a sister from the community"
            className="block w-full h-auto"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <p className="font-serif italic text-white text-[24px] sm:text-[34px] leading-[1.25] max-w-[520px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              This is different from anything I've ever done before.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function _TransformationsStripImpl() {
  const items = [t1, t4, t7, t8, t9, t10, t11, t12, tTammi, tGirosalee];
  const track = [...items, ...items];
  return (
    <div className="relative -mx-5 mt-12 bg-brand-deep py-7 overflow-hidden">
      <div className="flex w-max gap-4 animate-marquee-slow">
        {track.map((src, i) => (
          <figure
            key={i}
            className="relative shrink-0 w-[280px] sm:w-[340px] rounded-2xl overflow-hidden bg-black/30 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
          >
            <img
              src={src}
              alt="Sister transformation before and after"
              className="block w-full h-[300px] sm:h-[360px] object-cover"
              loading="lazy"
            />
          </figure>
        ))}
      </div>
      <div className="pointer-events-none absolute top-0 left-0 h-full w-10 bg-gradient-to-r from-brand-deep to-transparent" />
      <div className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-brand-deep to-transparent" />
    </div>
  );
}

function PromiseQuote({
  eyebrow,
  children,
  bg = "soft",
  signature = false,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  bg?: "soft" | "warm";
  signature?: boolean;
}) {
  return (
    <section className={`relative px-5 py-20 text-center ${bg === "warm" ? "bg-bg-warm" : "bg-bg-soft"}`}>
      <span aria-hidden className="absolute top-6 left-6 font-serif text-[120px] leading-none text-brand opacity-20 select-none">"</span>
      <span aria-hidden className="absolute bottom-2 right-6 font-serif text-[120px] leading-none text-brand opacity-20 select-none rotate-180">"</span>
      <div className="mx-auto max-w-[640px] relative">
        {eyebrow && <Eyebrow center>{eyebrow}</Eyebrow>}
        <p className="font-serif italic text-[28px] sm:text-[34px] leading-[1.3] max-w-[580px] mx-auto mb-5">
          {children}
        </p>
        {signature && (
          <p className="text-[14px] text-ink-faint tracking-[0.18em]">JJ</p>
        )}
      </div>
    </section>
  );
}

function RealTalk() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow center>Real talk</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] leading-[1.1] mb-10 max-w-[580px] mx-auto">
          Sister to sister, <em className="not-italic text-brand">why im doing this</em>.
        </h2>
      </div>
      <figure className="mb-10 -mx-5 sm:mx-0">
        <div className="overflow-hidden sm:rounded-2xl shadow-[0_30px_60px_-30px_rgba(184,80,66,0.45)]">
          <img
            src={jjLaughingClient}
            alt="JJ Smith laughing on stage with a sister from the community"
            className="block w-full h-auto"
            loading="lazy"
          />
        </div>
      </figure>
      <div className="space-y-6 text-[18px] sm:text-[19px] text-ink-soft leading-[1.7]">
        <p>You already know what to do. You've read the books. You've done the cleanses. You've signed up for the challenges. You've started over a Monday more times than you can count.</p>
        <p>So why hasn't it stuck?</p>
        <p><strong className="text-ink font-semibold">Because every program leaves you on a Tuesday night.</strong></p>
        <p>Sunday you're motivated. Monday you're locked in. Tuesday is fine. Then Wednesday hits, the kids, the work, the stress, and by Thursday at 9pm you're standing in front of the fridge, alone, fixing to undo everything you started.</p>
        <p>That's where every program loses you. Not because the information was wrong. <strong className="text-ink font-semibold">Because nobody was there with you.</strong></p>
        <p>Nobody to text. Nobody who knew the kind of week you were having. Nobody to remind you what you signed up for and why this time was supposed to be different. Just you, by yourself, doing what you've always done.</p>
        <p className="text-ink font-medium text-[20px] pt-2">That's the part I'm fixing this time.</p>
      </div>
      <div className="mt-12">
        <BigCta sub="14-day money-back · Only 500 spots">
          Reserve my spot
        </BigCta>
      </div>
    </Section>
  );
}

function Promise2() {
  return (
    <section className="px-5 py-16 text-center bg-bg-soft">
      <div className="mx-auto max-w-[640px]">
        <p className="font-serif italic text-[26px] sm:text-[32px] leading-snug text-ink max-w-[580px] mx-auto">
          This time, I'm giving you me… and I'm not leaving.
        </p>
        <div className="mt-10 rounded-2xl overflow-hidden shadow-[0_30px_60px_-30px_rgba(70,30,110,0.45)]">
          <img
            src={jjTightWaist}
            alt="JJ Smith"
            className="block w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    n: "01",
    title: "We'll start with a call, just you and me",
    text: (
      <>
        Sister, before anything else, I want to know <em>you</em>. What you've tried. What worked, what didn't. What you love eating and what you can't stand. What's been holding you back. <strong className="text-ink font-medium">This whole thing is about you</strong>, so we have to start there.
      </>
    ),
  },
  {
    n: "02",
    title: "I'll build your meal plan and movement plan, just for you",
    text: (
      <>
        From everything you tell me, I'll put together a meal plan and a movement plan that's all <em>you</em>. Not a cookie-cutter PDF I send to everybody. Not a generic challenge plan from a book. <strong className="text-ink font-medium">A plan designed around your body, your life, the foods you actually love.</strong>
      </>
    ),
  },
  {
    n: "03",
    title: "Then I'm calling you every week",
    text: (
      <>
        This is where it all changes, sister. I'm going to be calling you. Not to throw more information at you. Just to <strong className="text-ink font-medium">check in on you</strong>, see how you're feeling, what's working, what's hard. Then we'll figure out together what to do about it. The way real sisters do.
      </>
    ),
  },
  {
    n: "04",
    title: "And I'll be texting you every day",
    text: (
      <>
        Every. Single. Day. A check-in in the morning. A pick-me-up in the afternoon. A "you good?" on the days that look hard. <strong className="text-ink font-medium">I'm not letting anything slip past me</strong>, because if we catch the small stuff early, we never end up on a Tuesday night staring at the fridge wondering how we got here again.
      </>
    ),
  },
];

function Steps() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow center>Here's how it works, sister</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] leading-[1.1] mb-12 max-w-[580px] mx-auto">
          This is what our 12 weeks together will <em className="not-italic text-brand">actually feel like</em>.
        </h2>
      </div>
      <div className="space-y-6">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl bg-bg-soft p-7 sm:p-8">
            <div className="font-serif italic font-medium text-[52px] text-brand leading-none mb-4">
              {s.n}
            </div>
            <h3 className="text-[20px] sm:text-[22px] font-semibold font-sans mb-3 tracking-tight">
              {s.title}
            </h3>
            <p className="text-[17px] sm:text-[18px] text-ink-soft leading-[1.7]">{s.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function JJReveal() {
  return (
    <Section bg="warm">
      <div className="text-center">
        <Eyebrow center>From JJ</Eyebrow>
        <h2 className="font-serif text-[30px] sm:text-[38px] leading-[1.15] mb-10 max-w-[580px] mx-auto">
          Sister to sister, why and how I'm doing this.
        </h2>
      </div>
      <div className="bg-card rounded-2xl p-7 sm:p-9 shadow-[0_20px_50px_-25px_rgba(184,80,66,0.25)]">
        <div className="flex justify-center -mt-16 mb-6">
          <img
            src={jjSelfieSun}
            alt="JJ Smith portrait"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover object-top border-4 border-card shadow-md"
            width={128}
            height={128}
            loading="lazy"
          />
        </div>
        <div className="space-y-5 text-[17px] sm:text-[18px] text-ink-soft leading-[1.75]">
          <p>For 15 years I've been writing the books, building the programs, and giving you everything I've learned. Together we've lost more than 5 million pounds. And I am so proud of every single one.</p>
          <p>But here's the truth, sister. <strong className="text-ink font-semibold">Every single time, I've watched you sign up with all the hope in the world and slip back without me.</strong> And every time, I wished I could be there with you. On your shoulder on the hard days. In your pocket on the random Tuesday nights when nobody else is.</p>
          <p>For years, that was impossible. There's only one of me, and millions of you.</p>
          <p>So we built something. <strong className="text-ink font-semibold">Something that lets me actually be with you</strong>, calling you, texting you, checking in on you, the way I would if it was just you and me. It's me, in your pocket, every day for 12 weeks. Finally.</p>
        </div>
        <blockquote className="mt-7 pl-5 border-l-[3px] border-brand font-serif italic text-[19px] sm:text-[22px] leading-snug text-ink">
          That's why this time is different. Because this time, I'm not handing you another program and saying good luck. I'm walking with you the whole way.
        </blockquote>
        <p className="mt-7 font-serif italic text-[19px] text-ink">
          Love,
          <br />
          JJ
        </p>
      </div>
    </Section>
  );
}

function Transformations() {
  const slides = [
    { headline: '"My waist comes back, my belly fat finally lets go."', src: t1 },
    { headline: '"I get my curves back, snatched, not skinny."', src: t4 },
    { headline: '"My clothes fit again, and I look 10 years younger."', src: t8 },
    { headline: '"My energy is back, and my confidence with it."', src: t10 },
    { headline: '"My health came back, pre-diabetes reversed, blood pressure normal."', src: t7 },
    { headline: '"Down the size I haven\'t worn in a decade."', src: t12 },
    { headline: '"Smiling in pictures again, dressing up again."', src: t9 },
    { headline: '"Lighter, stronger, finally me again."', src: tTammi },
  ];
  return (
    <Section id="stories">
      <div className="text-center">
        <Eyebrow center>Real sisters, real transformations</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] leading-[1.1] mb-6 max-w-[580px] mx-auto">
          Here's what happens after <em className="not-italic text-brand">12 weeks</em>.
        </h2>
        <p className="text-[18px] sm:text-[19px] text-ink-soft leading-[1.7] mb-12 max-w-[580px] mx-auto">
          When you make it through 12 weeks with a plan built for your body and someone walking with you the whole way, this is what happens:
        </p>
      </div>
      <div className="-mx-5">
        <div className="flex overflow-x-auto snap-x snap-mandatory scroll-px-5 px-5 gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((s, i) => (
            <figure
              key={i}
              className="shrink-0 w-[88%] sm:w-[600px] snap-center"
            >
              <p className="font-serif italic text-[22px] sm:text-[26px] leading-[1.3] text-ink mb-5 text-center min-h-[80px]">
                {s.headline}
              </p>
              <div className="rounded-2xl overflow-hidden bg-bg-soft shadow-[0_20px_40px_-20px_rgba(70,30,110,0.3)]">
                <img
                  src={s.src}
                  alt="Sister transformation before and after"
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </div>
            </figure>
          ))}
        </div>
        <p className="text-center text-[12px] uppercase tracking-[0.2em] text-ink-faint mt-6">
          Swipe to see more →
        </p>
      </div>
      <div className="mt-14">
        <BigCta sub="14-day money-back · Only 500 spots">
          Yes, I want this to be me
        </BigCta>
      </div>
    </Section>
  );
}

function Offer() {
  const plans = [
    {
      name: "Essential",
      price: "$137",
      perMonth: "≈ $46 / month",
      tagline: "One coaching call per week with JJ",
      featured: false,
      items: [
        "Welcome call to get to know you",
        "Personalized meal plan & movement plan",
        "1 coaching call / week with JJ",
        "Daily text check-ins from JJ",
      ],
    },
    {
      name: "Plus",
      price: "$167",
      perMonth: "≈ $56 / month",
      tagline: "Two coaching calls per week with JJ",
      featured: true,
      items: [
        "Everything in Essential",
        "2 coaching calls / week with JJ",
      ],
    },
  ];
  return (
    <Section id="offer" bg="soft">
      <div className="text-center">
        <Eyebrow center>The offer</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] leading-[1.1] mb-10 max-w-[580px] mx-auto">
          Choose how close you want me, sister.
        </h2>
        <p className="-mt-6 mb-10 text-[15px] sm:text-[16px] text-ink-soft max-w-[520px] mx-auto">
          One payment for the <strong className="text-ink font-semibold">full 12-week program</strong> with JJ. Not monthly — that's the whole thing.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative rounded-2xl bg-card p-7 sm:p-8 flex flex-col ${
              p.featured
                ? "border-2 border-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.22)]"
                : "border border-line shadow-[0_20px_40px_-25px_rgba(0,0,0,0.15)]"
            }`}
          >
            {p.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] tracking-[0.18em] font-semibold px-3 py-1 rounded-full uppercase">
                Most personal
              </span>
            )}
            <div className="text-center">
              <h3 className="font-serif text-[22px] sm:text-[26px] leading-tight">{p.name}</h3>
              <p className="text-[14px] text-ink-soft mt-2 min-h-[40px]">{p.tagline}</p>
              <div className="flex items-baseline justify-center gap-2 my-6">
                <span className="font-serif text-[56px] sm:text-[64px] font-medium leading-none">{p.price}</span>
                <span className="text-[13px] text-ink-soft font-medium">total</span>
              </div>
              <p className="-mt-4 mb-2 text-[13px] text-ink-faint">
                for the full 12-week program <span className="text-ink-soft">· {p.perMonth} if you'd rather break it up</span>
              </p>
            </div>
            <ul className="border-t border-dashed border-line flex-1">
              {p.items.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-3 py-3.5 text-[16px] text-ink border-b border-dashed border-line last:border-b-0"
                >
                  <span className="text-brand font-bold w-5 text-center text-[18px]">✓</span>
                  <span className="flex-1">{label}</span>
                </li>
              ))}
            </ul>
            <BigCta sub="14-day money-back guarantee" className="mt-6">
              Reserve my spot, {p.price}
            </BigCta>
          </div>
        ))}
      </div>
      <p className="text-center text-[14px] text-ink-faint mt-6">
        Only 500 spots · Doors close in <CountdownInline className="font-semibold text-ink-soft tabular-nums" />
      </p>
    </Section>
  );
}

function Guarantee() {
  return (
    <Section>
      <Eyebrow center>My personal guarantee</Eyebrow>
      <div className="bg-bg-soft rounded-2xl p-7 sm:p-9 flex gap-5 items-start max-w-[580px] mx-auto">
        <div className="text-brand shrink-0">
          <Heart className="h-10 w-10 fill-brand" />
        </div>
        <p className="font-serif italic text-[18px] sm:text-[20px] leading-[1.65] text-ink">
          "Sister, I need you to be confident this is right for you. So if you're not 100% thrilled within 14 days, I want to send your money back. If you're not happy, I'm not happy. No reason needed. That's my promise."
          <br />
          <br />
          <span className="not-italic font-sans text-[14px] text-ink-faint tracking-[0.16em]">JJ</span>
        </p>
      </div>
    </Section>
  );
}

function Faq() {
  const items = [
    {
      q: "I'm in my 50s and nothing's worked. Will this?",
      a: "Sister, this is who I built it for. Most of the women I work with are 40+ navigating perimenopause, menopause, and hormone shifts. Your plan is built around all of that, and I'm right there with you the whole way.",
    },
    {
      q: "I work full-time and have kids. Do I have time?",
      a: "Yes. Personalizing your plan means it fits your life, not the other way around. And I'm meeting you right where you are, every day. Most sisters spend 20 to 30 minutes a day on this.",
    },
    {
      q: "Do I have to drink green smoothies?",
      a: "Only if you want to. This isn't the cleanse. Your plan is built around foods you actually love.",
    },
    {
      q: "What makes this different from your other programs?",
      a: "My books and challenges gave you the information. This one gives you me, every step of the way. The information was never the problem. Being alone on the hard days was.",
    },
    {
      q: "What if I miss this cohort?",
      a: "I keep enrollment small so every sister gets the real attention she deserves. Once these 500 spots are gone, you'll have to wait until I open the next round.",
    },
  ];
  return (
    <Section bg="soft">
      <div className="text-center">
        <Eyebrow center>Questions sisters ask me</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] leading-[1.1] mb-10 max-w-[580px] mx-auto">
          Let me answer what's on your mind.
        </h2>
      </div>
      <Accordion type="single" collapsible defaultValue="q-0" className="w-full">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-line">
            <AccordionTrigger className="text-left text-[18px] sm:text-[19px] font-semibold font-sans hover:no-underline py-6">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-[17px] text-ink-soft leading-[1.75]">
              {it.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

function LastCall() {
  return (
    <section className="px-5 py-24 text-center">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-7 flex justify-center">
          <CountdownPill />
        </div>
        <Eyebrow center>Last call</Eyebrow>
        <h2 className="font-serif text-[36px] sm:text-[48px] leading-[1.05] mb-7">
          Your next 12 weeks are <em className="not-italic text-brand">happening either way</em>.
        </h2>
        <p className="text-[18px] sm:text-[19px] text-ink-soft leading-[1.7] mb-9 max-w-[580px] mx-auto">
          You can spend them like the last 12. Or you can spend them with me right there with you, every Tuesday morning, every Thursday night, every time life hits. This time, sister, you don't have to do it alone.
        </p>
        <BigCta sub="14-day money-back guarantee · Only 500 spots">
          Reserve my spot
        </BigCta>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 py-10 border-t border-line text-[13px] text-ink-faint text-center">
      © {new Date().getFullYear()} JJ Smith. All rights reserved. ·{" "}
      <a href="#" className="underline">Terms</a> ·{" "}
      <a href="#" className="underline">Privacy</a>
    </footer>
  );
}

function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      aria-hidden={!show}
      className={`sticky-mobile-cta sm:hidden border-t border-line bg-background/95 backdrop-blur transition-opacity duration-200 ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex-1 text-[13px] leading-tight">
          <div className="font-semibold text-ink">JJ's 12-Week Transformation</div>
          <div className="text-ink-faint">
            Closes in <CountdownInline className="tabular-nums" />
          </div>
        </div>
        <button
          onClick={scrollToOffer}
          className="bg-brand text-white px-5 py-3 rounded-full text-[14px] font-semibold shadow-md"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
