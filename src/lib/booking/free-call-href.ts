import { FREE_CALL_PATH } from "./config";

/** The public Terms page. There is no privacy page to link yet. */
export const TERMS_URL = "https://app.yobody.ai/terms";

/** `/free-call` plus the current query string, so UTMs survive the hop. */
export function freeCallHref(search: string): string {
  if (!search) return FREE_CALL_PATH;
  return `${FREE_CALL_PATH}${search.startsWith("?") ? search : `?${search}`}`;
}
