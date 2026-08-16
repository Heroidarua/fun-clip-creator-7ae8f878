import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Gamepad2, X, Search, Play, Heart, Shuffle, Clock,
  Flame, Sparkles, Star, Filter, Trophy, RotateCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Game } from "@/data/games";
import { getGames, getFeaturedGames, getRecentGames } from "@/lib/games.functions";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useInView } from "react-intersection-observer";
import { useFavoriteGames } from "@/hooks/useFavoriteGames";

// ---------- helpers ----------
type Category = "Todos" | "Luta" | "Plataforma" | "Corrida" | "Ação" | "Tiro" | "Arcade";

const CATEGORIES: { id: Category; label: string; icon: string; description: string }[] = [
  { id: "Todos", label: "Tudo", icon: "✨", description: "Explorar toda a biblioteca" },
  { id: "Luta", label: "Luta", icon: "🥊", description: "Combate e artes marciais" },
  { id: "Plataforma", label: "Aventura", icon: "🍄", description: "Plataformas e exploração" },
  { id: "Corrida", label: "Velocidade", icon: "🏁", description: "Carros e corridas clássicas" },
  { id: "Ação", label: "Ação", icon: "💥", description: "Combate intenso e arcade" },
  { id: "Tiro", label: "Shoot'em Up", icon: "🎯", description: "Ação balística clássica" },
  { id: "Arcade", label: "Clássicos", icon: "🕹️", description: "O puro suco dos 8/16 bits" },
];

function categoryOf(g: Game): Category {
  const t = g.title.toLowerCase();
  if (/(kombat|fighter|tekken|smash|vs\.|vs |kof|jojo|chaos)/.test(t)) return "Luta";
  if (/(mario|sonic|kong|bomberman|kidd|mickey|donald|dizzy|picapau|monica|pocahontas|luigi|yoshi|rockman)/.test(t)) return "Plataforma";
  if (/(kart|top gear|gp rider|rider)/.test(t)) return "Corrida";
  if (/(1941|asteroids|duck hunt|battle city|popeye)/.test(t)) return "Tiro";
  if (/(metal slug|spider|mask|power rangers|x-men|simpsons|alien|justice|dragonball|flintstones|saga|gta|theft)/.test(t)) return "Ação";
  return "Arcade";
}

// deterministic pseudo-rating 4.2 – 5.0
function ratingOf(g: Game): number {
  const r = 4.2 + ((g.id * 37) % 9) / 10;
  return Math.min(5, Math.round(r * 10) / 10);
}

const POPULAR_IDS = [1, 2, 6, 20, 7, 23, 22, 17, 14, 33, 50, 4];
const COMMUNITY_IDS = [3, 5, 15, 21, 26, 44, 56, 27, 25, 13, 11, 36];

const RECENT_KEY = "sos01-recent-games";
function readRecent(): number[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function pushRecent(id: number) {
  try {
    const cur = readRecent().filter((x) => x !== id);
    cur.unshift(id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 12)));
  } catch {}
}

// ---------- Card ----------
const GameCard = React.memo(function GameCard({
  game, onPlay, isFavorite, onToggleFavorite,
}: {
  game: Game; onPlay: () => void; isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const rating = ratingOf(game);
  const category = categoryOf(game);

  return (
    <div className="group relative h-full">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 55%, hsl(var(--retro-yellow)) 100%)",
          filter: "blur(14px)",
        }}
      />

      <button
        onClick={onPlay}
        className="cartridge relative w-full h-full text-left rounded-[14px] overflow-hidden bg-[hsl(var(--card))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] flex flex-col"
        aria-label={`Jogar ${game.title}`}
      >
        <div className="relative h-5 bg-[hsl(var(--secondary))] shrink-0">
          <div className="absolute inset-x-0 top-0 h-1 bg-[hsl(var(--primary))] opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2.5 rounded-sm bg-[hsl(var(--secondary-foreground)/0.15)]" />
            ))}
          </div>
          <div className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--secondary-foreground)/0.25)]" />
          <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--secondary-foreground)/0.25)]" />
        </div>

        <div className="relative flex-1 min-h-0 aspect-[3/4] overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--primary)/0.12)]">
          <img
            src={game.img || `https://placehold.co/400x533/0E4A7B/F5F9FF?text=${encodeURIComponent(game.title)}`}
            alt={game.title}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.onerror = null;
              img.src = `https://placehold.co/400x533/0E4A7B/F5F9FF?text=${encodeURIComponent(game.title)}`;
            }}
          />

          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 1px, transparent 1px, transparent 3px)",
            }}
          />

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-2">
            <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-silkscreen tracking-wider text-white border border-white/15 shadow-sm">
              {category.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
              className={`shrink-0 grid place-items-center w-9 h-9 rounded-lg backdrop-blur-md transition-all duration-200 border shadow-sm ${
                isFavorite
                  ? "bg-[hsl(var(--accent))] text-white border-[hsl(var(--accent))] scale-105 shadow-neon-purple"
                  : "bg-black/50 text-white border-white/20 hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--accent))] hover:scale-105"
              }`}
              aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            >
              <Heart className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))] grid place-items-center text-white shadow-neon scale-90 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <h3 className="font-display text-base sm:text-lg leading-tight line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              {game.title}
            </h3>
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1 text-[hsl(var(--retro-yellow))]">
                <Star className="w-3 h-3" fill="currentColor" />
                <span className="font-silkscreen">{rating.toFixed(1)}</span>
              </span>
              <span className="font-silkscreen tracking-wider text-white/80">RETRO</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2.5 bg-[hsl(var(--muted)/0.5)] border-t border-[hsl(var(--border))]">
          <span className="text-[11px] font-silkscreen tracking-wider text-[hsl(var(--muted-foreground))]">
            #{String(game.id).padStart(3, "0")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-silkscreen tracking-wider bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_2px_0_hsl(var(--secondary))]">
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            JOGAR
          </span>
        </div>
      </button>
    </div>
  );
});

// ---------- Section row ----------
function GameRow({
  title, icon, badge, games: list, onPlay, isFavorite, toggleFavorite,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  games: Game[];
  onPlay: (g: Game) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
}) {
  if (!list.length) return null;
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-6 px-1">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] shrink-0">
          {icon}
        </span>
        <h2 className="font-display text-2xl text-[hsl(var(--foreground))] leading-none">
          {title}
        </h2>
        {badge && (
          <span className="font-silkscreen text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
            {badge}
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {list.map((g, i) => (
          <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}>
            <GameCard
              game={g}
              onPlay={() => onPlay(g)}
              isFavorite={isFavorite(g.id)}
              onToggleFavorite={() => toggleFavorite(g.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Page ----------
export default function Jogos() {
  const [fullscreenGame, setFullscreenGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category>("Todos");
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const { favorites, toggleFavorite, isFavorite } = useFavoriteGames();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRecentIds(readRecent()); }, []);

  const playGame = useCallback((g: Game) => {
    pushRecent(g.id);
    setRecentIds(readRecent());
    setFullscreenGame(g);
  }, []);

  const fetchGamesFn = useServerFn(getGames);
  const fetchFeaturedFn = useServerFn(getFeaturedGames);
  const fetchRecentFn = useServerFn(getRecentGames);

  const isHydrated = typeof window !== 'undefined';

  const { data: featured } = useQuery({
    queryKey: ["featured-games"],
    queryFn: () => fetchFeaturedFn(),
    staleTime: 1000 * 60 * 60,
    enabled: isHydrated,
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-games", recentIds],
    queryFn: () => fetchRecentFn({ data: { ids: recentIds } }),
    enabled: isHydrated && recentIds.length > 0,
  });

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["games", category, searchQuery],
    queryFn: ({ pageParam = 1 }) => fetchGamesFn({ 
      data: {
        page: pageParam as number, 
        search: searchQuery, 
        category 
      }
    }),
    getNextPageParam: (lastPage: any) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: isHydrated,
  });

  const filtered = useMemo(() => {
    if (!isHydrated) return [];
    return (infiniteData?.pages || []).flatMap((page: any) => page.items) || [];
  }, [infiniteData, isHydrated]);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (isHydrated && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, isHydrated]);

  const handleRandom = () => {
    if (filtered.length) {
      playGame(filtered[Math.floor(Math.random() * filtered.length)]);
    }
  };

  const handleContinue = () => {
    if (recent && recent[0]) playGame(recent[0]);
    else handleRandom();
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[hsl(var(--background))] pt-20 pb-24">
        {/* ---- Compact Hero ---- */}
        <section className="relative overflow-hidden">
          {/* soft neon spots */}
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-[hsl(var(--primary)/0.18)] blur-3xl" />
          <div className="absolute -top-10 right-0 w-72 h-72 rounded-full bg-[hsl(var(--accent)/0.18)] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="container relative mx-auto px-4 pt-6 pb-6 sm:pt-8 sm:pb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-silkscreen text-[10px] tracking-wider shadow-[0_3px_0_hsl(var(--secondary))]">
                <Gamepad2 className="w-3.5 h-3.5" /> ARCADE
              </span>
              <span className="font-silkscreen text-[10px] tracking-wider text-[hsl(var(--muted-foreground))]">
                2900+ JOGOS · 100% GRÁTIS
              </span>
            </div>

            <div className="grid sm:grid-cols-[1fr_auto] sm:items-end gap-4">
              <div className="min-w-0">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[0.95] text-[hsl(var(--foreground))]">
                  Jogos <span className="text-[hsl(var(--primary))] neon-text">Clássicos</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[hsl(var(--muted-foreground))] max-w-xl">
                  Reviva a era de ouro dos arcades. Pixel art, ação infinita e zero downloads.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={!recent || recent.length === 0}
                  className="font-silkscreen tracking-wider text-xs gap-2 bg-[hsl(var(--secondary))] text-white hover:bg-[hsl(var(--secondary)/0.9)] shadow-[0_4px_0_hsl(var(--secondary)/0.5)] disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  {recent && recent[0] ? "CONTINUAR" : "SEM HISTÓRICO"}
                </Button>
                <Button
                  onClick={handleRandom}
                  className="font-silkscreen tracking-wider text-xs gap-2 bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent)/0.9)] shadow-[0_4px_0_hsl(var(--secondary))]"
                >
                  <Shuffle className="w-4 h-4" />
                  JOGAR ALEATÓRIO
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Category Grid & Search ---- */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Sidebar Filters */}
            <aside className="space-y-6">
              <div className="relative group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`} />
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar jogo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`pl-11 pr-10 h-12 rounded-xl border-2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] transition-all ${
                    searchFocused
                      ? "border-[hsl(var(--primary))] shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
                      : "border-[hsl(var(--border))]"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary)/0.15)] hover:text-[hsl(var(--primary))]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-silkscreen text-[11px] tracking-wider text-[hsl(var(--muted-foreground))] px-2 mb-3">
                  CATEGORIAS
                </h3>
                <nav className="space-y-1">
                  {CATEGORIES.map((c) => {
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border ${
                          active
                            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-[0_4px_0_hsl(var(--secondary))]"
                            : "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)]"
                        }`}
                      >
                        <span className="text-lg leading-none">{c.icon}</span>
                        <div className="text-left">
                          <p className="font-silkscreen text-[11px] leading-none tracking-wider">{c.label.toUpperCase()}</p>
                          <p className={`text-[9px] mt-1 ${active ? "text-white/60" : "text-[hsl(var(--muted-foreground))]"}`}>
                            {c.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="space-y-12">
              {/* Sections go here */}

              {/* Content Sections */}
              <div className="space-y-12">
                {/* Featured / Carousel Style for specific sections */}
                {!searchQuery && category === "Todos" && (
                  <div className="space-y-10">
                    <GameRow
                      title="Continuar"
                      icon={<Clock className="w-4 h-4" />}
                      games={recent || []}
                      onPlay={playGame}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                    />

                    <GameRow
                      title="Destaques"
                      icon={<Flame className="w-4 h-4" />}
                      badge="HOT"
                      games={featured || []}
                      onPlay={playGame}
                      isFavorite={isFavorite}
                      toggleFavorite={toggleFavorite}
                    />
                  </div>
                )}

                {/* All / Filtered Grid */}
                <section>
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-display text-3xl text-[hsl(var(--foreground))] leading-none">
                        {category === "Todos" ? "Todos os Jogos" : category}
                      </h2>
                      <span className="font-silkscreen text-[10px] tracking-wider px-2 py-1 rounded bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                        {filtered.length}
                      </span>
                    </div>
                  </div>

                  {filtered.length > 0 ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {filtered.map((g: Game, i: number) => (
                        <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 15, 200)}ms` }}>
                          <GameCard
                            game={g}
                            onPlay={() => playGame(g)}
                            isFavorite={isFavorite(g.id)}
                            onToggleFavorite={() => toggleFavorite(g.id)}
                          />
                        </div>
                      ))}
                      {hasNextPage && (
                        <div ref={loadMoreRef} className="col-span-full h-20 flex items-center justify-center">
                          {isFetchingNextPage ? (
                            <div className="flex items-center gap-2 font-silkscreen text-[10px] text-[hsl(var(--muted-foreground))]">
                              <RotateCw className="w-4 h-4 animate-spin" /> CARREGANDO MAIS...
                            </div>
                          ) : (
                            <div className="h-1 w-full bg-transparent" />
                          )}
                        </div>
                      )}
                    </div>
                  ) : isLoading ? (
                    <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] rounded-[14px] bg-[hsl(var(--card))] animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 rounded-3xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))/0.5]">
                      <div className="mx-auto w-16 h-16 grid place-items-center rounded-2xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] mb-4">
                        <Gamepad2 className="w-8 h-8" />
                      </div>
                      <h3 className="font-display text-2xl text-[hsl(var(--foreground))] mb-1">Nada encontrado</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">Tente outra busca ou categoria.</p>
                      <Button
                        onClick={() => { setSearchQuery(""); setCategory("Todos"); }}
                        className="mt-6 font-silkscreen text-[11px] tracking-wider h-10 px-6"
                      >
                        LIMPAR FILTROS
                      </Button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---- Fullscreen player ---- */}
      {fullscreenGame && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[hsl(var(--secondary))] animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--secondary))] border-b-2 border-[hsl(var(--primary))]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="grid place-items-center w-10 h-10 rounded-lg bg-[hsl(var(--primary))] text-white shrink-0">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-display text-lg text-white truncate">{fullscreenGame.title}</h2>
                <p className="font-silkscreen text-[10px] tracking-wider text-[hsl(var(--primary))]">▶ NOW PLAYING</p>
              </div>
            </div>
            <Button
              onClick={() => setFullscreenGame(null)}
              className="gap-2 font-silkscreen text-[11px] tracking-wider bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.9)] text-white shrink-0"
            >
              <X className="w-4 h-4" />
              SAIR
            </Button>
          </div>
          <div className="flex-1 bg-black relative">
            <iframe
              src={fullscreenGame.src}
              className="w-full h-full"
              allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
              sandbox="allow-scripts allow-same-origin allow-pointer-lock"
              title={fullscreenGame.title}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
