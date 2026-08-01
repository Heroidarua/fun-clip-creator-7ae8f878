import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () =>
    buildSeo({
      path: "/dashboard",
      title: "Dashboard — Central de ferramentas do SOS01",
      description: "Painel do SOS01 com acesso rápido a downloaders, utilitários com IA, jogos retrô e todas as ferramentas gratuitas.",
      keywords: ["painel","dashboard","central de ferramentas"],
    }),
});
