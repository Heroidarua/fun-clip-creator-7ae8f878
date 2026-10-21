import { createFileRoute } from "@tanstack/react-router";
import SobreNos from "@/pages/SobreNos";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/sobre")({
  component: SobreNos,
  head: () =>
    buildSeo({
      path: "/sobre",
      title: "Sobre o SOS01 — Ferramentas digitais 100% gratuitas",
      description: "Conheça o SOS01: projeto gratuito que reúne downloaders de vídeo, jogos retrô, utilitários com IA e muito mais.",
      keywords: ["sobre sos01","quem somos","plataforma gratuita"],
    }),
});
