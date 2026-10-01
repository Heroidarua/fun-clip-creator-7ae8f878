import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureGate from "@/components/FeatureGate";
import Breadcrumbs from "@/components/Breadcrumbs";
import ToolSeoContent from "@/components/ToolSeoContent";
import { getRegisteredTool } from "@/lib/tools-registry";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { buildToolSeo } from "@/lib/seo";
import { getToolSeo, getCategory, categoryPath } from "@/config/seo";

export const Route = createFileRoute("/ferramenta/$slug")({
  component: ToolPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="font-pixel text-foreground">Ferramenta não encontrada</p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <p className="text-destructive text-center">Erro: {(error as Error).message}</p>
    </div>
  ),
  head: ({ params }) => {
    const tool = getRegisteredTool(params.slug);
    if (!tool) return {};
    const seo = getToolSeo(params.slug);
    const category = seo ? getCategory(seo.category) : undefined;

    const breadcrumb = [
      { name: "Início", path: "/" },
      { name: "Ferramentas", path: "/ferramentas" },
      ...(category ? [{ name: category.label, path: categoryPath(category.id) }] : []),
      { name: seo?.name ?? tool.name, path: `/ferramenta/${tool.slug}` },
    ];

    return buildToolSeo({
      path: `/ferramenta/${tool.slug}`,
      title: seo?.title ?? `${tool.name} Online Grátis | SOS01`,
      description: seo?.description ?? tool.description,
      toolName: seo?.name ?? tool.name,
      noindex: tool.status !== "ready",
      breadcrumb,
      faq: seo?.faq,
    });
  },
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getRegisteredTool(slug);
  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-pixel text-foreground">Ferramenta não encontrada</p>
      </div>
    );
  }
  const seo = getToolSeo(slug);
  const category = seo ? getCategory(seo.category) : undefined;
  const Icon = tool.icon;
  const Component = tool.component;

  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Ferramentas", path: "/ferramentas" },
            ...(category ? [{ name: category.label, path: categoryPath(category.id) }] : []),
            { name: seo?.name ?? tool.name, path: `/ferramenta/${tool.slug}` },
          ]}
        />

        <Link to="/ferramentas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>

        <article className="pixel-card rounded-sm p-6" style={{ borderColor: `hsl(${tool.color} / 0.6)` }}>
          <header className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center border-2"
              style={{ background: `hsl(${tool.color} / 0.2)`, borderColor: `hsl(${tool.color} / 0.5)` }}
            >
              <Icon className="w-6 h-6" style={{ color: `hsl(${tool.color})` }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-pixel text-base sm:text-lg" style={{ color: `hsl(${tool.color})` }}>
                  {(seo?.h1 ?? tool.name).toUpperCase()}
                </h1>
                {tool.premium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-400 to-pink-500 text-white">
                    <Sparkles className="w-3 h-3" /> PREMIUM
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{seo?.description ?? tool.description}</p>
            </div>
          </header>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-pixel">CARREGANDO...</p>
            </div>
          }>
            {tool.featureKey ? (
              <FeatureGate featureKey={tool.featureKey} label={tool.name}>
                <Component />
              </FeatureGate>
            ) : (
              <Component />
            )}
          </Suspense>
        </article>

        {seo && <ToolSeoContent tool={seo} />}
      </main>
      <Footer />
    </div>
  );
}