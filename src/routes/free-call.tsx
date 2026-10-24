import { createFileRoute } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Award,
  ChevronDown,
  CalendarCheck,
  ClipboardCheck,
  Gift,
  PhoneCall,
  Search,
  TrendingDown,
  UserCheck,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { scrollToId } from "@/lib/scroll-to-offer";
import { sectionNameOf, trackCtaClicked } from "@/lib/analytics/events";
import { useLandingBehaviorTracking } from "@/lib/analytics/use-landing-behavior";
import { trackFcCtaClicked } from "@/lib/analytics/free-call";
import type { FcCtaLocation } from "@/lib/analytics/free-call";
import { TERMS_URL } from "@/lib/booking/free-call-href";
import { BookingForm } from "@/components/free-call/BookingForm";
import {
  BOOKING_ANCHOR_ID,
  BOOKING_CTA_LABEL,
  BOOKING_SECTION_ID,
  CALLER_LABEL,
  CALL_MINUTES,
  COACH_LABEL,
  REASSURANCE,
} from "@/lib/booking/config";
// Every photo import below carries the width it is actually painted at.
// vite-imagetools merges that with the plugin defaults (WebP, quality 80) and
// clamps to the intrinsic size, so none of them is ever upscaled. Without it
// the page shipped 2000px originals into 220px boxes.
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import heroBg from "@/assets/landing/design-v2-hero.png?w=1100";
import jjOnTv from "@/assets/landing/jj-smith-on-tv-v3.png?w=1120";
import jjOwnTransformation from "@/assets/landing/jj-own-transformation.png?w=880";
import clarityImage from "@/assets/landing/clarity-image.png?w=800";
import whyEatingLess from "@/assets/landing/why-eating-less-backfires.jpg?w=760";
import whyOutTrain from "@/assets/landing/why-out-train-your-plate.jpg?w=760";
import whyOnYourOwn from "@/assets/landing/why-on-your-own.jpg?w=760";
import jjBefore1 from "@/assets/landing/jj-before-1.png?w=460";
import jjBefore2 from "@/assets/landing/jj-before-2.png?w=460";
import jjAfter1 from "@/assets/landing/jj-after-1.png?w=460";
import jjAfter2 from "@/assets/landing/jj-after-2.png?w=460";
import t1 from "@/assets/landing/transformation-1.jpg?w=760";
import t4 from "@/assets/landing/transformation-4.jpg?w=760";
import t7 from "@/assets/landing/transformation-7.jpg?w=760";
import t8 from "@/assets/landing/transformation-8.jpg?w=760";
import t9 from "@/assets/landing/transformation-9.jpg?w=760";
import t10 from "@/assets/landing/transformation-10.jpg?w=760";
import t11 from "@/assets/landing/transformation-11.jpg?w=760";
import t12 from "@/assets/landing/transformation-12.jpg?w=760";
import tTammi from "@/assets/landing/transformation-tammi.jpg?w=760";
import partnerEssence from "@/assets/landing/partners/essence.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";
import partnerWomansWorld from "@/assets/landing/partners/womansworld.png";

const PAGE_TITLE = `Book a free call with ${COACH_LABEL}`;
const PAGE_DESCRIPTION = `Over 40 and the weight will not move? Book a free ${CALL_MINUTES} minute call with ${COACH_LABEL}. She finds what is really going on and builds a simple plan made just for you.`;
const SHARE_TITLE = `Book a free call with ${COACH_LABEL}`;
const SHARE_DESCRIPTION = `A free ${CALL_MINUTES} minute call. ${COACH_LABEL} finds what has really been getting in your way, and you build your plan together.`;
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

// ── content ──────────────────────────────────────────────────────────────────
// Draft copy, David finalises. No dashes anywhere, by brand rule.
//
// Every claim about JJ on this page comes from the verified set: certified
// nutritionist and weight-management expert, author of the 10-Day Green
// Smoothie Cleanse (a number one national, USA Today and New York Times
// bestseller), helping women over 40 for over a decade, featured on The Steve
// Harvey Show and in The Washington Post. No count of women helped goes on
// the page until the team verifies a figure.

// The photos are the main landing page's own "Sound familiar?" cards, reused
// one for one: eating less backfires, you cannot out-train your plate, and on
// your own it never lasts.
const PAIN_POINTS = [
  {
    img: whyEatingLess,
    text: "You've eaten less and tried every diet, and your body just holds on tighter.",
  },
  { img: whyOutTrain, text: "After 40, the old rules just stopped working." },
  { img: whyOnYourOwn, text: "None of it was built for your body or your life." },
];

const STEPS = [
  { Icon: CalendarCheck, title: "Book your call", text: "Pick a time that works for you." },
  {
    Icon: PhoneCall,
    title: `${CALLER_LABEL} gets on the phone with you`,
    text: `About ${CALL_MINUTES} minutes. She listens and figures out what's really going on.`,
  },
  {
    Icon: ClipboardCheck,
    title: "Get your plan",
    text: "Built with you, around your life. Start today.",
  },
];

const VALUE_PROPS = [
  { Icon: UserCheck, text: "A plan built for your body, not another diet." },
  { Icon: UtensilsCrossed, text: "Keep the foods you love." },
  { Icon: Search, text: "Finally find what's holding you back." },
  { Icon: Zap, text: "A plan you can start today." },
  { Icon: Gift, text: "Free, no card, and you keep the plan either way." },
];

const FAQ_ITEMS = [
  { q: "Is it really free?", a: "Yes, and you don't need a card to book." },
  { q: "How long is the call?", a: `About ${CALL_MINUTES} minutes.` },
  {
    q: "Who calls me?",
    a: `${CALLER_LABEL}, her AI voice, trained on JJ's method, at the time you pick.`,
  },
  {
    q: "Am I really talking to JJ?",
    a: `You're talking with ${CALLER_LABEL}, built from JJ's own voice and her exact method. JJ can't personally sit down with every woman who needs her, so she created a coach that can, so you get her approach one on one, today. It listens, asks about your life, and builds your plan with you.`,
  },
  {
    q: "I've tried everything, why is this different?",
    a: `Because ${CALLER_LABEL} builds the plan with you, around your body and your life. That's the part every diet skips.`,
  },
  { q: "Do I have to buy anything?", a: "No. You leave with a real plan either way." },
  {
    q: "What if I can't make my time?",
    a: "No problem, you can reschedule from the text we send you.",
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
  {
    src: t8,
    name: "Angel",
    num: "Lost 72 lbs.",
    text: "“People keep telling me I look ten years younger, and I feel it. My clothes fit again, and I feel so good that my husband and my brother started too.”",
  },
  {
    src: t1,
    name: "Kiaya",
    num: "Lost 124 lbs.",
    text: "“I am wearing a size I had not touched in a decade. I actually love getting dressed now, I am in every picture, and I feel like myself again.”",
  },
  {
    src: t4,
    name: "Danielle",
    num: "Lost 34 lbs.",
    text: "“I got my curves back, snatched, not skinny. I fit into the dress I had been saving for three years and wore it to my daughter's wedding, feeling like the best version of me.”",
  },
];

// The hero photo strip: the same real before and after shots the main landing
// page runs in its own marquee.
const PHOTOS = [
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

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="ly-mark">{children}</span>;
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

/**
 * Wide enough that a 360px panel in the corner still leaves the content
 * column readable. Below this the form stays where it is, in the closing
 * section, and every button scrolls to it as before.
 */
const FLOATING_QUERY = "(min-width: 1280px)";

function formIsFloating(): boolean {
  return typeof window !== "undefined" && window.matchMedia(FLOATING_QUERY).matches;
}

/**
 * What a "Book my free call" button does. On a wide desktop the form is
 * already on screen, so the button opens and flags it instead of scrolling to
 * an empty band. Passed through context rather than threaded as a prop
 * through all six sections that hold a button.
 */
const BookContext = createContext<() => void>(() => scrollToId(BOOKING_SECTION_ID));

function useBook(): () => void {
  return useContext(BookContext);
}

/**
 * The section names the "Free Call Funnel" dashboard breaks `fc_cta_clicked`
 * down by. Kept as a map rather than renaming `position`, so the existing
 * `yobody_cta_clicked` property values on this page are left alone.
 */
const FC_LOCATION: Record<string, FcCtaLocation> = {
  hero: "hero",
  pain: "pain",
  meet_jj: "jj",
  how_it_works: "howitworks",
  what_you_get: "valueprops",
  faq: "faq",
  closer: "closer",
  every_day: "everyday",
  header: "header",
  sticky: "sticky",
};

/** One place to fire both: the shared landing event, and this page's own. */
function trackBookClick(position: string, section: string): void {
  trackCtaClicked({ cta_name: position, section_name: section, destination_type: "scroll" });
  const location = FC_LOCATION[position];
  if (location) trackFcCtaClicked(location);
}

/**
 * Every button on this page does one thing: send her to the booking form.
 * `center` is for the centred sections, where the button and its reassurance
 * line sit in the middle of the column rather than flush left.
 */
function Cta({
  position,
  center = false,
  onDark = false,
}: {
  position: string;
  center?: boolean;
  onDark?: boolean;
}) {
  const book = useBook();
  return (
    <div className={`fc-cta ${center ? "is-center" : ""}`}>
      <button
        className="fc-btn"
        data-cta="book-free-call"
        data-position={position}
        onClick={(e) => {
          trackBookClick(position, sectionNameOf(e.currentTarget));
          book();
        }}
      >
        {BOOKING_CTA_LABEL}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h13" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>
      <p className={`fc-micro ${onDark ? "is-dark" : ""}`}>{REASSURANCE}</p>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────
function FreeCall() {
  const [showSticky, setShowSticky] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  // The floating panel only exists above FLOATING_QUERY. These two are inert
  // below it, where the form simply sits in the closing section.
  const [formOpen, setFormOpen] = useState(true);
  const [nudging, setNudging] = useState(false);
  const nudgeTimer = useRef<number | undefined>(undefined);

  // Section reach + scroll depth, the same signals the main landing page sends.
  useLandingBehaviorTracking();

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);

  const book = useCallback(() => {
    if (!formIsFloating()) {
      // the band, not the card: she should read the close on the way in
      scrollToId(BOOKING_SECTION_ID);
      return;
    }
    // Already on screen, so open it, ring it once so a mouse user sees where
    // the click went, and put focus on its heading for everyone else.
    setFormOpen(true);
    setNudging(false);
    window.clearTimeout(nudgeTimer.current);
    window.requestAnimationFrame(() => {
      setNudging(true);
      nudgeTimer.current = window.setTimeout(() => setNudging(false), 950);
      document.querySelector<HTMLElement>(`#${BOOKING_ANCHOR_ID} .fcb-h`)?.focus();
    });
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
    <BookContext.Provider value={book}>
      <div className="lyx">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
        />
        <style>{CSS}</style>

        <Announce />
        <Header />
        <main>
          <Hero />
          <Pain />
          <MeetJJ />
          <HowItWorks />
          <SocialProof />
          <WhatYouGet />
          <Faq />
          <Closer
            open={formOpen}
            nudging={nudging}
            onCollapse={() => setFormOpen(false)}
            onExpand={() => setFormOpen(true)}
          />
          <EveryDay />
        </main>
        <Footer />
        <StickyCta show={showSticky && !formVisible} />
      </div>
    </BookContext.Provider>
  );
}

/** The announcement bar both reference pages carry, same gradient and scale. */
function Announce() {
  return (
    <div className="ly-announce">
      <div className="ly-wrap ly-announce-in">
        {/* the star rides inside the sentence, so it never wraps onto a line
            of its own on a narrow phone */}
        <span>
          <span className="ly-announce-star" aria-hidden>
            &#10022;
          </span>{" "}
          Book your free call
        </span>
      </div>
    </div>
  );
}

function Header() {
  const book = useBook();
  return (
    <header className="ly-header">
      <div className="ly-wrap ly-header-in">
        <img src={jjSmithLogo} alt="JJ Smith" className="ly-logo" />
        <button
          className="ly-header-cta"
          data-cta="book-free-call"
          data-position="header"
          onClick={() => {
            trackBookClick("header", "header");
            book();
          }}
        >
          {BOOKING_CTA_LABEL}
        </button>
      </div>
    </header>
  );
}

// ── hero ─────────────────────────────────────────────────────────────────────
/**
 * Ported from the Hormone Focus landing page hero, recoloured onto the JJ
 * palette.
 *
 * Desktop: copy on the left, JJ's cut-out pinned to the bottom right of the
 * full width band, then the photo strip and the logo slider underneath.
 *
 * Mobile: the band becomes one flex column and the grid becomes
 * display:contents, so the pieces reflow into copy, photo carousel, logos.
 * The cut-out drops out and the carousel does the hero image's job.
 */
function Hero() {
  return (
    <section data-yb-section="free_call_hero" className="fc-hero">
      <div className="fc-hero-top">
        {/* The /vapi-demo hero treatment: the photo bleeds off the right edge
            behind a gradient that keeps the copy readable, which is what lets
            the booking panel sit on top of it without cutting anyone in half.
            Desktop only, so `lazy` keeps phones from downloading it: it is in
            the viewport where it does show, so it still loads at once. */}
        <div className="fc-hero-bg" aria-hidden>
          <img src={heroBg} alt="" loading="lazy" decoding="async" />
          <span className="fc-hero-fade" />
        </div>

        <div className="ly-wrap fc-hero-grid">
          <div className="fc-hero-copy">
            <HeroTrust />

            <h1 className="fc-h1">
              <span className="fc-grp">Over 40 and</span>{" "}
              <span className="fc-grp">
                <Hi>can&rsquo;t lose the weight,</Hi>
              </span>{" "}
              <span className="fc-grp">no matter what you try?</span>
            </h1>

            <p className="fc-hero-sub">
              Book a <Mark>free call with {COACH_LABEL}.</Mark> In about {CALL_MINUTES} minutes she
              figures out what&rsquo;s really going on, and builds a simple plan made just for you.
            </p>

            <Cta position="hero" />
          </div>
        </div>
      </div>

      <PhotoStrip />
      <PressStrip />

      {/* the credibility composite the main landing page runs straight after
          its own featured-on strip */}
      <div className="fc-press-tv">
        <div className="ly-wrap">
          <img
            src={jjOnTv}
            alt="JJ Smith on The Steve Harvey Show and The Dr. Oz Show, and her bestselling books"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/** The main landing page's credibility pill, same markup and same claims. */
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

/**
 * `eager` is for the cards that open each row. Below 1280px this strip is the
 * hero image and the LCP candidate, so lazy loading the first of them would
 * cost exactly the metric it is meant to help.
 */
function PhotoCard({
  photo,
  eager = false,
}: {
  photo: { src: string; caption: string };
  eager?: boolean;
}) {
  return (
    <figure className="fc-tf-card">
      <img
        src={photo.src}
        alt="A woman's before and after transformation"
        width={212}
        height={258}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding={eager ? "sync" : "async"}
      />
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

/**
 * The main landing page's transformations marquee, same component: one row on
 * desktop, and two stacked rows running in opposite directions on a phone,
 * where the strip stands in for the hero image.
 */
function PhotoStrip() {
  const mid = Math.ceil(PHOTOS.length / 2);
  const rowTop = PHOTOS.slice(0, mid);
  const rowBottom = PHOTOS.slice(mid);
  const full = [...PHOTOS, ...PHOTOS];
  const top = [...rowTop, ...rowTop];
  const bottom = [...rowBottom, ...rowBottom];
  return (
    <div className="fc-photos">
      <div className="fc-tf fc-tf-desk">
        <div className="fc-tf-track">
          {full.map((photo, i) => (
            <PhotoCard key={i} photo={photo} eager={i < 2} />
          ))}
        </div>
      </div>
      <div className="fc-tf-mob">
        <div className="fc-tf">
          <div className="fc-tf-track is-rev">
            {top.map((photo, i) => (
              <PhotoCard key={i} photo={photo} eager={i < 2} />
            ))}
          </div>
        </div>
        <div className="fc-tf">
          <div className="fc-tf-track">
            {bottom.map((photo, i) => (
              <PhotoCard key={i} photo={photo} eager={i < 2} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** `inset` is the founder section's variant: a white panel inside the dark band. */
function PressStrip({ inset = false }: { inset?: boolean }) {
  return (
    <div
      className={`fc-press ${inset ? "is-inset" : ""}`}
      data-yb-section={inset ? undefined : "press_features"}
    >
      <p className="fc-press-lbl">JJ Smith has been featured on</p>
      <div className="fc-marquee">
        <div className="fc-marquee-track">
          {[...ALL_LOGOS, ...ALL_LOGOS].map((logo, i) => (
            <img key={i} src={logo} alt="" loading="lazy" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── pain ─────────────────────────────────────────────────────────────────────
function Pain() {
  return (
    <section data-yb-section="free_call_pain" className="ly-band ly-white ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Sound familiar?</span>
        <h2 className="ly-h2 ly-narrow">
          If you&rsquo;ve tried everything and the weight still won&rsquo;t come off,{" "}
          <Hi>it&rsquo;s not your fault.</Hi>
        </h2>
        <div className="ly-rcards">
          {PAIN_POINTS.map(({ img, text }) => (
            <div className="ly-rcard" key={text}>
              <div className="ly-rcard-media">
                <img src={img} alt="" loading="lazy" />
              </div>
              <div className="ly-rcard-in">
                <h3 className="ly-rcard-h">{text}</h3>
              </div>
            </div>
          ))}
        </div>
        <p className="fc-turn">That&rsquo;s exactly what this free call fixes.</p>
        <div className="ly-mt-l">
          <Cta position="pain" center />
        </div>
      </div>
    </section>
  );
}

// ── meet JJ ──────────────────────────────────────────────────────────────────
/**
 * The same component as the main landing page's founder section ("My body
 * turned on me, too."): the dark band, the before and after media column, the
 * lead paragraphs, the pull quote and the TV strip, on the same `ly-story-*`
 * classes so the two stay in step if that design moves.
 */
function MeetJJ() {
  return (
    <section data-yb-section="free_call_meet_jj" className="ly-band ly-dark">
      <div className="ly-wrap ly-story-grid">
        <div className="ly-story-media">
          <div className="ly-story-single">
            <img src={jjOwnTransformation} alt="JJ Smith's own transformation" loading="lazy" />
          </div>
          <div className="ly-story-quad">
            {[jjBefore1, jjAfter1, jjBefore2, jjAfter2].map((src, i) => (
              <div className="ly-story-cell" key={i}>
                <img src={src} alt="JJ Smith before and after" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="ly-story-copy">
          <span className="ly-eyebrow ly-eyebrow-dark">Meet JJ</span>
          <h2 className="ly-h2 on-dark">
            I know exactly where you are, <Hi>because I&rsquo;ve been there.</Hi>
          </h2>
          <p className="ly-lead on-dark-soft ly-mt">
            In my late 30s, my body turned on me. Weight out of nowhere, exhausted, foggy, a
            stranger in the mirror. So I did everything they tell you.{" "}
            <strong className="on-dark">
              Skipped meals, cut carbs, dragged myself to the gym.
            </strong>{" "}
            Nothing moved.
          </p>
          <p className="ly-story-quote">
            Nobody warned me my body had changed, and the old rules would never work again.
          </p>
          <p className="ly-lead on-dark-soft ly-mt">
            So I stopped fighting my body and started working with it.{" "}
            <strong className="on-dark">The weight came off, my energy roared back,</strong> and in
            my 40s I felt better than I did at 30. My books became bestsellers, and hundreds of
            thousands of women used them to get themselves back.
          </p>
          <p className="ly-story-quote">
            I&rsquo;m JJ Smith, a certified nutritionist and the author of the 10-Day Green Smoothie
            Cleanse.
          </p>
          <p className="ly-lead on-dark-soft ly-mt">
            On your free call, I&rsquo;ll help you find what&rsquo;s really getting in your way, and
            we&rsquo;ll build your plan together.
          </p>
          <p className="ly-guar-sig">JJ</p>

          <div className="ly-story-featured">
            <PressStrip inset />
          </div>

          <div className="ly-mt-l">
            <Cta position="meet_jj" onDark />
          </div>
        </div>

        {/* Last in the DOM so a phone reads photo, story, proof. On desktop it
            is placed under the before and after grid, in the column the copy
            would otherwise leave empty. */}
        <img
          src={jjOnTv}
          className="ly-story-tv"
          alt="JJ Smith on The Steve Harvey Show and The Dr. Oz Show, and her bestselling books"
          loading="lazy"
        />
      </div>
    </section>
  );
}

// ── how it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section data-yb-section="free_call_how_it_works" className="ly-band ly-lav ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Three steps</span>
        <h2 className="ly-h2">
          How your <Hi>free call</Hi> works
        </h2>
        <div className="fc-steps">
          {STEPS.map(({ Icon, title, text }, i) => (
            <div className="fc-step" key={title}>
              <span className="fc-step-n" aria-hidden>
                {i + 1}
              </span>
              <span className="fc-step-ico" aria-hidden>
                <Icon size={26} strokeWidth={1.9} />
              </span>
              <h3 className="fc-step-h">{title}</h3>
              <p className="fc-step-t">{text}</p>
            </div>
          ))}
        </div>
        <div className="ly-mt-l">
          <Cta position="how_it_works" center />
        </div>
      </div>
    </section>
  );
}

// ── social proof ─────────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section
      data-yb-section="free_call_results"
      className="ly-band ly-white ly-center"
      id="results"
    >
      <div className="ly-wrap">
        <span className="ly-eyebrow">Real women, real results</span>
        <h2 className="ly-h2 ly-narrow">
          They got themselves back. <Hi>So will you.</Hi>
        </h2>
        <div className="ly-results">
          {RESULTS.map((r) => (
            <figure className="ly-result" key={r.name}>
              <div className="ly-result-ph">
                <img
                  src={r.src}
                  alt="A woman's before and after transformation"
                  width={760}
                  height={760}
                  loading="lazy"
                  decoding="async"
                />
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
  );
}

// ── what you get ─────────────────────────────────────────────────────────────
function WhatYouGet() {
  return (
    <section data-yb-section="free_call_what_you_get" className="ly-band ly-pink ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">What you get</span>
        <h2 className="ly-h2">
          What you walk away with, <Hi>free.</Hi>
        </h2>
        <div className="fc-gets">
          {VALUE_PROPS.map(({ Icon, text }) => (
            <div className="fc-get" key={text}>
              <span className="fc-get-ico" aria-hidden>
                <Icon size={21} strokeWidth={2} />
              </span>
              <p className="fc-get-h">{text}</p>
            </div>
          ))}
        </div>
        <div className="ly-mt-l">
          <Cta position="what_you_get" center />
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
        <p className="fc-reassure">
          <Check className="ly-ico-12" /> {REASSURANCE}
        </p>
      </div>
    </section>
  );
}

// ── closer and the booking form ──────────────────────────────────────────────
/**
 * The closing band, and the form's single home in the DOM.
 *
 * Above FLOATING_QUERY the slot is taken out of flow and pinned to the bottom
 * right corner, so she can book from anywhere on the page. It is one instance
 * either way: rendering a second copy for the desktop would mean two forms
 * with their own state and duplicate field ids.
 *
 * Because the slot leaves the flow up there, the band grows its own button,
 * which is what `fc-closer-desk` is for.
 */
function Closer({
  open,
  nudging,
  onCollapse,
  onExpand,
}: {
  open: boolean;
  nudging: boolean;
  onCollapse: () => void;
  onExpand: () => void;
}) {
  return (
    <section
      id={BOOKING_SECTION_ID}
      data-yb-section="free_call_booking"
      className="ly-band ly-dark ly-center"
    >
      <div className="ly-wrap">
        <h2 className="ly-h2 on-dark">
          Your plan is <Hi>one short call away.</Hi>
        </h2>
        {/* no name here: the form says who takes the call, and the two must
            not disagree */}
        <p className="ly-lead on-dark-soft ly-mt ly-narrow">
          Book your free call. No card, no pressure, and you keep the plan either way.
        </p>

        <div className="fc-closer-desk">
          <Cta position="closer" center onDark />
        </div>

        <div className={`fc-form-slot ${open ? "" : "is-collapsed"} ${nudging ? "is-nudged" : ""}`}>
          <button
            type="button"
            className="fc-form-collapse"
            onClick={onCollapse}
            aria-label="Hide the booking form"
          >
            <ChevronDown size={18} strokeWidth={2.6} aria-hidden />
          </button>
          <BookingForm />
          <button type="button" className="fc-form-pill" onClick={onExpand}>
            {BOOKING_CTA_LABEL}
            <span className="fc-btn-arw" aria-hidden>
              &rarr;
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * The main landing page's "How I can finally be there for you every day"
 * section, same component and the same photo, adapted twice: it names the
 * coach as AI, and it ends by connecting that coach to the free call. The
 * warm place to land the disclosure, after the form rather than in the hero.
 */
function EveryDay() {
  return (
    <section data-yb-section="free_call_every_day" className="ly-band ly-cream">
      <div className="ly-wrap ly-clarity">
        <div className="ly-clarity-media">
          <img src={clarityImage} alt="JJ Smith" loading="lazy" />
        </div>
        <div>
          <span className="ly-eyebrow">A word from me</span>
          <h2 className="ly-h2">
            Why I built a coach to be there for you <Hi>every day</Hi>
          </h2>
          <p className="ly-lead ly-soft ly-mt">
            For fifteen years, my books and group coaching have helped hundreds of thousands of
            women get themselves back. But I could never be right there with each of you,{" "}
            <strong>one on one, on the hard days.</strong> There was only ever one of me.
          </p>
          <p className="ly-lead ly-soft ly-mt">
            So I built my AI coach. <strong>It is my exact voice, my exact coaching,</strong>{" "}
            everything I know and everything I would tell you if we were sitting together.
          </p>
          <p className="ly-clarity-quote">
            You can talk to me any time, day or night, and it feels like sitting down with me.
          </p>
          <p className="ly-lead ly-soft ly-mt">
            This is how I finally keep the promise I could never keep before: to be there for you,
            every single day. Not a book. Not a plan you follow alone.{" "}
            <strong>And she is the one who sits down with you on your free call.</strong>
          </p>
          <p className="ly-guar-sig ly-sig-light">JJ</p>
          <div className="ly-mt-l">
            <Cta position="every_day" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ly-footer">
      &copy; {new Date().getFullYear()} JJ Smith. All rights reserved. · <a href="#">Privacy</a> ·{" "}
      <a href={TERMS_URL}>Terms</a>
    </footer>
  );
}

function StickyCta({ show }: { show: boolean }) {
  const book = useBook();
  return (
    <div className={`ly-sticky ${show ? "is-show" : ""}`} aria-hidden={!show}>
      <div className="ly-sticky-in">
        <span className="ly-sticky-lbl">
          <strong>Free</strong> · about {CALL_MINUTES} minutes
        </span>
        <button
          className="fc-btn ly-sticky-btn"
          tabIndex={show ? undefined : -1}
          data-cta="book-free-call"
          data-position="sticky"
          onClick={() => {
            trackBookClick("sticky", "sticky_bar");
            book();
          }}
        >
          {BOOKING_CTA_LABEL}
          <span className="fc-btn-arw" aria-hidden>
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
// Two sources, deliberately:
//
//  - `.lyx` and every `ly-*` class below are the JJ coaching landing page's
//    design language, carried as a per-route copy the way every route in this
//    repo carries it (see index.tsx, b.tsx, v2.tsx). The founder section uses
//    those classes unchanged.
//  - the `fc-hero`, `fc-photos` and `fc-press` block is the Hormone Focus
//    landing page's hero, ported structure for structure (the grid, the
//    pinned cut-out, the display:contents mobile reflow, the two sliders) and
//    recoloured onto the JJ tokens so the page reads as one brand.
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
.ly-mark{background:linear-gradient(180deg,transparent 58%, var(--mark) 58%);padding:0 .06em;border-radius:2px;color:var(--purple-deep);font-weight:700}
.on-dark{color:#fff!important}
.on-dark-soft{color:#DEC9EE}
.ly-dark .ly-hi{color:#EEBBE0}

.ly-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.lyx .ly-narrow{max-width:760px;margin-left:auto;margin-right:auto}
.ly-band{padding:56px 0}
.ly-center{text-align:center}
.ly-white{background:var(--white)} .ly-lav{background:var(--lav)} .ly-pink{background:var(--pink)} .ly-cream{background:var(--cream)}
.ly-dark{background:radial-gradient(130% 120% at 50% 0%,#4A2A66 0%,#2B1940 62%);color:#F3EAFB}
.lyx .ly-mt{margin-top:20px}.lyx .ly-mt-s{margin-top:12px}.lyx .ly-mt-l{margin-top:34px}
.ly-soft{color:var(--ink-soft)}

/* eyebrow, h2, lead and the body sizes below are the main landing page's
   values, so the type reads at the same scale across the two pages */
.ly-eyebrow{display:inline-block;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.ly-eyebrow-dark{color:#EEBBE0}
.ly-h2{font-family:var(--head);font-weight:800;font-size:clamp(31px,5.4vw,48px);line-height:1.08;letter-spacing:-.02em;margin:0}
.ly-lead{font-size:clamp(19px,2.2vw,22px);line-height:1.55;font-weight:500;margin:0}
.ly-ico-12{width:14px;height:14px;flex:0 0 auto}

.ly-pills{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px;justify-content:center}
.ly-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--hair);border-radius:999px;padding:9px 15px;font-size:14px;font-weight:700;box-shadow:var(--shadow-sm)}
.ly-pill svg{color:var(--purple);flex:0 0 auto}
.ly-dark .ly-pill{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.17);color:#F3EAFB;box-shadow:none}
.ly-dark .ly-pill svg{color:#EEBBE0}

/* ── announcement bar ─────────────────────────────────────────────────── */
.ly-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff;position:relative;z-index:3}
.ly-announce-in{display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;padding:7px 18px;font-family:var(--head);font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;text-align:center;line-height:1.35}
.ly-announce-star{color:#F6C9E4}

/* ── header ───────────────────────────────────────────────────────────── */
.ly-header{background:var(--white);border-bottom:1px solid var(--hair);position:relative;z-index:3}
/* the padding shorthand here overrides .ly-wrap's side gutter, so the side
   value is restated */
.ly-header-in{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 20px}
.ly-logo{height:24px;width:auto}
.ly-header-cta{background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:14px;border:0;border-radius:12px;padding:11px 20px;box-shadow:0 10px 22px -10px rgba(91,42,128,.5)}
/* desktop only, as on both reference pages. On a phone the sticky bottom bar
   carries the CTA instead, and the logo centres. */
@media (max-width:560px){ .ly-header-cta{display:none} .ly-header-in{justify-content:center} }

/* ═══ hero, ported from the Hormone Focus landing page ═══════════════════ */
.fc-hero{background:linear-gradient(180deg,#FAF1FB 0%,#F1E7FA 100%);padding:clamp(24px,3.4vw,60px) 0 0}
.fc-hero-top{position:relative;padding-bottom:clamp(26px,3.4vw,60px)}
.fc-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) clamp(240px,24vw,340px);gap:clamp(28px,4vw,56px);align-items:start}
.fc-hero-copy{display:flex;flex-direction:column;align-items:flex-start;gap:clamp(16px,2.1vw,26px);min-width:0}

/* The hero photo, ported from /vapi-demo: it fills the right of the band and
   the fade carries it into the page background so the copy stays readable. */
.fc-hero-bg{display:none;position:absolute;inset:0;z-index:0}
.fc-hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center 32%}
.fc-hero-fade{position:absolute;inset:0}

/* the main landing page's credibility pill, verbatim: a white pill on a phone,
   a bare inline row carrying the extra NYT item on desktop */
.ly-trust .ly-tdesk{display:none}
.ly-trust{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:5px 8px;margin:0;max-width:100%;font-size:12.5px;font-weight:700;color:var(--purple-deep);background:#fff;border:1px solid var(--hair);border-radius:999px;padding:7px 14px;box-shadow:var(--shadow-sm)}
.ly-trust-i{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.ly-trust-i svg{color:var(--purple);width:14px;height:14px}
.ly-trust-div{width:1px;height:12px;background:var(--hair);flex:0 0 auto}
.ly-trust-av{display:inline-flex}
.ly-trust-av img{width:18px;height:18px;border-radius:999px;object-fit:cover;object-position:top;margin-left:-6px;border:2px solid #fff}
.ly-trust-av img:first-child{margin-left:0}

/* greedy wrapping, with the nowrap groups deciding where the lines break */
.fc-h1{margin:0;font-family:var(--head);font-weight:900;font-size:clamp(32px,4.4vw,50px);line-height:1.08;letter-spacing:-.02em;color:var(--ink);text-wrap:wrap}
.fc-grp{white-space:nowrap}
@media (max-width:560px){ .fc-grp{white-space:normal} }
/* the main landing page's hero sub: bigger, heavier, ink not grey */
.fc-hero-sub{margin:0;max-width:600px;font-size:clamp(18px,2.5vw,23px);line-height:1.4;font-weight:800;color:var(--ink)}

/* ── the one button, used everywhere ──────────────────────────────────── */
.fc-btn{display:inline-flex;align-items:center;justify-content:center;gap:11px;font-family:var(--head);font-weight:800;font-size:clamp(18px,2vw,21px);line-height:1.15;border:0;border-radius:16px;text-align:center;padding:21px clamp(34px,4.4vw,58px);min-height:68px;background:var(--grad);color:#fff;box-shadow:0 20px 40px -18px rgba(91,42,128,.65);transition:transform .16s ease,filter .16s ease}
.fc-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
.fc-btn-arw{font-size:1.15em;line-height:1}
.fc-cta{display:flex;flex-direction:column;gap:10px;width:fit-content;max-width:100%;align-items:stretch}
.fc-cta.is-center{margin-inline:auto;align-items:center}
.fc-micro{margin:0;text-align:center;font-size:14px;line-height:1.5;font-weight:600;color:var(--ink-soft)}
.fc-micro.is-dark{color:#C7B2DE}
@media (max-width:700px){
  .fc-cta{width:100%;align-items:center}
  .fc-btn{width:100%;max-width:520px;padding-inline:18px}
}

/* ── hero photo strip, the main landing page's marquee ────────────────── */
.fc-photos{background:var(--white);border-top:1px solid var(--hair);padding:clamp(14px,2vw,24px) 0 clamp(12px,1.6vw,18px)}
/* the fade masks the strip, not the band: a mask on .fc-photos would eat its
   own background and split the white band it shares with the logos */
.fc-tf{padding:10px 0 4px;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
.fc-tf-track{display:flex;gap:16px;width:max-content;animation:fc-scroll 60s linear infinite}
.fc-tf:hover .fc-tf-track{animation-play-state:paused}
.fc-tf-track.is-rev{animation-direction:reverse}
.fc-tf-mob{display:none}
.fc-tf-card{position:relative;flex:0 0 auto;width:180px;border-radius:18px;overflow:hidden;box-shadow:var(--shadow-sm);margin:0}
.fc-tf-card img{width:100%;height:220px;object-fit:cover;object-position:top}
.fc-tf-card figcaption{position:absolute;left:0;right:0;bottom:10px;margin:0 auto;width:fit-content;background:rgba(255,255,255,.96);border-radius:999px;padding:5px 12px;font-family:var(--head);font-size:13px;font-weight:800;color:var(--purple-deep);box-shadow:0 6px 14px -6px rgba(0,0,0,.3)}

/* ── hero logo slider ─────────────────────────────────────────────────── */
.fc-press{background:var(--white);border-bottom:1px solid var(--hair);padding:0 0 clamp(18px,2.2vw,26px)}
.fc-press-lbl{text-align:center;font-family:var(--head);font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 14px}
.fc-marquee{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent);mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}
/* logo sizes are the main landing page's: 64px on a phone, 58px with a wider
   gap on desktop */
.fc-marquee-track{display:flex;align-items:center;gap:50px;width:max-content;animation:fc-scroll 40s linear infinite}
.fc-marquee-track img{height:64px;width:auto;object-fit:contain}
@keyframes fc-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
/* the founder section's variant: the same strip as a white panel on the dark band */
.fc-press.is-inset{background:transparent;border:0;padding:0;margin-top:6px}
.fc-press.is-inset .fc-press-lbl{color:#C7B2DE;margin-bottom:12px}
.fc-press.is-inset .fc-marquee{background:#fff;border-radius:14px;padding:14px 0}

/* the credibility composite, straight after the featured-on strip */
.fc-press-tv{background:var(--white);padding:22px 0 30px;border-bottom:1px solid var(--hair);margin-top:-1px}
.fc-press-tv img{display:block;width:100%;height:auto;aspect-ratio:1280/720;border-radius:14px}

/* ── hero: the phone layout ───────────────────────────────────────────────
   On a phone the cut-out gives way to the photo strip, which does the hero
   image's job. One flex column reorders the pieces, and the grid becomes
   display:contents so its columns join that same flow. */
@media (max-width:940px){
  .fc-hero{display:flex;flex-direction:column;padding-bottom:0}
  .fc-hero-top,.fc-hero-grid{display:contents}
  .fc-hero-copy{order:1;width:100%;max-width:1120px;margin-inline:auto;padding:0 20px}
  .fc-photos{order:2}
  .fc-press{order:3}
  .fc-press-tv{order:4}
  /* out-specifies .lyx img{display:block}, which is (0,1,1) and would win */

  /* two stacked rows running opposite ways, as on the main landing page */
  .fc-photos{background:transparent;border-top:0;padding:clamp(20px,4vw,30px) 0 0}
  .fc-tf-desk{display:none}
  .fc-tf-mob{display:flex;flex-direction:column;gap:12px;padding:0}
  .fc-tf-mob .fc-tf{padding:0}
  .fc-tf-mob .fc-tf-track{animation-duration:75s}
  .fc-tf-card{width:212px}
  .fc-tf-card img{height:258px}

  .fc-press{margin-top:clamp(22px,3.4vw,32px);padding-top:clamp(24px,5vw,34px);border-top:1px solid var(--hair)}
}
@media (prefers-reduced-motion:reduce){ .fc-tf-track,.fc-marquee-track{animation:none} }

/* ── hero: the desktop photo ──────────────────────────────────────────── */
@media (min-width:941px){
  /* The photo is square and object-fit:cover, so how much gets cropped off
     the top is set by the BOX's aspect. A fixed height meant the crop grew
     tighter the wider the screen, which is what was slicing her hair off.
     Tying the height to the viewport keeps the box at a constant 1.78, so one
     object-position frames her the same way at 1280 and at 2560. */
  /* Flush to the top bar, the way /vapi-demo's stage is. The band's own top
     padding was leaving a strip of lavender above the photo, which read as
     the photo being pushed down the page. The copy is centred in the band, so
     it does not need the padding to sit off the header. */
  .fc-hero{padding-top:0}
  .fc-hero-top{min-height:clamp(520px,36vw,700px);padding-bottom:0;display:flex;align-items:center}
  .fc-hero-grid{width:100%}
  /* Wider than vapi-demo's 56%: the booking panel owns the right 26% of the
     screen, so a narrower photo would park her face behind it. At 64% she
     lands in the gap between the headline and the panel. */
  .fc-hero-bg{display:block;left:auto;right:0;width:64%}
  /* 34% leaves her about 4% of the frame in headroom at every width */
  .fc-hero-bg img{object-position:center 34%}
  /* NOTE: this sits inside .fc-hero-bg, so its stops are a share of the PHOTO,
     not of the viewport. At 64% wide that makes every percent worth a lot of
     pixels, and a ramp that ran to 70% washed straight across her.
     It now covers only the strip the headline reaches over (which ends near
     32% of the photo at every width from 1280 up) and is fully clear well
     before her face, at 52%. */
  .fc-hero-fade{background:linear-gradient(90deg,#FAF1FB 0%,#FAF1FB 32%,rgba(250,241,251,.55) 39%,rgba(250,241,251,0) 47%)}
}

/* ═══ pain, on the main landing page's photo cards ══════════════════════ */
.ly-rcards{display:grid;grid-template-columns:1fr;gap:16px;margin-top:34px;text-align:left}
.ly-rcard{background:var(--white);border:1px solid var(--hair);border-radius:18px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column}
.ly-rcard-media{aspect-ratio:4/3;overflow:hidden;background:var(--purple-soft)}
.ly-rcard-media img{width:100%;height:100%;object-fit:cover;display:block}
.ly-rcard-in{padding:20px 22px 24px}
/* the main page splits a bold title and a paragraph. Each of these cards is a
   single line, so it carries the title weight at a size that fits three up. */
.ly-rcard-h{margin:0;font-family:var(--head);font-weight:800;font-size:19px;line-height:1.3;letter-spacing:-.01em;color:var(--ink)}
.fc-turn{margin:26px 0 0;font-family:var(--head);font-weight:800;font-size:clamp(19px,2.6vw,25px);line-height:1.35;color:var(--purple)}

/* ═══ founder section, as on the main landing page ══════════════════════ */
.ly-story-grid{display:grid;grid-template-columns:1fr;gap:30px}
.ly-story-grid>*{min-width:0}
.ly-story-single{max-width:440px;margin:0 auto;border-radius:22px;overflow:hidden;box-shadow:0 30px 60px -24px rgba(0,0,0,.7);border:1px solid rgba(255,255,255,.1)}
.ly-story-single img{width:100%;height:auto;aspect-ratio:1/1}
.ly-story-quad{display:none}
.ly-story-quote{margin:22px 0 0;font-family:var(--head);font-style:italic;font-weight:700;font-size:clamp(20px,2.8vw,26px);line-height:1.3;color:#EBBEDD}
.ly-story-quad img{width:100%;height:100%;object-fit:cover;object-position:top}
.ly-story-tv{display:block;width:100%;height:auto;aspect-ratio:1280/720;border-radius:14px}
.ly-guar-sig{font-family:var(--head);font-weight:800;letter-spacing:.16em;color:#C7B2DE;margin:14px 0 0;font-size:15px}

/* ═══ a word from me, the main landing page's clarity section ═══════════ */
.ly-clarity{display:grid;grid-template-columns:1fr;gap:28px;align-items:center}
.ly-clarity>*{min-width:0}
.ly-clarity-media img{width:100%;height:auto;aspect-ratio:1152/2048;border-radius:22px;box-shadow:var(--shadow)}
.ly-clarity-quote{margin:22px 0 0;font-family:var(--head);font-style:italic;font-weight:700;font-size:clamp(21px,2.6vw,26px);line-height:1.32;color:var(--purple-deep);border-left:3px solid var(--purple);padding-left:20px}
/* the founder section's signature sits on a dark band, this one does not */
.lyx .ly-sig-light{color:var(--ink-soft)}

/* ═══ how it works ═══════════════════════════════════════════════════════ */
.fc-steps{display:grid;grid-template-columns:1fr;gap:34px;margin-top:44px;text-align:left}
.fc-step{position:relative;background:#fff;border:1px solid var(--hair);border-radius:20px;box-shadow:var(--shadow-sm);padding:30px 22px 26px}
.fc-step-n{position:absolute;top:-19px;left:20px;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:900;font-size:18px;line-height:1;box-shadow:0 12px 24px -10px rgba(91,42,128,.7);border:3px solid var(--white)}
.fc-step-ico{display:flex;align-items:center;justify-content:center;width:54px;height:54px;border-radius:16px;background:var(--purple-soft);color:var(--purple);margin-bottom:15px}
.fc-step-h{margin:0;font-family:var(--head);font-weight:800;font-size:22px;line-height:1.2;letter-spacing:-.01em}
.fc-step-t{margin:9px 0 0;font-size:16.5px;line-height:1.55;color:var(--ink-soft)}

/* ═══ what you get ═══════════════════════════════════════════════════════ */
.fc-gets{display:grid;grid-template-columns:1fr;gap:13px;margin-top:34px;text-align:left}
.fc-get{display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--hair);border-radius:18px;box-shadow:var(--shadow-sm);padding:18px 20px}
.fc-get-ico{display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex:0 0 auto;border-radius:13px;background:var(--grad);color:#fff}
.fc-get-h{margin:0;font-family:var(--head);font-weight:800;font-size:18px;line-height:1.35;color:var(--ink)}

/* ═══ faq ════════════════════════════════════════════════════════════════ */
.ly-faq{max-width:760px;margin:34px auto 0;text-align:left}
.ly-faq-item{background:#fff;border:1px solid var(--hair);border-radius:16px;box-shadow:var(--shadow-sm);margin-bottom:12px;overflow:hidden}
.ly-faq-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;font-family:var(--head);font-weight:700;font-size:18px}
.ly-faq-item summary::-webkit-details-marker{display:none}
.ly-faq-mark{position:relative;width:18px;height:18px;flex:0 0 auto}
.ly-faq-mark::before,.ly-faq-mark::after{content:"";position:absolute;background:var(--purple);border-radius:2px}
.ly-faq-mark::before{left:0;top:8px;width:18px;height:2.4px}
.ly-faq-mark::after{left:8px;top:0;width:2.4px;height:18px;transition:opacity .18s}
.ly-faq-item[open] .ly-faq-mark::after{opacity:0}
.ly-faq-a{padding:0 22px 22px;font-size:17px;line-height:1.65;color:var(--ink-soft);font-weight:500}
.fc-reassure{display:inline-flex;align-items:center;gap:9px;margin:24px 0 0;background:var(--purple-soft);border-radius:999px;padding:11px 22px;font-family:var(--head);font-size:14.5px;font-weight:800;color:var(--purple-deep)}

/* ═══ results ════════════════════════════════════════════════════════════ */
.ly-results{display:grid;grid-template-columns:1fr;gap:18px;margin-top:34px;text-align:left}
.ly-result{background:var(--white);border:1px solid var(--hair);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);margin:0}
/* a reserved square box: no layout shift as the photos arrive, and the six
   cards line up instead of each starting its text at a different height */
.ly-result-ph{aspect-ratio:1/1;overflow:hidden;background:var(--purple-soft)}
.ly-result-ph img{width:100%;height:100%;object-fit:cover;object-position:top}
.ly-result-in{padding:20px 22px 24px}
.ly-result-name{font-family:var(--head);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin:0 0 6px}
.ly-result-num{font-family:var(--head);font-weight:900;font-size:24px;color:var(--purple);margin:0}
.ly-result-t{margin:8px 0 0;font-size:16px;line-height:1.55;color:var(--ink-soft)}

/* ═══ the booking form slot ══════════════════════════════════════════════ */
.fc-form-slot{position:relative;max-width:560px;margin:34px auto 0;text-align:left}
/* only the floating panel has these */
.fc-form-collapse,.fc-form-pill,.fc-closer-desk{display:none}

/* ═══ the form floating in the corner, wide desktop only ════════════════ */
@media (min-width:1280px){
  /* on screen from the first paint, so she can book without scrolling at all */
  .fc-form-slot{position:fixed;right:22px;bottom:22px;z-index:45;width:360px;max-width:none;margin:0}
  /* the card scrolls inside itself, so a tall step two can never run off a
     short laptop screen */
  .fc-form-slot .fcb-card{max-height:calc(100vh - 44px);overflow-y:auto;overscroll-behavior:contain;box-shadow:0 30px 70px -22px rgba(36,20,56,.62)}
  /* a touch smaller so the step headings hold one line at 360px, next to the collapse control */
  .fc-form-slot .fcb-h{font-size:23px;padding-right:34px}
  .fc-form-slot .fcb-done-h{font-size:23px}

  .fc-form-collapse{position:absolute;top:13px;right:13px;z-index:2;display:flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:0;border-radius:999px;background:var(--purple-soft);color:var(--purple-deep);box-shadow:0 2px 6px -2px rgba(0,0,0,.2);transition:background .15s}
  .fc-form-collapse:hover{background:#E4D4F4}

  .fc-form-slot.is-collapsed{width:auto}
  .fc-form-slot.is-collapsed .fcb,.fc-form-slot.is-collapsed .fc-form-collapse{display:none}
  .fc-form-slot.is-collapsed .fc-form-pill{display:inline-flex}
  .fc-form-pill{align-items:center;gap:10px;min-height:56px;padding:16px 26px;border:0;border-radius:999px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:16px;box-shadow:0 20px 40px -16px rgba(91,42,128,.7);transition:transform .15s,filter .15s}
  .fc-form-pill:hover{transform:translateY(-1px);filter:brightness(1.05)}

  /* one ring when a button sends her here, so a mouse user sees where it went */
  .fc-form-slot.is-nudged .fcb-card{animation:fc-nudge .9s ease-out}

  /* the band needs its own button now that the form has left the flow */
  .fc-closer-desk{display:block;margin-top:34px}
}
@keyframes fc-nudge{
  from{box-shadow:0 30px 70px -22px rgba(36,20,56,.62),0 0 0 0 rgba(192,70,140,.5)}
  to{box-shadow:0 30px 70px -22px rgba(36,20,56,.62),0 0 0 18px rgba(192,70,140,0)}
}

/* ═══ footer and sticky bar ══════════════════════════════════════════════ */
.ly-footer{padding:28px 20px;text-align:center;color:var(--ink-soft);font-size:14px;background:var(--white);border-top:1px solid var(--hair)}
.ly-footer a{text-decoration:underline}
.ly-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-top:1px solid var(--hair);box-shadow:0 -10px 30px -12px rgba(74,35,90,.2);transform:translateY(130%);transition:transform .28s cubic-bezier(.32,.72,0,1);padding:11px 16px calc(11px + env(safe-area-inset-bottom,0px))}
.ly-sticky.is-show{transform:translateY(0)}
.ly-sticky-in{display:flex;align-items:center;gap:14px;max-width:1120px;margin:0 auto}
.ly-sticky-lbl{flex:0 0 auto;font-weight:600;font-size:14px}
.ly-sticky-lbl strong{color:var(--purple);font-weight:800}
.lyx .ly-sticky-btn{flex:1;width:auto;max-width:none;font-size:15px;padding:14px 16px;min-height:52px;border-radius:12px;box-shadow:none}

/* ═══ desktop ════════════════════════════════════════════════════════════ */
@media (min-width:860px){
  .ly-band{padding:92px 0}
  .ly-rcards{grid-template-columns:repeat(3,1fr);gap:20px}
  .fc-gets{grid-template-columns:repeat(3,1fr);gap:18px}
  .fc-marquee-track{gap:72px}
  .fc-marquee-track img{height:58px}
  .ly-trust{display:flex;background:transparent;border:0;padding:0;box-shadow:none;font-size:13px}
  .ly-trust .ly-tdesk{display:inline-flex}
  .ly-results{grid-template-columns:1fr 1fr 1fr;gap:22px}
  .ly-clarity{grid-template-columns:0.82fr 1.18fr;gap:54px}
  .ly-story-grid{grid-template-columns:.85fr 1fr;gap:28px 48px;align-items:start}
  .ly-story-media{grid-column:1;grid-row:1}
  .ly-story-copy{grid-column:2;grid-row:1 / span 2}
  .ly-story-tv{grid-column:1;grid-row:2;align-self:start}
  .ly-story-single{display:none}
  .ly-story-quad{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .ly-story-cell{aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 50px -24px rgba(0,0,0,.7)}
  .ly-sticky{display:none}
}
@media (min-width:900px){
  .fc-steps{grid-template-columns:repeat(3,1fr);gap:clamp(26px,3.2vw,44px)}
  /* the flow arrow between cards, so the three read as one sequence */
  .fc-step+.fc-step::before{content:"\\2192";position:absolute;top:50%;left:calc(-1 * (clamp(26px,3.2vw,44px) / 2) - 10px);transform:translateY(-50%);font-size:22px;line-height:1;color:var(--purple);opacity:.5}
}
@media (prefers-reduced-motion:reduce){ .lyx *{transition:none!important;animation:none!important} }
`;
