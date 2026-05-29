import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosYouTube from "@/pages/blog/ComoBaixarVideosYouTube";

export const Route = createFileRoute("/blog/como-baixar-videos-youtube")({
  component: ComoBaixarVideosYouTube,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-baixar-videos-youtube";
    const title = "Como baixar vídeos do YouTube grátis — SOS/01";
    const description = "Passo a passo para baixar vídeos do YouTube em alta qualidade, com ou sem áudio separado, direto pelo SOS/01 e sem instalar nada.";
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
