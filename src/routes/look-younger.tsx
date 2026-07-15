import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  logo, hero, productTruth, productEverything, secrets, jjGuide,
  styleGuide as guaranteeSeal, guarantee as whyNowImg,
} from "@/assets/look-younger";
import partnerTheView from "@/assets/landing/partners/theview.png";
import partnerSteveHarvey from "@/assets/landing/partners/steveharvey.png";
import partnerDrOz from "@/assets/landing/partners/droz.png";
import partnerNbc from "@/assets/landing/partners/nbc.png";
import partnerFox from "@/assets/landing/partners/fox.png";
import partnerNyTimes from "@/assets/landing/partners/nytimes.png";

export const Route = createFileRoute("/look-younger")({
  head: () => ({
    meta: [
      { title: "Look Younger After 40 | Natural Anti-Aging System for Women" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Discover the simple anti-aging system helping women over 40 improve skin, boost energy, reduce puffiness, and support a more youthful appearance naturally." },
    ],
  }),
  component: LookYounger,
});

const ORDER_ID = "order";
const scrollToOrder = () => document.getElementById(ORDER_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });

// ── highlight helpers ───────────────────────────────────────────────────────
function Mark({ children }: { children: React.ReactNode }) { return <span className="ly-mark">{children}</span>; }
function Hi({ children }: { children: React.ReactNode }) { return <span className="ly-hi">{children}</span>; }

// ── icons ───────────────────────────────────────────────────────────────────
function Check({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Lock({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden><rect x="4.5" y="10.5" width="15" height="10" rx="2.4" stroke="currentColor" strokeWidth="1.8" /><path d="M8 10.5V7.5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
function Apple({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M16.4 12.9c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .6 1 1.4 2 2.4 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.3-2c.7-1.1 1-2.2 1-2.3-.1 0-2.1-.8-2.2-3.1zM14.6 6.3c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z" /></svg>;
}

function Cta({ label = "Get Instant Access", price = true, big = false, full = false }: { label?: string; price?: boolean; big?: boolean; full?: boolean }) {
  return (
    <button className={`ly-cta ${big ? "ly-cta-lg" : ""} ${full ? "ly-cta-full" : ""}`} onClick={scrollToOrder}>
      {label}{price && <span className="ly-cta-price">— $27</span>}<span className="ly-cta-arw" aria-hidden>→</span>
    </button>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <span className="ly-kicker"><span className="ly-kicker-mk" aria-hidden>✦</span>{children}</span>;
}

// ── page ─────────────────────────────────────────────────────────────────────
function LookYounger() {
  const [total, setTotal] = useState(27);
  const [bump, setBump] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 680);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const toggleBump = () => setBump((b) => { const nb = !b; setTotal(nb ? 36 : 27); return nb; });

  return (
    <div className="lyx">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <PressStrip />
        <Problem />
        <Mechanism />
        <Reveal />
        <Secrets />
        <MeetJJ />
        <Offer />
        <OrderForm total={total} bump={bump} toggleBump={toggleBump} />
        <Guarantee />
        <WhyNow />
        <Faq />
        <Close />
      </main>
      <Footer />
      <StickyCta show={showSticky} />
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="ly-announce">
      <div className="ly-wrap ly-announce-in">
        <span className="ly-announce-star" aria-hidden>✦</span>
        <span>14-Day Money Back Guarantee</span>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="ly-header">
      <div className="ly-wrap ly-header-in">
        <img src={logo} alt="Look Younger After 40" className="ly-logo" />
        <button className="ly-header-cta" onClick={scrollToOrder}>Get Instant Access</button>
      </div>
    </header>
  );
}

// ── 1 · hero ─────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="ly-band ly-hero">
      <div className="ly-wrap ly-hero-grid">
        <div className="ly-hero-copy">
          <Kicker>Look Younger After 40</Kicker>
          <h1 className="ly-h1">The <Mark>6 Secrets</Mark> of Women Who <em>Never Seem To Age</em></h1>
          <p className="ly-hero-sub">Grab the 6-Secret System That Helps Women Over 40 <strong>Look Naturally Younger</strong> — <strong>Without the Guesswork</strong></p>
        </div>

        <div className="ly-hero-media">
          <div className="ly-hero-glow" aria-hidden />
          <img src={hero} alt="JJ Smith" className="ly-hero-img" fetchPriority="high" />
        </div>

        <div className="ly-hero-action">
          <Cta big full />
          <div className="ly-hero-proof">
            <span className="ly-stars" aria-hidden>★★★★★</span>
            <span>Loved by <strong>100K+</strong> women</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PressStrip() {
  const logos = [partnerTheView, partnerSteveHarvey, partnerDrOz, partnerNbc, partnerFox];
  return (
    <section className="ly-press">
      <div className="ly-wrap">
        <p className="ly-press-lbl">As seen on</p>
        <div className="ly-press-row">
          {logos.map((l, i) => <img key={i} src={l} alt="" className="ly-press-img" loading="lazy" />)}
        </div>
      </div>
    </section>
  );
}

// ── 2 · problem ──────────────────────────────────────────────────────────────
function Problem() {
  const wrong = ["Buy more expensive skincare", "Exercise harder", "Try another restrictive diet", "Blame themselves when nothing changes"];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap">
        <div className="ly-narrow ly-center">
          <span className="ly-eyebrow">Let's Be Real…</span>
          <h2 className="ly-h2">After 40, Your Body Plays by <Hi>Different Rules</Hi> — and Nobody Tells You What They Are</h2>
          <p className="ly-lead ly-mt"><strong>Skin looks duller. Energy crashes.</strong> Stubborn belly fat appears and nothing seems to work anymore.</p>
          <p className="ly-lead ly-soft ly-mt-s">So most women do what they've always been told…</p>
        </div>
        <div className="ly-wrong">
          {wrong.map((w) => (
            <div className="ly-wrong-card" key={w}><span className="ly-wrong-x" aria-hidden>✕</span><span>{w}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 3 · mechanism ────────────────────────────────────────────────────────────
function Mechanism() {
  const items = ["Hormones", "Gut Health", "Inflammation", "Poor Sleep", "Digestion", "Muscle Loss"];
  return (
    <section className="ly-band ly-lav">
      <div className="ly-wrap ly-center">
        <div className="ly-narrow">
          <span className="ly-eyebrow">Here's The Part Nobody Explains…</span>
          <h2 className="ly-h2">Looking younger isn't just about <Hi>what you put on your face.</Hi></h2>
          <p className="ly-lead ly-mt">After 40, your body becomes <strong>more sensitive to:</strong></p>
        </div>
        <div className="ly-chips">
          {items.map((i) => <span className="ly-chip" key={i}><span className="ly-chip-dot" aria-hidden />{i}</span>)}
        </div>
        <div className="ly-narrow ly-mt-l">
          <p className="ly-lead">That's why you can <strong>spend more on skincare, eat healthier and work harder…</strong></p>
          <p className="ly-lead ly-emph ly-mt-s">…and still look tired, puffy and older than you feel.</p>
        </div>
      </div>
    </section>
  );
}

// ── 4 · reveal ───────────────────────────────────────────────────────────────
function Reveal() {
  return (
    <>
      <section className="ly-band ly-dark ly-center">
        <div className="ly-wrap">
          <span className="ly-eyebrow ly-eyebrow-light">The Truth?</span>
          <p className="ly-reveal-line">Looking younger starts <em>from the inside out.</em></p>
          <p className="ly-lead ly-dark-soft ly-mt">That's exactly why I created <strong className="ly-dark-strong">Look Younger After 40</strong></p>
          <div className="ly-reveal-tile"><img src={productTruth} alt="Look Younger After 40" loading="lazy" /></div>
        </div>
      </section>
      <section className="ly-band ly-white ly-center">
        <div className="ly-narrow">
          <h2 className="ly-h2">Ready to Look <Hi>Younger Naturally?</Hi></h2>
          <p className="ly-lead ly-mt">Everything you need is inside <em>Look Younger After 40</em> — the <strong>exact step-by-step system</strong> created specifically for women over 40.</p>
          <div className="ly-mt-l ly-cta-center"><Cta big /></div>
        </div>
      </section>
    </>
  );
}

// ── 5 · the 6 secrets ────────────────────────────────────────────────────────
function Secrets() {
  const data = [
    { n: "Secret 1", t: "The Overnight Repair Secret", p: "Activate your body's natural repair cycle every night — so you wake up looking and feeling younger", b: <>The <strong>exact bedtime routine to wake up with less puffiness and younger looking skin</strong></> },
    { n: "Secret 2", t: "The Gut-Glow Connection", p: "Healthier skin starts in your gut — not your skincare routine.", b: <>The simple gut-reset strategy that helps support <strong>clearer, firmer, younger-looking skin — with fewer breakouts</strong></> },
    { n: "Secret 3", t: "The Plump & Flush Method", p: "Most women are dehydrated — and their skin shows it.", b: <>The simple hydration strategy that helps <strong>reduce facial puffiness while restoring plumper, more youthful-looking skin</strong></> },
    { n: "Secret 4", t: "The Hormone Youth Formula", p: "Balance your hormones so your body works with you — not against you.", b: <>The hormone-support strategy that helps restore the naturally <strong>plump, youthful-looking skin you had in your 20s and 30s</strong></> },
    { n: "Secret 5", t: "The Craving Control Secret", p: "The foods you crave can either accelerate aging — or help slow it", b: <>The simple strategy that helps control cravings so it's <strong>easier to choose foods that support healthier, brighter, younger-looking skin</strong></> },
    { n: "Secret 6", t: "The Strength = Youth Secret", p: "The stronger your body becomes, the younger you look and feel.", b: <>The simple strength strategy that helps you <strong>look younger, move better, and stay strong for years to come</strong></> },
  ];
  return (
    <section className="ly-band ly-pink">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">Inside The Program</span>
        <h2 className="ly-h2">The <Hi>6 Secrets</Hi> Of Women Who Never Seem To Age</h2>
        <div className="ly-secrets">
          {data.map((s, i) => (
            <article className="ly-secret" key={s.n}>
              <div className="ly-secret-ph"><img src={secrets[i]} alt="" loading="lazy" /><span className="ly-secret-n">{s.n}</span></div>
              <div className="ly-secret-in">
                <h3 className="ly-h3">{s.t}</h3>
                <p className="ly-secret-p">{s.p}</p>
                <p className="ly-secret-b">{s.b}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 6 · authority ────────────────────────────────────────────────────────────
function MeetJJ() {
  const creds = [
    { icon: <svg viewBox="0 0 24 24" fill="none"><path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="1.8" /><path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>, t: <><strong>#1 New York Times</strong> Bestselling Author of <strong>7 Books</strong></> },
    { icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M4 19a5 5 0 0110 0M16 7a3 3 0 010 6M15 19a5 5 0 015-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>, t: <>Helping over <strong>2.9 million women</strong> through her books, courses & social media</> },
    { icon: <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M8 21h8M12 6V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>, t: <>Featured on <strong>TODAY, The View, Steve Harvey, Dr. Oz, NBC, FOX</strong> & more</> },
  ];
  const logos = [partnerTheView, partnerSteveHarvey, partnerDrOz, partnerNbc, partnerFox, partnerNyTimes];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap">
        <div className="ly-jj-grid">
          <div className="ly-jj-media">
            <img src={jjGuide} alt="JJ Smith" className="ly-jj-img" loading="lazy" />
            <div className="ly-jj-badge"><span className="ly-jj-num">57</span><span className="ly-jj-badge-lbl">years young</span></div>
          </div>
          <div>
            <span className="ly-eyebrow">Meet your guide</span>
            <h2 className="ly-h2">Why learn From <Hi>JJ Smith?</Hi></h2>
            <p className="ly-lead ly-jj-quote ly-mt">"At 57, I'm still <strong>obsessed with what actually works</strong> for women over 40."</p>
            <ul className="ly-creds">
              {creds.map((c, i) => <li key={i}><span className="ly-cred-ico">{c.icon}</span><span>{c.t}</span></li>)}
            </ul>
          </div>
        </div>
        <div className="ly-jj-press">
          <p className="ly-press-lbl">As featured on</p>
          <div className="ly-marquee"><div className="ly-marquee-track">
            {[...logos, ...logos].map((l, i) => <img key={i} src={l} alt="" className="ly-marquee-img" loading="lazy" />)}
          </div></div>
        </div>
      </div>
    </section>
  );
}

// ── 7 · offer ────────────────────────────────────────────────────────────────
function Offer() {
  const items = [
    <><strong>Exact morning & evening routines</strong> that actually work for women over 40</>,
    <><strong>Overnight repair strategies</strong> to help you wake up looking younger</>,
    <>Simple habits that <strong>reduce puffiness and wrinkles</strong></>,
    <>The <strong>foods that nourish your skin</strong>, making it look younger</>,
    <>Sleep strategies that help you <strong>wake up with brighter, younger</strong> skin</>,
    <>Everything organized into an <strong>easy-to-follow plan</strong></>,
  ];
  return (
    <section className="ly-band ly-lav">
      <div className="ly-wrap ly-center">
        <span className="ly-eyebrow">The Complete Package</span>
        <h2 className="ly-h2">Everything you <Hi>get today</Hi></h2>

        <div className="ly-pkg">
          <div className="ly-pkg-media">
            <img src={productEverything} alt="Look Younger After 40 program" loading="lazy" />
          </div>
          <div className="ly-pkg-body">
            <p className="ly-pkg-h">The Complete Look Younger After 40 Program includes:</p>
            <ul className="ly-ticks">
              {items.map((it, i) => <li key={i}><span className="ly-tick-badge"><Check className="ly-ico-14" /></span><span>{it}</span></li>)}
            </ul>
          </div>
        </div>

        <div className="ly-price">
          <span className="ly-price-badge">Today Only · Save $170</span>
          <div className="ly-price-anchors">
            <span>Total Value <s>$197+</s></span>
            <span className="ly-price-dot" aria-hidden>•</span>
            <span>Normal Price <s>$97</s></span>
          </div>
          <div className="ly-price-big"><span className="ly-price-just">Today just</span><span className="ly-price-num">$27</span></div>
          <p className="ly-price-note">One-time payment · instant digital access</p>
          <div className="ly-price-cta"><Cta big full /></div>
          <p className="ly-lead ly-soft ly-price-just2">Less than one expensive face cream or a single anti-aging facial — yet this could change how your body looks and feels.</p>
        </div>
      </div>
    </section>
  );
}

// ── 8 · order form + bump ────────────────────────────────────────────────────
function OrderForm({ total, bump, toggleBump }: { total: number; bump: boolean; toggleBump: () => void }) {
  return (
    <section className="ly-band ly-pink" id={ORDER_ID}>
      <div className="ly-wrap ly-checkout">
        <div className="ly-center">
          <span className="ly-eyebrow">Order Here</span>
          <h2 className="ly-h2">Get instant access for <Hi>just $27</Hi></h2>
          <p className="ly-lead ly-soft ly-mt-s">One-time payment · Instant digital access · 14-day guarantee</p>
        </div>

        <div className="ly-co-card">
          <p className="ly-co-step"><span className="ly-co-num">1</span> Your details</p>
          <div className="ly-field"><label>Full name</label><input type="text" placeholder="Your name" autoComplete="name" /></div>
          <div className="ly-field"><label>Email address</label><input type="email" placeholder="you@email.com" autoComplete="email" /><span className="ly-field-hint">Your program is sent here instantly.</span></div>

          <div className="ly-co-div" />

          <p className="ly-co-step"><span className="ly-co-num">2</span> Your order</p>
          <div className="ly-sum-row"><span>Look Younger After 40</span><span>$27.00</span></div>
          {bump && <div className="ly-sum-row"><span>The Look Younger Success Kit</span><span>$9.00</span></div>}

          <label className={`ly-bump ${bump ? "is-on" : ""}`}>
            <input type="checkbox" checked={bump} onChange={toggleBump} className="ly-bump-input" />
            <div className="ly-bump-flag"><span aria-hidden>★</span> [Highly Recommended] — Add For Just $9</div>
            <div className="ly-bump-body">
              <img src="/order-bump-2.png" alt="The Look Younger Success Kit" className="ly-bump-img" loading="lazy" />
              <div className="ly-bump-detail">
                <h4 className="ly-bump-title">The Look Younger Success Kit</h4>
                <p className="ly-bump-sub">The Three Simple Guides That Keep The Program Right In Front Of You</p>
                <ul className="ly-bump-list">
                  <li><Check className="ly-ico-12" /> <span><strong>Morning & Night Routine Cards</strong> — both routines on a single page</span></li>
                  <li><Check className="ly-ico-12" /> <span><strong>The Daily Glow Tracker</strong> — thirty seconds a night, watch it working</span></li>
                  <li><Check className="ly-ico-12" /> <span><strong>The Ingredient Cheat Sheet</strong> — know what's worth buying</span></li>
                </ul>
                <p className="ly-bump-price"><span className="ly-bump-now">$9</span> <s>Regular price: $17</s></p>
              </div>
            </div>
            <div className="ly-bump-add">
              <span className="ly-bump-check" aria-hidden><Check className="ly-ico-16" /></span>
              <span className="ly-bump-add-t">{bump ? "Added to your order" : "Yes! Add this to my order"}</span>
            </div>
          </label>

          <div className="ly-sum-total"><span>Order Total</span><span className="ly-sum-amt">${total}.00</span></div>

          <div className="ly-co-div" />

          <p className="ly-co-step"><span className="ly-co-num">3</span> Payment</p>
          <div className="ly-express">
            <button type="button" className="ly-pay ly-pay-apple"><Apple className="ly-ico-18" /> Pay</button>
            <button type="button" className="ly-pay ly-pay-google"><span className="ly-gpay"><b style={{ color: "#4285F4" }}>G</b> Pay</span></button>
          </div>
          <div className="ly-or"><span>or pay with card</span></div>
          <div className="ly-field"><label>Card number</label><div className="ly-input-ico"><input inputMode="numeric" placeholder="1234 1234 1234 1234" autoComplete="cc-number" /><Lock className="ly-ico-16 ly-field-lock" /></div></div>
          <div className="ly-field-row">
            <div className="ly-field"><label>Expiry</label><input inputMode="numeric" placeholder="MM / YY" autoComplete="cc-exp" /></div>
            <div className="ly-field"><label>CVC</label><input inputMode="numeric" placeholder="CVC" autoComplete="cc-csc" /></div>
          </div>

          <button className="ly-cta ly-cta-lg ly-cta-full ly-co-submit" onClick={() => {}}>Complete My Order<span className="ly-cta-price">— ${total}</span><span className="ly-cta-arw" aria-hidden>→</span></button>
          <p className="ly-order-trust"><Lock className="ly-ico-14" /> 100% Secure & Safe Payments · 14-day money-back guarantee</p>
        </div>
      </div>
    </section>
  );
}

// ── 9 · guarantee ────────────────────────────────────────────────────────────
function Guarantee() {
  const pills = ["14-Day Money Back", "No Questions Asked", "Instant Access", "Zero Risk"];
  return (
    <section className="ly-band ly-white">
      <div className="ly-wrap ly-guar-grid">
        <img src={guaranteeSeal} alt="100% money-back guarantee" className="ly-guar-img" loading="lazy" />
        <div>
          <span className="ly-eyebrow">My Look-Younger Guarantee</span>
          <h2 className="ly-h2">100% <Hi>Money-Back Guarantee</Hi></h2>
          <p className="ly-lead ly-mt">Go through the program, apply the strategies, and if you don't feel more energized, notice a clearer glow, and feel noticeably better in your body within 14 days, simply email our support team for a full refund. <strong>You have nothing to lose except the exhaustion and frustration.</strong></p>
          <div className="ly-pills">
            {pills.map((p) => <span className="ly-pill" key={p}><Check className="ly-ico-12" /> {p}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 10 · why now ─────────────────────────────────────────────────────────────
function WhyNow() {
  const costs = [
    { icon: <svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>, t: "The puffiness continues" },
    { icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M8.5 15c1-1.2 6-1.2 7 0M9 9.5h.01M15 9.5h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" /></svg>, t: "The frustration continues" },
    { icon: <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>, t: "The accelerated aging continues" },
  ];
  return (
    <section className="ly-band ly-lav ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Why Start Now</span>
        <h2 className="ly-h2">Every week you stay stuck:</h2>
        <div className="ly-whynow-grid">
          <img src={whyNowImg} alt="" className="ly-whynow-img" loading="lazy" />
          <div className="ly-costs">
            {costs.map((c) => <div className="ly-cost" key={c.t}><span className="ly-cost-ico">{c.icon}</span><span className="ly-cost-t">{c.t}</span></div>)}
          </div>
        </div>
        <div className="ly-turn">
          <p className="ly-lead">But the sooner you start giving your body the <Hi>RIGHT internal signals</Hi>… the sooner your body can finally <strong>start repairing itself.</strong></p>
          <p className="ly-lead ly-emph ly-mt-s">And many women begin noticing changes in their energy and skin within just days.</p>
        </div>
        <div className="ly-mt-l ly-cta-center"><Cta big /></div>
      </div>
    </section>
  );
}

// ── 11 · faq ─────────────────────────────────────────────────────────────────
function Faq() {
  const items = [
    { q: "Is this another restrictive diet?", a: "No. This is a hormone-supportive, inside-out aging system specifically designed for women over 40." },
    { q: "Do I have to buy expensive creams?", a: "No. The focus is on improving digestion, stabilizing blood sugar, reducing inflammation, and supporting your body's natural repair systems." },
    { q: "Will I have to give up all my favorite foods?", a: "No. You'll learn how to make smarter choices without feeling deprived" },
    { q: "Is this beginner friendly?", a: "Yes. Everything is broken down step-by-step." },
    { q: "How quickly will I notice results?", a: "Many women notice improved energy and reduced puffiness within the first few weeks." },
    { q: "Is intense exercise required?", a: "No intense workouts are required. Strategic movement is encouraged but can be adapted to your level." },
    { q: "What makes this different?", a: "Most programs only focus on the outside. This one focuses on the real things affecting aging after 40: hormones, insulin, digestion, cravings, inflammation, sleep, and stress." },
  ];
  return (
    <section className="ly-band ly-white ly-center">
      <div className="ly-wrap">
        <span className="ly-eyebrow">Still Got Questions?</span>
        <h2 className="ly-h2">Frequently Asked Questions</h2>
        <div className="ly-faq">
          {items.map((it, i) => (
            <details key={i} className="ly-faq-item">
              <summary>{it.q}<span className="ly-faq-mark" aria-hidden /></summary>
              <div className="ly-faq-a">{it.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── 12 · close ───────────────────────────────────────────────────────────────
function Close() {
  return (
    <section className="ly-band ly-lav ly-center">
      <div className="ly-narrow ly-wrap">
        <span className="ly-eyebrow">Instant Access</span>
        <h2 className="ly-h2">You don't need another <Hi>expensive surface-level fix.</Hi></h2>
        <p className="ly-lead ly-mt">You simply need to understand what your body's repair systems need after 40 — and <strong>Look Younger After 40</strong> shows you exactly how.</p>
        <div className="ly-mt-l ly-cta-center"><Cta big /></div>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="ly-footer">© 2026 JJ Smith. All Rights Reserved.</footer>;
}

function StickyCta({ show }: { show: boolean }) {
  return (
    <div className={`ly-sticky ${show ? "is-show" : ""}`} aria-hidden={!show}>
      <div className="ly-sticky-in">
        <span className="ly-sticky-lbl">Instant access · <strong>$27</strong></span>
        <button className="ly-cta ly-sticky-btn" onClick={scrollToOrder}>Get Instant Access<span className="ly-cta-arw" aria-hidden>→</span></button>
      </div>
    </div>
  );
}

// ── styles ───────────────────────────────────────────────────────────────────
const CSS = `
.lyx{
  --white:#FFFFFF; --lav:#F3ECFB; --pink:#FCEAF4; --dark-2:#2B1940;
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
.lyx em{font-style:normal;color:var(--purple);font-weight:800}
.lyx strong{font-weight:700;color:var(--ink)}
.lyx s{color:var(--ink-soft);text-decoration:line-through;font-weight:600}

.ly-mark{background:linear-gradient(180deg,transparent 58%, var(--mark) 58%);padding:0 .06em;border-radius:2px;color:var(--purple-deep)}
.ly-hi{color:var(--purple)}
.lyx :focus-visible{outline:3px solid var(--purple);outline-offset:3px}

.ly-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.ly-narrow{max-width:740px;margin-left:auto;margin-right:auto}
.ly-band{padding:56px 0}
.ly-center{text-align:center}
.ly-white{background:var(--white)} .ly-lav{background:var(--lav)} .ly-pink{background:var(--pink)}
.ly-dark{background:radial-gradient(130% 120% at 50% 0%,#4A2A66 0%,#2B1940 62%);color:#F3EAFB}
.ly-mt{margin-top:20px}.ly-mt-s{margin-top:12px}.ly-mt-l{margin-top:32px}
.ly-soft{color:var(--ink-soft)} .ly-emph{color:var(--pink-accent);font-weight:800}
.ly-cta-center{display:flex;justify-content:center}

/* kicker + eyebrow */
.ly-kicker{display:inline-flex;align-items:center;gap:9px;font-family:var(--head);font-weight:800;font-size:clamp(15px,2vw,17px);letter-spacing:.04em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.ly-kicker-mk{color:var(--pink-accent);font-size:.9em}
.ly-eyebrow{display:inline-block;font-family:var(--head);font-weight:800;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.ly-eyebrow-light{color:#E6CBF3}

.ly-h1{font-family:var(--head);font-weight:900;font-size:clamp(40px,7.8vw,66px);line-height:1.04;letter-spacing:-.02em;margin:0}
.ly-h2{font-family:var(--head);font-weight:800;font-size:clamp(31px,5.4vw,48px);line-height:1.08;letter-spacing:-.02em;margin:0}
.ly-h3{font-family:var(--head);font-weight:800;font-size:23px;line-height:1.18;letter-spacing:-.01em;margin:0 0 8px}
.ly-lead{font-size:clamp(19px,2.2vw,22px);line-height:1.55;font-weight:500;margin:0}

.ly-ico-12{width:14px;height:14px;flex:0 0 auto}
.ly-ico-13{width:15px;height:15px;flex:0 0 auto}
.ly-ico-14{width:16px;height:16px;flex:0 0 auto}
.ly-ico-16{width:18px;height:18px;flex:0 0 auto}
.ly-ico-18{width:20px;height:20px;flex:0 0 auto}

/* CTA */
.ly-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:18px;letter-spacing:.005em;border:0;padding:16px 28px;border-radius:14px;box-shadow:0 16px 30px -12px rgba(91,42,128,.55);transition:transform .15s ease,box-shadow .15s ease,filter .15s ease;line-height:1.15}
.ly-cta:hover{transform:translateY(-2px);box-shadow:0 22px 40px -14px rgba(91,42,128,.6);filter:brightness(1.05)}
.ly-cta-lg{font-size:clamp(19px,2.1vw,21px);padding:19px 34px}
.ly-cta-full{width:100%}
.ly-cta-price{font-weight:700;opacity:.92}
.ly-cta-arw{font-size:1.25em;line-height:1;transform:translateY(-1px)}

/* announcement bar */
.ly-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff}
.ly-announce-in{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:5px 18px;font-family:var(--head);font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-align:center}
.ly-announce-star{color:#F6C9E4}
.ly-announce-dot{opacity:.55}

/* header */
.ly-header{background:var(--white);border-bottom:1px solid var(--hair)}
.ly-header-in{display:flex;align-items:center;justify-content:space-between;padding-top:14px;padding-bottom:14px}
.ly-logo{height:23px;width:auto}
.ly-header-cta{background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:14px;border:0;border-radius:12px;padding:11px 20px;box-shadow:0 10px 22px -10px rgba(91,42,128,.5)}
@media (max-width:560px){ .ly-header-cta{display:none} .ly-header-in{justify-content:center} }

/* hero */
.ly-hero{background:linear-gradient(180deg,#FAF1FB 0%,#F4EBFB 100%);padding-top:20px}
.ly-hero-grid{display:grid;grid-template-columns:1fr;gap:24px}
.ly-hero-copy{order:1}
.ly-hero-action{order:2}
.ly-hero-media{order:3;position:relative;max-width:400px;margin:0 auto;width:100%}
.ly-hero-sub{margin-top:18px;max-width:560px;font-size:clamp(18px,2.2vw,21px);line-height:1.5;font-weight:600;color:var(--ink)}
.ly-hero-glow{position:absolute;inset:-10% -8% -12% 4%;background:radial-gradient(58% 58% at 60% 40%,#EAD5F5,transparent 72%);border-radius:46% 44% 46% 42%;z-index:0}
.ly-hero-img{position:relative;z-index:1;width:100%;height:auto;border-radius:24px;box-shadow:var(--shadow)}
.ly-hero-action{margin-top:4px;max-width:480px}
.ly-fud{list-style:none;padding:0;margin:16px 0 0;display:flex;flex-wrap:wrap;gap:8px 18px}
.ly-fud li{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:700;color:var(--ink)}
.ly-fud-tick{color:var(--purple)}
.ly-hero-proof{display:flex;align-items:center;gap:11px;margin-top:16px;font-size:16px;font-weight:600;flex-wrap:wrap}
.ly-hero-proof strong{font-weight:800}
.ly-stars{color:var(--gold);letter-spacing:2px;font-size:20px}

/* press */
.ly-press{background:var(--white);border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);padding:22px 0}
.ly-press-lbl{text-align:center;font-family:var(--head);font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 14px}
.ly-press-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:24px}
.ly-press-img{height:22px;width:auto;object-fit:contain;opacity:.5;filter:grayscale(1)}
@media (min-width:700px){ .ly-press-img{height:26px} .ly-press-row{gap:44px} }

/* problem */
.ly-wrong{display:grid;grid-template-columns:1fr;gap:14px;max-width:820px;margin:34px auto 0}
.ly-wrong-card{display:flex;align-items:center;gap:14px;background:var(--lav);border:1px solid var(--hair);border-radius:16px;padding:18px 20px;font-size:18px;font-weight:600;color:var(--ink)}
.ly-wrong-x{width:30px;height:30px;flex:0 0 auto;border-radius:999px;background:#fff;border:1px solid var(--hair);color:var(--pink-accent);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}

/* mechanism chips */
.ly-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;max-width:780px;margin:32px auto 0}
.ly-chip{display:inline-flex;align-items:center;gap:11px;background:var(--white);border:1px solid var(--hair);border-radius:999px;padding:14px 24px;font-family:var(--head);font-size:clamp(17px,2.2vw,19px);font-weight:700;box-shadow:var(--shadow-sm)}
.ly-chip-dot{width:11px;height:11px;border-radius:999px;background:var(--purple);flex:0 0 auto}

/* reveal */
.ly-reveal-line{font-family:var(--head);font-weight:900;font-size:clamp(30px,5.6vw,46px);line-height:1.12;letter-spacing:-.01em;margin:0 auto;max-width:760px}
.ly-reveal-line em{color:#EBBE8E}
.ly-dark-soft{color:#DEC9EE}
.ly-dark-strong{color:#fff;font-weight:800}
.ly-reveal-tile{max-width:330px;margin:32px auto 0;background:#fff;border-radius:22px;padding:20px;box-shadow:0 40px 70px -30px rgba(0,0,0,.55)}
.ly-reveal-tile img{width:100%;height:auto;border-radius:10px}

/* secrets */
.ly-secrets{display:grid;grid-template-columns:1fr;gap:22px;margin-top:38px;text-align:left}
.ly-secret{background:var(--white);border:1px solid var(--hair);border-radius:22px;overflow:hidden;box-shadow:var(--shadow-sm);display:flex;flex-direction:column}
.ly-secret-ph{position:relative;aspect-ratio:4/3;background:linear-gradient(160deg,#F6EDFC,#FBE9F3);display:flex;align-items:center;justify-content:center;padding:16px}
.ly-secret-ph img{width:100%;height:100%;object-fit:contain}
.ly-secret-n{position:absolute;top:12px;left:12px;font-family:var(--head);font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:var(--grad);border-radius:999px;padding:6px 13px;box-shadow:0 8px 18px -8px rgba(91,42,128,.6)}
.ly-secret-in{padding:22px 24px 26px}
.ly-secret-p{font-weight:700;margin:0;font-size:17px;color:var(--ink)}
.ly-secret-b{color:var(--ink-soft);margin:9px 0 0;font-size:16px;line-height:1.55}
.ly-secret-b strong{color:var(--ink)}

/* meet jj */
.ly-jj-grid{display:grid;grid-template-columns:1fr;gap:32px;align-items:center}
.ly-jj-media{position:relative;max-width:440px;margin:0 auto;width:100%}
.ly-jj-img{width:100%;height:auto;border-radius:22px;box-shadow:var(--shadow)}
.ly-jj-badge{position:absolute;right:-4px;bottom:18px;background:#fff;border-radius:16px;box-shadow:var(--shadow-sm);border:1px solid var(--hair);padding:12px 16px;text-align:center;line-height:1}
.ly-jj-num{display:block;font-family:var(--head);font-weight:900;font-size:34px;color:var(--purple);letter-spacing:-.02em}
.ly-jj-badge-lbl{display:block;font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin-top:4px}
.ly-jj-quote{font-style:italic;max-width:520px}
.ly-creds{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:14px}
.ly-creds li{display:flex;gap:14px;align-items:center;font-size:18px;background:var(--white);border:1px solid var(--hair);border-radius:14px;padding:14px 16px;box-shadow:var(--shadow-sm)}
.ly-cred-ico{width:46px;height:46px;flex:0 0 auto;border-radius:12px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center}
.ly-cred-ico svg{width:23px;height:23px}
.ly-jj-press{margin-top:36px}
.ly-marquee{overflow:hidden;margin-top:14px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.ly-marquee-track{display:flex;align-items:center;gap:46px;width:max-content;animation:ly-scroll 26s linear infinite}
.ly-marquee-img{height:28px;width:auto;object-fit:contain;opacity:.55;filter:grayscale(1)}
@keyframes ly-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* offer / package */
.ly-pkg{display:grid;grid-template-columns:1fr;gap:26px;align-items:center;text-align:left;background:var(--white);border:1px solid var(--hair);border-radius:26px;box-shadow:var(--shadow);padding:26px;margin:36px auto 0;max-width:920px}
.ly-pkg-media{background:linear-gradient(160deg,#F6EDFC,#FBE9F3);border-radius:18px;padding:22px;display:flex;align-items:center;justify-content:center}
.ly-pkg-media img{width:100%;height:auto;max-height:320px;object-fit:contain}
.ly-pkg-h{font-family:var(--head);font-weight:800;font-size:19px;margin:0 0 14px}
.ly-ticks{list-style:none;padding:0;margin:0;display:grid;gap:13px}
.ly-ticks li{display:flex;gap:13px;align-items:flex-start;font-size:18px;font-weight:500}
.ly-tick-badge{width:28px;height:28px;flex:0 0 auto;border-radius:999px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center;margin-top:1px}
.ly-price{position:relative;background:linear-gradient(165deg,#FFFFFF, #F7ECFB);border:1.5px solid var(--purple-soft);border-radius:26px;box-shadow:var(--shadow);padding:36px 28px 30px;text-align:center;max-width:460px;margin:26px auto 0}
.ly-price-badge{position:absolute;top:-15px;left:50%;transform:translateX(-50%);background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 18px;border-radius:999px;box-shadow:0 12px 24px -10px rgba(91,42,128,.6);white-space:nowrap}
.ly-price-anchors{display:flex;align-items:center;justify-content:center;gap:12px;font-size:15px;font-weight:600;color:var(--ink-soft)}
.ly-price-dot{color:var(--hair)}
.ly-price-big{display:flex;align-items:baseline;justify-content:center;gap:10px;margin:6px 0 2px}
.ly-price-just{font-family:var(--head);font-size:20px;font-weight:800;color:var(--ink)}
.ly-price-num{font-family:var(--head);font-weight:900;font-size:84px;line-height:1;color:var(--purple);letter-spacing:-.03em}
.ly-price-note{font-size:14px;font-weight:700;letter-spacing:.02em;color:var(--ink-soft);margin:0 0 20px}
.ly-price-just2{font-size:15px;margin:16px auto 0;max-width:380px}

/* checkout */
.ly-checkout{max-width:600px}
.ly-co-card{background:#fff;border:1px solid var(--hair);border-radius:24px;box-shadow:var(--shadow);padding:22px;margin-top:30px}
@media (min-width:560px){ .ly-co-card{padding:32px} }
.ly-co-step{font-family:var(--head);font-weight:800;font-size:19px;margin:0 0 16px;display:flex;align-items:center;gap:11px}
.ly-co-num{width:28px;height:28px;flex:0 0 auto;border-radius:999px;background:var(--grad);color:#fff;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center}
.ly-co-div{height:1px;background:var(--hair);margin:22px 0}
.ly-field{margin-bottom:15px}
.ly-field label{display:block;font-size:14px;font-weight:700;margin-bottom:7px}
.ly-field input{width:100%;font-family:var(--sans);font-size:17px;font-weight:500;padding:15px 15px;border:1.5px solid var(--hair);border-radius:13px;background:#fff;color:var(--ink)}
.ly-field input::placeholder{color:#b6a9c4}
.ly-field input:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 4px var(--purple-soft)}
.ly-field-hint{display:block;font-size:13.5px;color:var(--ink-soft);margin-top:6px;font-weight:600}
.ly-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ly-input-ico{position:relative}
.ly-input-ico .ly-field-lock{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--ink-soft)}
.ly-sum-row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid var(--hair);font-size:16px;font-weight:600}
.ly-sum-total{display:flex;justify-content:space-between;align-items:center;padding-top:16px;font-family:var(--head);font-weight:800;font-size:18px}
.ly-sum-amt{color:var(--purple);font-size:26px}

/* bump */
.ly-bump{display:block;position:relative;border:2px dashed var(--purple);background:var(--purple-soft);border-radius:16px;padding:0;margin:16px 0 4px;cursor:pointer;overflow:hidden;transition:box-shadow .15s,border-color .15s}
.ly-bump.is-on{border-style:solid;box-shadow:0 0 0 3px var(--purple-soft)}
.ly-bump-input{position:absolute;opacity:0;width:0;height:0}
.ly-bump-flag{background:var(--purple);color:#fff;font-family:var(--head);font-weight:800;font-size:12.5px;letter-spacing:.04em;text-transform:uppercase;padding:9px 14px;text-align:center;line-height:1.35}
.ly-bump-flag span{color:#F6C9E4}
.ly-bump-body{display:flex;flex-direction:column;gap:14px;padding:16px}
.ly-bump-img{width:100%;max-width:220px;height:auto;margin:0 auto;border-radius:12px;border:1px solid var(--hair);background:#fff}
.ly-bump-title{font-family:var(--head);font-weight:800;font-size:19px;margin:0 0 4px;color:var(--ink)}
.ly-bump-sub{font-size:15px;font-weight:700;color:var(--pink-accent);margin:0 0 10px;line-height:1.35}
.ly-bump-list{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.ly-bump-list li{display:flex;gap:9px;align-items:flex-start;font-size:15px;line-height:1.45}
.ly-bump-list svg{color:var(--purple);margin-top:3px;flex:0 0 auto}
.ly-bump-price{display:flex;align-items:baseline;gap:10px;margin:13px 0 0}
.ly-bump-now{font-family:var(--head);font-weight:900;font-size:27px;color:var(--purple);line-height:1}
.ly-bump-price s{font-size:15px;font-weight:600}
.ly-bump-add{display:flex;align-items:center;gap:11px;justify-content:center;background:#fff;border-top:2px dashed var(--purple);padding:15px 16px}
.ly-bump.is-on .ly-bump-add{background:var(--purple-soft)}
.ly-bump-check{width:26px;height:26px;flex:0 0 auto;border:2px solid var(--purple);border-radius:8px;background:#fff;color:#fff;display:flex;align-items:center;justify-content:center;transition:background .12s}
.ly-bump.is-on .ly-bump-check{background:var(--purple)}
.ly-bump-check svg{opacity:0;transition:opacity .12s}
.ly-bump.is-on .ly-bump-check svg{opacity:1}
.ly-bump-add-t{font-family:var(--head);font-weight:800;font-size:15.5px;color:var(--purple-deep)}

/* express pay */
.ly-express{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ly-pay{display:flex;align-items:center;justify-content:center;gap:6px;min-height:54px;border-radius:13px;font-weight:700;font-size:17px;border:1.5px solid transparent}
.ly-pay-apple{background:#000;color:#fff}
.ly-pay-google{background:#fff;color:#3c4043;border-color:var(--hair)}
.ly-gpay{display:inline-flex;align-items:center;gap:2px}
.ly-or{display:flex;align-items:center;gap:14px;margin:18px 0;color:var(--ink-soft);font-size:14px;font-weight:600}
.ly-or::before,.ly-or::after{content:"";height:1px;background:var(--hair);flex:1}
.ly-co-submit{margin-top:20px}
.ly-order-trust{display:flex;align-items:center;justify-content:center;gap:8px;color:var(--ink-soft);font-size:13.5px;font-weight:600;margin:14px 0 0;text-align:center;flex-wrap:wrap}

/* guarantee */
.ly-guar-grid{display:grid;grid-template-columns:1fr;gap:26px;align-items:center;justify-items:center;text-align:center}
.ly-guar-img{width:160px;height:auto}
.ly-pills{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;justify-content:center}
.ly-pill{display:inline-flex;align-items:center;gap:7px;background:var(--lav);border:1px solid var(--hair);border-radius:999px;padding:9px 15px;font-size:14px;font-weight:700}
.ly-pill svg{color:var(--purple)}

/* why now */
.ly-whynow-grid{display:grid;grid-template-columns:1fr;gap:22px;align-items:center;margin-top:32px}
.ly-whynow-img{width:100%;max-width:360px;height:auto;margin:0 auto;border-radius:18px}
.ly-costs{display:grid;grid-template-columns:1fr;gap:12px}
.ly-cost{display:flex;align-items:center;gap:14px;background:var(--white);border:1px solid var(--hair);border-radius:16px;padding:18px 20px;font-weight:700;color:var(--ink);text-align:left;box-shadow:var(--shadow-sm)}
.ly-cost-ico{width:44px;height:44px;flex:0 0 auto;border-radius:12px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center}
.ly-cost-ico svg{width:22px;height:22px}
.ly-cost-t{font-size:18px}
.ly-turn{background:linear-gradient(135deg,#FCEAF4,#F1E8FA);border:1px solid var(--hair);border-radius:22px;padding:30px;max-width:780px;margin:26px auto 0;box-shadow:var(--shadow-sm)}

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
.ly-footer{padding:28px 0;text-align:center;color:var(--ink-soft);font-size:14px;background:var(--white);border-top:1px solid var(--hair)}
.ly-sticky{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-top:1px solid var(--hair);box-shadow:0 -10px 30px -12px rgba(74,35,90,.2);transform:translateY(130%);transition:transform .28s cubic-bezier(.32,.72,0,1);padding:11px 16px calc(11px + env(safe-area-inset-bottom,0px))}
.ly-sticky.is-show{transform:translateY(0)}
.ly-sticky-in{display:flex;align-items:center;gap:14px;max-width:1120px;margin:0 auto}
.ly-sticky-lbl{flex:0 0 auto;font-weight:700;font-size:14px}
.ly-sticky-lbl strong{color:var(--purple);font-weight:800}
.ly-sticky-btn{flex:1;font-size:15px;padding:14px 16px;min-height:52px;border-radius:12px}

@media (min-width:860px){
  .ly-band{padding:92px 0}
  .ly-hero{padding-top:52px}
  .ly-hero-grid{grid-template-columns:1.06fr .94fr;gap:48px;align-items:center}
  .ly-hero-copy{order:1}
  .ly-hero-action{order:1;grid-column:1;margin-top:6px}
  .ly-hero-media{order:2;grid-row:1 / span 2;grid-column:2;max-width:440px}
  .ly-wrong{grid-template-columns:1fr 1fr;gap:18px}
  .ly-secrets{grid-template-columns:1fr 1fr 1fr;gap:24px}
  .ly-jj-grid{grid-template-columns:.9fr 1.1fr;gap:52px}
  .ly-pkg{grid-template-columns:.85fr 1.15fr;gap:40px;padding:34px}
  .ly-guar-grid{grid-template-columns:auto 1fr;gap:48px;text-align:left;justify-items:start}
  .ly-whynow-grid{grid-template-columns:1fr 1.1fr;gap:40px;text-align:left}
  .ly-bump-body{flex-direction:row;align-items:flex-start}
  .ly-bump-img{width:130px;margin:0}
  .ly-sticky-btn{flex:0 0 auto;padding:13px 24px}
}
@media (prefers-reduced-motion:reduce){ .lyx *,.ly-marquee-track{transition:none!important;animation:none!important} }
`;
