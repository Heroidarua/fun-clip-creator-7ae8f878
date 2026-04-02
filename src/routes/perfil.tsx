import { createFileRoute } from "@tanstack/react-router";
import Perfil from "@/pages/Perfil";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
});
