import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Play, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCountdown, pad } from "@/hooks/use-countdown";
import { useCoachPrograms, signupUrl, type CoachProgram } from "@/lib/coach-programs";
import { scrollToOffer } from "@/lib/scroll-to-offer";
import heroJJ from "@/assets/landing/hero-jj.png";
import heroJJNoVideo from "@/assets/landing/hero-jj-no-video.png";
import heroA from "@/assets/landing/hero-c-cards.png";
import heroMobile from "@/assets/landing/hero-mobile.png";
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
import jjTightWaist from "@/assets/landing/jj-laughing-client.jpg";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import yobodyLogo from "@/assets/yobody-jj-smith-logo.png.asset.json";
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
      { title: "JJ Smith, 12-Weeks to Sexy™, A" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "Lose up to 30 pounds in 12 weeks. JJ Smith's most personal program ever, built around your body, with JJ in your corner every single day.",
      },
      { property: "og:title", content: "JJ Smith, 12-Weeks to Sexy™" },
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

const COHORT_DEADLINE = new Date(Date.now() + 23 * 60 * 60 * 1000);

function CountdownInline({ className = "" }: { className?: string }) {
  const { days, hours, minutes, seconds } = useCountdown(COHORT_DEADLINE);
  return (
    <span className={className}>
      {days > 0 ? `${days}d ` : ""}
      {hours}h {minutes}min {seconds}s
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
  position,
  tier,
  buyButton,
  price,
  paymentOption,
}: {
  children: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  href?: string;
  to?: string;
  search?: Record<string, string>;
  position?: string;
  tier?: string;
  buyButton?: boolean;
  price?: string | number;
  paymentOption?: string;
}) {
  const content = (
    <>
      <span className="inline-flex items-center justify-center gap-2">
        <span>{children}</span>
        <span aria-hidden className="text-white">→</span>
      </span>
      {sub && (
        <span className="block text-[12px] sm:text-[13px] font-normal mt-1.5 tracking-normal" style={{ color: "#f0d78c" }}>{sub}</span>
      )}
    </>
  );
  const cls =
    "block w-full rounded-full text-white px-6 py-5 text-[18px] sm:text-[20px] font-semibold tracking-wide shadow-[0_18px_36px_-12px_rgba(42,20,56,0.55)] transition-transform hover:-translate-y-0.5 text-center border-2";
  const style: React.CSSProperties = {
    background:
      "linear-gradient(180deg, #5a1f47 0%, #4a1838 45%, #3a1430 80%, #2a0e22 100%)",
    borderColor: "#c9a84c",
  };
  return (
    <div className={`w-full ${className}`}>
      {to ? (
        <Link to={to as string} search={search as never} className={cls} style={style} data-cta="yes-jj" data-position={position ?? "unknown"} data-tier={tier ?? "unknown"} {...(buyButton ? { "data-buy-button": "true", "data-price": String(price ?? ""), "data-payment-option": paymentOption ?? "" } : {})}>
          {content}
        </Link>
      ) : href ? (
        <a href={href} className={cls} style={style} data-cta="yes-jj" data-position={position ?? "unknown"} data-tier={tier ?? "unknown"} {...(buyButton ? { "data-buy-button": "true", "data-price": String(price ?? ""), "data-payment-option": paymentOption ?? "" } : {})}>
          {content}
        </a>
      ) : (
        <button onClick={scrollToOffer} className={cls} style={style} data-cta="yes-jj" data-position={position ?? "unknown"} data-tier={tier ?? "unknown"} {...(buyButton ? { "data-buy-button": "true", "data-price": String(price ?? ""), "data-payment-option": paymentOption ?? "" } : {})}>
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
        <img src={yobodyLogo.url} alt="Yobody by JJ Smith" className="h-8 sm:h-10 w-auto" width={1196} height={595} />
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="px-5 pt-3 pb-16 sm:pt-5 sm:pb-20 lg:pt-10 lg:pb-24 text-center" style={{ backgroundColor: "#fdebeb" }}>
      <div className="mx-auto max-w-[640px] lg:max-w-[1320px]">
        <div className="lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:items-center lg:text-left">
          <div className="relative z-20 lg:order-1 lg:min-w-0">
            <h1
              className="font-normal leading-[1.1] tracking-[-0.01em] mb-6 text-[40px] sm:text-[52px] lg:text-[60px] xl:text-[68px] text-left"
              style={{ fontFamily: "'Fraunces', 'Playfair Display', serif" }}
            >
              <span style={{ color: "#1f1a3d" }}>Stop Starting Over</span>
              <br />
              <span style={{ color: "#d62a7a" }}>Every Monday.</span>
            </h1>

            <p className="font-sans text-[16px] sm:text-[18px] leading-[1.55] text-ink mb-6 lg:max-w-[560px] text-left">
              Imagine having JJ Smith in your pocket every day, helping you stay accountable, stay motivated, and stay consistent until the weight finally comes off.
            </p>

            <ul className="font-sans text-[16px] leading-snug text-ink mb-7 max-w-[560px] space-y-3 text-left">
              <li className="flex gap-3 items-center"><span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: "#d62a7a", fontSize: "11px" }}>✓</span><span>Delicious Meals Sent Daily</span></li>
              <li className="flex gap-3 items-center"><span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: "#d62a7a", fontSize: "11px" }}>✓</span><span>One-on-one coaching calls with JJ</span></li>
              <li className="flex gap-3 items-center"><span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: "#d62a7a", fontSize: "11px" }}>✓</span><span>Daily text reminders from JJ</span></li>
            </ul>

            <div className="hidden lg:block max-w-[360px]">
              <HeroCta />
            </div>
          </div>
          <div className="lg:order-2 relative z-0">
            <HeroImageWithLogoBackdrop />
          </div>
        </div>

        <div className="lg:hidden">
          <HeroCta />
        </div>

        <div className="mt-8 lg:mt-12 font-serif italic text-[20px] sm:text-[26px] leading-snug text-ink lg:max-w-[900px] lg:mx-auto lg:text-center space-y-4">
          <p>Because weight loss isn't about willpower.</p>
          <p>It's about having someone helping you stay consistent long enough to finally see results.</p>
          <p>Like having JJ Smith in your phone every day.</p>
        </div>

        <TransformationsStrip />
      </div>
      <PartnersMarquee />
    </section>
  );
}

function HeroImageWithLogoBackdrop() {
  return _HeroImageImpl();
}

function HeroCta() {
  const cls =
    "block w-full text-white px-6 py-4 text-[16px] sm:text-[18px] font-bold uppercase tracking-wide rounded-xl shadow-[0_14px_30px_-10px_rgba(214,42,122,0.55)] transition-transform hover:-translate-y-0.5 text-center";
  const style: React.CSSProperties = {
    background: "linear-gradient(180deg, #e83a8a 0%, #d62a7a 50%, #a01e5a 100%)",
  };
  return (
    <div className="w-full">
      <button onClick={scrollToOffer} className={cls} style={style} data-cta="yes-jj" data-position="hero-top" data-tier="unknown">
        Start Today
      </button>
      <p className="mt-3 text-center text-[13px] sm:text-[14px] leading-[1.4]" style={{ color: "#1f1a3d" }}>
        No restrictive diets. No guilt.<br />No starting over every Monday.
      </p>
    </div>
  );
}

function _HeroImageImpl() {
  return (
    <div className="relative w-full mx-auto max-w-[420px] mt-2 lg:mt-0 lg:max-w-none lg:w-[110%] lg:-mr-[10%] lg:-mt-6 lg:-mb-6">
      <img
        src={heroMobile}
        alt="JJ Smith with weekly calls, daily texts, and personalized plan"
        className="block w-full h-auto mx-auto max-w-[280px] sm:max-w-[320px] lg:hidden"
        width={1024}
        height={1024}
      />
      <img
        src={heroA}
        alt="JJ Smith with weekly calls, daily texts, and personalized plan"
        className="hidden lg:block w-full h-auto"
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
              JJ
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
    title: "You'll stop starting over every Monday",
    text: (
      <>
        <p>
          No more falling <strong className="text-ink font-semibold">"off track" for weeks</strong> after one bad meal
          or bad weekend.
        </p>
        <p>
          JJ helps you{" "}
          <strong className="text-ink font-medium">reset quickly, stay focused, and keep moving forward</strong>.
        </p>
        <p>
          Instead of <strong className="text-ink font-semibold">spiraling into guilt and frustration</strong>.
        </p>
      </>
    ),
  },
  {
    title: "You'll know exactly what to eat",
    text: (
      <>
        <p>
          No more stressing over what to eat or trying to force yourself to live on{" "}
          <strong className="text-ink font-semibold">boring diet food</strong>.
        </p>
        <p>
          Your meal plans are{" "}
          <strong className="text-ink font-medium">personalized around foods YOU actually like</strong>.
        </p>
        <p>
          So losing weight finally feels{" "}
          <strong className="text-ink font-semibold">realistic and sustainable</strong>.
        </p>
      </>
    ),
  },
  {
    title: "Then I'm calling you every week",
    text: (
      <>
        <p>
          <strong className="text-ink font-semibold">This is where it all changes.</strong>
        </p>
        <p>
          Through the version of me I built for this, I'm going to be{" "}
          <strong className="text-ink font-semibold">calling you</strong>.
        </p>
        <p>Not to throw more information at you.</p>
        <p>
          Just to <strong className="text-ink font-medium">check in on you</strong>, see how you're feeling, what's
          working, what's hard.
        </p>
        <p>Then we'll figure out together what to do about it.</p>
        <p>
          The way <strong className="text-ink font-semibold">real sisters</strong> do.
        </p>
      </>
    ),
  },
  {
    title: "And I'll be texting you every day",
    text: (
      <>
        <p>
          <strong className="text-ink font-semibold">Every. Single. Day.</strong>
        </p>
        <p>A check-in in the morning.</p>
        <p>A pick-me-up in the afternoon.</p>
        <p>
          A "you good?" on the days that <strong className="text-ink font-semibold">look hard</strong>.
        </p>
        <p>
          <strong className="text-ink font-medium">I'm not letting anything slip past me</strong>, because if we catch
          the small stuff early, we never end up on a Tuesday night{" "}
          <strong className="text-ink font-semibold">staring at the fridge wondering how we got here again</strong>.
        </p>
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
          will <em className="not-italic text-brand">actually feel</em> like.
        </h2>
      </div>
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-7">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-2xl bg-bg-soft p-7 sm:p-8">
            <h3 className="text-[24px] sm:text-[26px] font-semibold font-sans mb-3 tracking-tight">{s.title}</h3>
            <div className="text-[19px] sm:text-[20px] text-ink-soft leading-[1.7] space-y-4">{s.text}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function JJReveal() {
  return (
    <Section>
      <div className="text-center">
        <Eyebrow center>From JJ</Eyebrow>
        <h2 className="font-serif text-[34px] sm:text-[44px] lg:text-[54px] leading-[1.15] mb-10 max-w-[580px] lg:max-w-[760px] mx-auto">
          <em className="not-italic" style={{ color: "#c9635c" }}>
            Sister to Sister…
          </em>
          <br />
          <em className="not-italic text-brand">Here's the truth</em>.
        </h2>
      </div>
      <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-7 lg:max-w-[820px] lg:mx-auto">
        <img
          src={jjSelfieSun}
          alt="JJ Smith portrait"
          className="w-[96px] h-[96px] lg:w-[110px] lg:h-[110px] rounded-full object-cover shadow-[0_8px_24px_-10px_rgba(184,80,66,0.4)] mb-5 lg:mb-0 lg:mt-1 shrink-0"
          loading="lazy"
        />
        <div className="space-y-5 text-[19px] sm:text-[21px] text-ink-soft leading-[1.75] text-center lg:text-left">
          <p>
            For years, I thought women struggled with weight loss because they needed better information. But after
            helping millions of women lose weight…
          </p>
          <p>
            I realized something heartbreaking: the problem was never the information. The problem was that nobody was
            there when things started getting hard.
          </p>
        </div>
      </div>

      <div className="mt-14 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-7 lg:max-w-[820px] lg:mx-auto">
        <RevealCard title="Where I keep losing you.">
          <p className="card-lead">
            You start strong on Monday. But by Wednesday? Life hits. Stress. Exhaustion. One bad meal. One skipped
            workout.
          </p>
          <p>
            And suddenly that voice shows up again:{" "}
            <em>"See? I knew I wouldn't stick to it."</em>
          </p>
          <p className="card-key">That's where most programs lose you.</p>
          <p>
            Not because you failed.{" "}
            <strong className="card-bold">Because nobody was there when it got hard.</strong>
          </p>
        </RevealCard>

        <RevealCard title="What it's really costing you.">
          <p className="card-lead">
            This isn't just about weight anymore.
          </p>
          <p>
            It's <strong className="card-bold">confidence</strong>. Energy.{" "}
            <strong className="card-bold">Avoiding photos</strong>. Covering up in summer. Not feeling like yourself
            anymore.
          </p>
          <p className="card-key">And after enough restarts… you stop trusting YOU.</p>
          <p>
            That quiet voice that whispers <em>"maybe this just isn't for me"</em> gets a little louder every time.
          </p>
        </RevealCard>

        <RevealCard title="So I built something different.">
          <p className="card-lead">
            I didn't want to give you another program and disappear.
          </p>
          <p>
            I wanted to actually <strong className="card-bold">BE THERE</strong>. To check on you. Talk to you. Help
            you reset before one bad day turns into quitting again.
          </p>
          <p className="card-key">Like real sisters do.</p>
          <p>
            In my voice. In my words. With my coaching. The way I'd talk to my own sister if she called me crying at
            9pm.
          </p>
        </RevealCard>

        <RevealCard title="This time, you're not doing it alone.">
          <p className="card-lead">
            I'll be checking on you daily. Calling you weekly. Helping you stay focused when motivation fades.
          </p>
          <p>
            Because if we catch the small stuff early…{" "}
            <strong className="card-bold">we never end up back in that same painful cycle again.</strong>
          </p>
          <blockquote className="mt-10 mb-10 font-serif italic text-[22px] sm:text-[26px] leading-snug text-ink text-center">
            "Sister… this isn't just about weight loss. It's about feeling like YOU again. Confident. Sexy.
            Energized. In control."
            <footer className="mt-3 not-italic font-sans text-[14px] text-ink-faint tracking-[0.18em]">JJ</footer>
          </blockquote>
        </RevealCard>
      </div>

      <div className="mt-10 lg:mt-12 lg:max-w-[480px] lg:mx-auto">
        <BigCta
          position="mid"
          sub={
            <>
              Limited spots · Doors close in <CountdownInline className="font-bold tabular-nums" />
            </>
          }
        >
          Yes JJ, I'm ready for this to be my turn
        </BigCta>
      </div>
    </Section>
  );
}

function RevealCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-bg-soft p-7 sm:p-8 [&_.card-lead]:text-[21px] sm:[&_.card-lead]:text-[22px] [&_.card-key]:text-[23px] sm:[&_.card-key]:text-[24px] [&_.card-key]:font-semibold [&_.card-key]:text-ink [&_.card-key]:my-6 sm:[&_.card-key]:my-8 [&_.card-key]:leading-[1.4] [&_.card-bold]:font-semibold [&_.card-bold]:text-ink">
      <h3 className="text-[24px] sm:text-[26px] font-semibold font-sans mb-3 tracking-tight">{title}</h3>
      <div className="space-y-4 text-[19px] sm:text-[20px] text-ink-soft leading-[1.7]">{children}</div>
    </div>
  );
}

function Transformations() {
  const slides = [
    { headline: '"I\'m not hiding in baggy clothes anymore."', src: t1 },
    { headline: '"I\'m in family photos again, front and center."', src: t4 },
    { headline: '"I\'m dressing up again. I\'m smiling in pictures again."', src: t8 },
    { headline: '"I feel like the woman I forgot I was."', src: t10 },
    { headline: '"My doctor\'s visits sound completely different now."', src: t7 },
    { headline: '"I\'m back to the size I never thought I\'d see again."', src: t12 },
    { headline: '"I\'m not the one hiding behind the camera anymore."', src: t9 },
    { headline: '"I lost the baby weight."', src: tTammi },
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
        <BigCta position="mid" sub="14-day money-back · Limited spots">Yes, I want this to be me</BigCta>
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
    const fullHref = program ? signupUrl(program.id, "FULL_PROGRAM", { durationWeeks: program.durationWeeks }) : "/checkout";
    const monthlyHref = program ? signupUrl(program.id, "MONTHLY", { durationWeeks: program.durationWeeks }) : "/checkout";
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
              <BigCta position="mid" tier={p.name.toLowerCase()} buyButton price={isFull ? p.fullPrice : p.monthlyPrice} paymentOption={isFull ? "pay_in_full" : "monthly"} sub="14-day money-back guarantee" className="mt-4" href={p.loading ? undefined : ctaHref}>
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
          <BigCta position="bottom" sub="14-day money-back guarantee · Limited spots">Reserve my spot</BigCta>
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
          <div className="font-normal text-ink-soft">JJ's 12-Weeks to Sexy™</div>
          <div className="text-brand font-bold text-[15px]">
            Closes in <CountdownInline className="tabular-nums font-bold" />
          </div>
        </div>
        <button
          onClick={scrollToOffer}
          data-cta="yes-jj"
          data-position="bottom"
          data-tier="unknown"
          className="bg-brand text-white px-5 py-3 rounded-full text-[14px] font-semibold shadow-md"
        >
          Reserve
        </button>
      </div>
    </div>
  );
}
