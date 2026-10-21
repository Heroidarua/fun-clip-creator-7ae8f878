import { createFileRoute } from "@tanstack/react-router";
import DigitalHavenStore from "@/pages/DigitalHavenStore";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/loja")({
  component: DigitalHavenStore,
  head: () =>
    buildSeo({
      path: "/loja",
      title: "Digital Haven Store — Assinaturas de IA e Streaming | SOS01",
      description: "Catálogo da Digital Haven Store no SOS01: IA, streaming e softwares com garantia e ativação explicadas. Confira os produtos.",
    }),
});
