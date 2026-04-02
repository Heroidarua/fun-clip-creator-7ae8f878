import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Download, Music, Video, CheckCircle, AlertTriangle } from "lucide-react";

const ComoBaixarVideosYouTube = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-10 text-base leading-relaxed">
        <Link
          to="/blog"
          className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Blog
        </Link>

        <article className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            Como Baixar Vídeos do YouTube em MP4 e MP3 com ClipSave
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Publicado em 15 de Janeiro de 2025 • Atualizado recentemente
          </p>

          <p className="text-foreground mb-6">
            O YouTube é a maior plataforma de vídeos do mundo, com bilhões de horas de conteúdo disponível. 
            Com o ClipSave, você pode salvar seus vídeos favoritos para assistir offline ou extrair 
            apenas o áudio em formato MP3. Tudo de forma rápida, gratuita e sem necessidade de instalação.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Por que baixar vídeos do YouTube?
          </h2>
          
          <ul className="list-disc list-inside text-foreground mb-6 space-y-2">
            <li>Assistir offline durante viagens ou em locais sem internet</li>
            <li>Criar compilações de estudo ou pesquisa</li>
            <li>Salvar tutoriais importantes para referência futura</li>
            <li>Extrair músicas e podcasts em MP3 para ouvir em qualquer lugar</li>
            <li>Arquivar conteúdos que podem ser removidos da plataforma</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Passo a passo para baixar
          </h2>
          
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <ol className="list-decimal list-inside text-foreground space-y-4">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">1.</span>
                <span>Copie o link do vídeo do YouTube (da barra de endereços ou botão "Compartilhar")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">2.</span>
                <span>Acesse o ClipSave e clique na aba "YouTube"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">3.</span>
                <span>Cole o link no campo indicado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">4.</span>
                <span>Escolha entre MP4 (vídeo) ou MP3 (áudio)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-primary">5.</span>
                <span>Clique em "BAIXAR" e aguarde o processamento</span>
              </li>
            </ol>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            Download de Áudio MP3
          </h2>
          
          <p className="text-foreground mb-6">
            O ClipSave permite extrair apenas o áudio dos vídeos em formato MP3 de alta qualidade. 
            Ideal para músicas, podcasts, audiobooks e qualquer conteúdo que você queira ouvir 
            sem precisar assistir ao vídeo. Basta selecionar a opção MP3 antes de baixar.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary" />
            Vantagens do ClipSave para YouTube
          </h2>
          
          <ul className="list-disc list-inside text-foreground mb-6 space-y-2">
            <li>Sistema de cascata com múltiplos provedores para máxima confiabilidade</li>
            <li>Suporte a vídeos de qualquer duração</li>
            <li>Download rápido sem filas de espera</li>
            <li>Opção de MP4 (vídeo) ou MP3 (áudio)</li>
            <li>Funciona em qualquer dispositivo com navegador</li>
            <li>100% gratuito e sem cadastro</li>
          </ul>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Uso Responsável
            </h3>
            <p className="text-foreground text-sm">
              O ClipSave é uma ferramenta de utilidade digital. Os usuários são responsáveis por 
              garantir que possuem os direitos necessários sobre qualquer conteúdo baixado. 
              Respeite os direitos autorais e utilize os downloads apenas para fins pessoais e 
              legais. Conteúdos protegidos por direitos autorais devem ser utilizados conforme 
              as leis de seu país.
            </p>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mt-8">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Experimente Agora!
            </h3>
            <p className="text-foreground mb-4">
              Pronto para baixar seus vídeos favoritos do YouTube? Acesse o ClipSave e 
              comece a usar gratuitamente.
            </p>
            <Link
              to="/"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Ir para o ClipSave
            </Link>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoBaixarVideosYouTube;
