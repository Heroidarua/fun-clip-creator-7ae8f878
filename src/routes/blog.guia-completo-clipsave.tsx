import { createFileRoute } from "@tanstack/react-router";
import GuiaCompletoClipSave from "@/pages/blog/GuiaCompletoClipSave";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/guia-completo-clipsave")({
  component: GuiaCompletoClipSave,
  head: () =>
    buildArticleSeo({
      path: "/blog/guia-completo-clipsave",
      title: "Guia Completo do SOS01 — Todos os recursos explicados",
      description: "Conheça todos os recursos do SOS01: downloaders, utilitários com IA, jogos retrô, player e ferramentas de produtividade.",
      keywords: ["guia sos01","recursos","tutorial completo"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Guia Completo do SOS01", path: "/blog/guia-completo-clipsave" },
      ],
    }),
});
