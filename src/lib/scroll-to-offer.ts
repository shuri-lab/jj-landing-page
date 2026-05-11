export function scrollToOffer() {
  const el = document.getElementById("offer");
  if (!el) return;

  const go = (smooth: boolean) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  };

  // Initial smooth scroll
  go(true);

  // Wait for any not-yet-loaded images to settle, then snap to the final position.
  const imgs = Array.from(document.images).filter((img) => !img.complete);
  const settled = Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((res) => {
          const done = () => res();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
  const timeout = new Promise<void>((res) => setTimeout(res, 800));

  Promise.race([settled, timeout]).then(() => {
    // Re-correct after layout shifts. Use a couple of rAFs to ensure layout pass completed.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        go(false);
      }),
    );
  });
}
