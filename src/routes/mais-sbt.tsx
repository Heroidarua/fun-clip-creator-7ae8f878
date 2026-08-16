import { createFileRoute } from "@tanstack/react-router";
import MaisSbt from "@/pages/MaisSbt";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/mais-sbt")({
  component: MaisSbt,
  head: () =>
    buildSeo({
      path: "/mais-sbt",
      title: "+SBT Online Grátis — Novelas e programas | SOS01",
      description: "Acesse o +SBT pelo SOS01 e assista novelas, programas e conteúdos do SBT gratuitamente, direto no navegador.",
      keywords: ["+sbt","sbt online","novelas grátis"],
    }),
});
