import { createFileRoute } from "@tanstack/react-router";
import ComoNasceuClipSave from "@/pages/blog/ComoNasceuClipSave";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-nasceu-sos01")({
  component: ComoNasceuClipSave,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-nasceu-sos01",
      title: "Como nasceu o SOS01 — A história do projeto",
      description:
        "A trajetória do SOS01: de um simples downloader a uma plataforma gratuita com dezenas de ferramentas, jogos e utilitários. Leia a história.",
      publishedTime: "2025-01-15T09:00:00-03:00",
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como nasceu o SOS01", path: "/blog/como-nasceu-sos01" },
      ],
    }),
});
