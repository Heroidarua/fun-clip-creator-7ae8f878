import { createFileRoute } from "@tanstack/react-router";
import Contato from "@/pages/Contato";

export const Route = createFileRoute("/contato")({
  component: Contato,
  head: () => ({
    meta: [
      { title: "Contato — SOS/01" },
      { name: "description", content: "Fale com o time do SOS/01: dúvidas, sugestões, parcerias e suporte das ferramentas gratuitas." },
      { property: "og:title", content: "Contato — SOS/01" },
      { property: "og:description", content: "Canais de contato, suporte e parcerias do SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/contato" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/contato" }],
  }),
});
