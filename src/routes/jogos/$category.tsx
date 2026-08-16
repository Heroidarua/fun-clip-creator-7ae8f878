import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/jogos/$category")({
  component: Jogos,
  head: ({ params }) => {
    const category = params.category.charAt(0).toUpperCase() + params.category.slice(1);
    return buildSeo({
      path: `/jogos/${params.category}`,
      title: `Jogos de ${category} Retrô Grátis Online | SOS01`,
      description: `Explore nossa coleção de jogos de ${category} retrô. Jogue clássicos como Mario, Sonic e Street Fighter diretamente no seu navegador, 100% grátis.`,
      keywords: ["jogos retrô", `jogos de ${category}`, "arcade no navegador", "jogos online grátis"],
    });
  },
});