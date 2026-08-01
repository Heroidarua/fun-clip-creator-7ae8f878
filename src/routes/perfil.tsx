import { createFileRoute } from "@tanstack/react-router";
import Perfil from "@/pages/Perfil";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
  head: () =>
    buildSeo({
      path: "/perfil",
      title: "Meu Perfil — SOS01",
      description: "Gerencie seu perfil no SOS01: avatar, banner, bio e tema personalizado.",
      keywords: [],
      noindex: true,
    }),
});
