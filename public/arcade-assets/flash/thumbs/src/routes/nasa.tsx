import { createFileRoute } from "@tanstack/react-router";
import Nasa from "@/pages/Nasa";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/nasa")({
  component: Nasa,
  head: () =>
    buildSeo({
      path: "/nasa",
      title: "NASA Earth Satellites — Terra em tempo real | SOS01",
      description: "Explore a Terra em tempo real com satélites, dados científicos e visualização 3D oficial da NASA, direto no navegador.",
      keywords: ["nasa","satélites","terra em tempo real"],
    }),
});
