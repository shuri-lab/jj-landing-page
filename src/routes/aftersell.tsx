import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Star, ShoppingCart, DollarSign, Gift, BadgeCheck } from "lucide-react";
import coachingImage from "@/assets/landing/aftersell-coaching-image.png";

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
const WAS = "78.33";
const NOW = "47.00";
const SAVE_PCT = "40%";

const INCLUDED: React.ReactNode[] = [
  <>Two 1-on-1 coaching calls a week with JJ&rsquo;s AI Twin, my exact voice, personality, and coaching.</>,
  <>Daily texts to keep you on track, so you never fall off, even on the hard days.</>,
  <>A meal plan around the food you love, no starving, no bland &ldquo;diet food.&rdquo;</>,
  <>Your jumpstart plan, designed to help you drop up to 15 lbs in your first 2 weeks.</>,
  <>The Circle of Women losing the weight right alongside you.</>,
];

function Aftersell() {
  const [secs, setSecs] = useState(5 * 60);
  const [agreed, setAgreed] = useState(false);
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" />
      <style>{CSS}</style>

      {/* Checkout progress — Aftersell renders this natively; recreated for context */}
      <div className="ups-steps">
        <div className="ups-steps-in">
          <span className="ups-node"><ShoppingCart className="ups-ico-24" /></span>
          <span className="ups-line" />
          <span className="ups-node circle"><DollarSign className="ups-ico-20" /></span>
          <span className="ups-line" />
          <span className="ups-node gift"><Gift className="ups-ico-26" /></span>
          <span className="ups-line todo" />
          <span className="ups-node todo"><BadgeCheck className="ups-ico-26" /></span>
        </div>
      </div>

      <main className="ups-main">
        <h1 className="ups-h1">
          {CUSTOMER_NAME}, <span className="ups-green">You&rsquo;re Ready to Lose the Weight. Now Let&rsquo;s Make Sure It Stays Off.</span>
        </h1>

        <p className="ups-sub"><em>Research Shows</em>: 92% of women won&rsquo;t reach their goal weight without personalized support.</p>

        <div className="ups-alert">
          Your order is confirmed, but you can still add the following for a limited time: <span className="ups-timer">{mm}:{ss}</span>
        </div>

        <div className="ups-card">
          <div className="ups-media">
            <img src={coachingImage} alt="You shouldn't have to choose between weight loss and food you love — get a personalized plan from JJ Smith" loading="lazy" />
          </div>

          <div className="ups-info">
            <h2 className="ups-title">Meet JJ&rsquo;s Personalized Weight Loss Coaching</h2>

            <div className="ups-price">
              <s>$ {WAS}</s>
              <b>$ {NOW}</b>
              <span className="ups-per">/month</span>
              <span className="ups-savepct">(Save {SAVE_PCT})</span>
              <span className="ups-new"><Star className="ups-ico-13" /> New</span>
            </div>
            <div className="ups-perday">That&rsquo;s just $1.57 a day, less than your morning coffee ☕</div>

            <p className="ups-para">You&rsquo;ve got the products. But the products don&rsquo;t call you on a hard day. They don&rsquo;t talk you off the ledge when cravings hit. And they don&rsquo;t adjust your plan when the scale stalls. But JJ does.</p>

            <p className="ups-lead">Lose up to <span className="ups-red">15 pounds in your first 30 days</span>, and we keep going together, with food you actually love, until every last pound is gone.</p>

            <div className="ups-incl-h">Here&rsquo;s everything you get:</div>
            <ul className="ups-incl">
              {INCLUDED.map((text, i) => (
                <li key={i}>
                  <Check className="ups-check" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="ups-free-h">YOUR FIRST 10 POUNDS ARE ON US!</div>
            <div className="ups-free-sub"><em>Lose 10 pounds &ndash; or your month is FREE. *</em></div>

            <div className="ups-deliver">Deliver every month</div>

            <label className="ups-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I understand that I&rsquo;m agreeing to a subscription. It will renew at the price and frequency listed until it ends or is canceled.</span>
            </label>

            <div className="ups-guar">14-Day Money-Back Guarantee &middot; Cancel Anytime</div>

            <button className="ups-cta" type="button" disabled={!agreed}>
              {agreed ? <>Continue &middot; $ {NOW} USD</> : <>Accept Terms Before Continuing &middot; $ {NOW} USD</>}
            </button>
            <button className="ups-decline" type="button">Decline this offer</button>
          </div>
        </div>
      </main>
    </div>
  );
}

const CSS = `
.ups{
  --white:#FFFFFF;
  --ink:#1C1C1E; --ink-soft:#6B7280; --hair:#E7E7EA;
  --green:#2E9E4F; --green-deep:#1F8A41;
  --red:#E23A2E;
  --pink-bg:#FDEBF2; --pink-line:#F5CFE0; --pink-txt:#7C2B54;
  --badge-bg:#F8DAEC; --badge-txt:#B23A80;
  --gray-cta:#C9CACC;
  --sans:'DM Sans',-apple-system,'Segoe UI',sans-serif;
  font-family:var(--sans); color:var(--ink); background:var(--white);
  font-size:17px; line-height:1.55; font-weight:500; -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
.ups *{box-sizing:border-box}
.ups img{max-width:100%;display:block}
.ups button{font-family:inherit;cursor:pointer}
.ups s{color:var(--ink-soft);text-decoration:line-through;font-weight:600}
.ups em{font-style:italic}
.ups :focus-visible{outline:3px solid var(--green);outline-offset:3px}
.ups-green{color:var(--green)}
.ups-red{color:var(--red);font-weight:800}
.ups-ico-26{width:26px;height:26px} .ups-ico-24{width:24px;height:24px} .ups-ico-20{width:20px;height:20px} .ups-ico-13{width:13px;height:13px}

/* ── Checkout progress bar ─────────────────────────────────────────────── */
.ups-steps{border-bottom:1px solid var(--hair);background:var(--white)}
.ups-steps-in{max-width:1040px;margin:0 auto;padding:30px 36px 22px;display:flex;align-items:center;gap:0}
.ups-line{flex:1 1 auto;height:4px;border-radius:2px;background:var(--ink)}
.ups-line.todo{background:#DEDEE2}
.ups-node{flex:0 0 auto;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.ups-node.circle{width:34px;height:34px;border-radius:999px;background:var(--ink);color:#fff}
.ups-node.gift{transform:translateY(-15px)}
.ups-node.todo{color:#C4C4C8}

/* ── Header ─────────────────────────────────────────────────────────────── */
.ups-main{max-width:1040px;margin:0 auto;padding:34px 36px 80px}
.ups-h1{font-weight:700;font-size:38px;line-height:1.18;letter-spacing:-.015em;color:var(--ink);text-align:center;margin:0 auto;max-width:960px}
.ups-sub{text-align:center;margin:20px auto 0;max-width:820px;font-size:24px;line-height:1.35;font-weight:600;color:var(--ink)}
.ups-sub em{font-style:italic;font-weight:800}

.ups-alert{margin:26px 0 0;background:var(--pink-bg);border:1px solid var(--pink-line);border-radius:14px;padding:18px 24px;text-align:center;font-size:18px;font-weight:600;color:var(--ink)}
.ups-timer{font-weight:800;color:var(--ink);font-variant-numeric:tabular-nums}

/* ── Card: tall image on the left, all copy on the right ─────────────────── */
.ups-card{margin-top:30px;display:grid;grid-template-columns:minmax(0,480px) minmax(0,1fr);gap:48px;align-items:start}
.ups-media{border-radius:16px;overflow:hidden}
.ups-media img{width:100%;height:auto}
.ups-info{min-width:0;padding-top:4px}
.ups-title{font-weight:700;font-size:34px;line-height:1.18;letter-spacing:-.01em;margin:0}

.ups-price{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px}
.ups-price s{font-size:22px}
.ups-price b{font-weight:700;font-size:26px;color:var(--ink)}
.ups-per{font-size:18px;font-weight:600;color:var(--ink)}
.ups-savepct{font-size:18px;font-weight:700;color:var(--green)}
.ups-new{display:inline-flex;align-items:center;gap:5px;background:var(--badge-bg);color:var(--badge-txt);font-weight:700;font-size:14px;padding:5px 12px;border-radius:999px}
.ups-new svg{fill:currentColor}
.ups-perday{margin-top:10px;font-size:18px;font-weight:500;color:var(--ink)}

.ups-para{margin:18px 0 0;font-size:19px;line-height:1.5;color:var(--ink)}
.ups-lead{margin:22px 0 0;font-size:19px;line-height:1.5;color:var(--ink)}

.ups-incl-h{margin-top:24px;font-weight:600;font-size:19px;color:var(--ink)}
.ups-incl{list-style:none;margin:16px 0 0;padding:0;display:flex;flex-direction:column;gap:16px}
.ups-incl li{display:flex;gap:12px;align-items:flex-start;font-size:18px;line-height:1.45;color:var(--ink)}
.ups-check{flex:0 0 auto;width:22px;height:22px;margin-top:1px;color:var(--ink);stroke-width:2.5}

.ups-free-h{margin-top:28px;font-weight:800;font-size:22px;letter-spacing:.01em;color:var(--green)}
.ups-free-sub{margin-top:10px;font-size:20px;font-weight:800;color:var(--green)}
.ups-free-sub em{font-style:italic}

.ups-deliver{margin-top:22px;font-size:15px;font-weight:500;color:var(--ink-soft)}

.ups-agree{display:flex;gap:12px;align-items:flex-start;margin-top:22px;font-size:16px;line-height:1.5;color:var(--ink)}
.ups-agree input{flex:0 0 auto;width:22px;height:22px;margin-top:1px;accent-color:var(--green);cursor:pointer}
.ups-guar{margin-top:20px;font-weight:700;font-size:18px;color:var(--ink)}

.ups-cta{width:100%;margin-top:18px;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--gray-cta);color:#fff;font-weight:700;font-size:20px;border:0;padding:20px 24px;border-radius:12px;transition:background .15s,transform .15s,box-shadow .15s;cursor:not-allowed}
.ups-cta:not(:disabled){background:linear-gradient(135deg,#33B15A 0%,#1F8A41 100%);box-shadow:0 16px 34px -14px rgba(31,138,65,.5);cursor:pointer}
.ups-cta:not(:disabled):hover{transform:translateY(-1px);filter:brightness(1.03)}
.ups-decline{display:block;margin:16px auto 0;background:none;border:0;color:var(--ink);font-weight:600;font-size:17px}
.ups-decline:hover{text-decoration:underline;text-underline-offset:3px}

/* ── Mobile ─────────────────────────────────────────────────────────────── */
@media (max-width:759px){
  .ups{font-size:16px}
  .ups-steps-in{padding:22px 22px 18px}
  .ups-main{padding:26px 20px 64px}
  .ups-h1{font-size:27px}
  .ups-sub{font-size:19px;margin-top:16px}
  .ups-alert{font-size:16px;padding:15px 18px}
  .ups-card{display:block}
  .ups-media{margin-bottom:26px}
  .ups-title{font-size:26px}
  .ups-price b{font-size:24px}
  .ups-para,.ups-lead,.ups-incl li,.ups-incl-h,.ups-perday{font-size:17px}
  .ups-free-h{font-size:20px}
  .ups-free-sub{font-size:18px}
}
`;
