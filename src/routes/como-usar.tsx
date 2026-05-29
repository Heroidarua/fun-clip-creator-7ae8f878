import { createFileRoute } from "@tanstack/react-router";
import ComoUsar from "@/pages/ComoUsar";

export const Route = createFileRoute("/como-usar")({
  component: ComoUsar,
  head: () => ({
    meta: [
      { title: "Como usar o SOS/01 — Guia rápido das ferramentas" },
      { name: "description", content: "Passo a passo para usar os downloaders de vídeo, conversores, gerador de QR Code e demais utilitários do SOS/01." },
      { property: "og:title", content: "Como usar o SOS/01" },
      { property: "og:description", content: "Guia rápido das ferramentas gratuitas do SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/como-usar" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/como-usar" }],
  }),
});
