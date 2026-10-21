import { createFileRoute } from "@tanstack/react-router";
import ComoExtrairAudioTikTok from "@/pages/blog/ComoExtrairAudioTikTok";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/como-extrair-audio-tiktok")({
  component: ComoExtrairAudioTikTok,
  head: () =>
    buildArticleSeo({
      path: "/blog/como-extrair-audio-tiktok",
      title: "Como Extrair o Áudio de Vídeos do TikTok em MP3",
      description: "Aprenda a converter vídeos do TikTok em áudio MP3 com qualidade, gratuitamente e direto pelo navegador.",
      keywords: ["áudio tiktok","tiktok mp3","extrair som"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Como Extrair o Áudio de Vídeos do TikTok em MP3", path: "/blog/como-extrair-audio-tiktok" },
      ],
    }),
});
