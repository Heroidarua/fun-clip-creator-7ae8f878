import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosYouTube from "@/pages/blog/ComoBaixarVideosYouTube";

export const Route = createFileRoute("/blog/como-baixar-videos-youtube")({
  component: ComoBaixarVideosYouTube,
});
