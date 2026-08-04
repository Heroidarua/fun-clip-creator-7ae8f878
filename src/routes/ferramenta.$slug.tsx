import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPremiumTool, PREMIUM_TOOLS } from "@/lib/premium-tools";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import RelatedTools from "@/components/RelatedTools";
import { buildToolSeo } from "@/lib/seo";

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
  head: ({ params }) => {
    const tool = PREMIUM_TOOLS.find((t) => t.slug === params.slug);
    if (!tool) return {};
    
    // SEO Customizado para o Removedor de Metadados
    if (tool.slug === 'remover-metadados') {
      return buildToolSeo({
        path: `/ferramenta/${tool.slug}`,
        title: "Removedor de Metadados Online — Limpar EXIF e GPS Grátis | SOS01",
        description: "Remova metadados, localização GPS e informações privadas de imagens (JPG, PNG) e documentos (PDF, Word) 100% no seu navegador com o sos01.com.br.",
        keywords: [
          "remover metadados", "remover exif", "apagar gps da foto", "limpar metadados", 
          "metadata remover", "remover localização da imagem", "remover metadados pdf", 
          "metadata cleaner", "remover dados privados online"
        ],
        toolName: tool.name,
        breadcrumb: [
          { name: "Início", path: "/" },
          { name: "Ferramentas", path: "/ferramentas" },
          { name: tool.name, path: `/ferramenta/${tool.slug}` },
        ],
      });
    }

    const title = `${tool.name} Online Grátis | SOS01`;
    return buildToolSeo({
      path: `/ferramenta/${tool.slug}`,
      title,
      description: tool.description,
      keywords: [tool.name.toLowerCase(), `${tool.name.toLowerCase()} online`, "ferramenta grátis"],
      toolName: tool.name,
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
        { name: tool.name, path: `/ferramenta/${tool.slug}` },
      ],
    });
  },
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getPremiumTool(slug);
  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-pixel text-foreground">Ferramenta não encontrada</p>
      </div>
    );
  }
  const Icon = tool.icon;
  const Component = tool.component;

  if (slug === 'remover-metadados') {
    return (
      <div className="fixed inset-0 z-[9999] bg-background overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border h-14 shrink-0">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> VOLTAR PARA O SOS01
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tool.name}</span>
          </div>
        </div>
        <div className="flex-1 w-full bg-black relative">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-pixel uppercase tracking-widest">CARREGANDO AMBIENTE SEGURO...</p>
            </div>
          }>
            <Component />
          </Suspense>
        </div>
      </div>
    );
  }

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

        <RelatedTools />
      </main>
      <Footer />
    </div>
  );
}