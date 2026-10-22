/**
 * A tiny, safe wrapper over the GTM dataLayer.
 *
 * GTM is loaded in __root.tsx, but this never assumes it: on the server, in a
 * blocked browser, or before the tag has booted, the push is a no-op or lands
 * in the queue GTM drains on load. Analytics must never break a page.
 *
 * Never pass personal data (name, email, phone, free text) into these events.
 */

export type DataLayerEvent = Record<string, string | number | boolean | null>;

export function pushDataLayer(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  try {
    const target = window as unknown as { dataLayer?: unknown[] };
    target.dataLayer = target.dataLayer ?? [];
    target.dataLayer.push(event);
  } catch {
    /* ignore */
  }
}
