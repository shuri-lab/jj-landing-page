import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/look-younger-improved-ob-2")({
  head: () => ({
    meta: [
      { title: "Look Younger After 40 | Natural Anti-Aging System for Women" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LookYoungerOb2,
});

// Copy of the working "look-younger" funnel with a modernized checkout form.
// Full page snapshot lives at public/look-younger-improved-ob-2.html.
function LookYoungerOb2() {
  return (
    <iframe
      src="/look-younger-improved-ob-2.html?v=5"
      title="Look Younger After 40"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}
