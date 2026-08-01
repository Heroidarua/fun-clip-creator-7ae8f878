import { createFileRoute } from "@tanstack/react-router";
import NotFound from "@/pages/NotFound";

export const Route = createFileRoute("/$")({
  component: NotFound,
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
