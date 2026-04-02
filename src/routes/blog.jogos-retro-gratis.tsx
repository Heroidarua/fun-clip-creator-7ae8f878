import { createFileRoute } from "@tanstack/react-router";
import JogosRetroGratis from "@/pages/blog/JogosRetroGratis";

export const Route = createFileRoute("/blog/jogos-retro-gratis")({
  component: JogosRetroGratis,
});
