/**
 * Helpers for Facebook / Instagram (and similar) in-app webviews, where the
 * embedded Stripe checkout is unreliable. Used to offer an "open in your real
 * browser" escape hatch when the embedded flow fails for those users.
 */

function ua(): string {
  return typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
}

/** Inside a Facebook / Instagram / other in-app webview. */
export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|\bLine\b|Snapchat|Pinterest|TikTok|musical_ly|BytedanceWebview|Twitter|GSA/i.test(
    ua(),
  );
}

/** Best-effort friendly name of the in-app browser for copy. */
export function inAppName(): string {
  const s = ua();
  if (/Instagram/i.test(s)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(s)) return "Facebook";
  return "in-app";
}

export function isAndroid(): boolean {
  return /Android/i.test(ua());
}

export function isIOS(): boolean {
  const s = ua();
  return (
    /iPhone|iPad|iPod/i.test(s) ||
    (/Macintosh/i.test(s) &&
      typeof document !== "undefined" &&
      "ontouchend" in document)
  );
}

/**
 * Try to open `url` in the phone's real browser, escaping the in-app webview.
 * Android: hands the URL to the default browser via an `intent:` URL (works
 * from the FB/IG webview). iOS has no reliable programmatic escape, so we
 * return "manual" and the caller shows a "tap ••• → Open in Browser" hint.
 * `url` must NOT contain a hash fragment (the intent syntax uses one).
 */
export function openInSystemBrowser(url: string): "android" | "manual" {
  if (isAndroid()) {
    try {
      // Drop any #hash — the intent: syntax uses its own #Intent fragment.
      const noScheme = url.replace(/^https?:\/\//i, "").split("#")[0];
      window.location.href = `intent://${noScheme}#Intent;scheme=https;end`;
      return "android";
    } catch {
      /* fall through to manual */
    }
  }
  return "manual";
}

/** Copy text to the clipboard, best-effort. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
