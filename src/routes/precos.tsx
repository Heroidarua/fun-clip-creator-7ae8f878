import { createFileRoute } from "@tanstack/react-router";
import Precos from "@/pages/Precos";

export const Route = createFileRoute("/precos")({
  component: Precos,
  head: () => ({
    meta: [
      { title: "Preços — SOS/01 | 100% Gratuito" },
      { name: "description", content: "Todas as ferramentas, downloaders, IA e jogos do SOS/01 são gratuitos para sempre. Sem trial, sem paywall, sem pegadinhas." },
    ],
  }),
});