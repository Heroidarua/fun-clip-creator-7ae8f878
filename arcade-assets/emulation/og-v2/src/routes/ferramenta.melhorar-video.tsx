import { createFileRoute } from '@tanstack/react-router';
import { getRegisteredTool } from '@/lib/tools-registry';
import VideoEnhancer from '@/components/tools/video-enhancer/VideoEnhancer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ToolSeoContent from '@/components/ToolSeoContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildToolSeo } from '@/lib/seo';
import { getToolSeo, getCategory, categoryPath } from '@/config/seo';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/ferramenta/melhorar-video')({
  component: VideoEnhancerPageRoute,
  head: () => {
    const slug = 'melhorar-video';
    const tool = getRegisteredTool(slug);
    if (!tool) return {};
    const seo = getToolSeo(slug);
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
      keywords: seo?.keywords ?? [tool.name.toLowerCase(), `${tool.name.toLowerCase()} online`],
      toolName: seo?.name ?? tool.name,
      noindex: tool.status !== "ready",
      breadcrumb,
      faq: seo?.faq,
    });
  },
});

function VideoEnhancerPageRoute() {
  const slug = 'melhorar-video';
  const tool = getRegisteredTool(slug);
  const seo = getToolSeo(slug);
  const category = seo ? getCategory(seo.category) : undefined;

  if (!tool || !seo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-pixel text-foreground">Ferramenta não encontrada</p>
      </div>
    );
  }

  const Icon = tool.icon;

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

        <article className="pixel-card rounded-sm p-6" style={{ borderColor: `hsl(${tool.color} / 0.6)` }}>
          <header className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center border-2"
              style={{ background: `hsl(${tool.color} / 0.2)`, borderColor: `hsl(${tool.color} / 0.5)` }}
            >
              <Icon className="w-6 h-6" style={{ color: `hsl(${tool.color})` }} />
            </div>
            <div className="flex-1">
              <h1 className="font-pixel text-base sm:text-lg" style={{ color: `hsl(${tool.color})` }}>
                {(seo?.h1 ?? tool.name).toUpperCase()}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">{seo.description}</p>
            </div>
          </header>

          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-pixel">CARREGANDO...</p>
            </div>
          }>
            <VideoEnhancer />
          </Suspense>
        </article>

        <ToolSeoContent tool={seo} />
      </main>
      <Footer />
    </div>
  );
}
