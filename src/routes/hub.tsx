import { createFileRoute } from "@tanstack/react-router";
import AIHub from "@/pages/AIHub";

export const Route = createFileRoute("/hub")({
  component: AIHub,
});
