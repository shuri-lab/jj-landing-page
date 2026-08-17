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

export function envYobodySignupUrl(): string {
  return (import.meta.env.VITE_YOBODY_SIGNUP_URL ?? "https://app.yobody.ai/signup").replace(/\/$/, "");
}

export function envYobodyAuthUrl(): string {
  return (import.meta.env.VITE_YOBODY_AUTH_URL ?? "https://app.yobody.ai/auth").replace(/\/$/, "");
}

export function envMetaPixelDebug(): boolean {
  return (
    import.meta.env.VITE_META_PIXEL_DEBUG === "true" ||
    import.meta.env.DEV
  );
}
