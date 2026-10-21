import { createFileRoute } from "@tanstack/react-router";
import ComoUsar from "@/pages/ComoUsar";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/como-usar")({
  component: ComoUsar,
  head: () =>
    buildSeo({
      path: "/como-usar",
      title: "Como usar o SOS01 — Guia rápido das ferramentas gratuitas",
      description: "Passo a passo para baixar vídeos, converter arquivos, gerar QR Code e usar todos os utilitários gratuitos do SOS01.",
      keywords: ["como baixar vídeos","tutorial downloader","guia sos01"],
    }),
});
