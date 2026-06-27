import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPremiumTool, PREMIUM_TOOLS } from "@/lib/premium-tools";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ferramenta/$slug")({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="font-pixel text-foreground">Ferramenta não encontrada</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <p className="text-destructive text-center">Erro: {error.message}</p>
    </div>
  ),
  loader: ({ params }) => {
    const tool = getPremiumTool(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ params }) => {
    const tool = PREMIUM_TOOLS.find((t) => t.slug === params.slug);
    if (!tool) return {};
    return {
      meta: [
        { title: `${tool.name} — SOS/01` },
        { name: "description", content: tool.description },
      ],
    };
  },
});

function ToolPage() {
  const { tool } = Route.useLoaderData();
  const Icon = tool.icon;
  const Component = tool.component;

  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/ferramentas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>

        <div className="pixel-card rounded-sm p-6" style={{ borderColor: `hsl(${tool.color} / 0.6)` }}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center border-2"
              style={{ background: `hsl(${tool.color} / 0.2)`, borderColor: `hsl(${tool.color} / 0.5)` }}
            >
              <Icon className="w-6 h-6" style={{ color: `hsl(${tool.color})` }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-base sm:text-lg" style={{ color: `hsl(${tool.color})` }}>
                  {tool.name.toUpperCase()}
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-pink-500 text-white">
                  <Sparkles className="w-3 h-3" /> PREMIUM
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-pixel">CARREGANDO...</p>
            </div>
          }>
            <Component />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}