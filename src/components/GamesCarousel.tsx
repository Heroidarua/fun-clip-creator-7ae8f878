import { useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Play, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { games, Game } from "@/data/games";
import { useFavoriteGames } from "@/hooks/useFavoriteGames";

function GameCard({ game, isFavorite, onToggleFavorite }: { game: Game; isFavorite: boolean; onToggleFavorite: () => void }) {
  return (
    <div className="block group relative">
      <Link to="/jogos">
        <div className="relative overflow-hidden cursor-pointer transition-all duration-300">
          {/* Pixel card */}
          <div className={`relative bg-card border-2 rounded-sm overflow-hidden transition-all duration-300 ${
            isFavorite 
              ? 'border-[hsl(var(--retro-red))] shadow-[0_0_15px_hsl(var(--retro-red)/0.3)]' 
              : 'border-primary/30 group-hover:border-primary group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
          }`}>
            {/* Image container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={game.img}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                draggable={false}
                loading="lazy"
              />
              
              {/* CRT scanline overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/40 pointer-events-none"></div>
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="w-12 h-12 bg-primary flex items-center justify-center shadow-[3px_3px_0_hsl(var(--accent))]">
                  <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                </div>
              </div>
              
              {/* Favorite indicator */}
              {isFavorite && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-[hsl(var(--retro-red))] flex items-center justify-center rounded-sm">
                  <Heart className="w-3 h-3 text-white" fill="currentColor" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="p-3 bg-gradient-to-t from-background/90 to-transparent">
              <h3 className="font-pixel text-[8px] sm:text-[10px] text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {game.title}
              </h3>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Favorite toggle button */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
        className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-sm transition-all duration-200 z-10 ${
          isFavorite 
            ? 'bg-[hsl(var(--retro-red))] text-white' 
            : 'bg-black/60 text-gray-400 hover:text-[hsl(var(--retro-red))] hover:bg-black/80'
        }`}
      >
        <Heart className="w-3.5 h-3.5" fill={isFavorite ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

export default function GamesCarousel() {
  const { favorites, toggleFavorite, isFavorite } = useFavoriteGames();
  
  // Sort games: favorites first, then the rest
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  }, [favorites]);

  const autoplayPlugin = useRef(
    Autoplay({ 
      delay: 4000, 
      stopOnInteraction: true, 
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(var(--accent)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent))]/20 border-2 border-[hsl(var(--accent))]/50 text-[hsl(var(--accent))] font-pixel text-[10px] mb-4">
            <Gamepad2 className="w-4 h-4" />
            +60 GAMES
            {favorites.length > 0 && (
              <span className="ml-2 flex items-center gap-1 text-[hsl(var(--retro-red))]">
                <Heart className="w-3 h-3" fill="currentColor" />
                {favorites.length}
              </span>
            )}
          </div>
          <h2 className="font-pixel text-lg sm:text-xl md:text-2xl mb-3 text-[hsl(var(--retro-yellow))] neon-text">
            ARCADE ZONE
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm font-orbitron">
            Reviva a nostalgia com jogos clássicos direto no navegador
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[autoplayPlugin.current]}
          onMouseEnter={() => autoplayPlugin.current.stop()}
          onMouseLeave={() => autoplayPlugin.current.play()}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-3">
            {sortedGames.map((game) => (
              <CarouselItem key={game.id} className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <GameCard 
                  game={game} 
                  isFavorite={isFavorite(game.id)}
                  onToggleFavorite={() => toggleFavorite(game.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-4 bg-card border-2 border-primary/50 hover:bg-primary hover:border-primary rounded-sm" />
          <CarouselNext className="hidden sm:flex -right-4 bg-card border-2 border-primary/50 hover:bg-primary hover:border-primary rounded-sm" />
        </Carousel>

        {/* CTA Button */}
        <div className="text-center mt-8 sm:mt-10">
          <Link to="/jogos">
            <Button className="gap-2 px-6 sm:px-8 py-3 font-pixel text-[10px] sm:text-xs bg-primary hover:bg-primary/90 border-2 border-[hsl(var(--retro-yellow))] shadow-[4px_4px_0_hsl(var(--retro-yellow))] hover:shadow-[2px_2px_0_hsl(var(--retro-yellow))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm">
              <Gamepad2 className="w-4 h-4" />
              VER TODOS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
