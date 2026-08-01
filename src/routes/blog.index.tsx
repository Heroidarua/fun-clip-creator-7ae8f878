import { createFileRoute } from "@tanstack/react-router";
import Blog from "@/pages/Blog";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  component: Blog,
  head: () =>
    buildSeo({
      path: "/blog",
      title: "Blog SOS01 — Tutoriais, dicas e novidades",
      description: "Tutoriais de downloaders, dicas para criadores de conteúdo e novidades das ferramentas gratuitas do SOS01.",
      keywords: ["blog","tutoriais","dicas para criadores"],
    }),
});
