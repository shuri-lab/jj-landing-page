import { BOOKING_SECTION_ID } from "../booking/config";

/**
 * Keeps the page's first seconds responsive on a slow phone connection.
 *
 * The tracking tags used to download alongside the app's own code. On a slow
 * connection the app arrived after about 11 s, so "Book my free call" sat on
 * screen for 10 s and did nothing when pressed. Now:
 *
 * - The tags load once the app is interactive, or after TAG_FALLBACK_MS if it
 *   is not. Their inline bootstraps still run at once, so every event queues
 *   from the first moment and nothing is dropped.
 * - "Book my free call" pressed that early scrolls to the form at once: the
 *   form is in the server's HTML, so this needs no app code.
 * - A button pressed before React has taken it over shows it was pressed, and
 *   the press runs as soon as that button can take it. The app's ready signal
 *   comes before a lazy route's buttons are live, so each button is checked
 *   itself. Only the latest press runs. If the check never passes (a React
 *   rename, say), a kept press runs and keeping stops 3 s after the app is ready.
 *
 * Runs inline in <head> after JOIN_TOKEN_EARLY_SCRIPT, so HYROS's ref_url is
 * read here, once the token has left the address bar.
 */
export const TAG_FALLBACK_MS = 4000;

export const TAG_URLS = [
  "https://224254.t.hyros.com/v1/lst/universal-script?ph=01be9e27086bea56a534993ace52a5cd7b38088eb9e5420fe8c09b155e83f308&tag=!clicked&ref_url=",
  "https://connect.facebook.net/en_US/fbevents.js",
  "https://www.clarity.ms/tag/wu4kkcr0lk",
  "https://www.googletagmanager.com/gtag/js?id=G-PYRYHREW2F",
  "https://www.googletagmanager.com/gtag/js?id=G-6NTF2GY6XX",
] as const;

export const EARLY_PRESS_ATTRIBUTE = "data-early-press";

/** How often a kept press checks whether its button can take it yet. */
const EARLY_PRESS_POLL_MS = 50;
/** After the app is ready, stop keeping presses, whatever the check says. */
const EARLY_PRESS_LIMIT_MS = 3000;

export const EARLY_PAGE_STYLE = `button[${EARLY_PRESS_ATTRIBUTE}]{animation:yb-early-press .7s ease-in-out infinite alternate;transform:scale(.98)}@keyframes yb-early-press{from{opacity:1}to{opacity:.6}}`;

export const EARLY_PAGE_SCRIPT = `(function(){var w=window,d=document,started=false,pressed=null,timer=null;
var urls=${JSON.stringify(TAG_URLS)};urls[0]+=encodeURI(d.URL);
function loadTags(){if(started)return;started=true;urls.forEach(function(u){var s=d.createElement('script');s.async=true;s.src=u;d.head.appendChild(s);});}
w.clarity=w.clarity||function(){(w.clarity.q=w.clarity.q||[]).push(arguments);};
setTimeout(loadTags,${TAG_FALLBACK_MS});
function live(b){return Object.keys(b).some(function(k){return k.indexOf('__reactProps')===0;});}
function run(){if(timer){clearInterval(timer);timer=null;}var b=pressed;pressed=null;if(b){b.removeAttribute('${EARLY_PRESS_ATTRIBUTE}');if(b.isConnected&&!b.disabled)b.click();}}
function onPress(e){var b=e.target&&e.target.closest&&e.target.closest('button');if(!b||b.disabled||live(b))return;e.preventDefault();e.stopImmediatePropagation();if(pressed&&pressed!==b)pressed.removeAttribute('${EARLY_PRESS_ATTRIBUTE}');pressed=b;b.setAttribute('${EARLY_PRESS_ATTRIBUTE}','');if(b.getAttribute('data-cta')==='book-free-call'){var f=d.getElementById('${BOOKING_SECTION_ID}');if(f&&f.getBoundingClientRect().top>w.innerHeight/2)f.scrollIntoView({behavior:'smooth',block:'start'});}if(!timer)timer=setInterval(function(){if(pressed&&live(pressed))run();},${EARLY_PRESS_POLL_MS});}
w.addEventListener('click',onPress,true);
w.__ybAppReady=function(){loadTags();setTimeout(function(){w.removeEventListener('click',onPress,true);run();},${EARLY_PRESS_LIMIT_MS});};})();`;

/** The app is interactive: run a press that came early and load the tags. */
export function markAppReady(): void {
  (window as unknown as { __ybAppReady?: () => void }).__ybAppReady?.();
}
