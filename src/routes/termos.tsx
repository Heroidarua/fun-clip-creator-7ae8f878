import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "@/pages/TermsOfService";

export const Route = createFileRoute("/termos")({
  component: TermsOfService,
  head: () => ({
    meta: [
      { title: "Termos de Uso — SOS/01" },
      { name: "description", content: "Termos e condições de uso das ferramentas gratuitas do SOS/01." },
      { property: "og:title", content: "Termos de Uso — SOS/01" },
      { property: "og:description", content: "Termos e condições de uso do SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/termos" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/termos" }],
  }),
});
