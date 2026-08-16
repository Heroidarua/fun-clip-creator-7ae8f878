import { createFileRoute } from "@tanstack/react-router";
import ComoNasceuClipSave from "@/pages/blog/ComoNasceuClipSave";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-nasceu-clipsave")({
  component: ComoNasceuClipSave,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-nasceu-clipsave",
      title: "Como nasceu o SOS01 — A história do projeto",
      description: "A trajetória do SOS01: de um simples downloader a uma plataforma gratuita com dezenas de ferramentas, jogos e utilitários.",
      keywords: ["história sos01","projeto gratuito"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como nasceu o SOS01", path: "/blog/como-nasceu-clipsave" },
      ],
    }),
});
