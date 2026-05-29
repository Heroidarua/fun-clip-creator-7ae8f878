import { createFileRoute } from "@tanstack/react-router";
import Ferramentas from "@/pages/Ferramentas";

export const Route = createFileRoute("/ferramentas")({
  component: Ferramentas,
  head: () => ({
    meta: [
      { title: "Ferramentas gratuitas online — SOS/01" },
      { name: "description", content: "Catálogo de utilitários gratuitos: QR Code, gerador de senhas, conversor MP4 para MP3, removedor de fundo, encurtador de URL e mais." },
      { property: "og:title", content: "Ferramentas gratuitas — SOS/01" },
      { property: "og:description", content: "Utilitários online sem cadastro: QR Code, conversores, IA, geradores e mais." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/ferramentas" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/ferramentas" }],
  }),
});
