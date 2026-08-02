import { createFileRoute } from "@tanstack/react-router";
import Iptv from "@/pages/Iptv";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/iptv")({
  component: Iptv,
  head: () =>
    buildSeo({
      path: "/iptv",
      title: "TV ON Grátis — Canais ao vivo e filmes online | SOS01",
      description: "Assista canais ao vivo e filmes gratuitos pela Pluto TV integrada ao SOS01. Sem cadastro e sem instalar aplicativos.",
      keywords: ["iptv grátis","canais ao vivo","pluto tv"],
    }),
});
