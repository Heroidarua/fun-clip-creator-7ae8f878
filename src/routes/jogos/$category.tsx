import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";
import { buildSeo } from "@/lib/seo";
import { z } from "zod";

export const Route = createFileRoute("/jogos/$category")({
  component: Jogos,
  validateSearch: (search) => z.object({
    q: z.string().optional(),
  }).parse(search),
  loader: ({ params }) => {
    return {
      category: params.category
    };
  },
  head: ({ params }) => {
    const category = params.category;
    const isMain = category === 'index' || !category;
    return buildSeo({
      path: isMain ? "/jogos" : `/jogos/${category}`,
      title: isMain ? "Jogos Retrô Grátis Online | SOS01" : `Jogos de ${category} Retrô Grátis | SOS01`,
      description: `Jogue clássicos retrô${isMain ? '' : ` de ${category}`} direto no navegador. Sem download, 100% grátis.`,
    });
  },
});
