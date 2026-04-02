import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Music, Headphones, Download } from "lucide-react";

const ComoExtrairAudioTikTok = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Link>
        </div>

        <article className="bg-card border border-border rounded-xl p-8 shadow-sm">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-inter">
              Como Extrair Som de Vídeos do TikTok em MP3
            </h1>
            <div className="flex items-center text-muted-foreground text-sm mb-6">
              <span>Publicado em Janeiro de 2025</span>
              <span className="mx-2">•</span>
              <span>4 min de leitura</span>
            </div>
            <div className="w-full h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mb-6 flex items-center justify-center">
              <Music className="w-16 h-16 text-white" />
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg leading-relaxed">
              Deseja transformar o som de um TikTok em uma música? Nossa ferramenta permite extrair o áudio de qualquer vídeo com um clique. É rápido, prático e funciona em qualquer dispositivo.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Por que extrair áudio do TikTok?</h2>
            <p>
              Muitas vezes encontramos músicas incríveis em vídeos do TikTok que queremos ouvir separadamente. Seja uma música de fundo, um remix exclusivo ou um áudio viral, extrair o som permite que você:
            </p>
            
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ouça sua música favorita offline</li>
              <li>Use o áudio em seus próprios projetos</li>
              <li>Crie playlists personalizadas</li>
              <li>Tenha acesso a remixes e versões únicas</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Processo simples de extração:</h2>
            <div className="bg-background border border-border rounded-lg p-6 my-6">
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <div>
                    <strong>Encontre o vídeo no TikTok</strong>
                    <p className="text-sm text-muted-foreground mt-1">Localize o vídeo com o áudio que você quer extrair.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <div>
                    <strong>Copie o link</strong>
                    <p className="text-sm text-muted-foreground mt-1">Toque no botão de compartilhar e copie o link do vídeo.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <strong>Cole no ClipSave</strong>
                    <p className="text-sm text-muted-foreground mt-1">Acesse nossa ferramenta e cole o link na caixa de texto.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <div>
                    <strong>Selecione "Áudio"</strong>
                    <p className="text-sm text-muted-foreground mt-1">Escolha a opção de extrair apenas o áudio em MP3.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">5</span>
                  <div>
                    <strong>Baixe em MP3</strong>
                    <p className="text-sm text-muted-foreground mt-1">Em segundos, seu arquivo de áudio estará pronto para download!</p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Qualidade e formato</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <Headphones className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Alta qualidade</h3>
                <p className="text-sm">Extraímos o áudio na melhor qualidade disponível do vídeo original.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <Download className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Formato MP3</h3>
                <p className="text-sm">Compatível com todos os dispositivos e players de música.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Usos criativos para o áudio extraído</h2>
            <div className="space-y-3">
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">🎵 Trilha sonora pessoal</h3>
                <p className="text-sm">Crie sua própria playlist com os áudios mais virais do TikTok.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">🎬 Projetos criativos</h3>
                <p className="text-sm">Use os áudios em seus vídeos, apresentações ou outros conteúdos.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">🔄 Backup de favoritos</h3>
                <p className="text-sm">Mantenha uma cópia dos seus áudios favoritos caso sejam removidos.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Aspectos legais e éticos</h2>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 my-6">
              <p className="text-sm">
                <strong>Importante:</strong> Sempre respeite os direitos autorais. Use o áudio extraído apenas para fins pessoais e não comerciais. Se for usar em projetos públicos, sempre dê crédito ao criador original.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">Comece a extrair áudios agora!</h3>
              <p className="text-muted-foreground mb-4">
                Descubra a facilidade de ter seus áudios favoritos do TikTok sempre à mão.
              </p>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Extrair Áudio Grátis
              </Link>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoExtrairAudioTikTok;