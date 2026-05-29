import { createFileRoute } from "@tanstack/react-router";
import FerramentasGratuitas from "@/pages/blog/FerramentasGratuitas";

export const Route = createFileRoute("/blog/ferramentas-gratuitas")({
  component: FerramentasGratuitas,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/ferramentas-gratuitas";
    const title = "As melhores ferramentas gratuitas do SOS/01";
    const description = "Conheça os utilitários gratuitos do SOS/01: QR Code, gerador de senhas, conversor MP4→MP3, removedor de fundo e mais.";
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
