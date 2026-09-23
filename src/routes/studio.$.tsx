import { StudioPage } from "@/components/StudioPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/studio/$")({
  head: () => ({
    meta: [
      { title: "Content Studio | CET Counsellor" },
      { name: "description", content: "Edit colleges, cutoffs, CAP rounds and category rules for CET Counsellor." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StudioPage,
});
