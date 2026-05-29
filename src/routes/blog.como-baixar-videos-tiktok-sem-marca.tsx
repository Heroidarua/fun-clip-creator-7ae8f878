import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosTikTokSemMarca from "@/pages/blog/ComoBaixarVideosTikTokSemMarca";

export const Route = createFileRoute("/blog/como-baixar-videos-tiktok-sem-marca")({
  component: ComoBaixarVideosTikTokSemMarca,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-baixar-videos-tiktok-sem-marca";
    const title = "Como baixar vídeos do TikTok sem marca d'água — SOS/01";
    const description = "Passo a passo para salvar vídeos do TikTok em HD sem marca d'água, online, grátis e sem cadastro.";
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
