import { createFileRoute } from "@tanstack/react-router";
import DicasCriadoresConteudo from "@/pages/blog/DicasCriadoresConteudo";
import { buildArticleSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/dicas-criadores-conteudo")({
  component: DicasCriadoresConteudo,
  head: () =>
    buildArticleSeo({
      path: "/blog/dicas-criadores-conteudo",
      title: "Dicas Essenciais para Criadores de Conteúdo em 2026",
      description: "Estratégias, ferramentas e boas práticas para criadores de conteúdo crescerem em TikTok, Instagram, YouTube e Kwai.",
      keywords: ["dicas criadores","crescer no tiktok","marketing de conteúdo"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Dicas Essenciais para Criadores de Conteúdo em 2026", path: "/blog/dicas-criadores-conteudo" },
      ],
    }),
});
