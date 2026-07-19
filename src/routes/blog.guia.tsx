import { createFileRoute } from "@tanstack/react-router";
import GuiaCompletoClipSave from "@/pages/blog/GuiaCompleto";

export const Route = createFileRoute("/blog/guia-completo")({
  component: GuiaCompletoClipSave,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/guia";
    const title = "Guia completo do SOS/01 — Tudo o que dá pra fazer";
    const description = "Um tour completo por todas as ferramentas, jogos, IA e utilitários gratuitos disponíveis no SOS/01.";
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
