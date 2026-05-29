import { createFileRoute } from "@tanstack/react-router";
import DicasCriadoresConteudo from "@/pages/blog/DicasCriadoresConteudo";

export const Route = createFileRoute("/blog/dicas-criadores-conteudo")({
  component: DicasCriadoresConteudo,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/dicas-criadores-conteudo";
    const title = "Dicas práticas para criadores de conteúdo — SOS/01";
    const description = "Ferramentas, atalhos e boas práticas para acelerar a produção de quem trabalha com vídeo e redes sociais.";
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
