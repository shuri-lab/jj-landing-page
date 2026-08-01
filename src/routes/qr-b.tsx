import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import bottle from "@/assets/landing/liver-focus.png";

export const Route = createFileRoute("/qr-b")({
  head: () => ({
    meta: [
      { title: "Your 7-Day Starter Plan from JJ Smith" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Answer three quick questions and get your personalized 7-day starter plan from JJ Smith, built around your Liver Focus." },
    ],
  }),
  component: SupB,
});

const SUPPLEMENT = "Liver Focus";

// ── quiz content ─────────────────────────────────────────────────────────────
const Q1 = {
  n: "1 of 3",
  q: "What would make the biggest difference for you right now?",
  options: ["Lose weight", "Reduce belly fat", "Have more energy", "Feel comfortable in my clothes again"],
};
const Q2 = {
  n: "2 of 3",
  q: "How much weight would you like to lose?",
  options: ["Under 15 lbs", "15 to 30 lbs", "30 to 50 lbs", "More than 50 lbs", "I'm not sure, I just don't feel like me"],
};
const Q3 = {
  n: "3 of 3",
  q: "What usually gets in your way?",
  options: ["I'm not sure what to eat", "Cravings or emotional eating", "My schedule is too busy", "I start strong but struggle to stay consistent", "What used to work doesn't work anymore"],
};

const DESIRE_PHRASE: Record<string, string> = {
  "Lose weight": "lose the weight for good",
  "Reduce belly fat": "target that stubborn belly fat",
  "Have more energy": "get your energy back",
  "Feel comfortable in my clothes again": "feel comfortable in your clothes again",
};
const WEIGHT_PHRASE: Record<string, string> = {
  "Under 15 lbs": "Your target is under 15 pounds, which is very doable in your first stretch.",
  "15 to 30 lbs": "Your target is 15 to 30 pounds, and a steady pace gets you there.",
  "30 to 50 lbs": "Your target is 30 to 50 pounds. We go one win at a time.",
  "More than 50 lbs": "Your target is more than 50 pounds. This is a journey, and you never do it alone.",
  "I'm not sure, I just don't feel like me": "You are not sure of a number, and that is okay. The real goal is feeling like you again.",
};
const CHALLENGE_LABEL: Record<string, string> = {
  "I'm not sure what to eat": "Not knowing what to eat",
  "Cravings or emotional eating": "Cravings and emotional eating",
  "My schedule is too busy": "A schedule that is too busy",
  "I start strong but struggle to stay consistent": "Starting strong but losing consistency",
  "What used to work doesn't work anymore": "The old rules no longer working",
};
const STRATEGY: Record<string, string> = {
  "I'm not sure what to eat": "You do not need a perfect diet, you need a plan you do not have to think about. For the next seven days, repeat two simple meals you already like so eating becomes easy and automatic.",
  "Cravings or emotional eating": "Cravings are not a willpower problem. Keep your blood sugar steady with protein at every meal and one planned snack, so the urge never builds. Your Liver Focus supports this by helping your body work with you.",
  "My schedule is too busy": "Busy is fine. We make this fit your life, not the other way around. Prep once, keep meals low effort, and take your win earlier in the day before the day runs away with you.",
  "I start strong but struggle to stay consistent": "Consistency beats intensity. The goal this week is not to be perfect, it is to show up. Small daily checks keep you moving so one off day never turns into an off month.",
  "What used to work doesn't work anymore": "Your body changed, so the plan changes with it. We work with your hormones and metabolism now instead of against them, which is exactly why the old rules stopped working.",
};
const CHECKLIST = [
  `Take your ${SUPPLEMENT} as directed`,
  "Protein with every meal",
  "8 glasses of water",
  "A 10 minute walk after your biggest meal",
  "No eating in the 3 hours before bed",
  "One planned snack to stay ahead of cravings",
  "Check in with yourself: how do you feel today?",
];

function Mark({ children }: { children: React.ReactNode }) { return <span className="sb-mark">{children}</span>; }
function Hi({ children }: { children: React.ReactNode }) { return <span className="sb-hi">{children}</span>; }
function Check({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden><path d="M4 12.5l5 5L20 6.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

type Answers = { desired: string; weight: string; challenge: string };

function SupB() {
  const [step, setStep] = useState(0); // 0 welcome, 1-3 questions, 4 email, 5 result+offer
  const [answers, setAnswers] = useState<Answers>({ desired: "", weight: "", challenge: "" });
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState("");
  const [copied, setCopied] = useState(false);

  function pick(field: keyof Answers, value: string) {
    if (pending) return;
    setAnswers((a) => ({ ...a, [field]: value }));
    setPending(value);
    window.setTimeout(() => { setPending(null); setStep((s) => s + 1); window.scrollTo({ top: 0 }); }, 170);
  }
  function goto(s: number) { setStep(s); window.scrollTo({ top: 0 }); }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { setEmailErr("Please add your first name."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setEmailErr("Please add a valid email."); return; }
    setEmailErr("");
    goto(5);
  }

  return (
    <div className="sb">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      <div className="sb-announce">
        <span className="sb-announce-star" aria-hidden>✦</span> 14-Day Money Back Guarantee
      </div>
      <header className="sb-header">
        <img src={jjSmithLogo} alt="JJ Smith" className="sb-logo" />
      </header>

      {step === 0 && <Welcome onStart={() => goto(1)} />}
      {step === 1 && <Question data={Q1} value={answers.desired} pending={pending} onPick={(v) => pick("desired", v)} />}
      {step === 2 && <Question data={Q2} value={answers.weight} pending={pending} onPick={(v) => pick("weight", v)} onBack={() => goto(1)} />}
      {step === 3 && <Question data={Q3} value={answers.challenge} pending={pending} onPick={(v) => pick("challenge", v)} onBack={() => goto(2)} />}
      {step === 4 && (
        <EmailStep firstName={firstName} email={email} err={emailErr} setFirstName={setFirstName} setEmail={setEmail} onSubmit={submitEmail} onBack={() => goto(3)} />
      )}
      {step === 5 && <Result name={firstName || "Friend"} answers={answers} copied={copied} onCopy={() => setCopied(true)} />}
    </div>
  );
}

// ── screen 1 ─────────────────────────────────────────────────────────────────
function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <main className="sb-quiz sb-welcome">
      <div className="sb-eyebrow">Exclusive for {SUPPLEMENT} customers</div>
      <div className="sb-welcome-bottle"><img src={bottle} alt={`${SUPPLEMENT} bottle`} /></div>
      <h1 className="sb-h1">You&rsquo;ve got {SUPPLEMENT}. Now let&rsquo;s <Mark>build the right plan</Mark> around it.</h1>
      <p className="sb-sub">Answer three quick questions and get your personalized 7-day starter plan from JJ.</p>
      <button className="sb-cta" onClick={onStart}>Build my plan <span className="sb-cta-arw" aria-hidden>→</span></button>
      <p className="sb-micro">Takes about 60 seconds. No purchase required.</p>
    </main>
  );
}

// ── screens 2 to 4 ───────────────────────────────────────────────────────────
function Question({ data, value, pending, onPick, onBack }: { data: typeof Q1; value: string; pending: string | null; onPick: (v: string) => void; onBack?: () => void }) {
  const total = 3;
  const idx = Number(data.n.split(" ")[0]);
  return (
    <main className="sb-quiz">
      <div className="sb-progress">
        <div className="sb-progress-top">
          {onBack ? <button className="sb-back" onClick={onBack} aria-label="Back">←</button> : <span />}
          <span className="sb-progress-n">{data.n}</span>
          <span />
        </div>
        <div className="sb-progress-bar"><span style={{ width: `${(idx / total) * 100}%` }} /></div>
      </div>
      <h1 className="sb-h2">{data.q}</h1>
      <div className="sb-options">
        {data.options.map((o) => {
          const on = pending ? pending === o : value === o;
          return (
            <button key={o} className={`sb-option ${on ? "is-on" : ""}`} onClick={() => onPick(o)} type="button">
              <span className="sb-option-tick"><Check className="sb-ico-14" /></span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

// ── screen 5 ─────────────────────────────────────────────────────────────────
function EmailStep({ firstName, email, err, setFirstName, setEmail, onSubmit, onBack }: {
  firstName: string; email: string; err: string; setFirstName: (v: string) => void; setEmail: (v: string) => void; onSubmit: (e: React.FormEvent) => void; onBack: () => void;
}) {
  return (
    <main className="sb-quiz">
      <div className="sb-progress">
        <div className="sb-progress-top">
          <button className="sb-back" onClick={onBack} aria-label="Back">←</button>
          <span className="sb-progress-n">Almost there</span>
          <span />
        </div>
        <div className="sb-progress-bar"><span style={{ width: "100%" }} /></div>
      </div>
      <h1 className="sb-h2">Your personalized plan is ready.</h1>
      <p className="sb-sub sb-sub-tight">Tell JJ where to send it.</p>
      <form className="sb-form" onSubmit={onSubmit}>
        <label className="sb-field">
          <span>First name</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" autoComplete="given-name" />
        </label>
        <label className="sb-field">
          <span>Email used for your JJ Smith order</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </label>
        {err ? <p className="sb-err">{err}</p> : null}
        <button className="sb-cta sb-cta-full" type="submit">Send my plan <span className="sb-cta-arw" aria-hidden>→</span></button>
        <p className="sb-micro">Your plan appears on the next screen and lands in your inbox.</p>
      </form>
    </main>
  );
}

// ── screen 6: personalized result (with bridge CTA to the offer) ─────────────
function Result({ name, answers, copied, onCopy }: { name: string; answers: Answers; copied: boolean; onCopy: () => void }) {
  const desire = DESIRE_PHRASE[answers.desired] || "feel like yourself again";
  const weightLine = WEIGHT_PHRASE[answers.weight] || "";
  const challengeLabel = CHALLENGE_LABEL[answers.challenge] || "Staying consistent";
  const strategy = STRATEGY[answers.challenge] || STRATEGY["I start strong but struggle to stay consistent"];

  return (
    <main className="sb-result">
      <span className="sb-eyebrow">Your 7-day starter plan</span>
      <h1 className="sb-h1">{name}, here&rsquo;s your <Hi>7-day starter plan</Hi>.</h1>

      <div className="sb-card">
        <div className="sb-block">
          <span className="sb-block-lbl">Your goal</span>
          <p className="sb-block-lead">Your focus is to <strong>{desire}</strong>.</p>
          {weightLine ? <p className="sb-block-t">{weightLine}</p> : null}
        </div>

        <div className="sb-block">
          <span className="sb-block-lbl">Your biggest challenge</span>
          <p className="sb-block-lead">{challengeLabel}.</p>
          <p className="sb-block-t">You are not the problem. The right plan makes this the easy part.</p>
        </div>

        <div className="sb-block">
          <span className="sb-block-lbl">Your focus for the next seven days</span>
          <div className="sb-focus">
            <div className="sb-focus-item"><strong>Food</strong><span>Build every meal around protein and vegetables you enjoy, and take your {SUPPLEMENT} daily as directed.</span></div>
            <div className="sb-focus-item"><strong>Movement</strong><span>One 10 minute walk after your biggest meal. Joint-friendly, no gym required.</span></div>
            <div className="sb-focus-item"><strong>Consistency</strong><span>Use the checklist below. Showing up beats being perfect, every single day.</span></div>
          </div>
        </div>

        <div className="sb-block">
          <span className="sb-block-lbl">Your personal strategy</span>
          <p className="sb-block-t sb-strategy">{strategy}</p>
        </div>

        <div className="sb-block">
          <span className="sb-block-lbl">Your 7-day checklist</span>
          <ul className="sb-check">
            {CHECKLIST.map((c) => (
              <li key={c}><span className="sb-check-box"><Check className="sb-ico-13" /></span>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <button className={`sb-btn-ghost ${copied ? "is-done" : ""}`} onClick={onCopy} type="button">
        {copied ? "Copy sent to your inbox" : "Email me a copy"}
      </button>

      <div className="sb-bridge">
        <span className="sb-eyebrow">Your next step</span>
        <h2 className="sb-h2 sb-bridge-h">Start with 7 days. <Hi>Keep going with JJ until it&rsquo;s all gone.</Hi></h2>
        <p className="sb-block-t sb-bridge-t">This starter plan gets you moving. When you are ready, JJ builds the complete plan around your life, calls you twice a week, and texts you every day, and your next {SUPPLEMENT} bottle is on her.</p>
        <a className="sb-cta sb-cta-full" href="/qr-a">See how JJ keeps you going <span className="sb-cta-arw" aria-hidden>→</span></a>
        <p className="sb-micro">14-day money-back guarantee</p>
      </div>
    </main>
  );
}


const CSS = `
.sb{
  --white:#FFFFFF; --cream:#FBF6F0; --lav:#F3ECFB; --pink:#FCEAF4;
  --ink:#2A2036; --ink-soft:#6C6180; --hair:#EBE1F5;
  --purple:#7C3AA6; --purple-deep:#5B2A80; --purple-soft:#F0E6FA;
  --pink-accent:#C0468C; --mark:#F7D6EA; --gold:#E0A94F;
  --grad:linear-gradient(135deg,#7E36A6 0%,#5B2A80 100%);
  --shadow:0 34px 64px -36px rgba(74,35,90,.44);
  --shadow-sm:0 18px 38px -26px rgba(74,35,90,.4);
  --sans:'DM Sans',-apple-system,'Segoe UI',sans-serif;
  --head:'Montserrat',var(--sans);
  font-family:var(--sans);color:var(--ink);background:var(--white);
  font-size:17px;line-height:1.55;font-weight:500;-webkit-font-smoothing:antialiased;
  overflow-x:hidden;width:100%;max-width:100vw;min-height:100vh;
}
.sb *{box-sizing:border-box}
.sb img{max-width:100%;display:block}
.sb button{font-family:inherit;cursor:pointer}
.sb a{color:inherit;text-decoration:none}
.sb strong{font-weight:700;color:var(--ink)}
.sb s{color:var(--ink-soft);text-decoration:line-through;font-weight:600}
.sb :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.sb-mark{background:linear-gradient(180deg,transparent 58%, var(--mark) 58%);padding:0 .06em;border-radius:2px;color:var(--purple-deep)}
.sb-hi{color:var(--purple)}
.sb-ico-16{width:16px;height:16px} .sb-ico-14{width:14px;height:14px} .sb-ico-13{width:13px;height:13px}

.sb-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff;text-align:center;font-family:var(--head);font-weight:800;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;padding:8px 16px}
.sb-announce-star{opacity:.85;margin-right:5px}
.sb-header{display:flex;justify-content:center;align-items:center;padding:14px 20px;border-bottom:1px solid var(--hair);background:#fff;position:sticky;top:0;z-index:20}
.sb-logo{height:30px;width:auto}

/* quiz shell */
.sb-quiz{max-width:600px;margin:0 auto;padding:30px 22px 60px;display:flex;flex-direction:column;align-items:center;text-align:center;min-height:calc(100vh - 90px)}
.sb-eyebrow{display:inline-block;font-family:var(--head);font-weight:800;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--purple);margin-bottom:16px}
.sb-h1{font-family:var(--head);font-weight:900;font-size:clamp(30px,7vw,44px);line-height:1.1;letter-spacing:-.02em;margin:0}
.sb-h2{font-family:var(--head);font-weight:800;font-size:clamp(23px,5.4vw,32px);line-height:1.18;letter-spacing:-.01em;margin:0 0 24px;max-width:560px}
.sb-sub{margin:16px auto 26px;max-width:460px;font-size:18px;line-height:1.5;font-weight:500;color:var(--ink-soft)}
.sb-sub-tight{margin:12px auto 22px}

.sb-welcome{justify-content:center}
.sb-welcome-bottle{margin:6px auto 22px;width:150px}
.sb-welcome-bottle img{width:100%;filter:drop-shadow(0 24px 34px rgba(74,35,90,.28))}

.sb-cta{display:inline-flex;align-items:center;justify-content:center;gap:9px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:18px;border:0;padding:18px 34px;border-radius:14px;box-shadow:0 16px 34px -12px rgba(91,42,128,.5);transition:transform .15s,filter .15s;line-height:1.1}
.sb a.sb-cta{color:#fff}
.sb-cta:hover{transform:translateY(-1px);filter:brightness(1.05)}
.sb-cta-full{width:100%;max-width:440px;text-decoration:none}
.sb-cta-arw{font-size:1.15em;line-height:1}
.sb-micro{margin:14px 0 0;font-size:13.5px;color:var(--ink-soft);font-weight:600}

/* progress */
.sb-progress{width:100%;max-width:520px;margin-bottom:26px}
.sb-progress-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sb-progress-n{font-family:var(--head);font-weight:800;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--purple)}
.sb-back{background:none;border:0;color:var(--ink-soft);font-size:22px;line-height:1;padding:0 6px;font-weight:700}
.sb-progress-bar{height:6px;border-radius:999px;background:var(--purple-soft);overflow:hidden}
.sb-progress-bar span{display:block;height:100%;background:var(--grad);border-radius:999px;transition:width .3s ease}

/* options */
.sb-options{display:flex;flex-direction:column;gap:12px;width:100%;max-width:520px}
.sb-option{display:flex;align-items:center;gap:14px;text-align:left;background:#fff;border:1.5px solid var(--hair);border-radius:16px;padding:18px 20px;font-size:17px;font-weight:600;color:var(--ink);transition:border-color .15s,background .15s,transform .1s}
.sb-option:hover{border-color:var(--purple)}
.sb-option.is-on{border-color:var(--purple);background:var(--purple-soft)}
.sb-option-tick{flex:0 0 auto;width:26px;height:26px;border-radius:999px;border:2px solid var(--hair);color:transparent;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sb-option.is-on .sb-option-tick{background:var(--grad);border-color:transparent;color:#fff}

/* email form */
.sb-form{width:100%;max-width:440px;display:flex;flex-direction:column;gap:16px}
.sb-field{display:flex;flex-direction:column;gap:7px;text-align:left}
.sb-field span{font-family:var(--head);font-weight:700;font-size:13.5px;color:var(--ink)}
.sb-field input{width:100%;border:1.5px solid var(--hair);border-radius:12px;padding:14px 16px;font-size:16px;font-family:inherit;color:var(--ink);background:#fff}
.sb-field input:focus{outline:none;border-color:var(--purple);box-shadow:0 0 0 3px rgba(124,58,166,.14)}
.sb-err{color:var(--pink-accent);font-weight:700;font-size:14px;margin:0}

/* result */
.sb-result{max-width:640px;margin:0 auto;padding:32px 22px 20px;text-align:center}
.sb-card{margin-top:26px;background:#fff;border:1px solid var(--hair);border-radius:24px;box-shadow:var(--shadow);padding:8px 22px 22px;text-align:left}
.sb-block{padding:22px 0;border-bottom:1px solid var(--hair)}
.sb-block:last-child{border-bottom:0}
.sb-block-lbl{display:inline-block;font-family:var(--head);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--purple);margin-bottom:10px}
.sb-block-lead{margin:0;font-size:19px;font-weight:600;line-height:1.4;color:var(--ink)}
.sb-block-t{margin:8px 0 0;font-size:16px;line-height:1.55;color:var(--ink-soft)}
.sb-strategy{font-size:16.5px}
.sb-focus{display:flex;flex-direction:column;gap:14px;margin-top:4px}
.sb-focus-item{display:flex;flex-direction:column;gap:3px}
.sb-focus-item strong{font-family:var(--head);font-weight:800;font-size:15px;color:var(--purple-deep)}
.sb-focus-item span{font-size:15.5px;line-height:1.5;color:var(--ink-soft)}
.sb-check{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:11px}
.sb-check li{display:flex;align-items:flex-start;gap:11px;font-size:16px;font-weight:500;color:var(--ink)}
.sb-check-box{flex:0 0 auto;width:24px;height:24px;border-radius:7px;background:var(--purple-soft);color:var(--purple);display:flex;align-items:center;justify-content:center;margin-top:1px}
.sb-btn-ghost{margin:22px auto 0;display:block;background:#fff;border:1.5px solid var(--hair);color:var(--purple-deep);font-family:var(--head);font-weight:800;font-size:15px;padding:14px 24px;border-radius:12px}
.sb-btn-ghost:hover{border-color:var(--purple)}
.sb-btn-ghost.is-done{background:var(--purple-soft);border-color:transparent;color:var(--purple-deep)}

/* offer */
.sb-bridge{margin-top:36px;padding-top:30px;border-top:1px solid var(--hair);display:flex;flex-direction:column;align-items:center}
.sb-bridge-h{margin:6px 0 0;max-width:520px}
.sb-bridge-t{margin:14px auto 22px;max-width:480px;text-align:center;font-size:16.5px}

.sb-offer{background:linear-gradient(180deg,#FAF1FB 0%,#F4EBFB 100%);padding:34px 0 0;overflow:hidden;min-height:calc(100vh - 90px)}
.sb-offer-back{align-self:flex-start;background:none;border:0;color:var(--ink-soft);font-weight:700;font-size:14px;margin-bottom:16px;padding:0}
.sb-hero-img{width:100%;max-width:470px;margin:0 auto}
.sb-freebottle{display:flex;align-items:center;gap:15px;margin:18px 0 0;background:#fff;border:1px solid var(--hair);border-radius:16px;padding:13px 18px;box-shadow:var(--shadow-sm);max-width:420px;width:100%}
.sb-freebottle .sb-bottle-wrap{width:60px;flex:0 0 auto;margin:0}
.sb-freebottle .sb-bottle-img{filter:drop-shadow(0 10px 16px rgba(74,35,90,.26))}
.sb-freebottle .sb-free-badge{font-size:10px;padding:4px 9px;top:-5px;right:-9px}
.sb-freebottle-txt{display:flex;flex-direction:column;gap:2px;text-align:left}
.sb-freebottle-txt strong{font-family:var(--head);font-weight:800;font-size:15px}
.sb-freebottle-txt span{font-size:14px;color:var(--ink-soft);font-weight:600}
.sb-offer-in{max-width:600px;margin:0 auto;padding:0 22px;text-align:center;display:flex;flex-direction:column;align-items:center}
.sb-trust{display:inline-flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--hair);border-radius:999px;padding:8px 16px;font-family:var(--head);font-weight:800;font-size:12.5px;color:var(--ink);box-shadow:var(--shadow-sm);flex-wrap:nowrap;margin-bottom:22px}
.sb-trust svg{color:var(--purple);vertical-align:-2px;margin-right:4px}
.sb-trust-div{width:1px;height:16px;background:var(--hair)}
.sb-trust-av{display:inline-flex;margin-right:7px;vertical-align:-8px}
.sb-trust-av img{width:22px;height:22px;border-radius:999px;border:2px solid #fff;object-fit:cover;margin-left:-7px}
.sb-trust-av img:first-child{margin-left:0}
.sb-offer-h{font-family:var(--head);font-weight:900;font-size:clamp(27px,6.2vw,38px);line-height:1.1;letter-spacing:-.02em;margin:0;max-width:520px}
.sb-offer-sub{margin:16px auto 0;max-width:440px;font-size:18px;line-height:1.5;font-weight:500;color:var(--ink)}
.sb-offer-bullets{list-style:none;margin:22px 0 0;padding:0;display:grid;gap:11px;text-align:left;width:100%;max-width:420px}
.sb-offer-bullets li{display:flex;align-items:flex-start;gap:11px;font-size:16.5px;font-weight:600;color:var(--ink)}
.sb-b-tick{flex:0 0 auto;width:24px;height:24px;border-radius:999px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;margin-top:1px}
.sb-offer-visual{margin:26px 0 4px}
.sb-bottle-wrap{position:relative;width:170px;margin:0 auto}
.sb-bottle-img{width:100%;filter:drop-shadow(0 26px 38px rgba(74,35,90,.32))}
.sb-free-badge{position:absolute;top:6px;right:-6px;background:var(--gold);color:#4a2d10;font-family:var(--head);font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:.04em;padding:8px 14px;border-radius:999px;transform:rotate(8deg);box-shadow:0 10px 22px -8px rgba(74,35,90,.5)}
.sb-deal{display:flex;align-items:center;justify-content:center;gap:20px;margin:22px 0 0;background:#fff;border:2px solid var(--purple);border-radius:16px;padding:16px 24px;box-shadow:var(--shadow-sm)}
.sb-deal-value{display:flex;flex-direction:column;gap:2px}
.sb-deal-value-lbl,.sb-deal-now-lbl{font-family:var(--head);font-weight:700;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-soft)}
.sb-deal-value-num s{font-family:var(--head);font-weight:800;font-size:22px}
.sb-deal-now-lbl{color:var(--purple)}
.sb-deal-now-num{font-family:var(--head);font-weight:900;font-size:40px;line-height:1;color:var(--purple);letter-spacing:-.02em}
.sb-offer .sb-cta-full{margin-top:20px}
.sb-offer .sb-micro{margin-bottom:6px}

/* transformations strip */
.sb-tf{display:flex;gap:6px;margin-top:30px;overflow:hidden}
.sb-tf-cell{flex:0 0 auto;width:130px;height:150px;border-radius:12px 12px 0 0;overflow:hidden}
.sb-tf-cell img{width:100%;height:100%;object-fit:cover}

@media (min-width:820px){
  .sb-h1{font-size:clamp(38px,4.4vw,52px)}
  .sb-welcome-bottle{width:180px}
  .sb-offer{padding-top:56px}
  .sb-offer-visual{margin-top:30px}
  .sb-bottle-wrap{width:210px}
  .sb-tf-cell{width:170px;height:190px}
  .sb-deal{gap:34px}
}
`;
