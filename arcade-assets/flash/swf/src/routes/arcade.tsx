import { createFileRoute } from "@tanstack/react-router";
import ArcadePage from "@/pages/Arcade";
import { buildSeo } from "@/lib/seo";
import { ARCADE_GAMES, ARCADE_COUNTS } from "@/data/arcade";

const sample = ARCADE_GAMES.slice(0, 16);

export const Route = createFileRoute("/arcade")({
  component: ArcadePage,
  head: () =>
    buildSeo({
      path: "/arcade",
      title: "Arcade grátis online — 533 jogos retrô e Flash | SOS01",
      description: `Jogue ${ARCADE_COUNTS.all} clássicos retrô e Flash direto no navegador: Neo Geo, Capcom, Clássicos, PC em WASM e Flash. Coleção compilação do parceiro WASM Arcade, grátis e sem download.`,
      keywords: [
        "arcade grátis online",
        "jogar flash no navegador",
        "neo geo online grátis",
        "capcom classics online",
        "jogos retrô no navegador",
        "ruffle flash",
        "sos01 arcade",
      ],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Arcade", path: "/arcade" },
      ],
      schema: [
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Arcade SOS01",
          numberOfItems: ARCADE_COUNTS.all,
          itemListElement: sample.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: g.title,
            url: g.url,
          })),
        },
      ],
    }),
});
