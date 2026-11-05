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
 * - A button pressed before the app is interactive shows it was pressed, and
 *   the press runs as soon as the app can take it. Only the latest one runs.
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

export const EARLY_PAGE_STYLE = `button[${EARLY_PRESS_ATTRIBUTE}]{animation:yb-early-press .7s ease-in-out infinite alternate;transform:scale(.98)}@keyframes yb-early-press{from{opacity:1}to{opacity:.6}}`;

export const EARLY_PAGE_SCRIPT = `(function(){var w=window,d=document,started=false,ready=false,pressed=null;
var urls=${JSON.stringify(TAG_URLS)};urls[0]+=encodeURI(d.URL);
function loadTags(){if(started)return;started=true;urls.forEach(function(u){var s=d.createElement('script');s.async=true;s.src=u;d.head.appendChild(s);});}
w.clarity=w.clarity||function(){(w.clarity.q=w.clarity.q||[]).push(arguments);};
setTimeout(loadTags,${TAG_FALLBACK_MS});
function onPress(e){var b=e.target&&e.target.closest&&e.target.closest('button');if(ready||!b||b.disabled)return;e.preventDefault();e.stopImmediatePropagation();if(pressed&&pressed!==b)pressed.removeAttribute('${EARLY_PRESS_ATTRIBUTE}');pressed=b;b.setAttribute('${EARLY_PRESS_ATTRIBUTE}','');}
w.addEventListener('click',onPress,true);
w.__ybAppReady=function(){if(ready)return;ready=true;w.removeEventListener('click',onPress,true);var b=pressed;pressed=null;if(b){b.removeAttribute('${EARLY_PRESS_ATTRIBUTE}');if(b.isConnected&&!b.disabled)b.click();}loadTags();};})();`;

/** The app is interactive: run a press that came early and load the tags. */
export function markAppReady(): void {
  (window as unknown as { __ybAppReady?: () => void }).__ybAppReady?.();
}
