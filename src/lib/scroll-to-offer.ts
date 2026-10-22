export function scrollToOffer() {
  const el = document.getElementById("offer-limited") ?? document.getElementById("offer");
  if (!el) return;
  scrollToElement(el);
}

/**
 * The same controlled scroll, for pages whose primary target is not the offer
 * (for example the booking card on /free-call).
 */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToElement(el);
}

function scrollToElement(el: HTMLElement) {
  const targetTop = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY);

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    window.scrollTo(0, targetTop());
    return;
  }

  // Cancel our controlled scroll the moment the user takes over, so we never
  // fight them.
  let cancelled = false;
  const cancelEvents = ["wheel", "touchmove", "keydown"] as const;
  const cancel = () => {
    cancelled = true;
    cleanup();
  };
  const cleanup = () => cancelEvents.forEach((e) => window.removeEventListener(e, cancel));
  cancelEvents.forEach((e) => window.addEventListener(e, cancel, { passive: true }));

  const startY = window.scrollY;
  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
  const DURATION = 550;
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  const animate = () => {
    if (cancelled) return;
    const t = Math.min(1, (now() - startTime) / DURATION);
    // Re-read the target EVERY frame — late-loading images shift the page, and
    // this keeps the animation locked onto the real offer position instead of a
    // stale one (the cause of the "jumps to the section above, then corrects").
    const dest = targetTop();
    window.scrollTo(0, Math.round(startY + (dest - startY) * easeOutCubic(t)));
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      // Hold on the target for a short window while any remaining images finish
      // loading, then release. Stops instantly if the user scrolls.
      const settleStart = now();
      const settle = () => {
        if (cancelled) return;
        window.scrollTo(0, Math.round(targetTop()));
        if (now() - settleStart < 650) requestAnimationFrame(settle);
        else cleanup();
      };
      requestAnimationFrame(settle);
    }
  };
  requestAnimationFrame(animate);
}
