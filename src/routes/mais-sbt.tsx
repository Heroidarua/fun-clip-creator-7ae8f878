import { createFileRoute } from "@tanstack/react-router";
import MaisSbt from "@/pages/MaisSbt";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/mais-sbt")({
  component: MaisSbt,
  head: () =>
    buildSeo({
      path: "/mais-sbt",
      title: "+SBT — Assista TV Online Grátis | SOS01",
      description: "Assista a programação do +SBT ao vivo e on-demand direto no SOS01. Filmes, séries e programas de TV gratuitos.",
    }),
});
