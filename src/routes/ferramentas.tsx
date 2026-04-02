import { createFileRoute } from "@tanstack/react-router";
import Ferramentas from "@/pages/Ferramentas";

export const Route = createFileRoute("/ferramentas")({
  component: Ferramentas,
});
