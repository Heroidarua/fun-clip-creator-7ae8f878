import { createFileRoute } from "@tanstack/react-router";
import JogosRetroGratis from "@/pages/blog/JogosRetroGratis";

export const Route = createFileRoute("/blog/jogos-retro-gratis")({
  component: JogosRetroGratis,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/jogos-retro-gratis";
    const title = "Jogos retrô grátis online no navegador — SOS/01";
    const description = "Mais de 60 clássicos retrô jogáveis direto no navegador, sem download e sem cadastro.";
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
