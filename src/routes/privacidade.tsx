import { createFileRoute } from "@tanstack/react-router";
import PoliticaDePrivacidade from "@/pages/politica-de-privacidade";

export const Route = createFileRoute("/privacidade")({
  component: PoliticaDePrivacidade,
});
