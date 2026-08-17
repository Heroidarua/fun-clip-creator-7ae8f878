
import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { buildSeo, SITE } from "@/lib/seo";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    buildSeo({
      path: "/",
      title: "SOS01.com.br — Baixar vídeos sem marca d'água, jogos retrô e ferramentas grátis",
      description:
        "No SOS01.com.br você baixa vídeos do TikTok, YouTube, Instagram, Kwai, Facebook e Pinterest sem marca d'água. Explore jogos retrô, utilitários com IA e muito mais — 100% grátis.",
      keywords: [
        "sos01.com.br",
        "baixar vídeo tiktok sem marca d'água sos01",
        "baixar vídeo instagram sos01",
        "baixar vídeo youtube sos01",
        "sos01 downloader online grátis",
        "jogos retrô sos01",
      ],
      faq: [
        {
          question: "O que é o SOS01?",
          answer:
            "O SOS01.com.br é uma plataforma 100% gratuita de utilidades digitais: downloaders de vídeo, biblioteca de quadrinhos, jogos retrô e utilitários com IA, sem cadastro e sem custos.",
        },
        {
          question: "Como baixar vídeos do YouTube no SOS01?",
          answer:
            "Basta copiar o link do vídeo, colar no campo de busca do SOS01 e clicar em download. O sistema processa o link e inicia o download direto do servidor, sem redirecionamentos externos.",
        },
        {
          question: "O SOS01 é seguro e grátis?",
          answer:
            "Sim, o SOS01 é totalmente gratuito e prioriza a segurança, processando ferramentas de IA localmente no navegador quando possível e removendo metadados de privacidade em uploads.",
        },
      ],
    }),
});
