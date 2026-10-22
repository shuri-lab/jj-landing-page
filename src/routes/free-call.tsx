import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, TrendingDown } from "lucide-react";
import { scrollToId } from "@/lib/scroll-to-offer";
import { sectionNameOf, trackCtaClicked } from "@/lib/analytics/events";
import { useLandingBehaviorTracking } from "@/lib/analytics/use-landing-behavior";
import { BookingForm } from "@/components/free-call/BookingForm";
import {
  BOOKING_ANCHOR_ID,
  BOOKING_CTA_LABEL,
  CALL_MINUTES,
  COACH_LABEL,
  NO_CARD_COPY,
} from "@/lib/booking/config";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import jjPortrait from "@/assets/landing/jj-portrait.jpg";
import t4 from "@/assets/landing/transformation-4.jpg";
import t7 from "@/assets/landing/transformation-7.jpg";
import t8 from "@/assets/landing/transformation-8.jpg";
import t10 from "@/assets/landing/transformation-10.jpg";
import t12 from "@/assets/landing/transformation-12.jpg";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

const PAGE_TITLE = `Book a free call with ${COACH_LABEL} | JJ Smith`;
const PAGE_DESCRIPTION = `A free ${CALL_MINUTES} minute call where we figure out what is really going on with your weight and build your first plan together. Pick a time and ${COACH_LABEL} calls you.`;
const SHARE_TITLE = `Book your free call with ${COACH_LABEL}`;
const SHARE_DESCRIPTION = `A free ${CALL_MINUTES} minute call. We figure out what has really been getting in your way and build your first plan together, right on the call.`;
// The site's current share image, so a link posted on Facebook previews the
// same way links to the main page do. Swap in a dedicated /free-call image
// here when David has one.
const SHARE_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f84255a2-9b6d-46e0-b1c2-5983e0047431/id-preview-9eeb221f--002cf152-9d18-4c71-8667-aea70f493e00.lovable.app-1778437010517.png";
const CANONICAL_URL = "https://mycoach.jjsmithonline.com/free-call";

export const Route = createFileRoute("/free-call")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: SHARE_TITLE },
      { property: "og:description", content: SHARE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: SHARE_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE_TITLE },
      { name: "twitter:description", content: SHARE_DESCRIPTION },
      { name: "twitter:image", content: SHARE_IMAGE },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
  component: FreeCall,
});

// ── copy ─────────────────────────────────────────────────────────────────────
// Draft copy. David finalises the wording. No dashes anywhere, by brand rule.

const TRUST_CHIPS = [NO_CARD_COPY, `${CALL_MINUTES} minutes`, "A real plan you leave with"];

const CALL_POINTS = [
  "We talk through what has actually been getting in your way, not the generic stuff.",
  "We build your first simple plan together, around the food you already like.",
  "You leave the call knowing exactly what to do tonight and tomorrow.",
  "If it feels right, you can get started on the spot. No pressure either way.",
];

const FAQ_ITEMS = [
  { q: "Is it really free?", a: "Yes. The call is free and you do not need a card to book it." },
  { q: "How long is the call?", a: `About ${CALL_MINUTES} minutes.` },
  { q: "Who calls me?", a: `${COACH_LABEL}, at the time you choose.` },
  {
    q: "What do I need to do?",
    a: "Just be somewhere quiet where you can talk, with your goal in mind.",
  },
  {
    q: "What if I cannot make my time?",
    a: "No problem, you can reschedule from the text we send you.",
  },
  {
    q: "Do I have to buy anything?",
    a: "No. You will leave with a plan either way. If you want to keep going with us, we will show you how on the call.",
  },
];

// Real, already approved results, reused verbatim from the main landing page.
const RESULTS = [
  {
    src: t12,
    name: "Akilea",
    num: "Lost 166 lbs.",
    text: "“My doctor took me off my blood pressure medication this year. I sleep through the night, I can be on my feet all day, and I fit into clothes I never thought I would wear again.”",
  },
  {
    src: t7,
    name: "Marisol",
    num: "Lost 58 lbs.",
    text: "“I have energy from morning to night now, instead of dragging by the afternoon. My clothes fit the way I want them to, and I feel comfortable in my own skin again.”",
  },
  {
    src: t10,
    name: "Renee",
    num: "Lost 71 lbs.",
    text: "“The belly fat that would not budge for years finally let go. I chase my kids around without getting winded, and now I am in the family photos instead of behind the camera.”",
  },
];

const ALL_LOGOS = [
  partnerNyTimes,
  partnerDrOz,
  partnerTheView,
  partnerSteveHarvey,
  partnerNbc,
  partnerFox,
  partnerEssence,
  partnerWomansWorld,
];

// ── helpers ──────────────────────────────────────────────────────────────────
function Hi({ children }: { children: React.ReactNode }) {
  return <span className="ly-hi">{children}</span>;
}

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M4 12.5l5 5L20 6.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const scrollToForm = () => scrollToId(BOOKING_ANCHOR_ID);

/** Every CTA on this page does the same thing: send her to the form. */
function Cta({ position }: { position: string }) {
  return (
    <button
      className="ly-cta ly-cta-lg"
      data-cta="book-free-call"
      data-position={position}
      onClick={(e) => {
        trackCtaClicked({
          cta_name: position,
          section_name: sectionNameOf(e.currentTarget),
          destination_type: "scroll",
        });
        scrollToForm();
      }}
    >
      {BOOKING_CTA_LABEL}
      <span className="ly-cta-arw" aria-hidden>
        →
      </span>
    </button>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
function FreeCall() {
  const [showSticky, setShowSticky] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Section reach + scroll depth, the same signals the main landing page sends.
  useLandingBehaviorTracking();

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // No point nagging with a sticky bar while the form is on screen.
  useEffect(() => {
    const el = document.getElementById(BOOKING_ANCHOR_ID);
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), {
      threshold: 0,
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="lyx">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
      />
      <style>{CSS}</style>

      <Header />
      <main>
        <Hero />
        <WhatHappens />
        <MeetJJ />
        <SocialProof />
        <Faq />
        <Close />
      </main>
      <Footer />
      <StickyCta show={showSticky && !formVisible} />
    </div>
  );
}

function Header() {
  return (
    <header className="ly-header">
      <div className="ly-wrap ly-header-in">
        <img src={jjSmithLogo} alt="JJ Smith" className="ly-logo" />
        <button
          className="ly-header-cta"
          data-cta="book-free-call"
          data-position="header"
          onClick={() => {
            trackCtaClicked({
              cta_name: "header",
              section_name: "header",
              destination_type: "scroll",
            });
            scrollToForm();
          }}
        >
          {BOOKING_CTA_LABEL}
        </button>
      </div>
    </header>
  );
}

// ── hero + form ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section data-yb-section="free_call_hero" className="ly-band ly-hero">
      <div className="ly-hero-stage">
        <div className="ly-wrap ly-fc-hero">
          <div className="ly-fc-copy">
            <HeroTrust />
            <h1 className="ly-h1 ly-fc-h1">
              Book your free call with <Hi>{COACH_LABEL}.</Hi>
            </h1>
            <p className="ly-fc-sub">
              A free {CALL_MINUTES} minute call where we figure out what is really going on with
              your weight and build your first plan together, right on the call.
            </p>
            <div className="ly-pills ly-fc-chips">
              {TRUST_CHIPS.map((chip) => (
                <span className="ly-pill" key={chip}>
                  <Check className="ly-ico-12" /> {chip}
                </span>
              ))}
            </div>
            <p className="ly-fc-who">{COACH_LABEL} calls you at the time you pick.</p>
            <HeroProof />
          </div>

          <div className="ly-fc-form">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One real result beside the form, where the desktop column would otherwise
 * run empty next to a tall card. Hidden on mobile so nothing pushes the form
 * down the page. Copy and photo are reused verbatim from the main page.
 */
function HeroProof() {
  return (
    <figure className="ly-fc-proof">
      <img src={t8} alt="A woman's before and after transformation" loading="lazy" />
      <figcaption>
        <p className="ly-fc-proof-num">Angel, lost 72 lbs.</p>
        <p className="ly-fc-proof-t">
          &ldquo;People keep telling me I look ten years younger, and I feel it. My clothes fit
          again, and I feel so good that my husband and my brother started too.&rdquo;
        </p>
      </figcaption>
    </figure>
  );
}

/** The same credibility pill the main landing page opens with. */
function HeroTrust() {
  const avatars = [t8, t10, t4];
  return (
    <div className="ly-trust">
      <span className="ly-trust-i ly-tdesk">
        <Award className="ly-ico-16" /> NYT Bestseller
      </span>
      <span className="ly-trust-div ly-tdesk" aria-hidden />
      <span className="ly-trust-i">
        <TrendingDown className="ly-ico-16" /> 5M+ lbs lost
      </span>
      <span className="ly-trust-div" aria-hidden />
      <span className="ly-trust-i">
        <span className="ly-trust-av">
          {avatars.map((src, i) => (
            <img key={i} src={src} alt="" loading="lazy" />
          ))}
        </span>
        800K+ women helped
      </span>
    </div>
  );
}

// ── what happens on the call ─────────────────────────────────────────────────
function WhatHappens() {
  return (
    <section data-yb-section="free_call_what_happens" className="ly-band ly-lav">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">What happens</span>
        <h2 className="ly-h2">
          What happens on your <Hi>free call</Hi>
        </h2>
        <div className="ly-fc-steps">
          {CALL_POINTS.map((point, i) => (
            <div className="ly-step-card ly-fc-step" key={point}>
              <span className="ly-step-n" aria-hidden="true">
                {i + 1}
              </span>
              <p className="ly-fc-step-t">{point}</p>
            </div>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center">
          <Cta position="what_happens" />
        </div>
      </div>
    </section>
  );
}

// ── meet JJ ──────────────────────────────────────────────────────────────────
function MeetJJ() {
  return (
    <section data-yb-section="free_call_meet_jj" className="ly-band ly-cream">
      <div className="ly-wrap ly-clarity">
        <div className="ly-clarity-media ly-fc-meet-media">
          <img src={jjPortrait} alt="JJ Smith" loading="lazy" />
        </div>
        <div>
          <span className="ly-eyebrow">Meet JJ</span>
          <h2 className="ly-h2">
            The woman behind <Hi>the plan</Hi>
          </h2>
          <p className="ly-lead ly-soft ly-mt">
            In my late 30s, my body turned on me. Weight from nowhere, exhausted, foggy, a stranger
            in the mirror.
          </p>
          <p className="ly-lead ly-soft ly-mt">
            So I stopped fighting my body and started working with it, my hormones, my blood sugar,
            all of it. <strong>The weight came off, my energy roared back,</strong> and in my 40s I
            felt better than at 30.
          </p>
          <p className="ly-lead ly-soft ly-mt">
            My books became bestsellers, and hundreds of thousands of women used them to get
            themselves back.
          </p>
          <p className="ly-guar-sig">JJ</p>
          <div className="ly-mt-l">
            <Cta position="meet_jj" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── social proof ─────────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <>
      <section data-yb-section="free_call_results" className="ly-band ly-white">
        <div className="ly-wrap ly-center">
          <span className="ly-eyebrow">Real women, real results</span>
          <h2 className="ly-h2">
            They got themselves back. <Hi>So will you.</Hi>
          </h2>
          <div className="ly-results">
            {RESULTS.map((r) => (
              <figure className="ly-result" key={r.name}>
                <div className="ly-result-ph">
                  <img src={r.src} alt="A woman's before and after transformation" loading="lazy" />
                </div>
                <figcaption className="ly-result-in">
                  <p className="ly-result-name">{r.name}</p>
                  <p className="ly-result-num">{r.num}</p>
                  <p className="ly-result-t">{r.text}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <PressStrip />
    </>
  );
}

function PressStrip() {
  return (
    <section data-yb-section="press_features" className="ly-press">
      <p className="ly-press-lbl">JJ Smith has been featured on</p>
      <div className="ly-marquee">
        <div className="ly-marquee-track">
          {[...ALL_LOGOS, ...ALL_LOGOS].map((logo, i) => (
            <img key={i} src={logo} alt="" className="ly-marquee-img" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── faq ──────────────────────────────────────────────────────────────────────
function Faq() {
  return (
    <section data-yb-section="free_call_faq" className="ly-band ly-cream ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Before you book</span>
        <h2 className="ly-h2">
          Everything about <Hi>the call</Hi>
        </h2>
        <div className="ly-faq">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="ly-faq-item">
              <summary>
                {item.q}
                <span className="ly-faq-mark" aria-hidden />
              </summary>
              <div className="ly-faq-a">{item.a}</div>
            </details>
          ))}
        </div>
        <div className="ly-mt-l ly-cta-center">
          <Cta position="faq" />
        </div>
      </div>
    </section>
  );
}

// ── close ────────────────────────────────────────────────────────────────────
function Close() {
  return (
    <section data-yb-section="free_call_close" className="ly-band ly-dark ly-center">
      <div className="ly-wrap ly-narrow">
        <h2 className="ly-h2 on-dark">
          Your plan is <Hi>one short call away.</Hi>
        </h2>
        <p className="ly-lead on-dark-soft ly-mt">Pick a time that works for you.</p>
        <div className="ly-mt-l ly-cta-center">
          <Cta position="close" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ly-footer">
      © {new Date().getFullYear()} JJ Smith. All rights reserved. · <a href="#">Privacy</a> ·{" "}
      <a href="#">Terms</a>
    </footer>
  );
}

function StickyCta({ show }: { show: boolean }) {
  return (
    <div className={`ly-sticky ${show ? "is-show" : ""}`} aria-hidden={!show}>
      <div className="ly-sticky-in">
        <span className="ly-sticky-lbl">
          <strong>Free</strong> · about {CALL_MINUTES} minutes
        </span>
        <button
          className="ly-cta ly-sticky-btn"
          tabIndex={show ? undefined : -1}
          data-cta="book-free-call"
          data-position="sticky"
          onClick={() => {
            trackCtaClicked({
              cta_name: "sticky",
              section_name: "sticky_bar",
              destination_type: "scroll",
            });
            scrollToForm();
          }}
        >
          {BOOKING_CTA_LABEL}
          <span className="ly-cta-arw" aria-hidden>
            →
          </span>
        </button>
      </div>
    </div>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
// The landing-page design language, trimmed to what this page uses. Every
// route in this repo carries its own copy (see index.tsx, b.tsx, v2.tsx), so
// the tokens and the shared primitives below are deliberately identical to
// the ones on the main page.
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
.lyx strong{font-weight:700;color:var(--ink)}
.lyx :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.ly-hi{color:var(--purple)}
.on-dark{color:#fff!important}
.on-dark-soft{color:#DEC9EE}
.ly-dark .ly-hi{color:#EEBBE0}

.ly-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.lyx .ly-narrow{max-width:740px;margin-left:auto;margin-right:auto}
.ly-band{padding:56px 0}
.ly-center{text-align:center}
.ly-white{background:var(--white)} .ly-lav{background:var(--lav)} .ly-cream{background:var(--cream)}
.ly-dark{background:radial-gradient(130% 120% at 50% 0%,#4A2A66 0%,#2B1940 62%);color:#F3EAFB}
.lyx .ly-mt{margin-top:20px}.lyx .ly-mt-s{margin-top:12px}.lyx .ly-mt-l{margin-top:32px}
.ly-soft{color:var(--ink-soft)}
.ly-cta-center{display:flex;justify-content:center}

.ly-eyebrow{display:inline-block;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.ly-h1{font-family:var(--head);font-weight:900;font-size:clamp(37px,7vw,57px);line-height:1.06;letter-spacing:-.02em;margin:0}
.ly-h2{font-family:var(--head);font-weight:800;font-size:clamp(31px,5.4vw,48px);line-height:1.08;letter-spacing:-.02em;margin:0}
.ly-lead{font-size:clamp(19px,2.2vw,22px);line-height:1.55;font-weight:500;margin:0}
.ly-ico-12{width:14px;height:14px;flex:0 0 auto}.ly-ico-14{width:16px;height:16px;flex:0 0 auto}
.ly-ico-16{width:18px;height:18px;flex:0 0 auto}

/* CTA */
.ly-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:18px;border:0;padding:17px 30px;border-radius:14px;box-shadow:0 16px 34px -12px rgba(91,42,128,.5);transition:transform .15s,box-shadow .15s,filter .15s;line-height:1.15}
.ly-cta:hover{transform:translateY(-2px);box-shadow:0 22px 44px -14px rgba(91,42,128,.55);filter:brightness(1.05)}
.ly-cta-lg{font-size:clamp(18px,2vw,21px);padding:19px 30px}
.ly-cta-full{width:100%;padding-left:16px;padding-right:16px}
.ly-cta-arw{font-size:1.2em;line-height:1;transform:translateY(-1px)}

/* header */
.ly-header{background:var(--white);border-bottom:1px solid var(--hair)}
/* The padding shorthand here overrides .ly-wrap's side gutter, so the side
   value is restated. The main page hides this CTA under 560px and centres the
   logo, so it never shows the edge there. This page keeps the CTA at every
   width, so the gutter has to be explicit. */
.ly-header-in{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 20px}
.ly-logo{height:24px;width:auto}
.ly-header-cta{background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:14px;border:0;border-radius:12px;padding:11px 20px;box-shadow:0 10px 22px -10px rgba(91,42,128,.5)}
@media (max-width:420px){ .ly-header-cta{font-size:12.5px;padding:10px 14px} }

/* hero */
.ly-hero{background:linear-gradient(180deg,#FAF1FB 0%,#F4EBFB 100%);padding:0}
.ly-hero-stage{position:relative;overflow:hidden;padding:26px 0 40px}
.ly-fc-hero{position:relative;z-index:1;display:grid;grid-template-columns:1fr;gap:22px}
.ly-fc-hero>*{min-width:0}
.ly-fc-h1{font-size:clamp(30px,8.4vw,38px);line-height:1.1}
.ly-fc-sub{margin:16px 0 0;max-width:560px;font-size:clamp(17px,2.4vw,20px);line-height:1.45;font-weight:600;color:var(--ink-soft)}
.lyx .ly-fc-chips{margin-top:18px;gap:8px;justify-content:flex-start}
.ly-fc-who{margin:16px 0 0;font-family:var(--head);font-weight:700;font-size:14.5px;line-height:1.4;color:var(--purple-deep)}

/* hero trust pill (identical to the main page) */
.ly-trust .ly-tdesk{display:none}
.ly-trust{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:5px 8px;margin:0 0 18px;max-width:100%;font-size:12.5px;font-weight:700;color:var(--purple-deep);background:#fff;border:1px solid var(--hair);border-radius:999px;padding:7px 14px;box-shadow:var(--shadow-sm)}
.ly-trust-i{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.ly-trust-i svg{color:var(--purple);width:14px;height:14px}
.ly-trust-div{width:1px;height:12px;background:var(--hair);flex:0 0 auto}
.ly-trust-av{display:inline-flex}
.ly-trust-av img{width:18px;height:18px;border-radius:999px;object-fit:cover;object-position:top;margin-left:-6px;border:2px solid #fff}
.ly-trust-av img:first-child{margin-left:0}

/* pills */
.ly-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px;justify-content:center}
.ly-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--hair);border-radius:999px;padding:9px 15px;font-size:14px;font-weight:700;box-shadow:var(--shadow-sm)}
.ly-pill svg{color:var(--purple)}

/* one real result beside the form (desktop only) */
.ly-fc-proof{display:none}

/* what happens (numbered cards from the method section) */
.ly-fc-steps{display:grid;grid-template-columns:1fr;gap:30px;margin-top:40px;text-align:left}
.ly-step-card{position:relative;background:var(--white);border:1px solid var(--hair);border-radius:20px;box-shadow:var(--shadow-sm);padding:32px 22px 26px}
.ly-step-n{position:absolute;top:-20px;left:16px;display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:999px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:900;font-size:19px;line-height:1;box-shadow:0 12px 24px -10px rgba(91,42,128,.7);border:3px solid var(--white)}
.ly-fc-step-t{margin:0;font-family:var(--head);font-weight:700;font-size:17.5px;line-height:1.4;color:var(--ink);text-wrap:balance}

/* meet JJ */
.ly-clarity{display:grid;grid-template-columns:1fr;gap:28px;align-items:center}
.ly-clarity>*{min-width:0}
.ly-fc-meet-media img{width:100%;height:auto;aspect-ratio:1284/1555;object-fit:cover;border-radius:22px;box-shadow:var(--shadow)}
.ly-guar-sig{font-family:var(--head);font-weight:800;letter-spacing:.16em;color:var(--ink-soft);margin:14px 0 0;font-size:15px}

/* results */
.ly-results{display:grid;grid-template-columns:1fr;gap:20px;margin-top:34px;text-align:left}
.ly-result{background:var(--white);border:1px solid var(--hair);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);margin:0}
.ly-result-ph img{width:100%;height:auto;object-fit:cover}
.ly-result-in{padding:20px 22px 24px}
.ly-result-name{font-family:var(--head);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin:0 0 6px}
.ly-result-num{font-family:var(--head);font-weight:900;font-size:24px;color:var(--purple);margin:0}
.ly-result-t{margin:8px 0 0;font-size:16px;line-height:1.55;color:var(--ink-soft)}

/* press */
.ly-press{padding:30px 0;background:var(--white);border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.ly-press-lbl{text-align:center;font-family:var(--head);font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 16px}
.ly-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ly-marquee-track{display:flex;align-items:center;gap:50px;width:max-content;animation:ly-scroll 32s linear infinite}
.ly-marquee-img{height:64px;width:auto;object-fit:contain}
@keyframes ly-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

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
.ly-sticky-btn{flex:1;font-size:15px;padding:14px 16px;min-height:52px;border-radius:12px}

@media (min-width:860px){
  .ly-band{padding:92px 0}
  .ly-hero{padding:0}
  .ly-hero-stage{padding:52px 0 64px}
  .ly-fc-hero{grid-template-columns:1.02fr .98fr;column-gap:52px;row-gap:22px;align-items:start}
  .ly-fc-copy{grid-column:1}
  .ly-fc-form{grid-column:2}
  .ly-fc-h1{font-size:clamp(38px,3.8vw,50px)}
  .ly-fc-sub{font-size:20px}
  .ly-trust{display:flex;background:transparent;border:0;padding:0;box-shadow:none;font-size:13px}
  .ly-trust .ly-tdesk{display:inline-flex}
  .ly-marquee-img{height:58px}
  .ly-marquee-track{gap:72px}
  .ly-fc-proof{display:flex;gap:16px;align-items:center;margin:38px 0 0;max-width:460px;background:#fff;border:1px solid var(--hair);border-radius:20px;box-shadow:var(--shadow-sm);padding:16px 18px;text-align:left}
  .ly-fc-proof img{width:76px;height:76px;flex:0 0 auto;border-radius:16px;object-fit:cover;object-position:top}
  .ly-fc-proof figcaption{min-width:0}
  .ly-fc-proof-num{margin:0;font-family:var(--head);font-weight:900;font-size:15px;color:var(--purple)}
  .ly-fc-proof-t{margin:5px 0 0;font-size:14px;line-height:1.5;color:var(--ink-soft)}
  .ly-fc-steps{grid-template-columns:repeat(4,1fr);gap:clamp(18px,2.4vw,26px);margin-top:46px}
  .ly-fc-step{padding:34px 20px 28px}
  .ly-results{grid-template-columns:1fr 1fr 1fr;gap:22px}
  .ly-clarity{grid-template-columns:0.82fr 1.18fr;gap:54px}
  .ly-sticky{display:none}
}
@media (prefers-reduced-motion:reduce){ .lyx *,.ly-marquee-track{transition:none!important;animation:none!important} }
`;
