import { createFileRoute } from "@tanstack/react-router";
import JogosJava from "@/pages/JogosJava";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/jogos-java")({
  component: JogosJava,
  head: () =>
    buildSeo({
      path: "/jogos-java",
      title: "Jogos Java de Celular Antigo Online Grátis | SOS01",
      description: "Reviva os jogos Java de celular antigo direto no navegador. Coleção gratuita, sem instalação e sem emulador.",
      keywords: ["jogos java","celular antigo","j2me online"],
    }),
});
