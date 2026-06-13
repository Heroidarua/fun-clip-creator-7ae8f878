import { useState, lazy, Suspense, ComponentType } from "react";
import { Music, Eraser, Image, QrCode, Link2, Wrench, Stamp, KeyRound, UserSquare2, ChevronDown, Sparkles, FileImage, PenTool, Languages, FileText, Loader2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Lazy-load each tool — they only download/parse when the user opens its accordion.
// Cuts initial bundle by ~5k lines of tool code on the home page.
const MP4ToMP3Converter   = lazy(() => import("@/components/tools/MP4ToMP3Converter"));
const BackgroundRemover   = lazy(() => import("@/components/tools/BackgroundRemover"));
const ThumbnailGenerator  = lazy(() => import("@/components/tools/ThumbnailGenerator"));
const QRCodeGenerator     = lazy(() => import("@/components/tools/QRCodeGenerator"));
const UrlShortener        = lazy(() => import("@/components/tools/UrlShortener"));
const WatermarkTool       = lazy(() => import("@/components/tools/WatermarkTool"));
const PasswordGenerator   = lazy(() => import("@/components/tools/PasswordGenerator"));
const PixelAvatarGenerator = lazy(() => import("@/components/tools/PixelAvatarGenerator"));
const ImageToPdfConverter = lazy(() => import("@/components/tools/ImageToPdfConverter"));
const AITextGenerator     = lazy(() => import("@/components/tools/AITextGenerator"));
const AutoTranslator      = lazy(() => import("@/components/tools/AutoTranslator"));
const TextSummarizer      = lazy(() => import("@/components/tools/TextSummarizer"));

const ToolFallback = () => (
  <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-xs font-pixel">CARREGANDO...</span>
  </div>
);

interface Tool {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  Component: ComponentType<{ onSuccess?: () => void }>;
  trackKey: string;
  featured?: boolean;
}

const UtilityToolsSection = () => {
  const [openTool, setOpenTool] = useState<string | null>(null);
  const trackToolUsage = (_: string) => {};

  const handleToggle = (toolId: string) => {
    setOpenTool(openTool === toolId ? null : toolId);
  };

  const tools: Tool[] = [
    {
      id: "pixel-avatar-generator",
      title: "AVATAR PIXELADO",
      subtitle: "Crie avatares retrô com IA",
      icon: <UserSquare2 className="w-5 h-5" />,
      color: "hsl(280, 100%, 60%)",
      borderColor: "hsl(280 100% 60% / 0.8)",
      bgColor: "hsl(280, 100%, 60%, 0.2)",
      Component: PixelAvatarGenerator,
      trackKey: "avatar",
      featured: true,
    },
    {
      id: "mp4-to-mp3",
      title: "CONVERSOR MP4 → MP3",
      subtitle: "Extraia áudio de vídeos",
      icon: <Music className="w-5 h-5" />,
      color: "hsl(var(--primary))",
      borderColor: "hsl(var(--primary) / 0.5)",
      bgColor: "hsl(var(--primary) / 0.2)",
      Component: MP4ToMP3Converter,
      trackKey: "audio",
    },
    {
      id: "url-shortener",
      title: "ENCURTADOR DE URL",
      subtitle: "Crie links curtos",
      icon: <Link2 className="w-5 h-5" />,
      color: "hsl(200, 100%, 50%)",
      borderColor: "hsl(200 100% 50% / 0.5)",
      bgColor: "hsl(200, 100%, 50%, 0.2)",
      Component: UrlShortener,
      trackKey: "url",
    },
    {
      id: "background-remover",
      title: "REMOVEDOR DE FUNDO",
      subtitle: "Remova fundos de imagens",
      icon: <Eraser className="w-5 h-5" />,
      color: "hsl(280, 100%, 60%)",
      borderColor: "hsl(280 100% 60% / 0.5)",
      bgColor: "hsl(280, 100%, 60%, 0.2)",
      Component: BackgroundRemover,
      trackKey: "background",
    },
    {
      id: "thumbnail-generator",
      title: "GERADOR DE THUMBNAILS",
      subtitle: "Crie miniaturas para vídeos",
      icon: <Image className="w-5 h-5" />,
      color: "hsl(45, 100%, 50%)",
      borderColor: "hsl(45 100% 50% / 0.5)",
      bgColor: "hsl(45, 100%, 50%, 0.2)",
      Component: ThumbnailGenerator,
      trackKey: "thumbnail",
    },
    {
      id: "qr-code-generator",
      title: "GERADOR DE QR CODE",
      subtitle: "Crie QR Codes personalizados",
      icon: <QrCode className="w-5 h-5" />,
      color: "hsl(160, 100%, 40%)",
      borderColor: "hsl(160 100% 40% / 0.5)",
      bgColor: "hsl(160, 100%, 40%, 0.2)",
      Component: QRCodeGenerator,
      trackKey: "qr",
    },
    {
      id: "watermark-tool",
      title: "MARCA D'ÁGUA",
      subtitle: "Adicione texto ou logo",
      icon: <Stamp className="w-5 h-5" />,
      color: "hsl(320, 100%, 50%)",
      borderColor: "hsl(320 100% 50% / 0.5)",
      bgColor: "hsl(320, 100%, 50%, 0.2)",
      Component: WatermarkTool,
      trackKey: "watermark",
    },
    {
      id: "password-generator",
      title: "GERADOR DE SENHAS",
      subtitle: "Crie senhas fortes",
      icon: <KeyRound className="w-5 h-5" />,
      color: "hsl(140, 100%, 40%)",
      borderColor: "hsl(140 100% 40% / 0.5)",
      bgColor: "hsl(140, 100%, 40%, 0.2)",
      Component: PasswordGenerator,
      trackKey: "password",
    },
    {
      id: "image-to-pdf",
      title: "IMAGEM PARA PDF",
      subtitle: "Converta imagens em PDF",
      icon: <FileImage className="w-5 h-5" />,
      color: "hsl(10, 100%, 55%)",
      borderColor: "hsl(10 100% 55% / 0.5)",
      bgColor: "hsl(10, 100%, 55%, 0.2)",
      Component: ImageToPdfConverter,
      trackKey: "other",
    },
    {
      id: "ai-text-generator",
      title: "GERADOR DE TEXTO IA",
      subtitle: "Crie textos com inteligência artificial",
      icon: <PenTool className="w-5 h-5" />,
      color: "hsl(250, 100%, 65%)",
      borderColor: "hsl(250 100% 65% / 0.8)",
      bgColor: "hsl(250, 100%, 65%, 0.2)",
      Component: AITextGenerator,
      trackKey: "other",
      featured: true,
    },
    {
      id: "auto-translator",
      title: "TRADUTOR AUTOMÁTICO",
      subtitle: "Traduza textos para vários idiomas",
      icon: <Languages className="w-5 h-5" />,
      color: "hsl(190, 100%, 45%)",
      borderColor: "hsl(190 100% 45% / 0.8)",
      bgColor: "hsl(190, 100%, 45%, 0.2)",
      Component: AutoTranslator,
      trackKey: "other",
      featured: true,
    },
    {
      id: "text-summarizer",
      title: "RESUMIDOR DE TEXTO",
      subtitle: "Resuma textos longos com IA",
      icon: <FileText className="w-5 h-5" />,
      color: "hsl(30, 100%, 50%)",
      borderColor: "hsl(30 100% 50% / 0.8)",
      bgColor: "hsl(30, 100%, 50%, 0.2)",
      Component: TextSummarizer,
      trackKey: "other",
      featured: true,
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-4 relative overflow-hidden tools-fx-section">
      {/* Special FX background — only behind utility tools */}
      <div className="tools-fx-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="tools-fx-grid" />
        <div className="tools-fx-orb tools-fx-orb-1" />
        <div className="tools-fx-orb tools-fx-orb-2" />
        <div className="tools-fx-orb tools-fx-orb-3" />
        <div className="tools-fx-scanlines" />
        <div className="tools-fx-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="tools-fx-particle" style={{ ['--i' as any]: i }} />
          ))}
        </div>
      </div>
      <div className="container mx-auto max-w-4xl relative">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-[4px_4px_0_hsl(var(--accent))] border-2 border-foreground/20">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="font-pixel text-lg sm:text-xl text-primary neon-text">
                FERRAMENTAS ÚTEIS
              </h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Ferramentas gratuitas para converter, editar e criar conteúdo
            </p>
          </div>
        </ScrollReveal>

        {/* Tools Accordion */}
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <ScrollReveal key={tool.id} delay={0.1 + index * 0.05}>
              <Collapsible
                open={openTool === tool.id}
                onOpenChange={() => handleToggle(tool.id)}
              >
                <div
                  className={`pixel-card rounded-sm overflow-hidden transition-all duration-300 ${
                    tool.featured ? "ring-2 ring-offset-2 ring-offset-background" : ""
                  }`}
                  style={{ 
                    borderColor: tool.borderColor,
                    ...(tool.featured && { ringColor: tool.color })
                  }}
                >
                  {/* Tool Header - Always Visible */}
                  <CollapsibleTrigger className="w-full">
                    <div 
                      className={`flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-card/50 transition-colors ${
                        tool.featured ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-10 h-10 rounded-sm flex items-center justify-center border-2 ${
                            tool.featured ? "animate-pulse" : ""
                          }`}
                          style={{ 
                            backgroundColor: tool.bgColor,
                            borderColor: tool.borderColor,
                            color: tool.color
                          }}
                        >
                          {tool.icon}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 
                              className="font-pixel text-xs sm:text-sm"
                              style={{ color: tool.color }}
                            >
                              {tool.title}
                            </h3>
                            {tool.featured && (
                              <span 
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse"
                              >
                                <Sparkles className="w-3 h-3" />
                                IA
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {tool.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform duration-300 ${
                          openTool === tool.id ? "rotate-180" : ""
                        }`}
                        style={{ color: tool.color }}
                      />
                    </div>
                  </CollapsibleTrigger>

                  {/* Tool Content - Collapsible */}
                  <CollapsibleContent>
                    <div className="p-4 sm:p-5 pt-0 border-t border-border/30">
                      {openTool === tool.id ? (
                        <Suspense fallback={<ToolFallback />}>
                          <tool.Component onSuccess={() => trackToolUsage(tool.trackKey)} />
                        </Suspense>
                      ) : null}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UtilityToolsSection;
