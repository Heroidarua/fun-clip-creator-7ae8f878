import { createFileRoute } from "@tanstack/react-router";
import Player from "@/pages/Player";
import { buildSeo } from "@/lib/seo";

const seo = buildSeo({
  path: "/player",
  title: "SOS01 Player — Assista mídia online grátis",
  description: "Acesse o SOS01 Player para assistir filmes e outras mídias online diretamente pelo serviço integrado.",
  keywords: ["player online", "assistir filmes", "streaming grátis"],
  type: "video.other",
});

export const Route = createFileRoute("/player")({
  component: Player,
  head: () => ({
    ...seo,
    links: [
      ...(seo.links ?? []),
      { rel: "preconnect", href: "https://wplayer.link", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://wplayer.link" },
    ],
  }),
});
