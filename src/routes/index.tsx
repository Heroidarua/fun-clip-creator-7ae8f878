
import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildSeo, SITE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    buildSeo({
      path: "/",
      title: "SOS01.com.br — Ferramentas, jogos e serviços online grátis",
      description:
        "Explore o SOS01: baixe vídeos do YouTube, TikTok e Instagram sem marca d'água, jogue mais de 2700 jogos retrô e use ferramentas de IA e PDF 100% gratuitas e seguras.",
      keywords: [
        "sos01",
        "ferramentas online grátis",
        "jogos online grátis",
        "baixar vídeos youtube",
        "baixar vídeos tiktok sem marca d'água",
        "baixar vídeos instagram",
        "utilitários digitais",
        "sos01.com.br",
      ],
      faq: [
        {
          question: "O que é o SOS01?",
          answer:
            "O SOS01.com.br é uma plataforma multifuncional que oferece ferramentas de download de mídia, biblioteca de super-heróis, milhares de jogos retrô e utilitários com inteligência artificial, tudo de forma gratuita e sem necessidade de cadastro.",
        },
        {
          question: "Quais ferramentas o SOS01 oferece?",
          answer:
            "Oferecemos downloaders para YouTube, TikTok, Instagram e outras redes, conversores de PDF, removedores de fundo de imagem, geradores de QR Code e uma seção dedicada a jogos clássicos e informações sobre super-heróis.",
        },
        {
          question: "Como o SOS01 garante minha privacidade?",
          answer:
            "Muitas de nossas ferramentas, como o removedor de metadados e o gerador de senhas, processam os dados localmente no seu navegador, garantindo que suas informações sensíveis nunca saiam do seu dispositivo.",
        },
      ],
    }),
});
