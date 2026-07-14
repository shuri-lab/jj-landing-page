import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/look-younger-improved-v2")({
  head: () => ({
    meta: [
      { title: "Look Younger After 40 | Natural Anti-Aging System for Women" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LookYoungerImprovedV2,
});

// Redesigned copy of the JJ Smith "look-younger" funnel. Same copy, new
// design system (see Look Younger Build Spec). The full page lives at
// public/look-younger-improved-v2.html and is rendered inside a full-viewport
// iframe so its CSS and fonts stay isolated from the rest of the app.
function LookYoungerImprovedV2() {
  return (
    <iframe
      src="/look-younger-improved-v2.html"
      title="Look Younger After 40"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
