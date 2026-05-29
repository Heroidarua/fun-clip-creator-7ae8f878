import { createFileRoute } from "@tanstack/react-router";
import ComoExtrairAudioTikTok from "@/pages/blog/ComoExtrairAudioTikTok";

export const Route = createFileRoute("/blog/como-extrair-audio-tiktok")({
  component: ComoExtrairAudioTikTok,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-extrair-audio-tiktok";
    const title = "Como extrair o áudio de vídeos do TikTok — SOS/01";
    const description = "Aprenda a salvar somente o som ou música de um vídeo do TikTok em MP3, grátis e sem aplicativo.";
    return {
      meta: [
        { title }, { name: "description", content: description },
        { property: "og:title", content: title }, { property: "og:description", content: description },
        { property: "og:url", content: url }, { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article", headline: title,
        description, author: { "@type": "Organization", name: "SOS/01" },
        publisher: { "@type": "Organization", name: "SOS/01" }, mainEntityOfPage: url,
      }) }],
    };
  },
});
