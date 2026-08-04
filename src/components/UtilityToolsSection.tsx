import { useState, lazy, Suspense, ComponentType } from "react";
import { Music, Eraser, Image, QrCode, Link2, Wrench, Stamp, KeyRound, UserSquare2, Sparkles, FileImage, PenTool, Languages, FileText, Loader2, Brain, Image as ImageIcon, Settings2, Play, ShieldCheck } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FeatureGate from "@/components/FeatureGate";

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
  featureKey: string;
  featured?: boolean;
  category: "ia" | "midia" | "imagem" | "utilidades";
}

const UtilityToolsSection = () => {
  const [openTool, setOpenTool] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | Tool["category"]>("all");
  const trackToolUsage = (_: string) => {};

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
      featureKey: "pixel-avatar",
      featured: true,
      category: "ia",
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
      featureKey: "mp4-to-mp3",
      category: "midia",
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
      featureKey: "url-shortener",
      category: "utilidades",
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
      featureKey: "background-remover",
      category: "imagem",
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
      featureKey: "thumbnail",
      category: "imagem",
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
      featureKey: "qr-code",
      category: "utilidades",
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
      featureKey: "watermark",
      category: "imagem",
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
      featureKey: "password",
      category: "utilidades",
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
      featureKey: "image-to-pdf",
      category: "imagem",
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
      featureKey: "ai-text",
      featured: true,
      category: "ia",
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
      featureKey: "translator",
      featured: true,
      category: "ia",
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
      featureKey: "summarizer",
      featured: true,
      category: "ia",
    },
  ];

  const categories: { id: "all" | Tool["category"]; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "TODAS", icon: <Wrench className="w-4 h-4" /> },
    { id: "ia", label: "IA", icon: <Brain className="w-4 h-4" /> },
    { id: "midia", label: "MÍDIA", icon: <Music className="w-4 h-4" /> },
    { id: "imagem", label: "IMAGEM", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "utilidades", label: "UTILIDADES", icon: <Settings2 className="w-4 h-4" /> },
  ];

  const filteredTools = activeCategory === "all"
    ? tools
    : tools.filter((t) => t.category === activeCategory);

  const activeTool = tools.find((t) => t.id === openTool) ?? null;

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
      <div className="container mx-auto max-w-6xl relative">
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

        {/* Category filter tabs (cartridge style) */}
        <ScrollReveal>
          <div className="mb-8 flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`font-pixel inline-flex items-center gap-2 rounded-sm border-2 px-3 py-2 text-[10px] sm:text-xs transition-all ${
                    active
                      ? "bg-primary text-primary-foreground border-foreground/30 shadow-cartridge translate-y-0"
                      : "bg-card text-foreground/80 border-border hover:border-primary/60 hover:-translate-y-0.5"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Tools grid — large pixel-art cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredTools.map((tool, index) => (
            <ScrollReveal key={tool.id} delay={0.05 + index * 0.04}>
              <button
                type="button"
                onClick={() => setOpenTool(tool.id)}
                className="group relative w-full text-left cartridge rounded-sm bg-card p-5 sm:p-6 transition-transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary/60"
                style={{ borderColor: tool.borderColor }}
              >
                {/* Pixel-art icon block */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 grid place-items-center rounded-sm border-2"
                    style={{
                      backgroundColor: tool.bgColor,
                      borderColor: tool.color,
                      color: tool.color,
                      boxShadow: `4px 4px 0 ${tool.color}`,
                      imageRendering: "pixelated",
                    }}
                  >
                    {/* scanline overlay for pixel feel */}
                    <div
                      aria-hidden
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)",
                      }}
                    />
                    <div className="scale-[1.6] sm:scale-[1.9]">{tool.icon}</div>
                  </div>
                  {tool.featured && (
                    <span className="font-pixel inline-flex items-center gap-1 rounded-sm border border-foreground/20 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-[9px] text-white shadow-cartridge">
                      <Sparkles className="w-3 h-3" /> IA
                    </span>
                  )}
                </div>

                <h3 className="font-pixel text-xs sm:text-sm leading-snug mb-2" style={{ color: tool.color }}>
                  {tool.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 min-h-[2.5rem]">
                  {tool.subtitle}
                </p>

                <div
                  className="font-pixel inline-flex items-center gap-2 rounded-sm border-2 px-3 py-2 text-[10px] transition-colors"
                  style={{
                    borderColor: tool.color,
                    color: tool.color,
                    backgroundColor: tool.bgColor,
                  }}
                >
                  <Play className="w-3 h-3" />
                  ABRIR
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        {/* Modal — opened tool */}
        <Dialog open={!!openTool} onOpenChange={(o) => !o && setOpenTool(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto cartridge rounded-sm bg-card">
            {activeTool && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-pixel text-sm sm:text-base flex items-center gap-3" style={{ color: activeTool.color }}>
                    <span
                      className="w-10 h-10 grid place-items-center rounded-sm border-2"
                      style={{
                        backgroundColor: activeTool.bgColor,
                        borderColor: activeTool.color,
                        color: activeTool.color,
                      }}
                    >
                      {activeTool.icon}
                    </span>
                    {activeTool.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="pt-4">
                  <Suspense fallback={<ToolFallback />}>
                    <FeatureGate
                      featureKey={activeTool.featureKey}
                      label={activeTool.title}
                    >
                      <activeTool.Component onSuccess={() => trackToolUsage(activeTool.trackKey)} />
                    </FeatureGate>
                  </Suspense>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default UtilityToolsSection;
