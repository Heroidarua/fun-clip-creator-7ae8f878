import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";

export const Route = createFileRoute("/jogos")({
  component: Jogos,
});
