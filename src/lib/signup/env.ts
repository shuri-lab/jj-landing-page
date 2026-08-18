function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLoopbackApiUrl(value: string): boolean {
  try {
    return isLoopbackHost(new URL(value).hostname);
  } catch {
    return false;
  }
}

export function envApiUrl(): string {
  const fromEnv = stripTrailingSlash((import.meta.env.VITE_API_URL ?? "").trim());
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (isLoopbackHost(host)) {
      if (import.meta.env.DEV && (!fromEnv || isLoopbackApiUrl(fromEnv))) {
        return "";
      }
      return fromEnv || "http://localhost:4000";
    }
    // Deployed landing pages (e.g. mycoach.jjsmithonline.com) must never call
    // a local API — browsers block HTTPS → http://localhost as mixed content.
    if (fromEnv && !isLoopbackApiUrl(fromEnv)) return fromEnv;
    return "https://api.yoplatform.ai";
  }
  return fromEnv || "https://api.yoplatform.ai";
}

export function envStripePublishableKey(): string {
  return (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "").trim();
}

export function envMetaPixelId(): string {
  return (import.meta.env.VITE_META_PIXEL_ID ?? "920675803850327").trim();
}

function sameHostFallback(fromEnv: string, loopbackFallback: string, prodFallback: string): string {
  if (typeof window === "undefined") return fromEnv;
  try {
    const envHost = new URL(fromEnv, window.location.origin).hostname;
    if (envHost === window.location.hostname) {
      return isLoopbackHost(window.location.hostname) ? loopbackFallback : prodFallback;
    }
  } catch {
    /* ignore */
  }
  return fromEnv;
}

export function envYobodySignupUrl(): string {
  const prod = "https://app.yobody.ai/signup";
  const fromEnv = (import.meta.env.VITE_YOBODY_SIGNUP_URL ?? prod).replace(/\/$/, "");
  return sameHostFallback(fromEnv, "http://localhost:3000/signup", prod);
}

export function envYobodyAuthUrl(): string {
  const prod = "https://app.yobody.ai/auth";
  const fromEnv = (import.meta.env.VITE_YOBODY_AUTH_URL ?? prod).replace(/\/$/, "");
  return sameHostFallback(fromEnv, "http://localhost:3000/auth", prod);
}

export function envMetaPixelDebug(): boolean {
  return (
    import.meta.env.VITE_META_PIXEL_DEBUG === "true" ||
    import.meta.env.DEV
  );
}
