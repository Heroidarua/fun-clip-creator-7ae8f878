import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import VirusDoBem from "@/components/tools/VirusDoBem";
import { buildToolSeo } from "@/lib/seo";

export const Route = createFileRoute("/virus-do-bem")({
  component: VirusDoBemPage,
  head: () =>
    buildToolSeo({
      path: "/virus-do-bem",
      title: "Vírus do Bem — Link de Pegadinha | SOS01",
      description:
        "Gere e compartilhe um link de pegadinha com seus amigos. Simples, rápido e divertido no SOS01.",
      keywords: [
        "vírus do bem",
        "pegadinha",
        "link de pegadinha",
        "trollar amigos",
        "link engraçado",
      ],
      toolName: "Vírus do Bem",
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
        { name: "Vírus do Bem", path: "/virus-do-bem" },
      ],
      faq: [
        {
          question: "O que é o Vírus do Bem?",
          answer:
            "É uma ferramenta de pegadinha que gera um link para você compartilhar com amigos. O SOS01 apenas exibe e copia o link; o conteúdo do destino é de responsabilidade do site externo.",
        },
        {
          question: "O link é seguro?",
          answer:
            "O link é um redirecionamento externo. Recomendamos abrir antes de enviar e nunca compartilhar com pessoas que não conheça.",
        },
        {
          question: "Posso usar no celular?",
          answer:
            "Sim. A ferramenta funciona em qualquer dispositivo e permite copiar, abrir ou compartilhar o link nativamente.",
        },
      ],
    }),
});

function VirusDoBemPage() {
  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Breadcrumbs
            items={[
              { name: "Início", path: "/" },
              { name: "Ferramentas", path: "/ferramentas" },
              { name: "Vírus do Bem", path: "/virus-do-bem" },
            ]}
          />

          <article
            className="pixel-card rounded-sm p-6 mt-6"
            style={{ borderColor: "hsl(150 80% 45% / 0.6)" }}
          >
            <header className="text-center mb-8">
              <h1 className="font-pixel text-lg text-emerald-500">
                🦠 VÍRUS DO BEM
              </h1>
              <p className="text-xs text-muted-foreground mt-2">
                Gere seu link e compartilhe com seus amigos. 😈
              </p>
            </header>

            <VirusDoBem />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
