import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosYouTube from "@/pages/blog/ComoBaixarVideosYouTube";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-baixar-videos-youtube")({
  component: ComoBaixarVideosYouTube,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-baixar-videos-youtube",
      title: "Como Baixar Vídeos do YouTube Online e Grátis",
      description: "Passo a passo para baixar vídeos do YouTube em MP4 ou extrair o áudio em MP3, online, grátis e sem programas.",
      keywords: ["baixar vídeo youtube","youtube mp4","youtube mp3"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como Baixar Vídeos do YouTube Online e Grátis", path: "/blog/como-baixar-videos-youtube" },
      ],
    }),
});
