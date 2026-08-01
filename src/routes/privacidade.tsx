import { createFileRoute } from "@tanstack/react-router";
import PoliticaDePrivacidade from "@/pages/politica-de-privacidade";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/privacidade")({
  component: PoliticaDePrivacidade,
  head: () =>
    buildSeo({
      path: "/privacidade",
      title: "Política de Privacidade — SOS01",
      description: "Entenda como o SOS01 coleta, usa e protege seus dados ao utilizar as ferramentas gratuitas da plataforma.",
      keywords: ["privacidade","lgpd","proteção de dados"],
    }),
});
