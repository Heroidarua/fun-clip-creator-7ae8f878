import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Dices, Sparkles, Play, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Game } from "@/data/games";
import { useQuery } from "@tanstack/react-query";
import { getPagedGames } from "@/lib/games.functions";

export default function RandomGamePicker() {
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<Game | null>(null);
  const [reelIndex, setReelIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data } = useQuery({
    queryKey: ["games-random"],
    queryFn: () => getPagedGames({ data: { page: 0 } }),
  });

  const gamesList = data?.games || [];

  const startSpin = () => {
    if (spinning || !gamesList.length) return;
    setSpinning(true);
    setPicked(null);

    let tick = 0;
    intervalRef.current = setInterval(() => {
      setReelIndex(Math.floor(Math.random() * gamesList.length));
      tick++;
    }, 70);

    const totalDuration = 1800;
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const final = gamesList[Math.floor(Math.random() * gamesList.length)];
      setReelIndex(gamesList.findIndex((g) => g.id === final.id));
      setPicked(final);
      setSpinning(false);
    }, totalDuration);
  };

  const current = picked ?? gamesList[reelIndex] ?? (gamesList.length > 0 ? gamesList[0] : null);

  if (!current) return null;

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div aria-hidden className="absolute -top-20 left-1/4 w-72 h-72 rounded-full bg-[hsl(var(--primary)/0.12)] blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-[hsl(var(--accent)/0.12)] blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.25)] text-[hsl(var(--primary))] font-semibold text-[11px] tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            NOVIDADE
          </div>
          <h2 className="font-sora text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-[hsl(var(--foreground))]">
            Sem ideia do que jogar?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] max-w-xl mx-auto text-sm sm:text-base">
            Deixe a sorte escolher um clássico pra você em segundos
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Slot frame */}
          <div className="relative rounded-2xl p-[3px] bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--primary))] shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.45)]">
            <div className="relative bg-[hsl(var(--card))] rounded-[14px] overflow-hidden">
              {/* Reel window */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[hsl(var(--muted))]">
                <img
                  key={current.id}
                  src={current.img}
                  alt={`Prévia visual do jogo ${current.title} selecionado aleatoriamente para você`}
                  className={`w-full h-full object-cover transition-all duration-150 ${spinning ? "blur-sm scale-110 brightness-75" : "blur-0 scale-100"}`}
                  draggable={false}
                />
                {/* Scanlines while spinning */}
                {spinning && (
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 4px)",
                    }}
                  />
                )}
                {/* Bottom gradient + title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1">
                        {spinning ? "Sorteando..." : picked ? "Seu jogo é" : "Pronto?"}
                      </p>
                      <h3 className={`font-sora font-bold text-white text-lg sm:text-xl leading-tight line-clamp-2 ${spinning ? "opacity-70" : ""}`}>
                        {current.title}
                      </h3>
                    </div>
                    {picked && !spinning && (
                      <div className="shrink-0 w-11 h-11 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center shadow-lg ring-4 ring-white/15 animate-in zoom-in duration-300">
                        <Play className="w-5 h-5 text-[hsl(var(--primary-foreground))] ml-0.5" fill="currentColor" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex flex-col sm:flex-row gap-2.5">
                <Button
                  onClick={startSpin}
                  disabled={spinning}
                  className="flex-1 gap-2"
                  variant={picked ? "outline" : "default"}
                >
                  {spinning ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Sorteando...
                    </>
                  ) : picked ? (
                    <>
                      <Dices className="w-4 h-4" />
                      Sortear outro
                    </>
                  ) : (
                    <>
                      <Dices className="w-4 h-4" />
                      Sortear jogo
                    </>
                  )}
                </Button>
                {picked && !spinning && (
                  <Link to="/jogos" className="flex-1">
                    <Button className="w-full gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
                      <Play className="w-4 h-4" fill="currentColor" />
                      Jogar agora
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-4">
            {data?.totalCount || "..."} jogos disponíveis · 100% no navegador
          </p>
        </div>
      </div>
    </section>
  );
}
