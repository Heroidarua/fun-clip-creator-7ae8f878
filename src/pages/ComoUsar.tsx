import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Copy, Download, Music, Smartphone } from "lucide-react";

const ComoUsar = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-inter">
              Como Usar o ClipSave
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aprenda como baixar vídeos do TikTok e Instagram sem marca d'água em 4 passos simples
            </p>
          </div>

          <div className="grid gap-8 md:gap-12">
            {/* Passo 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Copy className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">Acesse o TikTok ou Instagram e copie o link do vídeo</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Abra o aplicativo TikTok ou Instagram (ou acesse o site), encontre o vídeo que deseja baixar e toque no ícone de compartilhar. Selecione "Copiar link" para copiar a URL do vídeo.
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Dica:</strong> Certifique-se de que o vídeo é público. Vídeos privados não podem ser baixados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Smartphone className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">Cole o link na caixa do ClipSave</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Volte ao ClipSave e cole o link que você copiou na caixa de texto principal. Você pode usar o botão "Colar" ou simplesmente clicar na caixa e usar Ctrl+V (ou Cmd+V no Mac).
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Compatibilidade:</strong> Funciona em computadores, tablets e celulares.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Music className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">Escolha entre baixar o vídeo sem marca d'água ou extrair apenas o áudio</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Selecione o formato desejado: vídeo completo em MP4 (sem a marca d'água do TikTok ou Instagram) ou apenas o áudio em MP3. Ambas as opções mantêm a qualidade original.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-background border border-border rounded-lg p-3">
                      <h4 className="font-medium text-foreground mb-1">🎬 Vídeo (MP4)</h4>
                      <p className="text-sm text-muted-foreground">Ideal para repostar em outras redes</p>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-3">
                      <h4 className="font-medium text-foreground mb-1">🎵 Áudio (MP3)</h4>
                      <p className="text-sm text-muted-foreground">Perfeito para ouvir a música offline</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                  <div className="flex items-center mb-4">
                    <Download className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-xl font-semibold text-foreground">Clique em "Baixar" e pronto!</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Aguarde alguns segundos enquanto processamos seu vídeo. Em seguida, clique no botão de download que aparecerá. O arquivo será salvo automaticamente na pasta de downloads do seu dispositivo.
                  </p>
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Tempo de processamento:</strong> Geralmente entre 5-15 segundos, dependendo do tamanho do vídeo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Rápido */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Perguntas Frequentes
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">É seguro usar o ClipSave?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim! Não armazenamos seus dados nem os vídeos baixados. Todo o processo é anônimo e seguro.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">Preciso pagar para usar?</h3>
                <p className="text-sm text-muted-foreground">
                  Não! O ClipSave é 100% gratuito e sempre será. Sem taxas ocultas ou limitações.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">Funciona no celular?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim! Nosso site é totalmente responsivo e funciona perfeitamente em Android, iOS e desktop.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">Posso baixar vídeos privados?</h3>
                <p className="text-sm text-muted-foreground">
                  Não. Só é possível baixar vídeos públicos que tenham um link direto disponível.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Pronto para começar?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Agora que você sabe como usar, teste nossa ferramenta e baixe seus vídeos favoritos do TikTok e Instagram!
              </p>
              <a 
                href="/#conversor"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Começar Agora - Grátis
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ComoUsar;