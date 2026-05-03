import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingUp, Clock, Users, Zap } from "lucide-react";

const DicasCriadoresConteudo = () => {
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
              Dicas para Criadores de Conteúdo no TikTok em 2025
            </h1>
            <div className="flex items-center text-muted-foreground text-sm mb-6">
              <span>Publicado em Janeiro de 2025</span>
              <span className="mx-2">•</span>
              <span>7 min de leitura</span>
            </div>
            <div className="w-full h-64 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg mb-6 flex items-center justify-center">
              <TrendingUp className="w-16 h-16 text-white" />
            </div>
          </header>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg leading-relaxed">
              Quer viralizar no TikTok? Use sons em alta, edições criativas e poste nos horários certos. Aprenda como o algoritmo funciona e transforme vídeos simples em grandes sucessos com consistência e estratégia.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Entendendo o algoritmo do TikTok</h2>
            <p>
              O algoritmo do TikTok é complexo, mas alguns fatores são fundamentais para o sucesso. Ele prioriza vídeos que geram engajamento rápido nos primeiros segundos, interações genuínas e tempo de visualização completo.
            </p>

            <div className="bg-background border border-border rounded-lg p-6 my-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Fatores que o algoritmo considera:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">✅ Positivos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Taxa de conclusão alta</li>
                    <li>• Comentários e shares</li>
                    <li>• Re-visualizações</li>
                    <li>• Tempo de tela total</li>
                    <li>• Interações rápidas</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">❌ Negativos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Pessoas pulando rapidamente</li>
                    <li>• Falta de interações</li>
                    <li>• Relatórios negativos</li>
                    <li>• Conteúdo repetitivo</li>
                    <li>• Baixa qualidade</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Use sons em alta (trending)</h2>
            <div className="bg-background border border-border rounded-lg p-4 my-4">
              <p>
                Sons virais são um dos fatores mais importantes. O TikTok favorece vídeos que usam áudios populares, especialmente nos primeiros dias após o áudio começar a viralizar.
              </p>
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-foreground">Como encontrar sons em alta:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Explore a página "Para Você" e note quais áudios se repetem</li>
                  <li>• Use a aba "Descobrir" para ver trends de áudio</li>
                  <li>• Acompanhe criadores de sua categoria</li>
                  <li>• Teste áudios com menos de 100k usos (oportunidade de pegar trend cedo)</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Horários estratégicos para postar</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <Clock className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Melhores horários gerais</h3>
                <ul className="text-sm space-y-1">
                  <li>• 18h às 21h (pico de engajamento)</li>
                  <li>• 12h às 15h (almoço)</li>
                  <li>• 21h às 23h (antes de dormir)</li>
                </ul>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <Users className="w-8 h-8 text-accent mb-2" />
                <h3 className="font-semibold text-foreground mb-2">Analise sua audiência</h3>
                <p className="text-sm">Use o TikTok Analytics para descobrir quando seu público específico está mais ativo online.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Técnicas de edição que funcionam</h2>
            <div className="space-y-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">🎬 Hook nos primeiros 3 segundos</h4>
                <p className="text-sm">Comece com algo impactante: uma pergunta, fato surpreendente ou transformação visual.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">✂️ Cortes rápidos e dinâmicos</h4>
                <p className="text-sm">Mantenha o ritmo acelerado com cortes a cada 2-3 segundos para manter a atenção.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">📱 Formato vertical otimizado</h4>
                <p className="text-sm">Use todo o espaço da tela, elementos centralizados e texto legível no celular.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">🔄 Loop perfeito</h4>
                <p className="text-sm">Faça o final conectar com o início para incentivar re-visualizações.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Estratégias de conteúdo que viralizam</h2>
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">📈 Formatos que funcionam:</h4>
                <ul className="text-sm space-y-2">
                  <li>• Antes e depois</li>
                  <li>• Tutoriais rápidos</li>
                  <li>• Trending challenges</li>
                  <li>• Curiosidades e fatos</li>
                  <li>• Behind the scenes</li>
                  <li>• Reações genuínas</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">💡 Gatilhos psicológicos:</h4>
                <ul className="text-sm space-y-2">
                  <li>• FOMO (fear of missing out)</li>
                  <li>• Nostalgia</li>
                  <li>• Surpresa e transformação</li>
                  <li>• Identificação pessoal</li>
                  <li>• Humor e entretenimento</li>
                  <li>• Valor educativo</li>
                </ul>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Consistência é fundamental</h2>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 my-6">
              <div className="flex items-start space-x-3">
                <Zap className="w-6 h-6 text-accent mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Frequência ideal de postagem:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Iniciantes: 1 vídeo por dia</li>
                    <li>• Intermediário: 1-2 vídeos por dia</li>
                    <li>• Avançado: 2-3 vídeos por dia</li>
                  </ul>
                  <p className="text-sm mt-3">
                    <strong>Dica:</strong> É melhor postar 1 vídeo de qualidade por dia do que 3 vídeos ruins.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Engajamento e comunidade</h2>
            <p>
              Responda comentários nas primeiras horas após a publicação. O algoritmo valoriza criadores que mantêm conversas ativas. Faça perguntas nos vídeos para incentivar comentários e crie conteúdo que responda dúvidas da sua audiência.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Ferramentas úteis para criadores</h2>
            <div className="space-y-3">
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">📊 Analytics</h4>
                <p className="text-sm">Use o TikTok Creator Fund e Analytics para entender sua audiência e performance.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">🎵 sos01 para research</h4>
                <p className="text-sm">Baixe vídeos virais para estudar técnicas de edição e encontrar inspiração.</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">📱 Apps de edição</h4>
                <p className="text-sm">CapCut, InShot, ou próprio editor do TikTok para efeitos básicos.</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">Pronto para viralizar?</h3>
              <p className="text-muted-foreground mb-4">
                Lembre-se: o sucesso no TikTok vem da combinação de estratégia, criatividade e consistência. Não desista nos primeiros vídeos!
              </p>
              <Link 
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Começar a Criar Conteúdo
              </Link>
            </div>
          </div>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default DicasCriadoresConteudo;