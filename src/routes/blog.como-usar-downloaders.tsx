import { createFileRoute } from "@tanstack/react-router";
import ComoUsarDownloaders from "@/pages/blog/ComoUsarDownloaders";

export const Route = createFileRoute("/blog/como-usar-downloaders")({
  component: ComoUsarDownloaders,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-usar-downloaders";
    const title = "Como usar os downloaders do SOS/01 — Guia rápido";
    const description = "Aprenda a usar os downloaders de TikTok, YouTube, Kwai e Instagram em poucos cliques, sem instalar nada.";
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
