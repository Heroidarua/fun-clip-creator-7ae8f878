import { createFileRoute } from "@tanstack/react-router";
import Desafio from "@/pages/Desafio";

export const Route = createFileRoute("/desafio")({
  component: Desafio,
});
