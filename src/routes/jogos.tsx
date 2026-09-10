import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";
import { buildSeo } from "@/lib/seo";
import { games } from "@/data/games";
import { TOTAL_GAMES } from "@/config/stats";

/** Primeiros jogos visíveis na página, usados no ItemList / VideoGame. */
const VISIBLE_GAMES = games.slice(0, 24);

export const Route = createFileRoute("/jogos")({
  component: Jogos,
  head: () =>
    buildSeo({
      path: "/jogos",
      title: "Jogos retrô grátis online no navegador | SOS01",
      description: `Jogue ${TOTAL_GAMES} clássicos retrô direto no navegador: Mario, Sonic, Mortal Kombat e mais. Comece agora, sem download.`,
      schema: [
        {
          "@type": "ItemList",
          name: "Jogos retrô grátis no SOS01",
          numberOfItems: VISIBLE_GAMES.length,
          itemListElement: VISIBLE_GAMES.map((game, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "VideoGame",
              name: game.title,
              url: "https://sos01.com.br/jogos",
              image: game.img,
              gamePlatform: "Navegador Web",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              inLanguage: "pt-BR",
              offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
            },
          })),
        },
      ],
    }),
});
