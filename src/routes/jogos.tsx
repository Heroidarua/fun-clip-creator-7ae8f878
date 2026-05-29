import { createFileRoute } from "@tanstack/react-router";
import Jogos from "@/pages/Jogos";

export const Route = createFileRoute("/jogos")({
  component: Jogos,
  head: () => ({
    meta: [
      { title: "Jogos retrô grátis no navegador — SOS/01" },
      { name: "description", content: "Mais de 60 jogos clássicos retrô que rodam direto no navegador. Sem download, sem cadastro, 100% grátis." },
      { property: "og:title", content: "Arcade Zone — Jogos retrô grátis" },
      { property: "og:description", content: "Mais de 60 clássicos que rodam no navegador, sem cadastro." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/jogos" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/jogos" }],
  }),
});
