import { createFileRoute } from "@tanstack/react-router";
import ComoNasceuClipSave from "@/pages/blog/ComoNasceuClipSave";

export const Route = createFileRoute("/blog/como-nasceu-clipsave")({
  component: ComoNasceuClipSave,
  head: () => {
    const url = "https://fun-clip-creator.lovable.app/blog/como-nasceu-clipsave";
    const title = "A história por trás do SOS/01 (ClipSave) — SOS/01";
    const description = "Como nasceu o ClipSave / SOS/01, o projeto comunitário que oferece ferramentas digitais 100% gratuitas.";
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
