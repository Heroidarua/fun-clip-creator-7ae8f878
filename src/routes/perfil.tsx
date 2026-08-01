import { createFileRoute } from "@tanstack/react-router";
import Perfil from "@/pages/Perfil";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
  head: () => ({
    meta: [
      { title: "Meu Perfil — SOS/01" },
      { name: "description", content: "Gerencie seu perfil no SOS/01: avatar, banner, bio e tema personalizado." },
      { property: "og:title", content: "Meu Perfil — SOS/01" },
      { property: "og:description", content: "Gerencie seu perfil no SOS/01: avatar, banner, bio e tema personalizado." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
});
