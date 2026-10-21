import { createFileRoute } from "@tanstack/react-router";
import FerramentasGratuitas from "@/pages/blog/FerramentasGratuitas";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/ferramentas-gratuitas")({
  component: FerramentasGratuitas,
  head: () =>
    buildArticleSeo({
      path: "/blog/ferramentas-gratuitas",
      title: "As Melhores Ferramentas Online Gratuitas de 2026",
      description: "Seleção das melhores ferramentas online gratuitas para edição, conversão, produtividade e criação de conteúdo.",
      keywords: ["ferramentas gratuitas","utilitários online"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "As Melhores Ferramentas Online Gratuitas de 2026", path: "/blog/ferramentas-gratuitas" },
      ],
    }),
});
