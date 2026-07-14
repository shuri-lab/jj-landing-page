import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/look-younger-improved-ob-1")({
  head: () => ({
    meta: [
      { title: "Look Younger After 40 | Natural Anti-Aging System for Women" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LookYoungerOb1,
});

// Copy of the working "look-younger" funnel with a modernized checkout form.
// Full page snapshot lives at public/look-younger-improved-ob-1.html.
function LookYoungerOb1() {
  return (
    <iframe
      src="/look-younger-improved-ob-1.html?v=6"
      title="Look Younger After 40"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
