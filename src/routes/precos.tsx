import { createFileRoute } from "@tanstack/react-router";
import Precos from "@/pages/Precos";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/precos")({
  component: Precos,
  head: () =>
    buildSeo({
      path: "/precos",
      title: "Preços — Tudo gratuito para sempre | SOS01",
      description: "Todas as ferramentas, downloaders, utilitários com IA e jogos do SOS01 são gratuitos. Sem trial, sem paywall e sem cadastro.",
      keywords: ["grátis","preços","sem assinatura"],
    }),
});
