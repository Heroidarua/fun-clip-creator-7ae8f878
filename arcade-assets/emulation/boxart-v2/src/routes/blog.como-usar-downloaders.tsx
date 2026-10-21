import { createFileRoute } from "@tanstack/react-router";
import ComoUsarDownloaders from "@/pages/blog/ComoUsarDownloaders";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-usar-downloaders")({
  component: ComoUsarDownloaders,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-usar-downloaders",
      title: "Como Usar os Downloaders do SOS01 — Guia Completo",
      description: "Guia prático para usar os downloaders de TikTok, Instagram, YouTube, Facebook, Kwai e Pinterest do SOS01.",
      keywords: ["como usar downloader","baixar vídeos online"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como Usar os Downloaders do SOS01", path: "/blog/como-usar-downloaders" },
      ],
    }),
});
