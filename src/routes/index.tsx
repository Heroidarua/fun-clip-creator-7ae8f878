import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildSeo, SITE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    buildSeo({
      path: "/",
      title: "SOS01 — Baixar vídeos sem marca d'água, jogos retrô e ferramentas grátis",
      description:
        "Baixe vídeos do TikTok, YouTube, Instagram, Kwai, Facebook e Pinterest sem marca d'água. Jogos retrô, utilitários com IA e gerador de QR Code — 100% grátis e sem cadastro.",
      keywords: [
        "baixar vídeo tiktok sem marca d'água",
        "baixar vídeo instagram",
        "baixar vídeo youtube",
        "downloader online grátis",
        "jogos retrô no navegador",
      ],
      faq: [
        {
          question: "O que é o SOS01?",
          answer:
            "O SOS01 é uma plataforma 100% gratuita de utilidades digitais: downloaders de vídeo, biblioteca de quadrinhos, jogos retrô e utilitários com IA, sem cadastro e sem custos.",
        },
        {
          question: "É realmente grátis?",
          answer:
            "Sim. Todas as ferramentas são gratuitas, sem cadastro, sem período de teste e sem cobrança.",
        },
        {
          question: "Preciso instalar algum aplicativo?",
          answer:
            "Não. Tudo funciona direto no navegador, em celular, tablet ou computador.",
        },
        {
          question: "O SOS01 armazena os conteúdos baixados?",
          answer:
            "Não. O SOS01 atua apenas como interface técnica para acessar conteúdos públicos de terceiros.",
        },
      ],
      schema: [
        {
          "@type": "WebSite",
          name: SITE.name,
          url: SITE.url,
          inLanguage: "pt-BR",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE.url}/ferramentas?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "SoftwareApplication",
          name: "SOS01",
          applicationCategory: "MultimediaApplication",
          operatingSystem: "Web",
          url: SITE.url,
          offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
        },
      ],
    }),
});
