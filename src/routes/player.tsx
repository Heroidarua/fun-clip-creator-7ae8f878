import { createFileRoute } from "@tanstack/react-router";
import Player from "@/pages/Player";

const TITLE = "SOS01 Player — Assista mídia online grátis";
const DESC =
  "Player premium do SOS01: reproduza mídia em tela cheia, com favoritos, compartilhamento e atalhos de teclado.";

export const Route = createFileRoute("/player")({
  component: Player,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "video.other" },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/player" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "theme-color", content: "#0d1117" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/player" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: "SOS01 Player",
          description: DESC,
          uploadDate: "2026-01-01",
          embedUrl: "https://wplayer.click/dashboard?view=movies",
        }),
      },
    ],
  }),
});