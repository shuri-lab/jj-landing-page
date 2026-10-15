/**
 * True when the error means the CLIENT dropped the connection mid-request
 * (browser refresh, navigating away, in-app webview closing). Node surfaces
 * this as `Error: aborted` / ECONNRESET on the incoming request, and h3 wraps
 * it in an HTTPError whose `cause` carries the original. Nobody receives the
 * response, so it is noise — never a server fault worth an error log.
 *
 * Used by src/server.ts (quiet branded 500) and vite.config.ts (dev-only
 * console filter for the same errors logged inside TanStack Start / h3).
 */
export function isClientAbortError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 4) return false;
  const e = error as { code?: unknown; message?: unknown; cause?: unknown };
  if (e.code === "ECONNRESET" || e.code === "ECONNABORTED") return true;
  if (typeof e.message === "string" && /^(aborted|request aborted)$/i.test(e.message)) {
    return true;
  }
  return isClientAbortError(e.cause, depth + 1);
}
