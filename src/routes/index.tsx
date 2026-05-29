import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SOS/01 — Downloads sem marca d'água, jogos retrô e ferramentas grátis" },
      { name: "description", content: "Baixe vídeos do TikTok, YouTube, Kwai e Instagram sem marca d'água. Jogos retrô, IA, QR Code e mais — 100% grátis, sem cadastro." },
      { property: "og:title", content: "SOS/01 — Ferramentas digitais 100% grátis" },
      { property: "og:description", content: "Downloaders, jogos retrô, biblioteca de quadrinhos e utilitários de IA sem cadastro." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://fun-clip-creator.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "O que é o SOS/01?", acceptedAnswer: { "@type": "Answer", text: "Plataforma 100% gratuita de utilidades digitais: downloaders de vídeo, biblioteca de quadrinhos, jogos retrô e utilitários com IA, sem cadastro e sem custos." } },
            { "@type": "Question", name: "É realmente grátis?", acceptedAnswer: { "@type": "Answer", text: "Sim. Todas as ferramentas são gratuitas, sem cadastro, sem trial e sem cobrança." } },
            { "@type": "Question", name: "Preciso instalar algum aplicativo?", acceptedAnswer: { "@type": "Answer", text: "Não. Tudo funciona direto no navegador, em celular, tablet ou computador." } },
            { "@type": "Question", name: "O SOS/01 armazena conteúdos?", acceptedAnswer: { "@type": "Answer", text: "Não. O SOS/01 atua apenas como interface técnica para acessar conteúdos públicos de terceiros." } },
          ],
        }),
      },
    ],
  }),
});
