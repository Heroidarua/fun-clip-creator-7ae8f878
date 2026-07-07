import { createFileRoute } from "@tanstack/react-router";
import Iptv from "@/pages/Iptv";

export const Route = createFileRoute("/iptv")({
  component: Iptv,
  head: () => ({
    meta: [
      { title: "IPTV 📺 — Pluto TV grátis | SOS01" },
      { name: "description", content: "Acesse a Pluto TV direto pelo SOS01. Canais ao vivo e filmes 100% grátis." },
    ],
  }),
});