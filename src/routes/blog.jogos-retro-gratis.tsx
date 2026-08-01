import { createFileRoute } from "@tanstack/react-router";
import JogosRetroGratis from "@/pages/blog/JogosRetroGratis";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/jogos-retro-gratis")({
  component: JogosRetroGratis,
  head: () =>
    buildArticleSeo({
      path: "/blog/jogos-retro-gratis",
      title: "Jogos Retrô Grátis Online — Os melhores clássicos no navegador",
      description: "Lista dos melhores jogos retrô gratuitos jogáveis direto no navegador, sem download, sem emulador e sem cadastro.",
      keywords: ["jogos retrô grátis","clássicos online"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Jogos Retrô Grátis Online", path: "/blog/jogos-retro-gratis" },
      ],
    }),
});
