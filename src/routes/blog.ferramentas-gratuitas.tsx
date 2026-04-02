import { createFileRoute } from "@tanstack/react-router";
import FerramentasGratuitas from "@/pages/blog/FerramentasGratuitas";

export const Route = createFileRoute("/blog/ferramentas-gratuitas")({
  component: FerramentasGratuitas,
});
