/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_YOBODY_SIGNUP_URL?: string;
  readonly VITE_YOBODY_AUTH_URL?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_META_PIXEL_DEBUG?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_VAPI_PUBLIC_KEY?: string;
  readonly VITE_VAPI_ASSISTANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
