import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosTikTokSemMarca from "@/pages/blog/ComoBaixarVideosTikTokSemMarca";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-baixar-videos-tiktok-sem-marca")({
  component: ComoBaixarVideosTikTokSemMarca,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-baixar-videos-tiktok-sem-marca",
      title: "Como Baixar Vídeos do TikTok Sem Marca d’Água | Guia 2026",
      description: "Guia completo para baixar vídeos do TikTok sem marca d’água, em HD, grátis e sem instalar nenhum aplicativo.",
      keywords: ["baixar vídeo tiktok","tiktok sem marca d’água","download tiktok hd"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como Baixar Vídeos do TikTok Sem Marca d’Água", path: "/blog/como-baixar-videos-tiktok-sem-marca" },
      ],
    }),
});
