/**
 * Landing-page behaviour tracking: scroll depth + section reach.
 *
 * Deliberately NOT per-button instrumentation — exploratory click behaviour
 * (rage clicks, dead clicks, heatmaps) comes from PostHog autocapture and
 * session replay. This hook only emits the two funnel-relevant behaviour
 * signals, each at most once per session.
 *
 * Sections opt in by rendering `data-yb-section="<stable_name>"`.
 */

import { useEffect } from "react";
import { trackScrollDepth, trackSectionViewed } from "./events";

const THRESHOLDS = [25, 50, 75, 90] as const;

export function useLandingBehaviorTracking(): void {
  // --- scroll depth --------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const total = document.documentElement.scrollHeight;
      const viewport = window.innerHeight;
      // A page shorter than the viewport has no meaningful scroll depth.
      if (total <= viewport + 1) return;
      const percent = ((window.scrollY + viewport) / total) * 100;
      for (const threshold of THRESHOLDS) {
        if (percent >= threshold) trackScrollDepth(threshold);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once in case the page is restored mid-scroll.
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- section reach -------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-yb-section]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // "Substantially visible" means half the section is on screen, or —
          // for sections taller than the viewport — half the viewport is
          // filled by it. Without the second case, tall sections on mobile
          // would never register.
          const visible = entry.intersectionRect.height;
          const needed = Math.min(entry.boundingClientRect.height, window.innerHeight) * 0.5;
          if (needed <= 0 || visible < needed) continue;

          const name =
            entry.target instanceof HTMLElement ? entry.target.dataset.ybSection : undefined;
          if (name) trackSectionViewed(name);
          observer.unobserve(entry.target);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}
