import { createFileRoute } from "@tanstack/react-router";
import JogosJava from "@/pages/JogosJava";

export const Route = createFileRoute("/jogos-java")({
  component: JogosJava,
});
