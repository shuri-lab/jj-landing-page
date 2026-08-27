import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Award, TrendingDown, Phone, MessageCircle, UtensilsCrossed, UserCheck, Users, Zap, Gift } from "lucide-react";
import { useCoachPrograms } from "@/lib/coach-programs";
import { scrollToOffer } from "@/lib/scroll-to-offer";
import { SignupCheckoutCard } from "@/components/signup/SignupCheckoutCard";
import { OFFER_PLANS } from "@/lib/signup/plans";
import { readLandingPrefill } from "@/lib/signup/attribution";
import { trackSelectPlan } from "@/lib/signup/tracking";
import type { OfferPlan } from "@/lib/signup/types";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import quizHeroDesktop from "@/assets/landing/quiz-hero-image-desktop.png";
import quizHeroMobile from "@/assets/landing/quiz-hero-image-mobile.png";
import jjOwnTransformation from "@/assets/landing/jj-own-transformation.png";
import jjOnTv from "@/assets/landing/jj-smith-on-tv-v3.png";
import groceryLists from "@/assets/landing/grocery-lists.png";
import clarityImage from "@/assets/landing/clarity-image.png";
import { styleGuide as guaranteeSeal } from "@/assets/look-younger";
import dailySmsImage from "@/assets/landing/daily-sms-image.png";
import weeklyCallsImage from "@/assets/landing/weekly-calls.png";
import resetPlanImage from "@/assets/landing/reset-plan.png";
import planForYourBodyImage from "@/assets/landing/plan-for-your-body.png";
import theCircleImage from "@/assets/landing/the-circle.png";
import mealsCardImage from "@/assets/landing/meals-card-image.png";
import methodReset from "@/assets/landing/method-reset.png";
import methodFeed from "@/assets/landing/method-feed.jpeg";
import methodCoach from "@/assets/landing/design-v2-hero.png";
import eatGoodJJ from "@/assets/landing/eat-good-jj.png";
import whyEatingLess from "@/assets/landing/why-eating-less-backfires.jpg";
import whyOutTrain from "@/assets/landing/why-out-train-your-plate.jpg";
import whyEveryMonday from "@/assets/landing/why-every-monday.jpg";
import whyOnYourOwn from "@/assets/landing/why-on-your-own.jpg";
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

export const Route = createFileRoute("/b")({
  head: () => ({
    meta: [
      { title: "Get Your Sexy Back After 40 — JJ Smith Personal Coaching" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Lose up to 15 pounds in your first 30 days with JJ Smith by your side every day. A plan built around the food you love, no starving, never alone." },
      { property: "og:title", content: "Get Your Sexy Back After 40 — JJ Smith" },
      { property: "og:description", content: "A plan built around the food you love, with JJ in your corner every single day." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const MEMBER_PRICE = 47;
const MEMBER_WAS = 77;
// 3-month prepay option: $127 up front vs $47/mo (= $141 over 3 months) → save $14, ~$1.41/day
const QUARTER_PRICE = 127;
const QUARTER_MONTHLY_EQUIV = MEMBER_PRICE * 3; // 141
const QUARTER_SAVE = QUARTER_MONTHLY_EQUIV - QUARTER_PRICE; // 14
const CTA_SUB = "Only $1.57/day · 14-day money back guarantee";

// ── highlight + icon helpers ─────────────────────────────────────────────────
function Mark({ children }: { children: React.ReactNode }) { return <span className="ly-mark">{children}</span>; }
function Hi({ children }: { children: React.ReactNode }) { return <span className="ly-hi">{children}</span>; }
function Check({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ShieldCheck({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const scroll = () => scrollToOffer();

function Cta({ label = "Start today", sub, href, full = false, onDark = false, onClick, position, tier = "standard" }: { label?: string; sub?: React.ReactNode; href?: string; full?: boolean; onDark?: boolean; onClick?: () => void; position?: string; tier?: string }) {
  const cls = `ly-cta ly-cta-lg ${full ? "ly-cta-full" : ""}`;
  const inner = <>{label}<span className="ly-cta-arw" aria-hidden>→</span></>;
  const btn = href
    ? <a href={href} className={cls} data-cta="yes-jj" data-position={position} data-tier={tier}>{inner}</a>
    : <button className={cls} onClick={onClick ?? scroll} data-cta="yes-jj" data-position={position} data-tier={tier}>{inner}</button>;
  if (!sub) return btn;
  return <div className="ly-cta-wrap">{btn}<p className={`ly-cta-sub ${onDark ? "on-dark" : ""}`}>{sub}</p></div>;
}

// ── page ─────────────────────────────────────────────────────────────────────
function Landing() {
  const [showSticky, setShowSticky] = useState(false);
  const [offerVisible, setOfferVisible] = useState(false);
  // Meta Pixel ViewContent is fired globally in __root.tsx for every landing page.
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const el = document.getElementById("offer");
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOfferVisible(e.isIntersecting), { threshold: 0, rootMargin: "0px 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lyx">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <PressStrip />
        <ResearchSupport />
        <WhyNothing />
        <Method />
        <Story />
        <RealResults />
        <WhatYouGet />
        <Clarity />
        <Pricing />
        <Guarantee />
        <Close />
        <Faq />
      </main>
      <Footer />
      <StickyCta show={showSticky && !offerVisible} />
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="ly-announce">
      <div className="ly-wrap ly-announce-in">
        <span className="ly-announce-star" aria-hidden>✦</span>
        <span>Lose 10 pounds or your money back*</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="ly-header">
      <div className="ly-wrap ly-header-in">
        <img src={jjSmithLogo} alt="JJ Smith" className="ly-logo" />
        <button className="ly-header-cta" onClick={scroll}>Join now</button>
      </div>
    </header>
  );
}

// ── hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const badges = [
    { Icon: MessageCircle, label: "Daily support" },
    { Icon: Phone, label: "2× weekly coaching calls" },
    { Icon: UtensilsCrossed, label: "Food you love" },
  ];
  return (
    <section className="ly-band ly-hero">
      <div className="ly-hero-stage">
        <div className="ly-wrap ly-hero-inner">
          <div className="ly-hero-copy">
            <HeroTrust />
            <h1 className="ly-h1 ly-hero-h1">Finally lose the weight after 40, <Hi>without giving up the food you love.</Hi></h1>
            <p className="ly-hero-sub">Lose up to <Mark>15 pounds in your first 30 days</Mark>, and we keep going together, with food you actually love, until every last pound is gone.</p>
            <div className="ly-hero-action">
              <Cta label="Start today" sub={CTA_SUB} full />
            </div>
          </div>
          <div className="ly-hero-media">
            <img src={eatGoodJJ} alt="JJ Smith enjoying a plate of food from her plan" fetchPriority="high" />
            {badges.map(({ Icon, label }, i) => (
              <span className={`ly-hero-badge ly-hero-badge-${i + 1}`} key={label}>
                <span className="ly-hero-bico"><Icon className="ly-ico-16" strokeWidth={2} /></span>{label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <TransformationsMarquee />
    </section>
  );
}

function HeroTrust() {
  const avatars = [t8, t10, t4];
  return (
    <div className="ly-trust">
      <span className="ly-trust-i ly-tdesk"><Award className="ly-ico-16" /> NYT Bestseller</span>
      <span className="ly-trust-div ly-tdesk" aria-hidden />
      <span className="ly-trust-i"><TrendingDown className="ly-ico-16" /> 5M+ lbs lost</span>
      <span className="ly-trust-div" aria-hidden />
      <span className="ly-trust-i">
        <span className="ly-trust-av">{avatars.map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}</span>
        800K+ women helped
      </span>
    </div>
  );
}

const TRANSFORMATIONS = [
  { src: t8, caption: "-19.8 lbs in 8 weeks" }, { src: t1, caption: "-16 lbs in 6 weeks" },
  { src: t12, caption: "-22 lbs in 8 weeks" }, { src: t4, caption: "-12.2 lbs in 6 weeks" },
  { src: t10, caption: "-11.6 lbs in 6 weeks" }, { src: t7, caption: "-24 lbs in 10 weeks" },
  { src: t9, caption: "-15 lbs in 7 weeks" }, { src: t11, caption: "-18 lbs in 8 weeks" },
  { src: tTammi, caption: "-20 lbs in 8 weeks" },
];

function TfCard({ tr }: { tr: { src: string; caption: string } }) {
  return (
    <figure className="ly-tf-card">
      <img src={tr.src} alt="A woman's before and after transformation" loading="lazy" />
      <figcaption>{tr.caption}</figcaption>
    </figure>
  );
}

function TransformationsMarquee() {
  const mid = Math.ceil(TRANSFORMATIONS.length / 2);
  const rowTop = TRANSFORMATIONS.slice(0, mid);      // first half → top row (scrolls left→right)
  const rowBottom = TRANSFORMATIONS.slice(mid);      // second half → bottom row (scrolls right→left)
  const full = [...TRANSFORMATIONS, ...TRANSFORMATIONS];
  const top = [...rowTop, ...rowTop];
  const bottom = [...rowBottom, ...rowBottom];
  return (
    <>
      {/* Desktop: single slider (unchanged) */}
      <div className="ly-tf ly-tf-desk">
        <div className="ly-tf-track">
          {full.map((tr, i) => <TfCard key={i} tr={tr} />)}
        </div>
      </div>
      {/* Mobile: two stacked sliders running in opposite directions */}
      <div className="ly-tf-mob">
        <div className="ly-tf">
          <div className="ly-tf-track ly-tf-rev">
            {top.map((tr, i) => <TfCard key={i} tr={tr} />)}
          </div>
        </div>
        <div className="ly-tf">
          <div className="ly-tf-track">
            {bottom.map((tr, i) => <TfCard key={i} tr={tr} />)}
          </div>
        </div>
      </div>
    </>
  );
}

const ALL_LOGOS = [partnerNyTimes, partnerDrOz, partnerTheView, partnerSteveHarvey, partnerNbc, partnerFox, partnerEssence, partnerWomansWorld];

function PressStrip({ dark = false, label = "As seen on" }: { dark?: boolean; label?: string }) {
  return (
    <section className={`ly-press ${dark ? "is-dark" : ""}`}>
      <p className="ly-press-lbl">{label}</p>
      <div className="ly-marquee">
        <div className="ly-marquee-track">
          {[...ALL_LOGOS, ...ALL_LOGOS].map((l, i) => <img key={i} src={l} alt="" className="ly-marquee-img" loading="lazy" />)}
        </div>
      </div>
    </section>
  );
}

// ── story (dark) ─────────────────────────────────────────────────────────────
function Story() {
  return (
    <section className="ly-band ly-dark">
      <div className="ly-wrap ly-story-grid">
        <div className="ly-story-media">
          <div className="ly-story-single">
            <img src={jjOwnTransformation} alt="JJ Smith's own transformation" loading="lazy" />
          </div>
          <div className="ly-story-quad">
            {[jjBefore1, jjAfter1, jjBefore2, jjAfter2].map((src, i) => (
              <div className="ly-story-cell" key={i}><img src={src} alt="JJ Smith before and after" loading="lazy" /></div>
            ))}
          </div>
        </div>
        <div className="ly-story-copy">
          <h2 className="ly-h2 on-dark">My body turned on me, <Hi>too.</Hi></h2>
          <p className="ly-lead on-dark-soft ly-mt">In my late 30s, my body turned on me. Weight from nowhere, exhausted, foggy, a stranger in the mirror. So I did everything they tell you. <strong className="on-dark">Skipped meals. Cut carbs. Dragged myself to the gym.</strong> Nothing moved.</p>
          <p className="ly-story-quote">"Eat less, move more. Nobody warned me my body had changed, and those old rules would never work again."</p>
          <p className="ly-lead on-dark-soft ly-mt">So I stopped fighting my body and started working with it, my hormones, my blood sugar, all of it. <strong className="on-dark">The weight came off, my energy roared back,</strong> and in my 40s I felt better than at 30.</p>
          <p className="ly-lead on-dark-soft ly-mt-s">My books became bestsellers, and hundreds of thousands of women used them to get themselves back.</p>
          <img src={jjOnTv} className="ly-story-tv" alt="JJ Smith featured across TV shows and bestselling books" loading="lazy" />
          <div className="ly-story-featured">
            <PressStrip label="JJ Smith has been featured on" />
          </div>
          <p className="ly-lead on-dark-soft ly-mt">But what I hold onto is simpler: the woman who tells me she came off her medication, or feels like herself again. That is why I do this, and now I want to do it with you. <strong className="on-dark">I got you.</strong></p>
          <div className="ly-mt-l"><Cta label="Start with me today" sub={CTA_SUB} onDark /></div>
        </div>
      </div>
    </section>
  );
}

// ── why nothing has worked ───────────────────────────────────────────────────
function WhyNothing() {
  const cards: { title: string; text: React.ReactNode; img: string }[] = [
    { img: whyEatingLess, title: "Eating less just backfires.", text: <>You cut back and skip meals. Then <strong>you are starving by night, and it all comes back.</strong> Eating less was never the answer.</> },
    { img: whyOutTrain, title: "You can't out-train your plate.", text: <>All those workouts, and the scale barely moves. <strong>What you eat matters far more than what you burn,</strong> and grinding harder only leaves you hungrier.</> },
    { img: whyEveryMonday, title: "Every Monday is day one again.", text: <>You start strong. <strong>By Wednesday, you are back.</strong> You have started over more times than you can count, and you are tired of it.</> },
    { img: whyOnYourOwn, title: "On your own, it never lasts.", text: <>You hold it together for a week or two, then life hits and <strong>nobody is there to catch you.</strong> Willpower runs out. <Hi>Somebody in your corner does not.</Hi></> },
  ];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">Why nothing has worked</span>
        <h2 className="ly-h2 ly-h2-sound">Sound <Hi>familiar?</Hi></h2>
        <div className="ly-rcards">
          {cards.map(({ img, title, text }) => (
            <div className="ly-rcard" key={title}>
              <div className="ly-rcard-media"><img src={img} alt={title} loading="lazy" /></div>
              <div className="ly-rcard-in">
                <h3 className="ly-h3">{title}</h3>
                <p className="ly-rcard-t">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── research / you're not alone (dark band, echoes the "eat good" design) ─────
function ResearchSupport() {
  return (
    <section className="ly-band ly-research">
      <div className="ly-wrap ly-research-in">
        <span className="ly-eyebrow ly-research-eyebrow">Research shows</span>
        <h2 className="ly-research-h">92% of women won&rsquo;t reach their goal weight <span className="ly-research-hi">without personalized support.</span></h2>
        <div className="ly-research-body">
          <p>Women with <strong>personalized support</strong> are up to <strong>3&times; more likely to keep the weight off.</strong></p>
          <p>The difference was <strong>never willpower.</strong> It was <span className="ly-research-turn">support.</span></p>
        </div>
      </div>
    </section>
  );
}

// ── method ───────────────────────────────────────────────────────────────────
function Method() {
  const shifts = [
    { img: methodReset, title: "First, we reset your body.", text: <>We start with a reset that gets your body working with you again. It quiets your cravings, settles your hormones and your blood sugar, and <Hi>drops up to 15 pounds.</Hi> You feel it fast, and it gives you your running start.</> },
    { img: methodFeed, title: "Then we feed your body, we don't punish it.", text: <><strong>No starving. No punishing gym.</strong> Real food you actually love, simple to make, planned around your life. The grocery lists alone can <Hi>save you up to $75 a month.</Hi></> },
    { img: methodCoach, title: "And this time, you've got me.", text: <>You already know what to do. You have the books. What you never had is <strong>somebody who shows up every day and does not leave.</strong> Two coaching calls a week, and a text every morning, so you are never doing this alone. <strong>That is what finally makes it stick.</strong></> },
  ];
  return (
    <section className="ly-band ly-lav">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">The method</span>
        <h2 className="ly-h2">The <Hi>3 shifts</Hi> that change everything</h2>
        <div className="ly-method">
          {shifts.map(({ img, title, text }, i) => (
            <div className="ly-shift" key={title}>
              <div className="ly-shift-img">
                <img src={img} alt={title} loading="lazy" />
                <span className="ly-shift-n" aria-hidden="true">{i + 1}</span>
              </div>
              <div className="ly-shift-body">
                <h3 className="ly-h3 ly-shift-h">{title}</h3>
                <p className="ly-shift-t">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center"><Cta label="Start today" /></div>
      </div>
    </section>
  );
}

// ── real results ─────────────────────────────────────────────────────────────
function RealResults() {
  const results = [
    { src: t12, name: "Akilea", num: "Lost 166 lbs.", text: "\"My doctor took me off my blood pressure medication this year. I sleep through the night, I can be on my feet all day, and I fit into clothes I never thought I would wear again.\"" },
    { src: t7, name: "Marisol", num: "Lost 58 lbs.", text: "\"I have energy from morning to night now, instead of dragging by the afternoon. My clothes fit the way I want them to, and I feel comfortable in my own skin again.\"" },
    { src: t10, name: "Renee", num: "Lost 71 lbs.", text: "\"The belly fat that would not budge for years finally let go. I chase my kids around without getting winded, and now I am in the family photos instead of behind the camera.\"" },
    { src: t8, name: "Angel", num: "Lost 72 lbs.", text: "\"People keep telling me I look ten years younger, and I feel it. My clothes fit again, and I feel so good that my husband and my brother started too.\"" },
    { src: t1, name: "Kiaya", num: "Lost 124 lbs.", text: "\"I am wearing a size I had not touched in a decade. I actually love getting dressed now, I am in every picture, and I feel like myself again.\"" },
    { src: t4, name: "Danielle", num: "Lost 34 lbs.", text: "\"I got my curves back, snatched, not skinny. I fit into the dress I had been saving for three years and wore it to my daughter's wedding, feeling like the best version of me.\"" },
  ];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">Real women, real results</span>
        <h2 className="ly-h2">They got themselves back. <Hi>So will you.</Hi></h2>
        <div className="ly-results">
          {results.map((r, i) => (
            <figure className="ly-result" key={i}>
              <div className="ly-result-ph"><img src={r.src} alt="A woman's before and after transformation" loading="lazy" /></div>
              <figcaption className="ly-result-in">
                {r.name && <p className="ly-result-name">{r.name}</p>}
                <p className="ly-result-num">{r.num}</p>
                <p className="ly-result-t">{r.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center"><Cta label="Start today" /></div>
      </div>
    </section>
  );
}

// ── what you get ─────────────────────────────────────────────────────────────
function WhatYouGet() {
  const items = [
    { Icon: Phone, img: weeklyCallsImage, title: "Two 1-on-1 coaching calls a week with JJ's AI Twin.", text: "Two 1-on-1 coaching calls a week with JJ's AI Twin — my exact voice, personality, and coaching. Twice a week we look back at your week together and fix what got in the way." },
    { Icon: MessageCircle, img: dailySmsImage, title: "A text every morning.", text: "A text every morning. You wake up with JJ in your corner, never starting the day alone." },
    { Icon: Zap, img: resetPlanImage, title: "Your reset.", text: "We start here. It quiets your cravings, kills the bloat, and drops up to 15 pounds, so you feel it working right away." },
    { Icon: UtensilsCrossed, img: mealsCardImage, title: "Meals built around the food you love.", text: "Planned for you, simple to make. No guessing, no wondering what to eat, and food you actually want to eat." },
    { Icon: UserCheck, img: planForYourBodyImage, title: "A plan made for your body.", text: "Built around your life, your schedule, and the season you are in, so it finally fits." },
    { Icon: Users, img: theCircleImage, title: "The Circle of Women.", text: "A private room of women on the same journey, so you are never the only one, and you never feel like it." },
  ];
  return (
    <section className="ly-band ly-pink">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">What is inside</span>
        <h2 className="ly-h2">Here is <Hi>everything you get</Hi></h2>
        <div className="ly-get">
          {items.map(({ Icon, img, title, text }) => (
            <div className="ly-getcard" key={title}>
              {img ? (
                <div className="ly-getcard-img"><img src={img} alt={title} loading="lazy" /></div>
              ) : (
                <div className="ly-getcard-ph"><Icon className="ly-ico-28" strokeWidth={1.8} /></div>
              )}
              <div className="ly-getcard-in">
                <h3 className="ly-getcard-h">{title}</h3>
                <p className="ly-getcard-t">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center"><Cta label="Start today" /></div>
      </div>
    </section>
  );
}

// ── pricing / value stack ────────────────────────────────────────────────────
const VALUE_STACK: { label: string; value: number; note?: string; bonus?: boolean; avatars?: boolean; img?: string }[] = [
  { label: "Two 1-on-1 coaching calls every week with JJ's AI Twin", value: 1200, note: "my exact voice, personality, and coaching" },
  { label: "Daily texts from JJ", value: 400 },
  { label: "Your reset plan, lose up to 15lbs in the first 2 weeks", value: 97 },
  { label: "A done-for-you weekly meal plan, built around the food you love", value: 300 },
  { label: "Grocery lists that save you up to $75 a month", value: 150, bonus: true, img: groceryLists },
  { label: "The Circle of Women", value: 200, bonus: true, avatars: true },
];

function Pricing() {
  const { premium: program } = useCoachPrograms();
  const [selectedPlan, setSelectedPlan] = useState<OfferPlan | null>(null);
  const openedFromUrl = useRef(false);
  const totalValue = VALUE_STACK.reduce((n, it) => n + it.value, 0);

  const choosePlan = (id: "monthly" | "quarter") => {
    const plan = OFFER_PLANS[id];
    setSelectedPlan(plan);
    trackSelectPlan({
      billing_interval: plan.billingInterval,
      button_position: plan.buttonPosition,
      cta_text: plan.ctaLabel,
      tier: (program?.pricingTier || "standard").toLowerCase(),
      content_id: program?.id,
      value: plan.price,
      currency: "USD",
      coach_program_config_id: program?.id,
    });
  };

  useEffect(() => {
    if (openedFromUrl.current) return;
    const fromUrl = readLandingPrefill().plan;
    if (!fromUrl) return;
    openedFromUrl.current = true;
    choosePlan(fromUrl);
  }, [program]);

  useEffect(() => {
    if (!selectedPlan) return;
    const el = document.getElementById("checkout-card");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedPlan]);

  return (
    <section id="offer" className="ly-band ly-lav">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">Get started</span>
        <h2 className="ly-h2">Your comeback starts at <Hi>$1.57 a day</Hi></h2>
        <p className="ly-lead ly-soft ly-mt ly-narrow">Less than a coffee ☕. <strong>Lose 10 pounds in your first month, or it&rsquo;s free.</strong></p>

        <div className="ly-stack">
          <p className="ly-stack-h">Everything included:</p>
          <ul className="ly-stack-list">
            {VALUE_STACK.filter((it) => !it.bonus).map((it) => (
              <li key={it.label}>
                <span className="ly-stack-name"><span className="ly-stack-tick"><Check className="ly-ico-12" /></span><span>{it.label}{it.note ? <span className="ly-stack-sub">{it.note}</span> : null}</span></span>
                <span className="ly-stack-val">${it.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="ly-stack-bonuses">
            {VALUE_STACK.filter((it) => it.bonus).map((it) => (
              <div className="ly-stack-bonus" key={it.label}>
                <span className="ly-stack-bonus-visual">
                  {it.avatars ? (
                    <span className="ly-stack-bonus-av">{[t8, t10, t4].map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}</span>
                  ) : it.img ? (
                    <img className="ly-stack-bonus-img" src={it.img} alt="" loading="lazy" />
                  ) : (
                    <span className="ly-stack-bonus-ico"><Gift className="ly-ico-16" strokeWidth={2} /></span>
                  )}
                </span>
                <span className="ly-stack-bonus-main">
                  <span className="ly-stack-bonus-tag">Bonus</span>
                  <span className="ly-stack-bonus-label">{it.label}</span>
                </span>
                <span className="ly-stack-val">${it.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="ly-stack-total"><span>Total Value</span><span className="ly-stack-total-v">${totalValue.toLocaleString()}+</span></div>
          <div className="ly-stack-deal">
            <span className="ly-stack-badge">Was <s>${MEMBER_WAS}</s> · Now</span>
            <div className="ly-stack-now"><span className="ly-stack-num">${MEMBER_PRICE}</span><span className="ly-stack-per">/month</span></div>
            <p className="ly-stack-note">Billed monthly · cancel anytime · that's just $1.57 a day</p>
            <div className="ly-mt-s"><Cta label={`Start today · $${MEMBER_PRICE}/month`} full onClick={() => choosePlan("monthly")} position="offer-monthly" /></div>
            <p className="ly-urgency">Price goes back to ${MEMBER_WAS} soon. <strong>Lock it in today.</strong></p>
          </div>

          <div className="ly-or"><span>or</span></div>

          <div className="ly-deal2">
            <span className="ly-deal2-badge">Best value · save ${QUARTER_SAVE}</span>
            <div className="ly-deal2-now"><s>${QUARTER_MONTHLY_EQUIV}</s><span className="ly-deal2-num">${QUARTER_PRICE}</span><span className="ly-deal2-per">for 3 months</span></div>
            <p className="ly-stack-note">Pay once · that's just $1.41 a day</p>
            <div className="ly-mt-s"><Cta label={`Start today · $${QUARTER_PRICE} for 3 months`} full onClick={() => choosePlan("quarter")} position="offer-quarter" /></div>
          </div>

          <p className="ly-stack-trust"><ShieldCheck className="ly-ico-14" /> 14-day money-back guarantee · zero risk · cancel anytime</p>
        </div>

        {selectedPlan ? (
          <SignupCheckoutCard
            key={selectedPlan.id}
            plan={selectedPlan}
            onChangePlan={() => setSelectedPlan(null)}
          />
        ) : null}
      </div>
    </section>
  );
}

// ── clarity (how she can be there every day) ─────────────────────────────────
function Clarity() {
  return (
    <section className="ly-band ly-cream">
      <div className="ly-wrap ly-clarity">
        <div className="ly-clarity-media">
          <img src={clarityImage} alt="JJ Smith" loading="lazy" />
        </div>
        <div>
          <span className="ly-eyebrow">A word from me</span>
          <h2 className="ly-h2">How I can finally be there for you <Hi>every day</Hi></h2>
          <p className="ly-lead ly-soft ly-mt">For fifteen years, my books and group coaching have helped hundreds of thousands of women get themselves back. But I could never be right there with each of you, <strong>one on one, on the hard days.</strong> There was only ever one of me.</p>
          <p className="ly-lead ly-soft ly-mt">So I built my JJ Twin. <strong>It is my exact voice, my exact personality, my exact coaching,</strong> everything I know and everything I would tell you if we were sitting together.</p>
          <p className="ly-clarity-quote">You can talk to me any time, day or night, and it feels like sitting down with me.</p>
          <p className="ly-lead ly-soft ly-mt">This is how I finally keep the promise I could never keep before: to be there for you, personally, every single day. Not a book. Not a plan you follow alone. <strong>Me, in your corner, whenever you need me.</strong></p>
          <p className="ly-guar-sig">JJ</p>
        </div>
      </div>
    </section>
  );
}

// ── guarantee ────────────────────────────────────────────────────────────────
function Guarantee() {
  const pills = ["Lose 10 lbs or free", "14-day money back", "no questions asked", "cancel anytime"];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap ly-guar-grid">
        <img src={guaranteeSeal} alt="100% money-back guarantee" className="ly-guar-img" loading="lazy" />
        <div>
          <span className="ly-eyebrow">My promise to you</span>
          <h2 className="ly-h2">You either lose the weight, <Hi>or your money back.</Hi></h2>
          <p className="ly-lead ly-mt">Give me your first month. Do the work with me, and if you don&rsquo;t lose at least 10 pounds, <strong>your month is free.</strong> That is how sure I am that this works.</p>
          <p className="ly-lead ly-mt">And if somewhere in your first 14 days you decide this isn&rsquo;t for you, just tell me. <strong>I send back every penny.</strong> No questions. No guilt. I only want your money if you are glad you are here.</p>
          <p className="ly-lead ly-mt">That is my promise to you.</p>
          <p className="ly-guar-sig">&mdash; JJ</p>
          <div className="ly-pills">
            {pills.map((p) => <span className="ly-pill" key={p}><Check className="ly-ico-12" /> {p}</span>)}
          </div>
          <div className="ly-mt-l"><Cta label="Start today, risk-free" sub="Only $1.57/day · cancel anytime" /></div>
        </div>
      </div>
    </section>
  );
}

// ── close (dark) ─────────────────────────────────────────────────────────────
function Close() {
  return (
    <section className="ly-band ly-dark ly-center">
      <div className="ly-wrap ly-narrow">
        <h2 className="ly-h2 on-dark">The months ahead are <Hi>coming either way.</Hi></h2>
        <p className="ly-lead on-dark-soft ly-mt">You can spend them like the last ones. Or you can spend them with me beside you, and come out the other side <strong className="on-dark">feeling like yourself again.</strong></p>
        <p className="ly-lead on-dark-soft ly-mt-s">You do not need another book. You need somebody in your corner who stays. Let that be me.</p>
        <div className="ly-mt-l ly-cta-center"><Cta label="Yes, I'm in" sub={CTA_SUB} onDark /></div>
      </div>
    </section>
  );
}

// ── faq ──────────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
    { q: "I'm in my 50s and nothing has worked.", a: "That is exactly who this is for. What stopped working was your body changing after 40, not you. The plan is built for your season, and this time you are not on your own." },
    { q: "How can it really be you, there for me every day?", a: "I built my JJ Twin, so I finally can. My exact voice, personality, and coaching, everything I would tell you if we were sitting together. Talk to me any time, and it feels like me, because it is me." },
    { q: "I don't have time.", a: "Your meals are planned for you and the check-ins keep it simple. This is one less thing to carry, not one more." },
    { q: "Do I have to drink green smoothies?", a: "No. You start with a jumpstart to reset your body, smoothies optional. After that, your weekly meals are built around the food you already love." },
    { q: "What makes this different?", a: "Everyone else hands you a plan and leaves. I stay, one on one, every single day. Each week we even plan around your real life, so eating out and busy weekends never knock you off track." },
    { q: "I'm on a weight-loss shot. Is this for me?", a: "Yes. A shot can quiet your appetite. It cannot build your habits or be in your corner on the hard days. That is the part that lasts, and that is what we do together." },
    { q: "How does billing work?", a: "$47 a month, cancel anytime in two clicks. No calls, no contract." },
    { q: "What if I fall behind?", a: "You pick up right where you left off, and I help you. This was never about being perfect." },
    { q: "What if I change my mind?", a: "You are covered two ways. Lose 10 pounds your first month or it is free. And if you change your mind in your first 14 days, every penny back, no reason needed." },
  ];
  return (
    <section className="ly-band ly-cream ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Questions women ask me</span>
        <h2 className="ly-h2">Let me answer <Hi>what's on your mind</Hi>.</h2>
        <div className="ly-faq">
          {items.map((it, i) => (
            <details key={i} className="ly-faq-item">
              <summary>{it.q}<span className="ly-faq-mark" aria-hidden /></summary>
              <div className="ly-faq-a">{it.a}</div>
            </details>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center"><Cta label="Start today" /></div>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="ly-footer">© {new Date().getFullYear()} JJ Smith. All rights reserved. · <a href="#">Privacy</a> · <a href="#">Terms</a></footer>;
}

function StickyCta({ show }: { show: boolean }) {
  return (
    <div className={`ly-sticky ${show ? "is-show" : ""}`} aria-hidden={!show}>
      <div className="ly-sticky-in">
        <span className="ly-sticky-lbl"><strong>$1.57 a day</strong> · cancel anytime<span className="ly-sticky-more"> · 14-day money-back guarantee</span></span>
        <button className="ly-cta ly-sticky-btn" onClick={scroll}>Start today<span className="ly-cta-arw" aria-hidden>→</span></button>
      </div>
    </div>
  );
}

// ── styles (look-younger design language) ────────────────────────────────────
const CSS = `
.lyx{
  --white:#FFFFFF; --cream:#FBF6F0; --lav:#F3ECFB; --pink:#FCEAF4; --dark-2:#2B1940;
  --ink:#2A2036; --ink-soft:#6C6180; --hair:#EBE1F5;
  --purple:#7C3AA6; --purple-deep:#5B2A80; --purple-soft:#F0E6FA;
  --pink-accent:#C0468C; --mark:#F7D6EA; --gold:#E0A94F;
  --grad:linear-gradient(135deg,#7E36A6 0%,#5B2A80 100%);
  --shadow:0 34px 64px -36px rgba(74,35,90,.44);
  --shadow-sm:0 18px 38px -26px rgba(74,35,90,.4);
  --sans:'DM Sans',-apple-system,'Segoe UI',sans-serif;
  --head:'Montserrat',var(--sans);
  font-family:var(--sans); color:var(--ink); background:var(--white);
  font-size:19px; line-height:1.6; font-weight:500; -webkit-font-smoothing:antialiased;
  overflow-x:hidden; width:100%; max-width:100vw;
}
.lyx *{box-sizing:border-box}
.lyx img{max-width:100%;display:block}
.lyx button{font-family:inherit;cursor:pointer}
.lyx a{color:inherit;text-decoration:none}
.lyx em{font-style:normal;color:var(--purple);font-weight:800}
.lyx strong{font-weight:700;color:var(--ink)}
.lyx s{color:var(--ink-soft);text-decoration:line-through;font-weight:600}
.lyx :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.ly-mark{background:linear-gradient(180deg,transparent 58%, var(--mark) 58%);padding:0 .06em;border-radius:2px;color:var(--purple-deep)}
.ly-hi{color:var(--purple)}
.on-dark{color:#fff!important}
.on-dark-soft{color:#DEC9EE}
.ly-dark .ly-hi{color:#EEBBE0}
.ly-dark .ly-mark{background:linear-gradient(180deg,transparent 58%,rgba(238,187,224,.28) 58%);color:#F6DCEF}

.ly-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.lyx .ly-narrow{max-width:740px;margin-left:auto;margin-right:auto}
.ly-band{padding:56px 0}
.ly-center{text-align:center}
.ly-white{background:var(--white)} .ly-lav{background:var(--lav)} .ly-pink{background:var(--pink)} .ly-cream{background:var(--cream)}
.ly-dark{background:radial-gradient(130% 120% at 50% 0%,#4A2A66 0%,#2B1940 62%);color:#F3EAFB}
.lyx .ly-mt{margin-top:20px}.lyx .ly-mt-s{margin-top:12px}.lyx .ly-mt-l{margin-top:32px}
.ly-soft{color:var(--ink-soft)}
.ly-cta-center{display:flex;justify-content:center}
.ly-only-mob{display:block} .ly-only-desk{display:none}

.ly-eyebrow{display:inline-block;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.ly-h1{font-family:var(--head);font-weight:900;font-size:clamp(37px,7vw,57px);line-height:1.06;letter-spacing:-.02em;margin:0}
.ly-h2{font-family:var(--head);font-weight:800;font-size:clamp(31px,5.4vw,48px);line-height:1.08;letter-spacing:-.02em;margin:0}
.ly-h3{font-family:var(--head);font-weight:800;font-size:22px;line-height:1.2;letter-spacing:-.01em;margin:0}
.ly-lead{font-size:clamp(19px,2.2vw,22px);line-height:1.55;font-weight:500;margin:0}

.ly-ico-12{width:14px;height:14px;flex:0 0 auto}.ly-ico-13{width:15px;height:15px;flex:0 0 auto}.ly-ico-14{width:16px;height:16px;flex:0 0 auto}
.ly-ico-16{width:18px;height:18px;flex:0 0 auto}.ly-ico-24{width:24px;height:24px}.ly-ico-28{width:30px;height:30px}

/* CTA */
.ly-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:18px;border:0;padding:17px 30px;border-radius:14px;box-shadow:0 16px 34px -12px rgba(91,42,128,.5);transition:transform .15s,box-shadow .15s,filter .15s;line-height:1.15}
.lyx a.ly-cta{color:#fff}
.ly-cta:hover{transform:translateY(-2px);box-shadow:0 22px 44px -14px rgba(91,42,128,.55);filter:brightness(1.05)}
.ly-cta-lg{font-size:clamp(18px,2vw,21px);padding:19px 30px}
.ly-cta-full{width:100%;padding-left:16px;padding-right:16px}
.ly-cta-arw{font-size:1.2em;line-height:1;transform:translateY(-1px)}
.ly-cta-wrap{width:100%}
.ly-cta-sub{margin:12px 0 0;font-size:14px;font-weight:600;color:var(--ink-soft);text-align:center}
.ly-cta-sub.on-dark{color:#D8C4E8}

/* announcement */
.ly-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff}
.ly-announce-in{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:6px 18px;font-family:var(--head);font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;text-align:center}
.ly-announce-star{color:#F6C9E4} .ly-announce-dot{opacity:.55}

/* header */
.ly-header{background:var(--white);border-bottom:1px solid var(--hair)}
.ly-header-in{display:flex;align-items:center;justify-content:space-between;padding:14px 0}
.ly-logo{height:24px;width:auto}
.ly-header-cta{background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:14px;border:0;border-radius:12px;padding:11px 20px;box-shadow:0 10px 22px -10px rgba(91,42,128,.5)}
@media (max-width:560px){ .ly-header-cta{display:none} .ly-header-in{justify-content:center} .ly-h2-sound{font-size:36px} }

/* hero */
.ly-hero{background:linear-gradient(180deg,#FAF1FB 0%,#F4EBFB 100%);padding:0}
.ly-hero-stage{position:relative;overflow:hidden;padding:28px 0 42px}
.ly-hero-inner{position:relative;z-index:1;width:100%}
.ly-hero-copy{max-width:560px}
.ly-hero-h1{font-size:clamp(30px,8.4vw,38px);line-height:1.1}
.ly-hbr{display:none}
.ly-hero-sub{margin-top:18px;max-width:560px;font-size:clamp(18px,2.5vw,23px);line-height:1.4;font-weight:800;color:var(--ink)}
.ly-hero-media{position:relative;max-width:380px;margin:34px auto 6px}
.ly-hero-media>img{position:relative;z-index:1;display:block;width:100%;height:auto}
.ly-hero-badge{position:absolute;z-index:2;display:inline-flex;align-items:center;gap:8px;background:#fff;color:#3A2350;font-family:var(--head);font-weight:700;font-size:13.5px;line-height:1.15;padding:7px 14px 7px 7px;border-radius:999px;box-shadow:0 16px 34px -14px rgba(74,35,90,.4);white-space:nowrap}
.ly-hero-bico{display:flex;align-items:center;justify-content:center;width:27px;height:27px;flex:0 0 auto;border-radius:999px;background:var(--grad);color:#fff}
.ly-hero-bico svg{width:14px;height:14px}
.ly-hero-badge-1{top:2%;left:-3%}
.ly-hero-badge-2{top:46%;right:-4%}
.ly-hero-badge-3{bottom:14%;left:-5%}
.ly-hero-action{max-width:480px;margin-top:24px}

/* hero trust (eyebrow / mobile pill) */
.ly-trust .ly-tdesk{display:none} .ly-bdesk{display:none}
.ly-trust{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:5px 8px;margin:0 0 18px;max-width:100%;font-size:12.5px;font-weight:700;color:var(--purple-deep);background:#fff;border:1px solid var(--hair);border-radius:999px;padding:7px 14px;box-shadow:var(--shadow-sm)}
.ly-trust-i{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.ly-trust-i svg{color:var(--purple);width:14px;height:14px}
.ly-trust-div{width:1px;height:12px;background:var(--hair);flex:0 0 auto}
.ly-trust-av{display:inline-flex}
.ly-trust-av img{width:18px;height:18px;border-radius:999px;object-fit:cover;object-position:top;margin-left:-6px;border:2px solid #fff}
.ly-trust-av img:first-child{margin-left:0}

/* transformations marquee */
.ly-tf{padding:24px 0 4px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
.ly-tf-track{display:flex;gap:16px;width:max-content;animation:ly-scroll 60s linear infinite}
.ly-tf:hover .ly-tf-track{animation-play-state:paused}
.ly-tf-card{position:relative;flex:0 0 auto;width:180px;border-radius:18px;overflow:hidden;box-shadow:var(--shadow-sm);margin:0}
.ly-tf-card img{width:100%;height:220px;object-fit:cover;object-position:top}
.ly-tf-card figcaption{position:absolute;left:0;right:0;bottom:10px;margin:0 auto;width:fit-content;background:rgba(255,255,255,.96);border-radius:999px;padding:5px 12px;font-family:var(--head);font-size:13px;font-weight:800;color:var(--purple-deep);box-shadow:0 6px 14px -6px rgba(0,0,0,.3)}
@keyframes ly-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.ly-tf-track.ly-tf-rev{animation-direction:reverse}
.ly-tf-mob{display:none}
/* Mobile: two stacked transformation sliders (opposite directions), bigger cards */
@media (max-width:859px){
  .ly-tf-desk{display:none}
  .ly-tf-mob{display:flex;flex-direction:column;gap:12px;padding:18px 0 6px}
  .ly-tf-mob .ly-tf{padding:0}
  .ly-tf-mob .ly-tf-track{animation-duration:75s}
  .ly-tf-card{width:212px}
  .ly-tf-card img{height:258px}
}

/* press */
.ly-press{padding:30px 0;background:var(--white);border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.ly-press.is-dark{background:transparent;border:0;padding:0}
.ly-press-lbl{text-align:center;font-family:var(--head);font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 16px}
.ly-press.is-dark .ly-press-lbl{color:#C7B2DE}
.ly-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ly-marquee-track{display:flex;align-items:center;gap:50px;width:max-content;animation:ly-scroll 32s linear infinite}
.ly-marquee-img{height:64px;width:auto;object-fit:contain;opacity:1;filter:none}
.ly-press.is-dark .ly-marquee{background:#fff;border-radius:14px;padding:14px 0}
.ly-press.is-dark .ly-marquee-img{opacity:.8;filter:grayscale(1)}
.ly-story-tv{display:block;width:100%;height:auto;margin-top:18px}
.ly-story-featured{margin-top:12px}
.ly-story-featured .ly-press{border:0;border-radius:14px;padding:16px 0;background:#fff}
.ly-story-featured .ly-press-lbl{margin-bottom:12px}

/* story (dark) */
.ly-story-grid{display:grid;grid-template-columns:1fr;gap:30px}
.ly-story-grid>*{min-width:0}
.ly-story-single{max-width:440px;margin:0 auto;border-radius:22px;overflow:hidden;box-shadow:0 30px 60px -24px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.1)}
.ly-story-single img{width:100%;height:auto}
.ly-story-quad{display:none}
.ly-story-press{margin-top:22px}
.ly-story-quote{margin:22px 0 0;font-family:var(--head);font-style:italic;font-weight:700;font-size:clamp(21px,3vw,27px);line-height:1.3;color:#EBBEDD}
.ly-story-quad img{width:100%;height:100%;object-fit:cover;object-position:top}

/* why nothing (reason cards + callout) */
.ly-rcards{display:grid;grid-template-columns:1fr;gap:16px;margin-top:34px;text-align:left}
.ly-rcard{background:var(--white);border:1px solid var(--hair);border-radius:18px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column}
.ly-rcard-media{aspect-ratio:4/3;overflow:hidden;background:var(--purple-soft)}
.ly-rcard-media img{width:100%;height:100%;object-fit:cover;display:block}
.ly-rcard-in{padding:20px 22px 24px}
.ly-rcard-t{margin:9px 0 0;font-size:17px;line-height:1.55;color:var(--ink-soft)}
.ly-callout{margin-top:26px;background:var(--grad);border-radius:22px;padding:30px 26px;box-shadow:var(--shadow)}
.ly-callout p{margin:0;font-family:var(--head);font-weight:700;font-size:clamp(20px,3vw,25px);line-height:1.35;color:#fff;max-width:780px;margin:0 auto}
.ly-callout strong{color:#F6C9E4}

/* research / you're not alone band — echoes the "eat good" design (no image) */
.ly-research{position:relative;overflow:hidden;background:linear-gradient(118deg,#331646 0%,#5B2A80 47%,#8A2E62 100%);color:#F5EBFA}
.ly-research::before{content:"";position:absolute;inset:0;background:radial-gradient(58% 74% at 86% 26%,rgba(242,132,196,.24),transparent 62%);pointer-events:none}
.ly-research-in{position:relative;z-index:1;max-width:840px;margin:0 auto;text-align:center}
.ly-research-eyebrow{color:#EDB4D8}
.ly-research-h{margin:0;font-family:var(--head);font-weight:900;letter-spacing:-.02em;font-size:clamp(37px,6vw,46px);line-height:1.06;color:#FBF3E9;text-wrap:balance}
.ly-research-hi{color:#F7A9D3}
.ly-research-body{margin:24px auto 0;max-width:60ch;font-size:clamp(18.5px,2.2vw,21px);line-height:1.65;font-weight:500;color:#EBDDF5}
.ly-research-body p{margin:0;text-wrap:balance}
.ly-research-body p+p{margin-top:16px}
.ly-research-body strong{color:#FBF3E9;font-weight:800}
.ly-research-turn{color:#F7A9D3;font-weight:800}
/* Comfortable side margins for the research body on phones */
@media (max-width:600px){
  .ly-research-body{padding:0 16px}
}

/* method */
.ly-method{display:grid;grid-template-columns:1fr;gap:20px;margin-top:34px;text-align:left}
.ly-shift{position:relative;overflow:hidden;display:flex;flex-direction:column;background:var(--white);border:1px solid var(--hair);border-radius:22px;box-shadow:var(--shadow-sm)}
.ly-shift-img{position:relative;width:100%;height:210px;background:var(--purple-soft)}
.ly-shift-img img{width:100%;height:100%;object-fit:cover;display:block}
.ly-shift-n{position:absolute;top:12px;right:14px;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:900;font-size:18px;line-height:1;box-shadow:0 10px 22px -10px rgba(91,42,128,.85)}
.ly-shift-body{position:relative;padding:24px 26px 28px}
.ly-shift-h{margin:0}
.ly-shift-t{margin:10px 0 0;font-size:17px;line-height:1.55;color:var(--ink-soft)}
.ly-shift-t .ly-hi,.ly-rcard-t .ly-hi{font-weight:800}

/* results */
.ly-results{display:grid;grid-template-columns:1fr;gap:20px;margin-top:34px;text-align:left}
.ly-result{background:var(--white);border:1px solid var(--hair);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);margin:0}
.ly-result-ph img{width:100%;height:auto;object-fit:cover}
.ly-result-in{padding:20px 22px 24px}
.ly-result-name{font-family:var(--head);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin:0 0 6px}
.ly-result-num{font-family:var(--head);font-weight:900;font-size:24px;color:var(--purple);margin:0}
.ly-result-t{margin:8px 0 0;font-size:16px;line-height:1.55;color:var(--ink-soft)}

/* what you get */
.ly-get{display:grid;grid-template-columns:1fr;gap:18px;margin-top:34px;text-align:left}
.ly-getcard{background:var(--white);border:1px solid var(--hair);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column}
.ly-getcard-img{aspect-ratio:16/9;overflow:hidden}
.ly-getcard-img img{width:100%;height:100%;object-fit:cover;object-position:center}
.ly-getcard-ph{aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#EFE0FA,#FBE0EE);color:#fff}
.ly-getcard-ph svg{color:var(--purple);opacity:.9}
.ly-getcard-in{padding:20px 22px 24px}
.ly-getcard-h{font-family:var(--head);font-weight:800;font-size:19px;margin:0}
.ly-getcard-t{margin:8px 0 0;font-size:16px;line-height:1.55;color:var(--ink-soft)}

/* value stack */
.ly-stack{background:#fff;border:1px solid var(--hair);border-radius:24px;box-shadow:var(--shadow);padding:24px;max-width:560px;margin:34px auto 0;text-align:left}
.ly-stack-h{font-family:var(--head);font-weight:800;font-size:17px;margin:0 0 6px;color:var(--ink)}
.ly-stack-list{list-style:none;padding:0;margin:0}
.ly-stack-list li{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px dashed var(--hair);font-size:15.5px;font-weight:500}
.ly-stack-name{display:flex;gap:10px;align-items:flex-start;line-height:1.4}
.ly-stack-tick{width:22px;height:22px;flex:0 0 auto;border-radius:999px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center;margin-top:1px}
.ly-stack-val{flex:0 0 auto;position:relative;display:inline-block;color:var(--ink-soft);text-decoration:none;font-weight:700;font-family:var(--head);font-size:15px}
.ly-stack-val::after{content:"";position:absolute;left:-6%;right:-6%;top:50%;height:2px;background:#E23B3B;transform:translateY(-50%) rotate(-12deg);border-radius:3px}
.ly-stack-total{display:flex;justify-content:space-between;align-items:center;background:var(--lav);border-radius:12px;padding:13px 16px;margin-top:14px;font-family:var(--head);font-weight:800;font-size:16px}
.ly-stack-total-v{position:relative;display:inline-block;color:var(--ink-soft);text-decoration:none;font-size:20px}
.ly-stack-total-v::after{content:"";position:absolute;left:-6%;right:-6%;top:50%;height:2px;background:#E23B3B;transform:translateY(-50%) rotate(-12deg);border-radius:3px}
.ly-stack-deal{position:relative;margin-top:18px;border:2px solid var(--purple);border-radius:16px;background:linear-gradient(165deg,#FFF,#F7ECFB);padding:26px 18px 20px;text-align:center}
.ly-stack-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:13.5px;letter-spacing:.05em;text-transform:uppercase;padding:8px 20px;border-radius:999px;white-space:nowrap;box-shadow:0 10px 22px -10px rgba(91,42,128,.6)}
.ly-stack-badge s{color:#fff;text-decoration:line-through;opacity:.75}
.ly-stack-now{display:flex;align-items:baseline;justify-content:center;gap:6px;margin:2px 0}
.ly-stack-num{font-family:var(--head);font-weight:900;font-size:74px;line-height:1;color:var(--purple);letter-spacing:-.03em}
.ly-stack-per{font-family:var(--head);font-weight:800;font-size:22px;color:var(--ink-soft)}
.ly-stack-note{font-size:13.5px;font-weight:700;color:var(--ink-soft);margin:0}
.ly-urgency{margin:11px 0 0;font-family:var(--head);font-weight:700;font-size:13.5px;line-height:1.35;color:var(--pink-accent)}
.ly-urgency strong{font-weight:800;color:var(--pink-accent);white-space:nowrap}
.ly-stack-sub{display:block;font-size:13px;color:var(--ink-soft);font-weight:500;margin-top:3px}
.ly-stack-bonuses{margin-top:12px;display:flex;flex-direction:column;gap:9px}
.ly-stack-bonus{display:flex;align-items:center;gap:11px;padding:10px 12px;border:1.5px dashed var(--purple);background:var(--purple-soft);border-radius:14px}
.ly-stack-bonus-visual{flex:0 0 auto;display:inline-flex;align-items:center}
.ly-stack-bonus-av{display:inline-flex}
.ly-stack-bonus-av img{width:31px;height:31px;border-radius:999px;object-fit:cover;object-position:top;margin-left:-11px;border:2px solid #fff;box-shadow:0 2px 5px -2px rgba(0,0,0,.35)}
.ly-stack-bonus-av img:first-child{margin-left:0}
.ly-stack-bonus-ico{width:34px;height:34px;border-radius:10px;background:#fff;color:var(--purple);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm)}
.ly-stack-bonus-img{height:42px;width:auto;object-fit:contain;display:block}
.ly-stack-bonus-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px;text-align:left}
.ly-stack-bonus-tag{align-self:flex-start;font-family:var(--head);font-weight:900;font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:#fff;background:var(--grad);padding:2px 8px;border-radius:999px;line-height:1.35}
.ly-stack-bonus-label{font-size:14.5px;font-weight:700;color:var(--ink);line-height:1.3}
.ly-stack-trust{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--ink-soft);font-size:13px;font-weight:600;margin:16px 0 0;flex-wrap:wrap}
.ly-stack-trust svg{color:var(--purple)}
.ly-or{display:flex;align-items:center;gap:14px;margin:16px 2px 0;color:var(--ink-soft);font-family:var(--head);font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase}
.ly-or::before,.ly-or::after{content:"";flex:1;height:1px;background:var(--hair)}
.ly-deal2{position:relative;margin-top:14px;border:1.5px solid var(--hair);border-radius:16px;background:var(--white);padding:22px 18px 20px;text-align:center}
.ly-deal2-badge{display:inline-block;background:var(--purple-soft);color:var(--purple-deep);font-family:var(--head);font-weight:800;font-size:12.5px;letter-spacing:.05em;text-transform:uppercase;padding:6px 15px;border-radius:999px;margin-bottom:12px}
.ly-deal2-now{display:flex;align-items:baseline;justify-content:center;flex-wrap:wrap;gap:4px 9px;margin:2px 0}
.ly-deal2-now s{font-family:var(--head);font-weight:700;font-size:24px;color:var(--ink-soft)}
.ly-deal2-num{font-family:var(--head);font-weight:900;font-size:52px;line-height:1;color:var(--purple);letter-spacing:-.02em}
.ly-deal2-per{font-family:var(--head);font-weight:800;font-size:17px;color:var(--ink-soft);white-space:nowrap;flex-basis:100%;text-align:center}

/* clarity */
.ly-clarity{display:grid;grid-template-columns:1fr;gap:28px;align-items:center}
.ly-clarity-media img{width:100%;border-radius:22px;box-shadow:var(--shadow)}
.ly-clarity-quote{margin:22px 0 0;font-family:var(--head);font-style:italic;font-weight:700;font-size:clamp(21px,2.6vw,26px);line-height:1.32;color:var(--purple-deep);border-left:3px solid var(--purple);padding-left:20px}

/* guarantee */
.ly-guar-grid{display:grid;grid-template-columns:1fr;gap:26px;align-items:center;justify-items:center;text-align:center}
.ly-seal{width:150px;height:150px;flex:0 0 auto}
.ly-guar-img{width:172px;height:auto;flex:0 0 auto}
.ly-seal-num{font-family:var(--head);font-weight:800;font-size:38px;fill:var(--purple)}
.ly-seal-lbl{font-family:var(--head);font-weight:800;font-size:11px;letter-spacing:.1em;fill:var(--purple)}
.ly-guar-sig{font-family:var(--head);font-weight:800;letter-spacing:.16em;color:var(--ink-soft);margin:14px 0 0;font-size:15px}
.ly-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;justify-content:center}
.ly-pill{display:inline-flex;align-items:center;gap:7px;background:var(--lav);border:1px solid var(--hair);border-radius:999px;padding:9px 15px;font-size:14px;font-weight:700}
.ly-pill svg{color:var(--purple)}

/* faq */
.ly-faq{max-width:760px;margin:34px auto 0;text-align:left}
.ly-faq-item{background:#fff;border:1px solid var(--hair);border-radius:16px;box-shadow:var(--shadow-sm);margin-bottom:13px;overflow:hidden}
.ly-faq-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;font-family:var(--head);font-weight:700;font-size:18px}
.ly-faq-item summary::-webkit-details-marker{display:none}
.ly-faq-mark{position:relative;width:18px;height:18px;flex:0 0 auto}
.ly-faq-mark::before,.ly-faq-mark::after{content:"";position:absolute;background:var(--purple);border-radius:2px}
.ly-faq-mark::before{left:0;top:8px;width:18px;height:2.4px}
.ly-faq-mark::after{left:8px;top:0;width:2.4px;height:18px;transition:opacity .18s}
.ly-faq-item[open] .ly-faq-mark::after{opacity:0}
.ly-faq-a{padding:0 22px 22px;font-size:17px;line-height:1.65;color:var(--ink-soft);font-weight:500}

/* footer / sticky */
.ly-footer{padding:28px 20px;text-align:center;color:var(--ink-soft);font-size:14px;background:var(--white);border-top:1px solid var(--hair)}
.ly-footer a{text-decoration:underline}
.ly-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-top:1px solid var(--hair);box-shadow:0 -10px 30px -12px rgba(74,35,90,.2);transform:translateY(130%);transition:transform .28s cubic-bezier(.32,.72,0,1);padding:11px 16px calc(11px + env(safe-area-inset-bottom,0px))}
.ly-sticky.is-show{transform:translateY(0)}
.ly-sticky-in{display:flex;align-items:center;gap:14px;max-width:1120px;margin:0 auto}
.ly-sticky-lbl{flex:0 0 auto;font-weight:600;font-size:14px}
.ly-sticky-lbl strong{color:var(--purple);font-weight:800}
.ly-sticky-more{display:none}
.ly-sticky-btn{flex:1;font-size:15px;padding:14px 16px;min-height:52px;border-radius:12px}

@media (min-width:860px){
  .ly-band{padding:92px 0}
  .ly-deal2-per{flex-basis:auto}
  .ly-clarity{grid-template-columns:0.82fr 1.18fr;gap:54px}
  .ly-only-mob{display:none} .ly-only-desk{display:block}
  .ly-hero{padding:0}
  .ly-hero-stage{padding:48px 0 10px}
  .ly-hero-inner{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center}
  .ly-hero-copy{max-width:560px}
  .ly-hero-h1{font-size:clamp(38px,3.8vw,50px)}
  .ly-hero-action{max-width:480px;margin-top:28px}
  .ly-hero-media{max-width:none;margin:0}
  .ly-hero-badge{font-size:15px;padding:9px 17px 9px 9px;gap:10px}
  .ly-hero-bico{width:32px;height:32px}
  .ly-hero-bico svg{width:16px;height:16px}
  .ly-hero-badge-1{top:4%;left:0}
  .ly-hero-badge-2{top:42%;right:-5%}
  .ly-hero-badge-3{bottom:12%;left:-5%}
  .ly-trust{display:flex;background:transparent;border:0;padding:0;box-shadow:none;font-size:13px}
  .ly-trust .ly-tdesk{display:inline-flex}
  .ly-bdesk{display:inline}
  .ly-tf{padding-top:44px}
  .ly-marquee-img{height:58px}
  .ly-marquee-track{gap:72px}
  .ly-rcards{grid-template-columns:1fr 1fr;gap:20px}
  .ly-method{grid-template-columns:1fr 1fr 1fr;gap:22px}
  .ly-results{grid-template-columns:1fr 1fr 1fr;gap:22px}
  .ly-get{grid-template-columns:1fr 1fr 1fr;gap:22px}
  .ly-story-grid{grid-template-columns:.85fr 1fr;gap:48px;align-items:start}
  .ly-story-single{display:none}
  .ly-story-quad{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .ly-story-cell{aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 50px -24px rgba(0,0,0,.7)}
  .ly-guar-grid{grid-template-columns:auto 1fr;gap:48px;text-align:left;justify-items:start}
  .ly-sticky{display:none}
  .lyx .ly-nowrap{white-space:nowrap}
}
@media (prefers-reduced-motion:reduce){ .lyx *,.ly-tf-track,.ly-marquee-track{transition:none!important;animation:none!important} }
`;
