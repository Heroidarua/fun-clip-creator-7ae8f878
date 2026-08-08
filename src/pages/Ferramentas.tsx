import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import MP4ToMP3Converter from "@/components/tools/MP4ToMP3Converter";
import BackgroundRemover from "@/components/tools/BackgroundRemover";
import ThumbnailGenerator from "@/components/tools/ThumbnailGenerator";
import QRCodeGenerator from "@/components/tools/QRCodeGenerator";
import WatermarkTool from "@/components/tools/WatermarkTool";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import PixelAvatarGenerator from "@/components/tools/PixelAvatarGenerator";
import UrlShortener from "@/components/tools/UrlShortener";
import AITextGenerator from "@/components/tools/AITextGenerator";
import AutoTranslator from "@/components/tools/AutoTranslator";
import TextSummarizer from "@/components/tools/TextSummarizer";
import FeatureGate from "@/components/FeatureGate";
import ToolsIndex from "@/components/ToolsIndex";
import SiteSearch from "@/components/SiteSearch";
import { Wrench, Music, Eraser, Image, QrCode, Stamp, KeyRound, UserSquare2, Link2, Sparkles, PenTool, Languages, FileText, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PREMIUM_TOOLS } from "@/lib/premium-tools";

const Ferramentas = () => {
  return (
    <div className="min-h-screen bg-background font-orbitron">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-[4px_4px_0_hsl(var(--accent))] border-2 border-foreground/20">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="font-pixel text-xl sm:text-2xl text-primary neon-text">
                FERRAMENTAS
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ferramentas gratuitas para converter, baixar, editar e criar conteúdo
            </p>
            <div className="mt-6 max-w-xl mx-auto">
              <SiteSearch />
            </div>
          </div>
        </ScrollReveal>

        {/* Featured Tool - Pixel Avatar */}
        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto mb-8">
            <div className="pixel-card rounded-sm p-6 ring-2 ring-offset-2 ring-offset-background ring-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10" style={{ borderColor: 'hsl(280 100% 60% / 0.8)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(280,100%,60%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(280,100%,60%)]/50 animate-pulse">
                  <UserSquare2 className="w-5 h-5 text-[hsl(280,100%,60%)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-sm text-[hsl(280,100%,60%)]">AVATAR PIXELADO</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Crie avatares retrô com inteligência artificial</p>
                </div>
              </div>
              <FeatureGate featureKey="pixel-avatar" label="Avatar Pixelado"><PixelAvatarGenerator /></FeatureGate>
            </div>
          </div>
        </ScrollReveal>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* MP4 to MP3 Converter */}
          <ScrollReveal delay={0.2}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(var(--primary) / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-sm flex items-center justify-center border-2 border-primary/50">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-primary">CONVERSOR MP4 → MP3</h2>
                  <p className="text-xs text-muted-foreground">Extraia áudio de vídeos</p>
                </div>
              </div>
              <FeatureGate featureKey="mp4-to-mp3" label="Conversor MP4→MP3"><MP4ToMP3Converter /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* URL Shortener */}
          <ScrollReveal delay={0.25}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(200 100% 50% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(200,100%,50%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(200,100%,50%)]/50">
                  <Link2 className="w-5 h-5 text-[hsl(200,100%,50%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(200,100%,50%)]">ENCURTADOR DE URL</h2>
                  <p className="text-xs text-muted-foreground">Crie links curtos e fáceis</p>
                </div>
              </div>
              <FeatureGate featureKey="url-shortener" label="Encurtador de URL"><UrlShortener /></FeatureGate>
            </div>
          </ScrollReveal>


          {/* Background Remover */}
          <ScrollReveal delay={0.35}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(280 100% 60% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(280,100%,60%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(280,100%,60%)]/50">
                  <Eraser className="w-5 h-5 text-[hsl(280,100%,60%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(280,100%,60%)]">REMOVEDOR DE FUNDO</h2>
                  <p className="text-xs text-muted-foreground">Remova fundos de imagens com IA</p>
                </div>
              </div>
              <FeatureGate featureKey="background-remover" label="Removedor de Fundo"><BackgroundRemover /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* Thumbnail Generator */}
          <ScrollReveal delay={0.4}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(45 100% 50% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(45,100%,50%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(45,100%,50%)]/50">
                  <Image className="w-5 h-5 text-[hsl(45,100%,50%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(45,100%,50%)]">GERADOR DE THUMBNAILS</h2>
                  <p className="text-xs text-muted-foreground">Crie miniaturas para vídeos</p>
                </div>
              </div>
              <FeatureGate featureKey="thumbnail" label="Gerador de Thumbnails"><ThumbnailGenerator /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* QR Code Generator */}
          <ScrollReveal delay={0.45}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(160 100% 40% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(160,100%,40%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(160,100%,40%)]/50">
                  <QrCode className="w-5 h-5 text-[hsl(160,100%,40%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(160,100%,40%)]">GERADOR DE QR CODE</h2>
                  <p className="text-xs text-muted-foreground">Crie QR Codes personalizados</p>
                </div>
              </div>
              <FeatureGate featureKey="qr-code" label="Gerador de QR Code"><QRCodeGenerator /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* Watermark Tool */}
          <ScrollReveal delay={0.5}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(320 100% 50% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(320,100%,50%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(320,100%,50%)]/50">
                  <Stamp className="w-5 h-5 text-[hsl(320,100%,50%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(320,100%,50%)]">MARCA D'ÁGUA</h2>
                  <p className="text-xs text-muted-foreground">Adicione texto ou logo em imagens</p>
                </div>
              </div>
              <FeatureGate featureKey="watermark" label="Marca d'água"><WatermarkTool /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* Password Generator */}
          <ScrollReveal delay={0.55}>
            <div className="pixel-card rounded-sm p-6 h-full" style={{ borderColor: 'hsl(140 100% 40% / 0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(140,100%,40%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(140,100%,40%)]/50">
                  <KeyRound className="w-5 h-5 text-[hsl(140,100%,40%)]" />
                </div>
                <div>
                  <h2 className="font-pixel text-sm text-[hsl(140,100%,40%)]">GERADOR DE SENHAS</h2>
                  <p className="text-xs text-muted-foreground">Crie senhas fortes e seguras</p>
                </div>
              </div>
              <FeatureGate featureKey="password" label="Gerador de Senhas"><PasswordGenerator /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* AI Text Generator */}
          <ScrollReveal delay={0.6}>
            <div className="pixel-card rounded-sm p-6 h-full ring-2 ring-offset-2 ring-offset-background ring-purple-500 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" style={{ borderColor: 'hsl(250 100% 65% / 0.8)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(250,100%,65%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(250,100%,65%)]/50 animate-pulse">
                  <PenTool className="w-5 h-5 text-[hsl(250,100%,65%)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-sm text-[hsl(250,100%,65%)]">GERADOR DE TEXTO IA</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Crie textos com inteligência artificial</p>
                </div>
              </div>
              <FeatureGate featureKey="ai-text" label="Gerador de Texto IA"><AITextGenerator /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* Auto Translator */}
          <ScrollReveal delay={0.65}>
            <div className="pixel-card rounded-sm p-6 h-full ring-2 ring-offset-2 ring-offset-background ring-cyan-500 bg-gradient-to-r from-cyan-500/10 to-teal-500/10" style={{ borderColor: 'hsl(190 100% 45% / 0.8)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(190,100%,45%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(190,100%,45%)]/50 animate-pulse">
                  <Languages className="w-5 h-5 text-[hsl(190,100%,45%)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-sm text-[hsl(190,100%,45%)]">TRADUTOR AUTOMÁTICO</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-white animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Traduza textos para vários idiomas</p>
                </div>
              </div>
              <FeatureGate featureKey="translator" label="Tradutor Automático"><AutoTranslator /></FeatureGate>
            </div>
          </ScrollReveal>

          {/* Text Summarizer */}
          <ScrollReveal delay={0.7}>
            <div className="pixel-card rounded-sm p-6 h-full ring-2 ring-offset-2 ring-offset-background ring-orange-500 bg-gradient-to-r from-orange-500/10 to-amber-500/10" style={{ borderColor: 'hsl(30 100% 50% / 0.8)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[hsl(30,100%,50%)]/20 rounded-sm flex items-center justify-center border-2 border-[hsl(30,100%,50%)]/50 animate-pulse">
                  <FileText className="w-5 h-5 text-[hsl(30,100%,50%)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-pixel text-sm text-[hsl(30,100%,50%)]">RESUMIDOR DE TEXTO</h2>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      IA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Resuma textos longos com IA</p>
                </div>
              </div>
              <FeatureGate featureKey="summarizer" label="Resumidor de Texto"><TextSummarizer /></FeatureGate>
            </div>
          </ScrollReveal>
        </div>

        {/* Ferramentas adicionais — mesma categoria das ferramentas úteis */}
        <ScrollReveal delay={0.15}>
          <div className="max-w-6xl mx-auto mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PREMIUM_TOOLS.map((tool) => {
                const Icon = tool.icon;
                const soon = tool.status === "soon";
                return (
                  <div
                    key={tool.slug}
                    className="pixel-card rounded-sm p-4 flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
                    style={{ borderColor: `hsl(${tool.color} / 0.5)` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-sm flex items-center justify-center border-2 shrink-0"
                        style={{ background: `hsl(${tool.color} / 0.2)`, borderColor: `hsl(${tool.color} / 0.5)` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: `hsl(${tool.color})` }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-pixel text-[11px]" style={{ color: `hsl(${tool.color})` }}>
                            {tool.name.toUpperCase()}
                          </h3>
                          {soon && (
                            <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-muted text-muted-foreground border border-border">
                              EM BREVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                    </div>
                    <Link
                      to="/ferramenta/$slug"
                      params={{ slug: tool.slug }}
                      aria-disabled={soon}
                      onClick={(e) => soon && e.preventDefault()}
                      className={`mt-auto inline-flex items-center justify-center gap-1 text-xs font-pixel py-2 rounded-sm border-2 transition-all ${
                        soon
                          ? "opacity-50 cursor-not-allowed border-border bg-muted text-muted-foreground"
                          : "border-foreground/20 bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {soon ? "EM BREVE" : "ABRIR"}
                      {!soon && <ArrowRight className="w-3 h-3" />}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <ToolsIndex />
      </main>

      <Footer />
    </div>
  );
};

export default Ferramentas;