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
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "A high-conversion landing page for the JJ Smith weight loss challenge." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f84255a2-9b6d-46e0-b1c2-5983e0047431/id-preview-9eeb221f--002cf152-9d18-4c71-8667-aea70f493e00.lovable.app-1778437010517.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f84255a2-9b6d-46e0-b1c2-5983e0047431/id-preview-9eeb221f--002cf152-9d18-4c71-8667-aea70f493e00.lovable.app-1778437010517.png" },
    ],
    links: [
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
