import { createFileRoute } from "@tanstack/react-router";
import BibliotecaQuadrinhos from "@/pages/blog/BibliotecaQuadrinhos";

export const Route = createFileRoute("/blog/biblioteca-quadrinhos")({
  component: BibliotecaQuadrinhos,
});
