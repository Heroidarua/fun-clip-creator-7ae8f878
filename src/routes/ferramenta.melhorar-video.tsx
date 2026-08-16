import { createFileRoute } from '@tanstack/react-router';
import { getRegisteredTool } from '@/lib/tools-registry';
import { TOOLS_SEO } from '@/config/seo';
import VideoEnhancer from '@/components/tools/video-enhancer/VideoEnhancer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ToolSeoContent } from '@/components/ToolSeoContent';
import { Helmet } from 'react-helmet-async';

export const Route = createFileRoute('/ferramenta/melhorar-video')({
  component: VideoEnhancerPageRoute,
  head: () => {
    const seo = TOOLS_SEO.find(s => s.slug === 'melhorar-video');
    return {
      title: seo?.title || 'Melhorar Vídeo Online',
      meta: [
        { name: 'description', content: seo?.description },
        { property: 'og:title', content: seo?.title },
        { property: 'og:description', content: seo?.description },
        { name: 'keywords', content: seo?.keywords.join(', ') },
      ],
    };
  },
});

function VideoEnhancerPageRoute() {
  const tool = getRegisteredTool('melhorar-video');
  const seo = TOOLS_SEO.find(s => s.slug === 'melhorar-video');

  if (!tool || !seo) return <div>Ferramenta não encontrada.</div>;

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Breadcrumbs 
        items={[
          { label: 'Ferramentas', to: '/' },
          { label: 'Vídeo', to: '/video' },
          { label: seo.name, to: `/ferramenta/${seo.slug}` },
        ]} 
      />

      <VideoEnhancer />

      <ToolSeoContent seo={seo} />
    </div>
  );
}
