import { createFileRoute } from "@tanstack/react-router";
import Admin from "@/pages/Admin";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () =>
    buildSeo({
      path: "/admin",
      title: "Administração — SOS01",
      description: "Painel administrativo interno do SOS01.",
      noindex: true,
    }),
});
