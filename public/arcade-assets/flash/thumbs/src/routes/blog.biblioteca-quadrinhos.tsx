import { createFileRoute } from "@tanstack/react-router";
import BibliotecaQuadrinhos from "@/pages/blog/BibliotecaQuadrinhos";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/biblioteca-quadrinhos")({
  component: BibliotecaQuadrinhos,
  head: () =>
    buildArticleSeo({
      path: "/blog/biblioteca-quadrinhos",
      title: "Biblioteca de Quadrinhos Online Grátis — Onde ler HQs legalmente",
      description: "Descubra onde ler quadrinhos, mangás e HQs online de graça e de forma legal, com plataformas oficiais organizadas pelo SOS01.",
      keywords: ["quadrinhos online","ler mangá grátis","hq online"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Biblioteca de Quadrinhos Online Grátis", path: "/blog/biblioteca-quadrinhos" },
      ],
    }),
});
