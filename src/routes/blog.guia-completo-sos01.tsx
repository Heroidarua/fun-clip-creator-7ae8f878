import { createFileRoute } from "@tanstack/react-router";
import GuiaCompletoClipSave from "@/pages/blog/GuiaCompletoClipSave";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/guia-completo-sos01")({
  component: GuiaCompletoClipSave,
  head: () =>
    buildArticleSeo({
      path: "/blog/guia-completo-sos01",
      title: "Guia completo do SOS01 — Todos os recursos explicados",
      description:
        "Downloaders, utilitários com IA, jogos retrô, player e produtividade: veja tudo o que o SOS01 faz e comece a usar agora.",
      publishedTime: "2025-02-04T09:00:00-03:00",
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Guia completo do SOS01", path: "/blog/guia-completo-sos01" },
      ],
    }),
});
