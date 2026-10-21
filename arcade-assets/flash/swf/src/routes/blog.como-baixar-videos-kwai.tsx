import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosKwai from "@/pages/blog/ComoBaixarVideosKwai";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-baixar-videos-kwai")({
  component: ComoBaixarVideosKwai,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-baixar-videos-kwai",
      title: "Como Baixar Vídeos do Kwai Sem Marca d’Água (2026)",
      description: "Aprenda a baixar vídeos do Kwai em alta qualidade e sem marca d’água, direto do navegador e sem instalar aplicativos.",
      keywords: ["baixar vídeo kwai","kwai sem marca d’água"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como Baixar Vídeos do Kwai Sem Marca d’Água (2026)", path: "/blog/como-baixar-videos-kwai" },
      ],
    }),
});
