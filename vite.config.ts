// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { imagetools } from "vite-imagetools";
import { isClientAbortError } from "./src/lib/client-abort";

const fromRoot = (path: string) => new URL(path, import.meta.url).pathname;

// `.env` carries PRODUCTION values (api.yobody.ai + live Stripe key) for
// builds. The toolchain loads `.env` into process.env before Vite resolves
// env files, and Vite's loadEnv gives process.env priority — so
// `.env.development` alone can never override `.env` for `vite dev`, and the
// local dev server would silently create LIVE checkout sessions against the
// production API. Force the dev values into process.env for `vite dev` only.
function applyDevEnvOverrides() {
  if (!process.argv.some((a) => a === "dev" || a === "serve")) return;
  let raw: string;
  try {
    raw = readFileSync(new URL("./.env.development", import.meta.url), "utf8");
  } catch {
    return;
  }
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*(VITE_[A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
}
applyDevEnvOverrides();

// Dev-only: TanStack Start's dev-server plugin and h3 console.error every
// request the browser drops mid-SSR (refresh / navigate away → `Error:
// aborted`, ECONNRESET). Those logs come from node_modules, so the only seam
// is the dev-server process's console. Real errors pass through untouched.
// Production (Cloudflare build) never runs this plugin; src/server.ts handles
// aborts there.
const suppressClientAbortLogs = () => ({
  name: "suppress-client-abort-logs",
  apply: "serve" as const,
  configureServer() {
    const original = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      if (args.some((arg) => isClientAbortError(arg))) return;
      original(...args);
    };
  },
});

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      suppressClientAbortLogs(),
      // Build-time image optimization: convert raster photos to WebP (visually
      // identical, ~80% smaller). Skips small line-art logos and non-raster assets.
      // No resize, so nothing is upscaled. Imports stay the same in every route.
      imagetools({
        defaultDirectives: (url: URL) => {
          const p = url.pathname;
          if (/\/partners\//.test(p)) return new URLSearchParams();
          if (/\.(svg|webp|avif|gif|ico)$/i.test(p)) return new URLSearchParams();
          if (/\.(png|jpe?g)$/i.test(p)) return new URLSearchParams({ format: "webp", quality: "80" });
          return new URLSearchParams();
        },
      }),
      nodePolyfills({
        include: ["events"],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    ],
    resolve: {
      alias: {
        "@vapi-ai/web": fromRoot("./node_modules/@vapi-ai/web/vapi.ts"),
      },
    },
    optimizeDeps: {
      include: ["@vapi-ai/web", "events"],
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    server: {
      proxy: {
        "/public/landing": {
          target: process.env.VITE_API_URL || "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        "/public/landing": {
          target: process.env.VITE_API_URL || "http://localhost:4000",
          changeOrigin: true,
        },
      },
    },
  },
});
