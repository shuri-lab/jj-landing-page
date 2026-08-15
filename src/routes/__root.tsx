import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "A high-conversion landing page for the JJ Smith weight loss challenge." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "A high-conversion landing page for the JJ Smith weight loss challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "A high-conversion landing page for the JJ Smith weight loss challenge." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f84255a2-9b6d-46e0-b1c2-5983e0047431/id-preview-9eeb221f--002cf152-9d18-4c71-8667-aea70f493e00.lovable.app-1778437010517.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f84255a2-9b6d-46e0-b1c2-5983e0047431/id-preview-9eeb221f--002cf152-9d18-4c71-8667-aea70f493e00.lovable.app-1778437010517.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "shortcut icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        {/* Meta Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','920675803850327');fbq('track','PageView');`,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://www.facebook.com/tr?id=920675803850327&ev=PageView&noscript=1"
          />
        </noscript>
        {/* Meta: InitiateCheckout + fbclid/_fbc/_fbp/UTM passthrough to app.yobody.ai */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function ck(n){var m=document.cookie.match('(^|;)\\\\s*'+n+'=([^;]*)');return m?decodeURIComponent(m[2]):'';}
var KEY='yb_attr';
function store(o){try{localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
var qs0=new URLSearchParams(window.location.search);
var saved=load();
['fbclid','utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){var v=qs0.get(k)||qs0.get(k.replace(/_(.)/g,function(m,c){return c.toUpperCase();}));if(v)saved[k]=v;});
store(saved);
function ensureFbc(){var c=ck('_fbc');if(c)return c;var f=qs0.get('fbclid')||saved.fbclid||'';if(!f)return '';var v='fb.1.'+Date.now()+'.'+f;try{document.cookie='_fbc='+v+';path=/;max-age=7776000';}catch(e){}return v;}
function ensureFbp(){var c=ck('_fbp');if(c)return c;var v='fb.1.'+Date.now()+'.'+Math.floor(Math.random()*1e10);try{document.cookie='_fbp='+v+';path=/;max-age=7776000';}catch(e){}return v;}
ensureFbc();ensureFbp();
var fired=new WeakSet();
function augment(a){try{if(!a||!a.href)return;var u=new URL(a.href,window.location.href);if(!/(^|\\.)yobody\\.ai$/.test(u.hostname)||u.pathname.indexOf('/signup')!==0)return;
var qs=new URLSearchParams(window.location.search);var st=load();function pick(){for(var i=0;i<arguments.length;i++){var v=qs.get(arguments[i])||st[arguments[i]];if(v)return v;}return '';}
function set(k,v){if(v&&!u.searchParams.has(k))u.searchParams.set(k,v);}
set('fbclid',pick('fbclid'));
var fbc=ensureFbc(),fbp=ensureFbp();
set('fbc',fbc);set('_fbc',fbc);set('fbp',fbp);set('_fbp',fbp);
var us=pick('utm_source','utmSource'),um=pick('utm_medium','utmMedium'),uc=pick('utm_campaign','utmCampaign'),uct=pick('utm_content','utmContent'),ut=pick('utm_term','utmTerm');
set('utm_source',us);set('utm_medium',um);set('utm_campaign',uc);set('utm_content',uct);set('utm_term',ut);
set('utmSource',us);set('utmMedium',um);set('utmCampaign',uc);set('utmContent',uct);set('utmTerm',ut);
set('sourceSurface','lovable');set('sourceContext','landing-page');set('pageUrl',window.location.href);set('referrer',document.referrer||'');
var btn=a.closest('[data-cta="yes-jj"], [data-buy-button="true"]')||a;var tier=(btn.dataset&&btn.dataset.tier)||u.searchParams.get('tier')||'';
set('tier',tier);set('buttonPosition',(btn.dataset&&btn.dataset.position)||'');
var eid='ic.'+Date.now()+'.'+Math.random().toString(36).slice(2,10);set('meta_event_id',eid);
a.href=u.toString();
if(!fired.has(a)){fired.add(a);if(typeof window.fbq==='function'){window.fbq('track','InitiateCheckout',{currency:'USD',content_name:'Yobody Coaching',content_category:tier||undefined,content_ids:[u.searchParams.get('coachProgramConfigId')||'yobody-program'],contents:[{id:u.searchParams.get('coachProgramConfigId')||'yobody-program',quantity:1}]},{eventID:eid});}}
}catch(e){}}
['click','mousedown','auxclick'].forEach(function(t){document.addEventListener(t,function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)augment(a);},true);});})();`,
          }}
        />
        <script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "67072633e75f4c1cb674b51d22b1c0ce"}'
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "wu4kkcr0lk");`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-PYRYHREW2F" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-PYRYHREW2F');`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6NTF2GY6XX" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-6NTF2GY6XX');`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.addEventListener('click',function(e){var btn=e.target.closest('[data-cta="yes-jj"], .cta-yes-jj, .yes-jj-btn');if(!btn)return;var position=btn.dataset.position||'unknown';var tier=btn.dataset.tier||'unknown';if(typeof gtag==='function'){gtag('event','cta_click',{button_position:position,tier:tier});}});`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var SEND_TO=['G-6NTF2GY6XX','GT-PLT5P7MB'];var fired=new WeakSet();function fireSelectPlan(a,u){try{if(fired.has(a))return;fired.add(a);if(typeof window.gtag!=='function')return;var p=u.searchParams;var payload={tier:p.get('tier')||undefined,billing_interval:p.get('billingInterval')||undefined,duration_weeks:p.get('durationWeeks')?Number(p.get('durationWeeks')):undefined,button_position:p.get('buttonPosition')||undefined,cta_text:p.get('ctaText')||undefined,coach_program_config_id:p.get('coachProgramConfigId')||undefined};for(var i=0;i<SEND_TO.length;i++){window.gtag('event','select_plan',Object.assign({send_to:SEND_TO[i]},payload));}}catch(err){}}function augment(a){try{if(!a||!a.href)return;var u=new URL(a.href,window.location.href);if(!/(^|\\.)yoplatform\\.ai$/.test(u.hostname)||u.pathname!=='/signup')return;var btn=a.closest('[data-cta="yes-jj"], [data-buy-button="true"], .cta-yes-jj, .yes-jj-btn')||a;var tier=(btn.dataset&&btn.dataset.tier)||u.searchParams.get('tier')||'unknown';var pos=(btn.dataset&&btn.dataset.position)||u.searchParams.get('buttonPosition')||'unknown';var ctaText=((a.innerText||a.textContent||'').trim().replace(/\\s+/g,' ')).slice(0,200);var qs=new URLSearchParams(window.location.search);function set(k,v){if(v!==undefined&&v!==null&&v!==''&&!u.searchParams.has(k))u.searchParams.set(k,v);}function pick(){for(var i=0;i<arguments.length;i++){var v=qs.get(arguments[i]);if(v)return v;}return '';}set('sourceSurface','lovable');set('sourceContext','landing-page');set('tier',tier);set('buttonPosition',pos);set('ctaText',ctaText);set('utmSource',pick('utm_source','utmSource'));set('utmMedium',pick('utm_medium','utmMedium'));set('utmCampaign',pick('utm_campaign','utmCampaign'));set('utmContent',pick('utm_content','utmContent'));set('utmTerm',pick('utm_term','utmTerm'));set('pageUrl',window.location.href);set('referrer',document.referrer||'');a.href=u.toString();fireSelectPlan(a,u);}catch(err){}}document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)augment(a);},true);document.addEventListener('mousedown',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)augment(a);},true);document.addEventListener('auxclick',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a)augment(a);},true);})();`,
          }}
        />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
