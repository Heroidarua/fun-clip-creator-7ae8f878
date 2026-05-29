import { createFileRoute } from "@tanstack/react-router";
import BibliotecaQuadrinhos from "@/pages/blog/BibliotecaQuadrinhos";

export const Route = createFileRoute("/blog/biblioteca-quadrinhos")({
  component: BibliotecaQuadrinhos,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/biblioteca-quadrinhos";
    const title = "Biblioteca de quadrinhos grátis — SOS/01";
    const description = "Mais de 100 mil HQs e mangás (Marvel, DC, Naruto, One Piece e mais) para ler online sem cadastro pelo SOS/01.";
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
