import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Check, Star, ArrowRight, Phone, MessageCircle, Zap, UtensilsCrossed, Users } from "lucide-react";
import productImage from "@/assets/landing/jj-aftersell-image.png";

export const Route = createFileRoute("/aftersell")({
  head: () => ({
    meta: [
      { title: "One-Time Offer — Personal Coaching with JJ Smith" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Aftersell,
});

// ── Placeholders for the Shopify / Aftersell team ────────────────────────────
// CUSTOMER_NAME → Aftersell merge tag {{ customer.first_name }}
// WAS / NOW → the reduced price ($47/mo) is permanent, not a first-month teaser.
const CUSTOMER_NAME = "Jane";
const WAS = 77;
const NOW = 47;
const SAVE = WAS - NOW;

const INCLUDED: { Icon: React.ComponentType<{ className?: string }>; text: React.ReactNode }[] = [
  { Icon: Phone, text: <><strong>Two 1-on-1 coaching calls a week with JJ&rsquo;s AI Twin</strong> — my exact voice, personality, and coaching.</> },
  { Icon: MessageCircle, text: <><strong>Daily texts to keep you on track</strong> — so you never fall off, even on the hard days.</> },
  { Icon: Zap, text: <><strong>Your reset plan</strong> — built to drop up to 15 lbs in your first 2 weeks.</> },
  { Icon: UtensilsCrossed, text: <><strong>A meal plan around the food you love</strong> — no starving, no bland &ldquo;diet food.&rdquo;</> },
  { Icon: Users, text: <><strong>The Circle of Women</strong> losing the weight right alongside you.</> },
];

function Aftersell() {
  const [secs, setSecs] = useState(5 * 60);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = Math.floor(secs / 60);
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="ups">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      {/* Aftersell native chrome (recreated for context — the app renders this automatically) */}
      <div className="ups-chrome">
        <div className="ups-chrome-in">
          <div className="ups-chrome-num">Order #1369</div>
          <div className="ups-chrome-paid"><CheckCircle2 className="ups-ico-22" /> You&rsquo;ve paid for your order.</div>
          <a className="ups-chrome-link" href="#">View order confirmation ›</a>
        </div>
      </div>

      <main className="ups-main">
        <h1 className="ups-h1">{CUSTOMER_NAME}, here&rsquo;s the missing piece in your weight loss.</h1>

        <div className="ups-alert">
          <span>Your order is confirmed, but you can still add this to it for the next few minutes.</span>
          <span className="ups-timer">{mm}:{ss}</span>
        </div>

        <div className="ups-card">
          <div className="ups-media">
            <img src={productImage} alt="JJ Smith, your personal coach" loading="lazy" />
          </div>

          <div className="ups-info">
            <h2 className="ups-title">Coaching with JJ Smith</h2>

            <div className="ups-rating">
              <span className="ups-stars" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="ups-star" />)}
              </span>
              <span className="ups-rating-txt">Rated 4.9 by women just like you</span>
            </div>

            <div className="ups-price">
              <s>${WAS}</s>
              <b>${NOW}</b>
              <span className="ups-per">/month</span>
              <span className="ups-save">Save ${SAVE}/mo</span>
            </div>
            <div className="ups-perday">That&rsquo;s just <strong>$1.57 a day</strong>, less than your morning coffee ☕</div>

            <p className="ups-lead">Lose up to <span className="ups-hi">15 pounds in your first 30 days</span>, and we keep going together, with food you actually love, until every last pound is gone.</p>

            <div className="ups-incl-h">Here&rsquo;s everything you get:</div>
            <ul className="ups-incl">
              {INCLUDED.map((it, i) => (
                <li key={i}>
                  <span className="ups-incl-ico"><it.Icon className="ups-ico-18" /></span>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>

            <div className="ups-guar"><Check className="ups-ico-16" /> 14-day money-back guarantee · cancel anytime</div>

            <button className="ups-cta" type="button">
              Add to my order · ${NOW}/mo
              <ArrowRight className="ups-ico-20" />
            </button>
            <div className="ups-cta-sub">Just <strong>$1.57 a day</strong> · less than a coffee ☕</div>
            <button className="ups-decline" type="button">Decline this offer</button>
          </div>
        </div>

        <p className="ups-fine"><s>${WAS}</s> ${NOW}/month, this price is only available on this page. Cancel anytime.</p>
      </main>
    </div>
  );
}

const CSS = `
.ups{
  --white:#FFFFFF; --lav:#F3ECFB; --pink:#FCEAF4;
  --ink:#2A2036; --ink-soft:#6C6180; --hair:#EBE1F5;
  --purple:#7C3AA6; --purple-deep:#5B2A80; --purple-soft:#F0E6FA;
  --pink-accent:#C0468C; --mark:#F7D6EA; --gold:#E0A94F;
  --grad:linear-gradient(135deg,#7E36A6 0%,#5B2A80 100%);
  --shadow:0 34px 64px -36px rgba(74,35,90,.44);
  --sans:'DM Sans',-apple-system,'Segoe UI',sans-serif;
  --head:'Montserrat',var(--sans);
  font-family:var(--sans); color:var(--ink); background:var(--white);
  font-size:17px; line-height:1.55; font-weight:500; -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
.ups *{box-sizing:border-box}
.ups img{max-width:100%;display:block}
.ups button{font-family:inherit;cursor:pointer}
.ups a{color:inherit;text-decoration:none}
.ups em{font-style:normal;color:var(--purple);font-weight:800}
.ups strong{font-weight:700;color:var(--ink)}
.ups s{color:var(--ink-soft);text-decoration:line-through;font-weight:600}
.ups :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.ups-mark{background:linear-gradient(180deg,transparent 58%,var(--mark) 58%);padding:0 .06em;border-radius:2px;color:var(--purple-deep)}
.ups-hi{color:var(--purple)}
.ups-ico-22{width:22px;height:22px} .ups-ico-20{width:20px;height:20px} .ups-ico-18{width:18px;height:18px} .ups-ico-16{width:16px;height:16px}

/* Aftersell chrome */
.ups-chrome{border-bottom:1px solid var(--hair);background:var(--white)}
.ups-chrome-in{max-width:1040px;margin:0 auto;padding:20px;text-align:center}
.ups-chrome-num{font-size:14px;color:var(--ink-soft);font-weight:600}
.ups-chrome-paid{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:6px;font-family:var(--head);font-weight:800;font-size:20px;color:var(--ink)}
.ups-chrome-paid svg{color:var(--purple)}
.ups-chrome-link{display:inline-block;margin-top:6px;color:var(--purple);font-weight:600;font-size:14px}

/* ── DESKTOP (base) — mirrors the Aftersell layout: left-aligned copy, image | info row ── */
.ups-main{max-width:1040px;margin:0 auto;padding:34px 28px 80px}
.ups-h1{font-family:var(--head);font-weight:700;font-size:36px;line-height:1.2;letter-spacing:-.01em;color:var(--ink);text-align:left;margin:0;max-width:920px}

.ups-alert{margin:22px 0 0;background:var(--pink);border:1px solid #F4D3E6;border-radius:16px;padding:15px 22px;display:flex;align-items:center;justify-content:center;gap:20px}
.ups-alert>span:first-child{color:#8A3A66;font-weight:600;font-size:15.5px}
.ups-timer{flex:0 0 auto;font-family:var(--head);font-weight:900;font-size:27px;color:var(--pink-accent);letter-spacing:.02em;font-variant-numeric:tabular-nums}

.ups-card{margin-top:26px;background:var(--white);border:1px solid var(--hair);border-radius:24px;box-shadow:var(--shadow);padding:30px;display:grid;grid-template-columns:minmax(0,460px) minmax(0,1fr);gap:38px;align-items:start}
.ups-media{border-radius:18px;overflow:hidden;background:var(--lav);aspect-ratio:1/1}
.ups-media img{width:100%;height:100%;object-fit:cover;object-position:center 20%}
.ups-info{min-width:0}
.ups-title{font-family:var(--head);font-weight:800;font-size:27px;line-height:1.16;letter-spacing:-.01em;margin:0}

.ups-rating{display:flex;align-items:center;gap:8px;margin-top:11px}
.ups-stars{display:inline-flex;gap:1px}
.ups-star{width:17px;height:17px;fill:var(--gold);color:var(--gold)}
.ups-rating-txt{font-size:14px;font-weight:600;color:var(--ink-soft)}

.ups-price{display:flex;align-items:baseline;flex-wrap:wrap;gap:9px;margin-top:15px}
.ups-price s{font-family:var(--head);font-weight:700;font-size:21px}
.ups-price b{font-family:var(--head);font-weight:900;font-size:40px;color:var(--purple-deep);letter-spacing:-.02em}
.ups-per{font-size:15px;font-weight:600;color:var(--ink-soft)}
.ups-save{background:var(--purple-soft);color:var(--purple-deep);font-family:var(--head);font-weight:800;font-size:13px;padding:6px 12px;border-radius:999px}
.ups-perday{margin-top:9px;font-size:15px;font-weight:600;color:var(--ink-soft)}
.ups-perday strong{color:var(--purple-deep);font-weight:800}

.ups-lead{margin:18px 0 0;font-size:20px;line-height:1.42;font-weight:700;color:var(--ink)}
.ups-desc{margin:12px 0 0;font-size:15.5px;line-height:1.6;color:var(--ink-soft)}

.ups-incl-h{margin-top:22px;font-family:var(--head);font-weight:800;font-size:15px;letter-spacing:.02em;color:var(--ink)}
.ups-incl{list-style:none;margin:12px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
.ups-incl li{display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5;color:var(--ink-soft)}
.ups-incl-ico{flex:0 0 auto;width:34px;height:34px;border-radius:10px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center;margin-top:1px}

.ups-guar{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:24px;padding:11px;border:1px dashed var(--hair);border-radius:12px;font-weight:700;font-size:14px;color:var(--purple-deep)}
.ups-guar svg{color:var(--purple)}

.ups-cta{width:100%;margin-top:16px;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:19px;border:0;padding:19px 24px;border-radius:14px;box-shadow:0 16px 34px -12px rgba(91,42,128,.5);transition:transform .15s,box-shadow .15s,filter .15s}
.ups-cta:hover{transform:translateY(-1px);filter:brightness(1.04);box-shadow:0 22px 40px -14px rgba(91,42,128,.55)}
.ups-cta-sub{text-align:center;margin-top:11px;font-size:14px;font-weight:600;color:var(--ink-soft)}
.ups-cta-sub strong{color:var(--purple-deep);font-weight:800}
.ups-decline{display:block;width:100%;margin-top:14px;background:none;border:0;color:var(--ink-soft);font-weight:600;font-size:15px;text-decoration:underline;text-underline-offset:3px}
.ups-decline:hover{color:var(--ink)}

.ups-fine{margin:20px 0 0;max-width:640px;font-size:12.5px;line-height:1.5;color:var(--ink-soft)}
.ups-fine s{font-size:12.5px}

/* ── MOBILE ─────────────────────────────────────────────────────────────── */
@media (max-width:759px){
  .ups{font-size:16px}
  .ups-main{padding:26px 18px 60px}
  .ups-h1{font-size:27px;text-align:left}
  .ups-alert{flex-direction:column;gap:8px;text-align:center;padding:15px 18px}
  .ups-card{display:block;padding:18px;border-radius:20px}
  .ups-media{margin-bottom:20px;aspect-ratio:4/3}
  .ups-media img{object-position:center 26%}
  .ups-title{font-size:22px}
  .ups-price b{font-size:34px}
  .ups-save{margin-left:0}
  .ups-lead{font-size:18px}
}
`;
