import { createFileRoute } from "@tanstack/react-router";
import Precos from "@/pages/Precos";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/precos")({
  component: Precos,
  head: () =>
    buildSeo({
      path: "/precos",
      title: "Por que é grátis — SOS01 vive de doações",
      description: "O SOS01 não tem planos nem cobrança: todas as ferramentas, downloaders e jogos são gratuitos, mantidos por doações voluntárias via Pix.",
      keywords: ["por que é grátis","doação pix","sem assinatura"],
    }),
});
