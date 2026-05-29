import { createFileRoute } from "@tanstack/react-router";
import PoliticaDePrivacidade from "@/pages/politica-de-privacidade";

export const Route = createFileRoute("/privacidade")({
  component: PoliticaDePrivacidade,
  head: () => ({
    meta: [
      { title: "Política de Privacidade — SOS/01" },
      { name: "description", content: "Como o SOS/01 trata seus dados: política de privacidade da plataforma de utilidades digitais gratuitas." },
      { property: "og:title", content: "Política de Privacidade — SOS/01" },
      { property: "og:description", content: "Como tratamos seus dados no SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/privacidade" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/privacidade" }],
  }),
});
