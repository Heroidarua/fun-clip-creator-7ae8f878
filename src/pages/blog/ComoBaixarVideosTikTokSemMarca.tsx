import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Music, Smartphone } from "lucide-react";

const ComoBaixarVideosTikTokSemMarca = () => {
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
              Como Baixar Vídeos do TikTok Sem Marca d'Água em 2025
            </h1>
            <div className="flex items-center text-muted-foreground text-sm mb-6">
              <span>Publicado em Janeiro de 2025</span>
              <span className="mx-2">•</span>
              <span>5 min de leitura</span>
            </div>
            <div className="w-full h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-6 flex items-center justify-center">
              <Download className="w-16 h-16 text-white" />
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg leading-relaxed">
              Baixar vídeos sem a marca d'água do TikTok nunca foi tão fácil. Com o ClipSave, você pode colar o link do vídeo e fazer o download limpo, em alta qualidade, sem precisar instalar aplicativos. Ideal para criar conteúdos em outras redes sociais, como Reels e Shorts.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Por que baixar vídeos sem marca d'água?</h2>
            <p>
              A marca d'água do TikTok pode atrapalhar quando você quer reutilizar o conteúdo em outras plataformas. Seja para criar compilações, fazer repostagens ou usar como material de referência, ter o vídeo limpo é essencial.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Passo a passo simples:</h2>
            <div className="bg-background border border-border rounded-lg p-6 my-6">
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                  <div>
                    <strong>Copie o link do TikTok</strong>
                    <p className="text-sm text-muted-foreground mt-1">Abra o TikTok, encontre o vídeo desejado e toque no ícone de compartilhar para copiar o link.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                  <div>
                    <strong>Cole no ClipSave</strong>
                    <p className="text-sm text-muted-foreground mt-1">Acesse o ClipSave e cole o link na caixa de texto principal.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <strong>Escolha o formato</strong>
                    <p className="text-sm text-muted-foreground mt-1">Selecione se quer baixar o vídeo completo ou apenas extrair o áudio.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                  <div>
                    <strong>Baixe instantaneamente</strong>
                    <p className="text-sm text-muted-foreground mt-1">Clique em "Baixar" e o arquivo será salvo no seu dispositivo em segundos!</p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Vantagens do ClipSave</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <Smartphone className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Funciona em qualquer dispositivo</h3>
                <p className="text-sm">Desktop, tablet ou celular - funciona perfeitamente em todos.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <Music className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Extração de áudio</h3>
                <p className="text-sm">Além do vídeo, você pode extrair apenas o áudio em MP3.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Dicas importantes</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Sempre respeite os direitos autorais do criador original</li>
              <li>Use o conteúdo baixado apenas para fins pessoais</li>
              <li>Dê créditos ao autor quando repostar em outras redes</li>
              <li>Certifique-se de que o vídeo seja público antes de baixar</li>
            </ul>

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">Pronto para começar?</h3>
              <p className="text-muted-foreground mb-4">
                Experimente agora mesmo e veja como é fácil baixar vídeos do TikTok sem marca d'água!
              </p>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Experimentar ClipSave Grátis
              </Link>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoBaixarVideosTikTokSemMarca;