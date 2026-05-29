import { createFileRoute } from "@tanstack/react-router";
import JogosJava from "@/pages/JogosJava";

export const Route = createFileRoute("/jogos-java")({
  component: JogosJava,
  head: () => ({
    meta: [
      { title: "Jogos Java clássicos online — SOS/01" },
      { name: "description", content: "Reviva os jogos Java de celular antigo direto no navegador. Coleção gratuita e sem instalação." },
      { property: "og:title", content: "Jogos Java online — SOS/01" },
      { property: "og:description", content: "Clássicos Java de celular antigo, jogáveis no navegador." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/jogos-java" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/jogos-java" }],
  }),
});
