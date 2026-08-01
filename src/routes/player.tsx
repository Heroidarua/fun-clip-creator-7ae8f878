import { createFileRoute } from "@tanstack/react-router";
import Player from "@/pages/Player";
import { buildSeo } from "@/lib/seo";

const seo = buildSeo({
  path: "/player",
  title: "SOS01 Player — Assista mídia online grátis",
  description: "Player premium do SOS01: reproduza filmes e mídia em tela cheia, com favoritos, compartilhamento e atalhos de teclado.",
  keywords: ["player online", "assistir filmes", "streaming grátis"],
  type: "video.other",
});

export const Route = createFileRoute("/player")({
  component: Player,
  head: () => ({
    ...seo,
    links: [
      ...(seo.links ?? []),
      { rel: "preconnect", href: "https://wplayer.click", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://wplayer.click" },
    ],
  }),
});
