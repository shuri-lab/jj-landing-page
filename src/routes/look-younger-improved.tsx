import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/look-younger-improved")({
  head: () => ({
    meta: [
      { title: "Look Younger After 40 | Natural Anti-Aging System for Women" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LookYoungerImproved,
});

// Exact copy of the published JJ Smith "look-younger" funnel. The full page
// snapshot lives at public/look-younger-improved.html (self-contained: inline
// styles, Google Fonts, and images served from the original CDN). It is
// rendered inside a full-viewport iframe so its CSS/fonts stay fully isolated
// from the rest of the app.
function LookYoungerImproved() {
  return (
    <iframe
      src="/look-younger-improved.html"
      title="Look Younger After 40"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
