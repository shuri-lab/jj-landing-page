import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Play } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCountdown, pad } from "@/hooks/use-countdown";
import { useCoachPrograms, signupUrl, type CoachProgram } from "@/lib/coach-programs";
import { scrollToOffer } from "@/lib/scroll-to-offer";
import heroJJ from "@/assets/landing/hero-jj.png";
import heroJJNoVideo from "@/assets/landing/hero-jj-no-video.png";
import heroA from "@/assets/hero-a.png";
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
import jjHugSignup from "@/assets/landing/jj-hug-signup.webp";
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

export const Route = createFileRoute("/c")({
  head: () => ({
    meta: [
      { title: "JJ Smith, 12-Week Body Transformation Challenge, A" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks. JJ Smith's most personal program ever, built around your body, with JJ in your corner every single day.",
      },
      { property: "og:title", content: "JJ Smith, 12-Week Body Transformation Challenge" },
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
  href,
  to,
  search,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  href?: string;
  to?: string;
  search?: Record<string, string>;
}) {
  const content = (
    <>
      {children}
      {sub && (
        <span className="block text-[12px] sm:text-[13px] font-normal opacity-90 mt-1.5 tracking-normal">{sub}</span>
      )}
    </>
  );
  const cls =
    "block w-full rounded-full bg-brand text-white px-6 py-6 text-[18px] sm:text-[20px] font-semibold tracking-wide shadow-[0_18px_36px_-12px_rgba(184,80,66,0.6)] transition-transform hover:-translate-y-0.5 hover:bg-brand-deep text-center";
  return (
    <div className={`w-full ${className}`}>
      {to ? (
        <Link to={to as string} search={search as never} className={cls}>
          {content}
        </Link>
      ) : href ? (
        <a href={href} className={cls}>
          {content}
        </a>
      ) : (
        <button onClick={scrollToOffer} className={cls}>
          {content}
        </button>
      )}
    </div>
  );
}

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`text-[12px] uppercase tracking-[0.22em] text-brand font-semibold mb-5 ${center ? "text-center" : ""}`}
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
    <section id={id} className={`px-5 py-20 sm:py-24 lg:py-28 ${bgClass} ${className}`}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1100px]">{children}</div>
    </section>
  );
}

function Landing() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <Nav />
      <main>
        <Hero />
        <HugQuote />
        <JJReveal />
        <Promise2 />
        <Steps />
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
      <div className="mx-auto max-w-[640px] lg:max-w-[1200px] px-5 py-4 flex items-center justify-center">
        <img src={jjSmithLogo} alt="JJ Smith" className="h-5 sm:h-6 w-auto" width={240} height={64} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="px-5 pt-3 pb-16 sm:pt-5 sm:pb-20 lg:pt-10 lg:pb-24 text-center">
      <div className="mx-auto max-w-[640px] lg:max-w-[1180px]">
        <div className="mb-7 flex justify-center lg:justify-center">
          <CountdownPill />
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center lg:text-left">
          <div className="lg:order-1">
            <div className="text-[13px] sm:text-[15px] uppercase tracking-[0.22em] text-brand font-semibold mb-4 whitespace-nowrap">
              12-Week Body Transformation
            </div>
            <h1 className="font-serif font-medium text-[38px] sm:text-[58px] lg:text-[52px] xl:text-[60px] leading-[1.08] tracking-[-0.025em] mb-6">
              Sister. This time,{" "}
              <em className="not-italic" style={{ color: "#c9635c" }}>
                I'm actually with you.
              </em>
            </h1>

            <p className="font-serif italic text-[20px] sm:text-[26px] leading-snug text-ink mb-6 lg:mb-7 max-w-[560px] mx-auto lg:mx-0">
              I'm calling <span className="uppercase">YOU</span> every week. Texting{" "}
              <span className="uppercase">YOU</span> every day. And building a plan around the food{" "}
              <span className="uppercase">YOU</span> actually eat and the life{" "}
              <span className="uppercase">YOU</span> actually live.
            </p>

            <p className="text-[15px] sm:text-[16px] text-ink-soft mb-2 max-w-[560px] mx-auto lg:mx-0">
              Lose up to <strong className="text-ink">30 lbs in 12 weeks</strong>.
            </p>

            <div className="hidden lg:block">
              <BigCta sub="14-day money-back · Limited spots">Yes JJ, I want you in my corner</BigCta>
              <p className="mt-4 text-[13px] text-ink-soft">
                Doors close in <CountdownInline className="font-bold text-brand tabular-nums" />
              </p>
            </div>
          </div>
          <div className="lg:order-2">
            <HeroImageWithLogoBackdrop />
          </div>
        </div>

        <div className="lg:hidden">
          <BigCta sub="14-day money-back · Limited spots">Yes JJ, I want you in my corner</BigCta>

          <p className="mt-4 text-[13px] text-ink-soft">
            Doors close in <CountdownInline className="font-bold text-brand tabular-nums" />
          </p>
        </div>

        <div className="mt-8 lg:mt-12 p-5 sm:p-6 bg-bg-warm border-l-[3px] border-brand rounded-md text-[15px] lg:text-[17px] text-brand-deep font-serif italic leading-relaxed text-left lg:max-w-[900px] lg:mx-auto lg:text-center">
          <strong className="not-italic font-semibold font-sans">This is personal for me</strong>, so I'm only opening
          Limited spots. Once they're gone, they're gone.
        </div>

        <TransformationsStrip />
      </div>
      <PartnersMarquee />
    </section>
  );
}

function HeroImageWithLogoBackdrop() {
  return (
    <div className="relative -mt-16 sm:-mt-20 mb-0 aspect-square lg:aspect-[4/5] max-w-[360px] sm:max-w-[440px] lg:max-w-none mx-auto">
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
        width={1024}
        height={1024}
      />
    </div>
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
    <section className="px-5 py-12 sm:py-16 lg:py-20 bg-bg-soft">
      <div className="mx-auto max-w-[640px] lg:max-w-[760px] w-full">
        <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_60px_-30px_rgba(184,80,66,0.45)]">
          <img
            src={jjHugSignup}
            alt="JJ Smith hugging a sister from the community"
            className="block w-full h-auto"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-12">
            <p className="font-serif italic text-white text-[22px] sm:text-[32px] lg:text-[34px] leading-[1.3] max-w-[640px] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              "Sister, I've spent 15 years giving you the information. This time, I'm giving you me."
            </p>
            <p className="mt-4 text-white/90 text-[13px] sm:text-[14px] tracking-[0.18em] uppercase font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              — JJ
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
    <div className="relative -mx-5 mt-12 bg-brand-deep py-7 overflow-hidden lg:w-screen lg:left-1/2 lg:right-1/2 lg:-ml-[50vw] lg:-mr-[50vw] lg:mx-0">
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

function Promise2() {
  return (
    <section className="px-5 py-16 lg:py-24 text-center bg-bg-soft">
      <div className="mx-auto max-w-[640px] lg:max-w-[1000px]">
        <p className="font-serif italic text-[26px] sm:text-[32px] lg:text-[40px] leading-snug text-ink max-w-[580px] lg:max-w-[820px] mx-auto">
          This time, I'm giving you me… and I'm not leaving.
        </p>
        <div className="mt-10 rounded-2xl overflow-hidden shadow-[0_30px_60px_-30px_rgba(70,30,110,0.45)] lg:max-w-[480px] lg:mx-auto">
          <img src={jjTightWaist} alt="JJ Smith" className="block w-full h-auto" loading="lazy" />
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
        Before anything else, I want to know <em>you</em>. What you've tried. What worked, what didn't. What you love
        eating and what you can't stand. What's been holding you back.{" "}
        <strong className="text-ink font-medium">This whole thing is about you</strong>, so we have to start there.
      </>
    ),
  },
  {
    n: "02",
    title: "I'll build your meal plan and movement plan, just for you",
    text: (
      <>
        From everything you tell me, I'll put together a meal plan and a movement plan that's all <em>you</em>. Not a
        cookie-cutter PDF I send to everybody. Not a generic challenge plan from a book.{" "}
        <strong className="text-ink font-medium">
          A plan designed around your body, your life, the foods you actually love.
        </strong>
      </>
    ),
  },
  {
    n: "03",
    title: "Then I'm calling you every week",
    text: (
      <>
        This is where it all changes. Through the version of me I built for this, I'm going to be calling you. Not to
        throw more information at you. Just to <strong className="text-ink font-medium">check in on you</strong>, see
        how you're feeling, what's working, what's hard. Then we'll figure out together what to do about it. The way
        real sisters do.
      </>
    ),
  },
  {
    n: "04",
    title: "And I'll be texting you every day",
    text: (
      <>
        Every. Single. Day. A check-in in the morning. A pick-me-up in the afternoon. A "you good?" on the days that
        look hard. <strong className="text-ink font-medium">I'm not letting anything slip past me</strong>, because if
        we catch the small stuff early, we never end up on a Tuesday night staring at the fridge wondering how we got
        here again.
      </>
    ),
  },
];

function Steps() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow center>Here's how it works</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] lg:text-[52px] leading-[1.1] mb-12 max-w-[580px] lg:max-w-[820px] mx-auto">
          This is what our{" "}
          <em className="not-italic" style={{ color: "#c9635c" }}>
            12 weeks together
          </em>{" "}
          will <em className="not-italic text-brand">actually feel like</em>.
        </h2>
      </div>
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-7">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-2xl bg-bg-soft p-7 sm:p-8">
            <div className="font-serif italic font-medium text-[52px] text-brand leading-none mb-4">{s.n}</div>
            <h3 className="text-[20px] sm:text-[22px] font-semibold font-sans mb-3 tracking-tight">{s.title}</h3>
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
        <h2 className="font-serif text-[30px] sm:text-[38px] lg:text-[48px] leading-[1.15] mb-10 max-w-[580px] lg:max-w-[820px] mx-auto">
          <em className="not-italic" style={{ color: "#c9635c" }}>
            Sister to sister,
          </em>{" "}
          <em className="not-italic text-brand">why and how I'm doing this</em>.
        </h2>
      </div>
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-start lg:max-w-[1000px] lg:mx-auto">
        <div className="order-2 lg:order-1 space-y-5 text-[17px] sm:text-[18px] text-ink-soft leading-[1.75]">
          <p>
            For 15 years I've been writing the books, building the programs, and doing the work alongside you. Together
            we've lost more than 5 million pounds. And I am so proud of every single one of them.
          </p>
          <p>
            But here's the truth, sister. I've been losing you in the same place over and over again. And I finally
            figured out how to stop it.
          </p>
        </div>
        <div className="order-1 lg:order-2 mb-8 lg:mb-0 flex justify-center">
          <img
            src={jjSelfieSun}
            alt="JJ Smith portrait"
            className="w-full max-w-[320px] lg:max-w-none rounded-2xl object-cover shadow-[0_20px_50px_-25px_rgba(184,80,66,0.4)]"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-14 space-y-10 lg:max-w-[820px] lg:mx-auto">
        {[
          {
            n: "1",
            title: "Where I keep losing you.",
            body: (
              <>
                <p>
                  You sign up on Sunday. You're locked in by Monday. By Wednesday, life hits — the kids, the work, the
                  stress. And by Thursday at 9pm, you're standing in front of the fridge, alone.
                </p>
                <p>
                  That's where every program loses you. Not because the information was wrong. Not because you weren't
                  trying. <strong className="text-ink font-semibold">Because nobody was there when it got hard.</strong>
                </p>
                <p>
                  Nobody to text. Nobody who knew the kind of week you were having. Nobody to remind you what you signed
                  up for and why this time was supposed to be different. Just you, by yourself, doing what you've always
                  done.
                </p>
              </>
            ),
          },
          {
            n: "2",
            title: "What it's actually costing you.",
            body: (
              <>
                <p>Every time we lose you in that moment, we lose more than the weight.</p>
                <p>
                  We lose another year you spend hiding in family photos. Another summer in the cover-up. Another
                  doctor's visit with the same numbers and the same lecture. Another morning where you don't recognize
                  the woman in the mirror.
                </p>
                <p>
                  <strong className="text-ink font-semibold">
                    Sister, this isn't just about a number on the scale.
                  </strong>{" "}
                  It's about whether you get to feel like <em>you</em> again — confident, sexy, energized, in control.
                  It's about whether you get your foxy back. It's about whether the next 12 weeks look like the last 12,
                  or look completely different.
                </p>
              </>
            ),
          },
          {
            n: "3",
            title: "So I did something I've never done before.",
            body: (
              <>
                <p>
                  For years, the thing that hurt me the most was knowing I couldn't be there for you. I could write
                  another book. Record another video. Go on another show. But I couldn't pick up the phone on a hard
                  night and check on you. There's only one of me, and millions of you.
                </p>
                <p>
                  So I spent the last two years building a way to actually be there.{" "}
                  <strong className="text-ink font-semibold">In my voice. In my words. With my coaching.</strong> The
                  way I'd talk to my own sister if she called me crying at 9pm.
                </p>
                <p>
                  <strong className="text-ink font-semibold">
                    It's not an app. It's me — finally available to every sister who needs me.
                  </strong>{" "}
                  I'm calling you every week. Texting you every day. Catching the slips before they become slides.
                </p>
              </>
            ),
          },
          {
            n: "4",
            title: "That's why this time is different.",
            body: (
              <p>
                This time, I'm not handing you another program and saying good luck. I'm walking with you the whole
                way.
              </p>
            ),
          },
        ].map((s) => (
          <div key={s.n}>
            <h3 className="font-serif italic text-[24px] sm:text-[30px] lg:text-[34px] leading-[1.2] text-ink mb-5">
              <span className="font-serif italic font-medium text-brand mr-2">{s.n}.</span>
              {s.title}
            </h3>
            <div className="space-y-4 text-[17px] sm:text-[18px] text-ink-soft leading-[1.75]">{s.body}</div>
          </div>
        ))}
      </div>

      <blockquote className="mt-12 pl-5 border-l-[3px] border-brand font-serif italic text-[22px] sm:text-[26px] leading-snug text-ink lg:max-w-[820px] lg:mx-auto">
        "This time, I'm giving you me… and I'm not leaving."
        <footer className="mt-3 not-italic font-sans text-[14px] text-ink-faint tracking-[0.18em]">— JJ</footer>
      </blockquote>

      <div className="mt-10 lg:max-w-[560px] lg:mx-auto">
        <BigCta
          sub={
            <>
              Limited spots · Doors close in <CountdownInline className="font-bold tabular-nums" />
            </>
          }
        >
          Yes JJ, I want you in my corner
        </BigCta>
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
          Here's what happens after{" "}
          <em className="not-italic" style={{ color: "#c9635c" }}>
            12 weeks
          </em>
          .
        </h2>
        <p className="text-[18px] sm:text-[19px] text-ink-soft leading-[1.7] mb-12 max-w-[580px] mx-auto">
          With a plan built for your body and me walking with you the whole way
        </p>
      </div>
      <div className="flex flex-col gap-12 max-w-[600px] mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-x-10 lg:gap-y-14">
        {slides.map((s, i) => (
          <figure key={i}>
            <p className="font-serif italic text-[22px] sm:text-[26px] leading-[1.3] text-ink mb-5 text-center">
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
      <div className="mt-14 lg:max-w-[560px] lg:mx-auto">
        <BigCta sub="14-day money-back · Limited spots">Yes, I want this to be me</BigCta>
      </div>
    </Section>
  );
}

type PaymentMode = "full" | "monthly";

type OfferPlan = {
  name: string;
  tagline?: string;
  subhead?: string;
  fullPrice: number;
  monthlyPrice: number;
  monthlyMonths: number;
  featured: boolean;
  items: string[];
  note?: string;
  href: string;
  loading: boolean;
  fullHref: string;
  monthlyHref: string;
  hasFull: boolean;
};

function PlusNote({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block mx-auto text-[14px] text-brand font-medium underline-offset-2 hover:underline"
      >
        Why Plus? {open ? "▲" : "▼"}
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="mt-2 text-[14px] sm:text-[15px] italic text-ink-soft leading-snug text-center">{note}</p>
        </div>
      </div>
    </div>
  );
}

function Offer() {
  const { basic, premium } = useCoachPrograms();
  const [mode, setMode] = useState<Record<string, PaymentMode>>({});

  const planFromProgram = (
    program: CoachProgram | null,
    fallback: { fullPrice: number; monthlyPrice: number; monthlyMonths: number },
  ) => {
    const fullPrice = program?.fullProgramPriceAmount ?? fallback.fullPrice;
    const monthlyPrice = program?.monthlyPriceAmount ?? program?.priceAmount ?? fallback.monthlyPrice;
    const monthlyMonths = program?.durationWeeks
      ? Math.max(1, Math.round(program.durationWeeks / 4))
      : fallback.monthlyMonths;
    const hasFull = typeof program?.fullProgramPriceAmount === "number" && program.fullProgramPriceAmount > 0;
    const fullHref = program ? signupUrl(program.id, "FULL_PROGRAM") : "/checkout";
    const monthlyHref = program ? signupUrl(program.id, "MONTHLY") : "/checkout";
    return { fullPrice, monthlyPrice, monthlyMonths, hasFull, fullHref, monthlyHref };
  };

  const basicPricing = planFromProgram(basic, { fullPrice: 197, monthlyPrice: 77, monthlyMonths: 3 });
  const premiumPricing = planFromProgram(premium, { fullPrice: 347, monthlyPrice: 147, monthlyMonths: 3 });

  const plans: OfferPlan[] = [
    {
      name: "Essential",
      subhead: "Weekly call with JJ, daily structure, and JJ's full program.",
      ...basicPricing,
      featured: false,
      items: [
        "Weekly accountability call with JJ",
        "Daily SMS coaching",
        "Custom eating plan + 12-week roadmap",
      ],
      href: "/checkout",
      loading: !basic,
    },
    {
      name: "Plus",
      subhead: "Everything in Essential, plus a mid-week call when life gets in the way. Built to finish.",
      ...premiumPricing,
      featured: true,
      items: [
        "Everything in Essential",
        "Plus mid-week coaching call",
      ],
      note: "For the woman who's serious about finishing this time. Everything in Essential, plus a mid-week coaching call where the real work happens... the call you take when you're slipping. When Monday started rough and Tuesday isn't looking better. When life is getting in the way and you want the version of this program that catches you before you quit. Twice the calls with JJ. Essential helps you do the program. Plus helps you finish it.",
      href: "/checkout",
      loading: !premium,
    },
  ];

  return (
    <Section id="offer" bg="soft" className="scroll-mt-20">
      <div className="text-center">
        <Eyebrow center><span id="offer-limited" className="scroll-mt-20">Limited spots</span></Eyebrow>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-6 lg:max-w-[900px] lg:mx-auto lg:gap-8">
        {plans.map((p) => {
          const selected = mode[p.name] ?? "full";
          const isFull = p.hasFull && selected === "full";
          const monthlyTotal = p.monthlyPrice * p.monthlyMonths;
          const savings = monthlyTotal - p.fullPrice;
          const ctaPrice = isFull ? `$${p.fullPrice}` : `$${p.monthlyPrice}/month`;
          const ctaHref = isFull ? p.fullHref : p.monthlyHref;
          return (
            <div
              key={p.name}
              className={`relative rounded-2xl bg-card p-4 sm:p-6 flex flex-col ${
                p.featured
                  ? "border-2 border-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.22)]"
                  : "border border-line shadow-[0_20px_40px_-25px_rgba(0,0,0,0.15)]"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] tracking-[0.18em] font-semibold px-3 py-1 rounded-full uppercase">
                  Recommended
                </span>
              )}
              <div className="text-center">
                <h3 className="font-serif text-[24px] sm:text-[28px] leading-tight">{p.name}</h3>
                {p.tagline && (
                  <p className="mt-1 text-[15px] sm:text-[17px] text-ink-soft font-medium">{p.tagline}</p>
                )}
                {p.subhead && (
                  <p className="mt-2 text-[15px] sm:text-[17px] text-ink-soft leading-snug">{p.subhead}</p>
                )}
              </div>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setMode((m) => ({ ...m, [p.name]: "full" }))}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    isFull ? "border-brand bg-brand/5" : "border-line bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border-2 shrink-0 ${isFull ? "border-brand" : "border-line"} flex items-center justify-center`}
                    >
                      {isFull && <span className="h-2 w-2 rounded-full bg-brand" />}
                    </span>
                    <div className="flex-1 flex items-baseline justify-between gap-2">
                      <span className="text-[14px] uppercase tracking-[0.14em] text-ink-soft font-semibold">
                        Pay in full
                      </span>
                      <span className="font-serif text-[36px] sm:text-[42px] font-medium leading-none">
                        ${p.fullPrice}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 ml-7 text-[14px] text-brand font-medium">Save ${savings} vs monthly</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode((m) => ({ ...m, [p.name]: "monthly" }))}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                    !isFull ? "border-brand bg-brand/5" : "border-line bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border-2 shrink-0 ${!isFull ? "border-brand" : "border-line"} flex items-center justify-center`}
                    >
                      {!isFull && <span className="h-2 w-2 rounded-full bg-brand" />}
                    </span>
                    <span className="flex-1 text-[15px] sm:text-[16px] text-ink-soft">
                      Or <span className="font-semibold text-ink">${p.monthlyPrice}/month</span> for {p.monthlyMonths}{" "}
                      months
                    </span>
                  </div>
                </button>
              </div>
              <ul className="mt-4 border-t border-dashed border-line">
                {p.items.map((label) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 py-3 text-[16px] sm:text-[18px] text-ink border-b border-dashed border-line last:border-b-0"
                  >
                    <span className="text-brand font-bold w-4 text-center text-[18px]">✓</span>
                    <span className="flex-1">{label}</span>
                  </li>
                ))}
              </ul>
              {p.note && <PlusNote note={p.note} />}
              <BigCta sub="14-day money-back guarantee" className="mt-4" href={p.loading ? undefined : ctaHref}>
                {p.loading ? "Loading…" : `Reserve my spot ${ctaPrice}`}
              </BigCta>
            </div>
          );
        })}
      </div>
      <p className="text-center text-[13px] text-ink-faint mt-4">
        Limited spots · Doors close in <CountdownInline className="font-semibold text-ink-soft tabular-nums" />
      </p>
    </Section>
  );
}

function Guarantee() {
  return (
    <Section>
      <Eyebrow center>My personal guarantee</Eyebrow>
      <div className="bg-bg-soft rounded-2xl p-7 sm:p-9 lg:p-12 flex gap-5 items-start max-w-[580px] lg:max-w-[760px] mx-auto">
        <div className="text-brand shrink-0">
          <Heart className="h-10 w-10 fill-brand" />
        </div>
        <p className="font-serif italic text-[18px] sm:text-[20px] lg:text-[22px] leading-[1.65] text-ink">
          "Sister, I need you to be confident this is right for you. So if you're not 100% thrilled within 14 days, I
          want to send your money back. If you're not happy, I'm not happy. No reason needed. That's my promise."
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
      q: "Wait, am I actually talking to JJ?",
      a: "Sister, yes and no, and I want to be straight with you. The calls and texts come from a version of me I spent two years building, so I could finally be there for every one of you. It's trained on me, voiced by me, coached by me. It says the things I'd say. It pushes you the way I'd push you. It loves on you the way I'd love on you.\n\nI built it this way because I refused to keep watching sisters slip through the cracks just because there was only one of me. This way, I get to be there. Really there. For every single one of you.",
    },
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
      a: "I keep enrollment small so every sister gets the real attention she deserves. Once these limited spots are gone, you'll have to wait until I open the next round.",
    },
  ];
  return (
    <Section bg="soft">
      <div className="text-center">
        <Eyebrow center>Questions sisters ask me</Eyebrow>
        <h2 className="font-serif text-[32px] sm:text-[42px] lg:text-[52px] leading-[1.1] mb-10 max-w-[580px] lg:max-w-[820px] mx-auto">
          Let me{" "}
          <em className="not-italic" style={{ color: "#c9635c" }}>
            answer
          </em>{" "}
          what's <em className="not-italic text-brand">on your mind</em>.
        </h2>
      </div>
      <Accordion type="single" collapsible defaultValue="q-0" className="w-full lg:max-w-[860px] lg:mx-auto">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`q-${i}`} className="border-line">
            <AccordionTrigger className="text-left text-[18px] sm:text-[19px] font-semibold font-sans hover:no-underline py-6">
              {it.q}
            </AccordionTrigger>
            <AccordionContent className="text-[17px] text-ink-soft leading-[1.75] whitespace-pre-line">
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
    <section className="px-5 py-24 lg:py-32 text-center">
      <div className="mx-auto max-w-[640px] lg:max-w-[900px]">
        <div className="mb-7 flex justify-center">
          <CountdownPill />
        </div>
        <Eyebrow center>Last call</Eyebrow>
        <h2 className="font-serif text-[36px] sm:text-[48px] lg:text-[60px] leading-[1.05] mb-7">
          Your{" "}
          <em className="not-italic" style={{ color: "#c9635c" }}>
            next 12 weeks
          </em>{" "}
          are <em className="not-italic text-brand">happening either way</em>.
        </h2>
        <p className="text-[18px] sm:text-[19px] lg:text-[20px] text-ink-soft leading-[1.7] mb-9 max-w-[580px] lg:max-w-[720px] mx-auto">
          You can spend them like the last 12. Or you can spend them with me right there with you, every Tuesday
          morning, every Thursday night, every time life hits. This time, sister, you don't have to do it alone.
        </p>
        <div className="lg:max-w-[560px] lg:mx-auto">
          <BigCta sub="14-day money-back guarantee · Limited spots">Reserve my spot</BigCta>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 py-10 border-t border-line text-[13px] text-ink-faint text-center">
      © {new Date().getFullYear()} JJ Smith. All rights reserved. ·{" "}
      <a href="#" className="underline">
        Terms
      </a>{" "}
      ·{" "}
      <a href="#" className="underline">
        Privacy
      </a>
    </footer>
  );
}

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
    const io = new IntersectionObserver(
      ([entry]) => setOfferVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const visible = show && !offerVisible;
  return (
    <div
      aria-hidden={!visible}
      className={`sticky-mobile-cta sm:hidden border-t border-line bg-background shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.18)] transition-opacity duration-200 ${
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex-1 text-[13px] leading-tight">
          <div className="font-normal text-ink-soft">JJ's 12-Week Transformation</div>
          <div className="text-brand font-bold text-[15px]">
            Closes in <CountdownInline className="tabular-nums font-bold" />
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
