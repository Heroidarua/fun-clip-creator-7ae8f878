import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <h1 className="text-3xl font-bold mb-4 text-foreground">Blog ClipSave</h1>
        <p className="text-muted-foreground mb-8">
          Guias, tutoriais e dicas para aproveitar ao máximo todas as ferramentas gratuitas do ClipSave.
        </p>

        <div className="space-y-6">
          {/* História - Destaque especial */}
          <div className="bg-gradient-to-r from-red-500/10 via-primary/10 to-red-500/10 border border-red-500/30 rounded-xl p-6 shadow-sm">
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-3">❤️ HISTÓRIA</span>
            <h2 className="text-xl font-semibold text-foreground mb-3">🚀 Como Nasceu o ClipSave</h2>
            <p className="text-muted-foreground mb-4">
              A história de Matheus Marinho e como uma frustração virou uma plataforma usada por milhares de pessoas. 100% gratuita, sem pegadinhas.
            </p>
            <Link
              to="/blog/como-nasceu-clipsave"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Ler a história completa →
            </Link>
          </div>

          {/* Guia Completo - Destaque */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-xl p-6 shadow-sm">
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mb-3">DESTAQUE</span>
            <h2 className="text-xl font-semibold text-foreground mb-3">📚 Guia Completo do ClipSave 2025</h2>
            <p className="text-muted-foreground mb-4">
              Conheça todas as funcionalidades: downloads, ferramentas com IA, jogos retrô e quadrinhos. Tudo 100% gratuito!
            </p>
            <Link
              to="/blog/guia-completo-clipsave"
              className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Ler guia completo →
            </Link>
          </div>

          {/* Novos Artigos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Ferramentas */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-block bg-purple-500/10 text-purple-500 text-xs font-bold px-2 py-1 rounded mb-3">NOVO</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">🛠️ Todas as Ferramentas Gratuitas</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Avatar com IA, removedor de fundo, QR Code, senhas fortes e mais 5 ferramentas.
              </p>
              <Link
                to="/blog/ferramentas-gratuitas"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ler artigo →
              </Link>
            </div>

            {/* Downloaders */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-block bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded mb-3">NOVO</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">📥 Como Baixar Vídeos</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Guia completo para TikTok, Instagram, Kwai e YouTube. Vídeo HD e MP3.
              </p>
              <Link
                to="/blog/como-usar-downloaders"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ler artigo →
              </Link>
            </div>

            {/* Quadrinhos */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-block bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded mb-3">NOVO</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">📖 Biblioteca de Quadrinhos</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Marvel, DC, Mangás e muito mais. Acesso 100% gratuito sem cadastro.
              </p>
              <Link
                to="/blog/biblioteca-quadrinhos"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ler artigo →
              </Link>
            </div>

            {/* Jogos */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 transition-colors">
              <span className="inline-block bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded mb-3">NOVO</span>
              <h2 className="text-lg font-semibold text-foreground mb-2">🎮 +60 Jogos Retrô Grátis</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Arcade clássico direto no navegador. Mario, Sonic, Pac-Man e mais.
              </p>
              <Link
                to="/blog/jogos-retro-gratis"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                Ler artigo →
              </Link>
            </div>
          </div>

          {/* Artigos Existentes */}
          <h3 className="text-lg font-semibold text-foreground mt-8 mb-4 border-b border-border pb-2">
            Mais Artigos
          </h3>

          {/* YouTube */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">▶️ Como Baixar Vídeos do YouTube em MP4 e MP3</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Aprenda a baixar vídeos do YouTube ou extrair apenas o áudio em MP3. Sistema robusto com múltiplos provedores.
            </p>
            <Link
              to="/blog/como-baixar-videos-youtube"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ler artigo →
            </Link>
          </div>

          {/* Kwai */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">🎬 Como Baixar Vídeos do Kwai Sem Marca d'Água</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Baixe vídeos do Kwai de forma rápida e gratuita, sem marcas d'água. Suporte a links curtos e longos.
            </p>
            <Link
              to="/blog/como-baixar-videos-kwai"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ler artigo →
            </Link>
          </div>

          {/* TikTok */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">📥 Como Baixar Vídeos do TikTok e Instagram</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Passo a passo para baixar vídeos do TikTok e Instagram com alta qualidade e sem marca d'água.
            </p>
            <Link
              to="/blog/como-baixar-videos-tiktok-sem-marca"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ler artigo →
            </Link>
          </div>

          {/* Áudio */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">🎵 Como Extrair Som de Vídeos em MP3</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Transforme o áudio de qualquer vídeo do TikTok, Instagram ou YouTube em MP3.
            </p>
            <Link
              to="/blog/como-extrair-audio-tiktok"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ler artigo →
            </Link>
          </div>

          {/* Dicas */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-2">🚀 Dicas para Criadores de Conteúdo 2025</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Algoritmos, horários de postagem, edições criativas e estratégias de crescimento.
            </p>
            <Link
              to="/blog/dicas-criadores-conteudo"
              className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ler artigo →
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;