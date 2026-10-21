import { createFileRoute } from "@tanstack/react-router";
import Contato from "@/pages/Contato";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/contato")({
  component: Contato,
  head: () =>
    buildSeo({
      path: "/contato",
      title: "Contato — Fale com a equipe do SOS01",
      description: "Envie dúvidas, sugestões, propostas de parceria ou peça suporte para as ferramentas gratuitas do SOS01.",
      keywords: ["contato sos01","suporte","parcerias"],
    }),
});
