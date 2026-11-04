import { defineConfig } from "vitest/config";

// Separate from vite.config.ts: the unit tests cover plain modules and must not
// load the TanStack Start and Cloudflare plugins.
export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
