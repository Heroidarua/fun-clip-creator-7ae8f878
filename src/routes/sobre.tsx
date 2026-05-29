import { createFileRoute } from "@tanstack/react-router";
import SobreNos from "@/pages/SobreNos";

export const Route = createFileRoute("/sobre")({
  component: SobreNos,
  head: () => ({
    meta: [
      { title: "Sobre o SOS/01 — Ferramentas digitais gratuitas" },
      { name: "description", content: "Conheça o SOS/01: projeto comunitário gratuito que reúne downloaders, jogos retrô, IA e utilitários úteis para o dia a dia." },
      { property: "og:title", content: "Sobre o SOS/01" },
      { property: "og:description", content: "Projeto comunitário gratuito de utilidades digitais." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/sobre" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/sobre" }],
  }),
});
