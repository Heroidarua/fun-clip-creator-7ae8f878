import { createFileRoute, notFound } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/$")({
  // Lança notFound() para que o servidor responda HTTP 404 de verdade
  // (antes devolvia 200 — soft 404 aos olhos do Google).
  loader: () => {
    throw notFound();
  },
  component: NotFound,
  notFoundComponent: NotFound,
  head: () => ({
    meta: [
      { title: "Página não encontrada — SOS01" },
      { name: "description", content: "A página que você procura não existe ou foi movida. Volte para a home do SOS01 e continue usando as ferramentas gratuitas." },
      { name: "robots", content: "noindex, follow" },
      { name: "googlebot", content: "noindex, follow" },
      { property: "og:title", content: "Página não encontrada — SOS01" },
      { property: "og:description", content: "A página que você procura não existe ou foi movida." },
      { property: "og:type", content: "website" },
    ],
  }),
});
