import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "@/pages/TermsOfService";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/termos")({
  component: TermsOfService,
  head: () =>
    buildSeo({
      path: "/termos",
      title: "Termos de Uso — SOS01",
      description: "Termos e condições de uso das ferramentas, downloaders e jogos gratuitos disponíveis no SOS01.",
      keywords: ["termos de uso","condições","regras"],
    }),
});
