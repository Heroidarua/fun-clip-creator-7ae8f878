import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gamepad2, X, Search, Joystick, Play, Grid3X3, LayoutGrid, Zap, Trophy, Star, Heart } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { games, Game } from "@/data/games";
import { useFavoriteGames } from "@/hooks/useFavoriteGames";
import { useAchievements } from "@/hooks/useAchievements";

function GameCard({ game, onPlay, isFavorite, onToggleFavorite }: { game: Game; onPlay: () => void; isFavorite: boolean; onToggleFavorite: () => void }) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  function handleMove(e: React.MouseEvent) {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateY = ((x - midX) / midX) * 10;
    const rotateX = -((y - midY) / midY) * 10;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
  }

  function handleLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onPlay}
      className="group relative cursor-pointer transition-all duration-300"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Pixel border glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-retro-red via-retro-yellow to-retro-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
           style={{ clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))" }} />
      
      {/* Card content */}
      <div className="relative bg-retro-dark overflow-hidden transition-colors duration-300"
           style={{ 
             clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))",
             boxShadow: "inset 0 0 0 2px hsl(var(--retro-purple))"
           }}>
        {/* Image container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-retro-purple/20 via-background/50 to-retro-cyan/20">
          <img
            src={game.img || `https://placehold.co/400x300/1a1a2e/ffffff?text=${encodeURIComponent(game.title)}`}
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            draggable={false}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = `https://placehold.co/400x300/1a1a2e/ffffff?text=${encodeURIComponent(game.title)}`;
            }}
          />
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-retro-dark via-transparent to-transparent opacity-80" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 bg-retro-red flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300"
                 style={{ 
                   clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))",
                   boxShadow: "4px 4px 0 hsl(var(--retro-dark))"
                 }}>
              <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Game number badge - arcade style */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-retro-purple font-pixel text-[10px] text-white"
               style={{ boxShadow: "2px 2px 0 hsl(var(--retro-dark))" }}>
            #{game.id}
          </div>
          
          {/* Favorite button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
              isFavorite 
                ? 'bg-retro-red text-white' 
                : 'bg-retro-dark/80 text-retro-gray hover:text-retro-red hover:bg-retro-dark'
            }`}
            style={{ 
              clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))",
              boxShadow: "2px 2px 0 hsl(var(--retro-dark))" 
            }}
          >
            <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Title and Button */}
        <div className="p-3 space-y-3 bg-gradient-to-b from-retro-dark to-retro-darker">
          <h3 className="font-retro text-sm text-white line-clamp-1 group-hover:text-retro-cyan transition-colors duration-300">
            {game.title}
          </h3>
          <Button 
            size="sm" 
            className="w-full gap-2 bg-retro-red hover:bg-retro-red/90 text-white font-pixel text-[10px] rounded-none transition-all duration-200"
            style={{ boxShadow: "3px 3px 0 hsl(var(--retro-dark))" }}
          >
            <Joystick className="w-4 h-4" />
            JOGAR
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Jogos() {
  const [fullscreenGame, setFullscreenGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gridSize, setGridSize] = useState<"small" | "large">("large");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavoriteGames();
  const { trackGamePlayed } = useAchievements();

  // Track game when fullscreen game changes
  useEffect(() => {
    if (fullscreenGame) {
      trackGamePlayed();
    }
  }, [fullscreenGame, trackGamePlayed]);

  const filteredGames = useMemo(() => {
    let result = games;
    
    if (showFavoritesOnly) {
      result = result.filter((game) => favorites.includes(game.id));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((game) => game.title.toLowerCase().includes(query));
    }
    
    return result;
  }, [searchQuery, showFavoritesOnly, favorites]);

  return (
    <>
      <Header />

      <main className="min-h-screen pt-24 pb-20 bg-retro-darker">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          {/* Retro background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-retro-purple/10 via-transparent to-transparent" />
          
          {/* Pixel grid pattern */}
          <div className="absolute inset-0 opacity-10"
               style={{
                 backgroundImage: `linear-gradient(hsl(var(--retro-purple)) 1px, transparent 1px),
                                   linear-gradient(90deg, hsl(var(--retro-purple)) 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
               }} />
          
          {/* Arcade glow spots */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-retro-red/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-retro-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-10 w-32 h-32 bg-retro-yellow/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Title */}
            <div className="text-center mb-10">
              {/* Arcade badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-retro-purple font-pixel text-xs text-white mb-6"
                   style={{ boxShadow: "4px 4px 0 hsl(var(--retro-dark))" }}>
                <Joystick className="w-4 h-4 text-retro-yellow" />
                ARCADE ZONE
              </div>
              
              <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 leading-relaxed">
                <span className="text-white">JOGOS</span>
                <span className="text-retro-cyan neon-text"> CLÁSSICOS</span>
              </h1>
              
              <p className="font-retro text-retro-gray text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Reviva a nostalgia com nossa coleção de {games.length} jogos retrô. 
                Jogue direto no navegador, sem downloads.
              </p>
              
              {/* Stats badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-3 py-2 bg-retro-dark border-2 border-retro-red"
                     style={{ boxShadow: "3px 3px 0 hsl(var(--retro-red) / 0.3)" }}>
                  <Gamepad2 className="w-4 h-4 text-retro-red" />
                  <span className="font-pixel text-[10px] text-white">{games.length} JOGOS</span>
                </div>
                <button 
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`flex items-center gap-2 px-3 py-2 border-2 transition-all duration-200 ${
                    showFavoritesOnly 
                      ? 'bg-retro-red border-retro-red' 
                      : 'bg-retro-dark border-retro-red/50 hover:border-retro-red'
                  }`}
                  style={{ boxShadow: "3px 3px 0 hsl(var(--retro-red) / 0.3)" }}
                >
                  <Heart className="w-4 h-4 text-white" fill={showFavoritesOnly ? "currentColor" : "none"} />
                  <span className="font-pixel text-[10px] text-white">{favorites.length} FAVORITOS</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2 bg-retro-dark border-2 border-retro-cyan"
                     style={{ boxShadow: "3px 3px 0 hsl(var(--retro-cyan) / 0.3)" }}>
                  <Zap className="w-4 h-4 text-retro-cyan" />
                  <span className="font-pixel text-[10px] text-white">GRÁTIS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-retro-dark border-2 border-retro-yellow"
                     style={{ boxShadow: "3px 3px 0 hsl(var(--retro-yellow) / 0.3)" }}>
                  <Trophy className="w-4 h-4 text-retro-yellow" />
                  <span className="font-pixel text-[10px] text-white">RETRÔ</span>
                </div>
              </div>
            </div>

            {/* Search and controls */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-retro-gray" />
                <Input
                  type="text"
                  placeholder="Encontre jogos ao digitar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-black border-2 border-retro-purple focus:border-retro-cyan rounded-none font-retro text-white placeholder:text-gray-500"
                  style={{ boxShadow: "4px 4px 0 hsl(var(--retro-dark))" }}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={gridSize === "large" ? "default" : "outline"}
                  size="icon"
                  className={`h-12 w-12 rounded-none border-2 transition-all ${
                    gridSize === "large" 
                      ? "bg-retro-red border-retro-red text-white" 
                      : "bg-retro-dark border-retro-purple text-retro-gray hover:border-retro-cyan hover:text-retro-cyan"
                  }`}
                  style={{ boxShadow: gridSize === "large" ? "3px 3px 0 hsl(var(--retro-dark))" : "none" }}
                  onClick={() => setGridSize("large")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </Button>
                <Button
                  variant={gridSize === "small" ? "default" : "outline"}
                  size="icon"
                  className={`h-12 w-12 rounded-none border-2 transition-all ${
                    gridSize === "small" 
                      ? "bg-retro-red border-retro-red text-white" 
                      : "bg-retro-dark border-retro-purple text-retro-gray hover:border-retro-cyan hover:text-retro-cyan"
                  }`}
                  style={{ boxShadow: gridSize === "small" ? "3px 3px 0 hsl(var(--retro-dark))" : "none" }}
                  onClick={() => setGridSize("small")}
                >
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-center font-pixel text-xs text-retro-gray mb-8">
              {filteredGames.length === games.length
                ? `${games.length} JOGOS DISPONÍVEIS`
                : `${filteredGames.length} DE ${games.length} JOGOS ENCONTRADOS`}
            </div>
          </div>
        </section>

        {/* Games Grid */}
        <section className="container mx-auto px-4">
          {filteredGames.length > 0 ? (
            <div
              className={`grid gap-5 ${
                gridSize === "large"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              }`}
            >
              {filteredGames.map((game, index) => (
                <div
                  key={game.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <GameCard 
                    game={game} 
                    onPlay={() => setFullscreenGame(game)} 
                    isFavorite={isFavorite(game.id)}
                    onToggleFavorite={() => toggleFavorite(game.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-retro-dark flex items-center justify-center"
                   style={{ 
                     clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))",
                     boxShadow: "inset 0 0 0 2px hsl(var(--retro-purple))"
                   }}>
                <Gamepad2 className="w-10 h-10 text-retro-purple" />
              </div>
              <h3 className="font-pixel text-lg text-white mb-2">
                GAME NOT FOUND
              </h3>
              <p className="font-retro text-retro-gray">
                Tente buscar por outro nome
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Fullscreen Player - Retro Style */}
      {fullscreenGame && (
        <div className="fixed inset-0 z-50 flex flex-col bg-retro-darker animate-fade-in">
          {/* Header - Arcade style */}
          <div className="flex items-center justify-between px-4 py-3 bg-retro-dark border-b-4 border-retro-purple">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-retro-red flex items-center justify-center"
                   style={{ 
                     clipPath: "polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px))"
                   }}>
                <Joystick className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-pixel text-sm text-white line-clamp-1">
                  {fullscreenGame.title}
                </h2>
                <p className="font-retro text-xs text-retro-cyan">NOW PLAYING</p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setFullscreenGame(null)}
              className="gap-2 rounded-none border-2 border-retro-red bg-transparent text-retro-red hover:bg-retro-red hover:text-white font-pixel text-[10px] transition-colors"
              style={{ boxShadow: "3px 3px 0 hsl(var(--retro-dark))" }}
            >
              <X className="w-4 h-4" />
              SAIR
            </Button>
          </div>

          {/* Game iframe with scanlines */}
          <div className="flex-1 bg-black relative">
            <iframe
              src={fullscreenGame.src}
              className="w-full h-full"
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
            />
            {/* Subtle scanline overlay */}
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
