import { createFileRoute } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import jjSmithLogo from "@/assets/landing/jj-smith-logo.png";
import bundle from "@/assets/landing/supplements-bundle-v2.png";

export const Route = createFileRoute("/qr-manychat")({
  head: () => ({
    meta: [
      { title: "Unlock Your Free Bottle — JJ Smith" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Your free bottle is waiting. Open Instagram to claim it." },
    ],
  }),
  component: QrClaim,
});

const INSTAGRAM_URL = "https://ig.me/m/it.is.hormonal?ref=w57982194";
// Placeholder: confirm the web fallback destination.
const CONTINUE_URL = "/qr-a";

function Mark({ children }: { children: React.ReactNode }) { return <span className="qr-mark">{children}</span>; }

function QrClaim() {
  return (
    <div className="qr">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" />
      <style>{CSS}</style>

      <div className="qr-announce">Exclusive offer for customers</div>
      <header className="qr-header"><img src={jjSmithLogo} alt="JJ Smith" className="qr-logo" /></header>

      <main className="qr-main">
        <div className="qr-bundle">
          <img src={bundle} alt="JJ Smith supplement bundle" fetchPriority="high" />
          <span className="qr-free" aria-hidden>
            <span className="qr-free-sm">Your next bottle</span>
            <span className="qr-free-lg">Free</span>
          </span>
        </div>

        <div className="qr-copy">
          <h1 className="qr-h1"><Mark>Your next bottle free</Mark><br />with JJ’s coaching.</h1>

          <a className="qr-btn qr-btn-ig" href={INSTAGRAM_URL}>
            <Instagram className="qr-ig-ico" strokeWidth={2.4} /> Claim on Instagram
          </a>
          <a className="qr-btn qr-btn-alt" href={CONTINUE_URL}>
            <span className="qr-alt-q">Instagram not working?</span>
            <span className="qr-alt-c">Continue here</span>
          </a>
        </div>
      </main>
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
.qr a{text-decoration:none;color:inherit}
.qr :focus-visible{outline:3px solid var(--purple);outline-offset:3px}
.qr-mark{background:linear-gradient(180deg,transparent 56%, var(--mark) 56%);padding:0 .08em;border-radius:2px;color:var(--purple-deep)}

.qr-announce{background:linear-gradient(90deg,#5B2A80 0%,#7E36A6 48%,#C0468C 100%);color:#fff;text-align:center;font-family:var(--head);font-weight:800;font-size:13px;letter-spacing:.08em;text-transform:uppercase;padding:11px 16px}
.qr-header{display:flex;justify-content:center;align-items:center;padding:16px 20px;background:#fff;border-bottom:1px solid var(--hair)}
.qr-logo{height:34px;width:auto}

.qr-main{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;max-width:520px;width:100%;margin:0 auto;padding:12px 20px 20px;gap:8px}
.qr-copy{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;width:100%}

.qr-bundle{position:relative;flex:0 0 auto;margin:0 auto}
.qr-bundle>img{display:block;width:auto;height:auto;max-width:min(300px,86vw);max-height:30dvh}
.qr-free{position:absolute;top:-2%;right:-2%;width:104px;height:104px;border-radius:999px;background:var(--grad);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-6deg);box-shadow:0 20px 36px -12px rgba(91,42,128,.55),inset 0 0 0 3px rgba(255,255,255,.3)}
.qr-free-lg{font-family:var(--head);font-weight:900;font-size:28px;line-height:.9;letter-spacing:-.01em;text-transform:uppercase;color:#fff}
.qr-free-sm{font-family:var(--head);font-weight:700;font-size:9px;line-height:1.15;letter-spacing:.05em;text-transform:uppercase;max-width:82px;margin-bottom:3px;color:rgba(255,255,255,.9)}

.qr-h1{font-family:var(--head);font-weight:900;font-size:clamp(32px,7.8vw,50px);line-height:1.06;letter-spacing:-.02em;margin:0}

.qr-btn{width:100%;max-width:460px;display:flex;align-items:center;justify-content:center;gap:11px;font-family:var(--head);font-weight:800;font-size:20px;padding:18px 24px;border-radius:16px;border:2px solid transparent;line-height:1.15;transition:transform .15s,filter .15s,background .15s}
.qr-btn:active{transform:translateY(1px)}
.qr-btn-ig{margin-top:20px;background:var(--grad);box-shadow:0 18px 38px -12px rgba(91,42,128,.55)}
.qr a.qr-btn-ig{color:#fff}
.qr-btn-ig:hover{filter:brightness(1.05);transform:translateY(-1px)}
.qr-ig-ico{width:26px;height:26px;flex:0 0 auto}
.qr-btn-alt{margin-top:14px;flex-direction:column;gap:1px;background:#fff;border-color:var(--hair);padding:15px 22px;box-shadow:var(--shadow-sm)}
.qr-btn-alt:hover{border-color:var(--purple);background:#faf7fe}
.qr-alt-q{font-family:var(--sans);font-size:14px;font-weight:600;color:var(--ink-soft)}
.qr-alt-c{font-family:var(--head);font-weight:800;font-size:18px;color:var(--purple-deep);text-decoration:underline;text-underline-offset:3px}

@media (min-width:860px){
  .qr-main{
    display:grid;
    grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);
    align-items:center;
    align-content:center;
    gap:52px;
    max-width:980px;
    text-align:left;
    padding:32px 32px 40px;
  }
  .qr-bundle{margin:0 auto}
  .qr-bundle>img{max-width:400px;max-height:none}
  .qr-free{width:120px;height:120px;top:-3%}
  .qr-free-lg{font-size:31px}
  .qr-copy{align-items:flex-start;text-align:left;width:100%}
  .qr-h1{font-size:clamp(40px,3.8vw,52px)}
  .qr-btn{max-width:430px}
  .qr-btn-ig{margin-top:26px}
}
`;
