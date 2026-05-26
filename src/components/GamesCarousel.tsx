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
        <div className="relative cursor-pointer transition-all duration-300">
          {/* Outer frame — decorative bezel */}
          <div
            className={`relative rounded-xl p-[3px] transition-all duration-300 ${
              isFavorite
                ? "bg-gradient-to-br from-[hsl(var(--destructive))] via-[hsl(var(--destructive)/0.6)] to-[hsl(var(--accent))] shadow-[0_8px_32px_-8px_hsl(var(--destructive)/0.35)]"
                : "bg-gradient-to-br from-[hsl(var(--primary)/0.5)] via-[hsl(var(--accent)/0.35)] to-[hsl(var(--primary)/0.2)] group-hover:from-[hsl(var(--primary)/0.8)] group-hover:via-[hsl(var(--accent)/0.55)] group-hover:to-[hsl(var(--primary)/0.4)] group-hover:shadow-[0_8px_32px_-8px_hsl(var(--primary)/0.25)]"
            }`}
          >
            {/* Inner card */}
            <div className="relative bg-[hsl(var(--card))] rounded-[10px] overflow-hidden">
              {/* Image container with top accent bar */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] z-10 ${
                  isFavorite ? "bg-[hsl(var(--destructive))]" : "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
                }`} />

                <img
                  src={game.img}
                  alt={game.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  draggable={false}
                  loading="lazy"
                />

                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg ring-4 ring-[hsl(var(--primary)/0.3)] backdrop-blur-sm">
                    <Play className="w-6 h-6 text-[hsl(var(--primary-foreground))] ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Favorite badge on image */}
                {isFavorite && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--destructive))] text-white text-[10px] font-semibold shadow-md">
                      <Heart className="w-2.5 h-2.5" fill="currentColor" />
                      Favorito
                    </div>
                  </div>
                )}
              </div>

              {/* Title bar */}
              <div className="px-3 pt-3 pb-3 bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--muted))]">
                <h3 className="font-semibold text-xs sm:text-sm text-[hsl(var(--foreground))] line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                  {game.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))]" />
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-medium">
                    Retrô
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite toggle button — repositioned outside the card frame */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
        className={`absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 z-20 shadow-md border-2 ${
          isFavorite
            ? "bg-[hsl(var(--destructive))] text-white border-[hsl(var(--destructive))] scale-110"
            : "bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:text-[hsl(var(--destructive))] hover:border-[hsl(var(--destructive))] hover:scale-105"
        }`}
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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
      {/* Subtle dot pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[hsl(var(--accent)/0.12)] border border-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))] font-semibold text-[11px] tracking-wide mb-5">
            <Gamepad2 className="w-4 h-4" />
            +60 GAMES
            {favorites.length > 0 && (
              <span className="ml-1 flex items-center gap-1 text-[hsl(var(--destructive))]">
                <Heart className="w-3 h-3" fill="currentColor" />
                {favorites.length}
              </span>
            )}
          </div>
          <h2 className="font-sora text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-[hsl(var(--foreground))]">
            Arcade Zone
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto text-sm sm:text-base">
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
          <CarouselContent className="-ml-4">
            {sortedGames.map((game) => (
              <CarouselItem key={game.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <GameCard
                  game={game}
                  isFavorite={isFavorite(game.id)}
                  onToggleFavorite={() => toggleFavorite(game.id)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex -left-5 w-10 h-10 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:border-[hsl(var(--primary))] shadow-lg transition-all" />
          <CarouselNext className="hidden sm:flex -right-5 w-10 h-10 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] hover:border-[hsl(var(--primary))] shadow-lg transition-all" />
        </Carousel>

        {/* CTA Button */}
        <div className="text-center mt-10 sm:mt-12">
          <Link to="/jogos">
            <Button className="gap-2 px-8 py-3 text-sm font-semibold bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-[hsl(var(--primary-foreground))] rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Gamepad2 className="w-4 h-4" />
              Ver todos os jogos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
