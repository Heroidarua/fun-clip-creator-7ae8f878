import { createFileRoute } from "@tanstack/react-router";
import DMCA from "@/pages/DMCA";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/dmca")({
  component: DMCA,
  head: () =>
    buildSeo({
      path: "/dmca",
      title: "Política DMCA — Direitos autorais | SOS01",
      description: "Saiba como o SOS01 trata notificações de direitos autorais sob a DMCA e como enviar uma reivindicação formal.",
      keywords: ["dmca","direitos autorais","remoção de conteúdo"],
    }),
});
