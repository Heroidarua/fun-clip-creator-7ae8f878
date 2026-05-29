import { createFileRoute } from "@tanstack/react-router";
import ComoBaixarVideosKwai from "@/pages/blog/ComoBaixarVideosKwai";

export const Route = createFileRoute("/blog/como-baixar-videos-kwai")({
  component: ComoBaixarVideosKwai,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-baixar-videos-kwai";
    const title = "Como baixar vídeos do Kwai grátis — SOS/01";
    const description = "Tutorial completo para baixar vídeos do Kwai em alta qualidade, sem marca d'água e sem instalar aplicativos.";
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
