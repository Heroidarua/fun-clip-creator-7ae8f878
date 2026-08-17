import { createFileRoute } from "@tanstack/react-router";
import Player from "@/pages/Player";
import { buildSeo } from "@/lib/seo";

const seo = buildSeo({
  path: "/player",
  title: "IPTV 1.0 — Assista mídia online grátis | SOS01",
  description: "Acesse o IPTV 1.0 do SOS01 para assistir filmes, séries e canais online diretamente pelo serviço integrado.",
  keywords: ["iptv 1.0", "player online", "assistir filmes", "streaming grátis"],
  type: "video.other",
});

export const Route = createFileRoute("/player")({
  component: Player,
  head: () => seo,
});
