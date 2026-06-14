import { createFileRoute } from "@tanstack/react-router";
import Blog from "@/pages/Blog";

export const Route = createFileRoute("/blog")({
  component: Blog,
  head: () => ({
    meta: [
      { title: "Blog SOS/01 — Tutoriais, dicas e novidades" },
      { name: "description", content: "Tutoriais de downloaders, dicas para criadores, novidades das ferramentas gratuitas e da plataforma SOS/01." },
      { property: "og:title", content: "Blog — SOS/01" },
      { property: "og:description", content: "Tutoriais, dicas e novidades do SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/blog" }],
  }),
});
