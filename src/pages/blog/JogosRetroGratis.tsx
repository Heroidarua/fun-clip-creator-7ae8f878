import { Link } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Gamepad2, Gift, Monitor, Zap } from "lucide-react";

const JogosRetroGratis = () => {
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
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-3 py-1 rounded-full">JOGOS</span>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            +60 Jogos Retrô Grátis para Jogar no Navegador
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Relembre os clássicos dos anos 80, 90 e 2000! O ClipSave oferece uma biblioteca de <strong>mais de 60 jogos de arcade</strong> que rodam diretamente no seu navegador, sem precisar instalar nada.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">100% Gratuito</span>
            </div>
            <p className="text-muted-foreground m-0">
              Todos os jogos são gratuitos, sem cadastro e funcionam em computadores, tablets e celulares.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Por Que Jogar no ClipSave?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">Sem Instalação</span>
              </div>
              <p className="text-sm text-muted-foreground m-0">
                Jogue direto no navegador. Funciona em Chrome, Firefox, Safari e Edge.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-foreground">Carregamento Rápido</span>
              </div>
              <p className="text-sm text-muted-foreground m-0">
                Jogos otimizados para carregar em segundos, mesmo em conexões lentas.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Categorias de Jogos Disponíveis
          </h2>
          <ul className="text-muted-foreground space-y-3">
            <li>
              <strong>🎮 Clássicos do Arcade</strong> - Pac-Man, Space Invaders, Galaga, Donkey Kong e outros icônicos
            </li>
            <li>
              <strong>🏃 Plataforma</strong> - Mario Bros, Sonic, Mega Man e aventuras side-scrolling
            </li>
            <li>
              <strong>🥊 Luta</strong> - Street Fighter, Mortal Kombat e batalhas épicas
            </li>
            <li>
              <strong>🏎️ Corrida</strong> - Mario Kart, Top Gear e velocidade máxima
            </li>
            <li>
              <strong>⚔️ Aventura/RPG</strong> - Zelda, Final Fantasy e jornadas épicas
            </li>
            <li>
              <strong>🧩 Puzzle</strong> - Tetris, Dr. Mario e desafios mentais
            </li>
            <li>
              <strong>⚽ Esportes</strong> - FIFA, NBA Jam e competições esportivas
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Como Jogar
          </h2>
          <ol className="text-muted-foreground space-y-3">
            <li><strong>1.</strong> Acesse a seção "Jogos" no menu principal</li>
            <li><strong>2.</strong> Navegue pelo carrossel ou lista completa de jogos</li>
            <li><strong>3.</strong> Clique em "JOGAR AGORA" no jogo desejado</li>
            <li><strong>4.</strong> Use as setas do teclado e teclas indicadas para jogar</li>
          </ol>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">
            Jogos Mais Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
            {[
              "Super Mario Bros",
              "Sonic the Hedgehog", 
              "Pac-Man",
              "Street Fighter II",
              "Tetris",
              "Donkey Kong",
              "Mega Man",
              "Mortal Kombat",
              "Space Invaders"
            ].map((game) => (
              <div key={game} className="bg-card border border-border rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">{game}</span>
              </div>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              🎮 Dica de Nostalgia
            </h3>
            <p className="text-muted-foreground m-0">
              Conecte um controle USB ao seu computador para uma experiência ainda mais autêntica! A maioria dos navegadores modernos reconhece controles automaticamente.
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

export default JogosRetroGratis;