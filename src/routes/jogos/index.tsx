import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/jogos/")({
  component: Jogos,
  head: () =>
    buildSeo({
      path: "/jogos",
      title: "Jogos Retrô Grátis Online no Navegador | SOS01",
      description: "Jogue mais de 60 clássicos retrô direto no navegador: Mario, Sonic, Flash e outros. Sem download, sem cadastro e 100% grátis.",
      keywords: ["jogos retrô","jogos online grátis","arcade no navegador"],
    }),
});
