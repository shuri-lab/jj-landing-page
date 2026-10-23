/// <reference types="vite/client" />

/**
 * vite-imagetools import suffixes.
 *
 * `vite/client` types a bare `*.png` import but not one carrying directives,
 * so `@/assets/landing/a.png?w=760` is otherwise an unresolved module. A
 * TypeScript ambient pattern allows only ONE wildcard, which rules out
 * `*.png?*`, so this matches on the asset prefix instead. It only applies
 * when normal resolution fails, so real modules such as the index.ts in
 * `@/assets/look-younger` keep their own types.
 */
declare module "@/assets/*" {
  const src: string;
  export default src;
}

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
