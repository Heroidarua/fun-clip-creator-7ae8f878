import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";
import { buildSeo } from "@/lib/seo";
import { z } from "zod";

export const Route = createFileRoute("/jogos_/$category")({
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
    return buildSeo({
      path: `/jogos/${category}`,
      title: `Jogos de ${category} Retrô Grátis | SOS01`,
      description: `Jogue clássicos retrô de ${category} direto no navegador. Sem download, 100% grátis.`,
    });
  },
});
