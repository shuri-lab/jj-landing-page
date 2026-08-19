import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import greenSmoothieGummies from "@/assets/landing/supplements/green-smoothie-gummies.jpg";
import liverFocus from "@/assets/landing/supplements/liver-focus.jpg";
import bloodSugarFocus from "@/assets/landing/supplements/blood-sugar-focus.jpg";
import tummyFocus from "@/assets/landing/supplements/tummy-focus.jpg";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "What are you taking? — JJ Smith" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Tell us which supplement you're taking to unlock your offer." },
    ],
  }),
  component: QrSupplements,
});

const CONTINUE_URL = "/qr-a";

const SUPPLEMENTS: { id: string; name: string; img: string }[] = [
  { id: "green-smoothie-gummies", name: "Green Smoothie Gummies", img: greenSmoothieGummies },
  { id: "liver-focus", name: "Liver Focus", img: liverFocus },
  { id: "blood-sugar-focus", name: "Blood Sugar Focus", img: bloodSugarFocus },
  { id: "tummy-focus", name: "Tummy Focus", img: tummyFocus },
];

function Mark({ children }: { children: React.ReactNode }) { return <span className="qr-mark">{children}</span>; }

function QrSupplements() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="qr">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      <div className="qr-announce">Exclusive offer for customers</div>
      <header className="qr-header"><img src={jjSmithLogo} alt="JJ Smith" className="qr-logo" /></header>

      <main className="qr-main">
        <h1 className="qr-h1">What supplement are you taking <Mark>right now?</Mark></h1>
        <p className="qr-sub">Tap the one you're on to unlock your offer.</p>

        <div className="qr-grid" role="radiogroup" aria-label="Your supplement">
          {SUPPLEMENTS.map((s) => {
            const isSel = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                className={`qr-opt${isSel ? " is-sel" : ""}`}
                onClick={() => setSelected(s.id)}
              >
                <span className="qr-opt-media"><img src={s.img} alt={s.name} loading="lazy" /></span>
                <span className="qr-opt-name">{s.name}</span>
                <span className="qr-opt-check" aria-hidden><Check strokeWidth={3} /></span>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="qr-footer">
        <button
          type="button"
          className="qr-continue"
          disabled={!selected}
          onClick={() => navigate({ to: CONTINUE_URL, search: { supplement: selected ?? undefined } })}
        >
          Continue
        </button>
      </footer>
    </div>
  );
}

const CSS = `
.qr{
  --white:#FFFFFF; --lav:#F3ECFB; --pink:#FCEAF4;
  --ink:#2A2036; --ink-soft:#6C6180; --hair:#EBE1F5;
  --purple:#7C3AA6; --purple-deep:#5B2A80; --purple-soft:#F0E6FA;
  --pink-accent:#C0468C; --mark:#F7D6EA; --gold:#F0A93A;
  --grad:linear-gradient(135deg,#7E36A6 0%,#5B2A80 100%);
  --shadow:0 34px 64px -36px rgba(74,35,90,.44);
  --shadow-sm:0 18px 38px -26px rgba(74,35,90,.4);
  --sans:'DM Sans',-apple-system,'Segoe UI',sans-serif;
  --head:'Montserrat',var(--sans);
  font-family:var(--sans);color:var(--ink);background:linear-gradient(180deg,#FAF1FB 0%,#F4EBFB 100%);
  height:100vh;height:100dvh;-webkit-font-smoothing:antialiased;overflow:hidden;overscroll-behavior:none;width:100%;max-width:100vw;
  display:flex;flex-direction:column;
}
.qr *{box-sizing:border-box}
.qr img{max-width:100%;display:block}
.qr button{font-family:inherit;cursor:pointer}
.qr :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.qr-mark{background:linear-gradient(180deg,transparent 56%, var(--mark) 56%);padding:0 .08em;border-radius:2px;color:var(--purple-deep)}

.qr-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff;text-align:center;font-family:var(--head);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:11px 16px}
.qr-header{display:flex;justify-content:center;align-items:center;padding:16px 20px;background:#fff;border-bottom:1px solid var(--hair)}
.qr-logo{height:34px;width:auto}

.qr-main{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;justify-content:center;width:100%;max-width:600px;margin:0 auto;padding:40px 22px 32px;text-align:center}
.qr-h1{font-family:var(--head);font-weight:900;font-size:clamp(30px,8vw,42px);line-height:1.1;letter-spacing:-.02em;margin:0 0 10px}
.qr-sub{font-size:17px;color:var(--ink-soft);font-weight:600;margin:0 0 30px}

.qr-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.qr-opt{position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;background:#fff;border:2px solid var(--hair);border-radius:20px;padding:18px 16px 18px;box-shadow:var(--shadow-sm);text-align:center;transition:border-color .15s,box-shadow .15s,transform .1s}
.qr-opt:active{transform:translateY(1px)}
.qr-opt-media{width:100%;aspect-ratio:5/4;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:12px;overflow:hidden}
.qr-opt-media img{width:100%;height:100%;object-fit:contain}
.qr-opt-name{font-family:var(--head);font-weight:800;font-size:16.5px;line-height:1.2;color:var(--ink)}
.qr-opt-check{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:999px;background:var(--grad);color:#fff;display:none;align-items:center;justify-content:center;box-shadow:0 6px 14px -6px rgba(91,42,128,.6)}
.qr-opt-check svg{width:17px;height:17px}
.qr-opt.is-sel{border-color:var(--purple);box-shadow:0 0 0 3px var(--purple-soft),var(--shadow-sm)}
.qr-opt.is-sel .qr-opt-check{display:flex}

.qr-footer{flex:0 0 auto;background:#fff;border-top:1px solid var(--hair);padding:16px 22px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -12px 30px -22px rgba(74,35,90,.5)}
.qr-continue{width:100%;max-width:560px;margin:0 auto;display:flex;align-items:center;justify-content:center;height:60px;border:0;border-radius:18px;background:var(--grad);color:#fff;font-family:var(--head);font-weight:800;font-size:21px;box-shadow:0 16px 34px -12px rgba(91,42,128,.55);transition:filter .15s,transform .15s,opacity .15s}
.qr-continue:hover:not(:disabled){filter:brightness(1.05);transform:translateY(-1px)}
.qr-continue:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
`;
