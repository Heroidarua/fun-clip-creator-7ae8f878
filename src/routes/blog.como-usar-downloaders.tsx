import { createFileRoute } from "@tanstack/react-router";
import ComoUsarDownloaders from "@/pages/blog/ComoUsarDownloaders";

export const Route = createFileRoute("/blog/como-usar-downloaders")({
  component: ComoUsarDownloaders,
});
