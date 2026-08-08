import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Download, Video, Music, Sparkles, CheckCircle } from "lucide-react";
import tiktokIcon from "@/assets/tiktok-icon.png";
import instagramIcon from "@/assets/instagram-icon.png";
import kwaiIcon from "@/assets/kwai-icon.png";
import youtubeIcon from "@/assets/youtube-icon.png";

const ComoUsarDownloaders = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-8 h-8 text-primary" />
            <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-3 py-1 rounded-full">DOWNLOADS</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Como Baixar Vídeos do TikTok, Instagram, Kwai e YouTube
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Guia completo para usar os downloaders do sos01. Baixe vídeos em HD, sem marca d'água, ou extraia apenas o áudio em MP3. <strong>100% gratuito!</strong>
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Plataformas Suportadas
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <img src={tiktokIcon} alt="TikTok" loading="lazy" decoding="async" className="w-6 h-6" />
                <span className="text-muted-foreground">TikTok</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={instagramIcon} alt="Instagram" loading="lazy" decoding="async" className="w-6 h-6" />
                <span className="text-muted-foreground">Instagram</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={kwaiIcon} alt="Kwai" loading="lazy" decoding="async" className="w-6 h-6" />
                <span className="text-muted-foreground">Kwai</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={youtubeIcon} alt="YouTube" loading="lazy" decoding="async" className="w-6 h-6" />
                <span className="text-muted-foreground">YouTube</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Video className="w-6 h-6" />
            Passo a Passo para Baixar Vídeos
          </h2>
          
          <ol className="text-muted-foreground space-y-4">
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <div>
                <strong className="text-foreground">Copie o Link do Vídeo</strong>
                <p className="text-sm mt-1">Abra o app ou site da plataforma, encontre o vídeo desejado e copie o link de compartilhamento.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <div>
                <strong className="text-foreground">Cole no sos01</strong>
                <p className="text-sm mt-1">Na página inicial, localize a aba da plataforma correta (TikTok, Instagram, Kwai ou YouTube) e cole o link no campo.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <div>
                <strong className="text-foreground">Clique em "Buscar"</strong>
                <p className="text-sm mt-1">Aguarde alguns segundos enquanto processamos o vídeo. Uma prévia será exibida com as informações.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <div>
                <strong className="text-foreground">Escolha e Baixe</strong>
                <p className="text-sm mt-1">Selecione "Vídeo HD" para baixar o vídeo completo ou "Áudio MP3" para extrair apenas o som.</p>
              </div>
            </li>
          </ol>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Funcionalidades por Plataforma
          </h2>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={tiktokIcon} alt="TikTok" className="w-5 h-5" />
                <h3 className="font-bold text-foreground">TikTok</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vídeo em HD sem marca d'água</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Extração de áudio MP3</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Suporte a links curtos e longos</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={instagramIcon} alt="Instagram" className="w-5 h-5" />
                <h3 className="font-bold text-foreground">Instagram</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Reels e vídeos do feed</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Fotos em alta qualidade</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Carrosséis (múltiplas fotos/vídeos)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Stories públicos</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={kwaiIcon} alt="Kwai" className="w-5 h-5" />
                <h3 className="font-bold text-foreground">Kwai</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vídeos sem marca d'água</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Expansão automática de links curtos</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Download rápido e direto</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={youtubeIcon} alt="YouTube" className="w-5 h-5" />
                <h3 className="font-bold text-foreground">YouTube</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Vídeos em múltiplas qualidades</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Extração de áudio MP3</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sistema robusto com múltiplos provedores</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4 flex items-center gap-2">
            <Music className="w-6 h-6" />
            Extraindo Apenas o Áudio
          </h2>
          <p className="text-muted-foreground">
            Quer salvar apenas a música ou o som de um vídeo? Após buscar o vídeo, basta clicar no botão "Áudio MP3" em vez de "Vídeo HD". O arquivo de áudio será baixado no formato MP3, compatível com qualquer player de música.
          </p>
          <p className="text-muted-foreground mt-2">
            Ideal para:
          </p>
          <ul className="text-muted-foreground">
            <li>Salvar músicas virais do TikTok</li>
            <li>Extrair podcasts do YouTube</li>
            <li>Baixar trilhas sonoras de vídeos</li>
            <li>Criar playlists offline</li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ⚠️ Uso Responsável
            </h3>
            <p className="text-sm text-muted-foreground m-0">
              Respeite os direitos autorais. Use os downloads apenas para conteúdos públicos e sempre dê crédito aos criadores originais. O sos01 não incentiva a violação de direitos autorais.
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro 2025
            </p>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoUsarDownloaders;