// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { imagetools } from "vite-imagetools";

const fromRoot = (path: string) => new URL(path, import.meta.url).pathname;

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
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
