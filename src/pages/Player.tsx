import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Maximize2,
  RefreshCw,
  Share2,
  Heart,
  Copy,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";


const PLAYER_URL = "https://wplayer.click/dashboard?view=movies";
const MEDIA_TITLE = "SOS01 Player";
const FAV_KEY = "sos01:player:favorite";

export default function Player() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);


  useEffect(() => {

    setFavorite(localStorage.getItem(FAV_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setFailed(true);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [loading, reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setFailed(false);
    setReloadKey((k) => k + 1);
  }, []);

  const goFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.().catch(() => toast.error("Tela cheia indisponível"));
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  }, []);

  const share = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: MEDIA_TITLE, url });
        return;
      } catch {
        return;
      }
    }
    void copyLink();
  }, [copyLink]);

  const toggleFavorite = useCallback(() => {
    setFavorite((prev) => {
      const next = !prev;
      localStorage.setItem(FAV_KEY, next ? "1" : "0");
      toast.success(next ? "Adicionado aos favoritos" : "Removido dos favoritos");
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === "f") goFullscreen();
      if (key === "r") reload();
      if (e.key === "Escape" && document.fullscreenElement) void document.exitFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goFullscreen, reload]);

  const iconBtn =
    "inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-secondary/60 bg-card/60 text-foreground/80 transition-all duration-300 hover:scale-105 hover:text-primary hover:border-primary";

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-foreground">
      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 sm:px-6 py-3 border-b-2 border-secondary/50 bg-[#0d1117]/95 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="Voltar"
            className={iconBtn + " shrink-0"}
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <p className="font-silkscreen text-[10px] uppercase tracking-widest text-primary">SOS01 Player</p>
            <h1 className="truncate text-xl sm:text-2xl font-vt323 leading-none" style={{ fontFamily: "'VT323', monospace" }}>
              {MEDIA_TITLE}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={reload} aria-label="Atualizar player" className={iconBtn}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={copyLink} aria-label="Copiar link" className={iconBtn + " hidden sm:inline-flex"}>
            <Copy className="w-4 h-4" aria-hidden="true" />
          </button>
          <a
            href={PLAYER_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir em nova guia"
            className={iconBtn + " hidden sm:inline-flex"}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
          <button type="button" onClick={share} aria-label="Compartilhar" className={iconBtn}>
            <Share2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggleFavorite}
            aria-pressed={favorite}
            aria-label="Favoritar"
            className={iconBtn + (favorite ? " text-destructive border-destructive" : "")}
          >
            <Heart className={"w-4 h-4" + (favorite ? " fill-current" : "")} aria-hidden="true" />
          </button>
          <button type="button" onClick={goFullscreen} aria-label="Tela cheia" className={iconBtn}>
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-2 sm:px-6 py-3 sm:py-5">
        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-190px)] min-h-[320px] overflow-hidden rounded-2xl border-2 border-secondary/50 bg-black shadow-2xl"
        >
          {!failed && (
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={PLAYER_URL}
              title={MEDIA_TITLE}
              loading="lazy"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setFailed(true);
              }}
              className={`w-full h-full border-0 transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"}`}
            />
          )}

          {loading && !failed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0d1117] animate-fade-in">
              <span
                className="font-silkscreen text-2xl sm:text-3xl text-primary"
                style={{ textShadow: "0 0 12px currentColor" }}
              >
                SOS01
              </span>
              <p className="text-sm text-muted-foreground">Carregando mídia...</p>
              <div className="w-56 h-2 overflow-hidden rounded-full bg-secondary/40">
                <div className="h-full w-1/3 rounded-full bg-primary animate-[slide-in-right_1.2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {failed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center bg-[#0d1117] animate-fade-in">
              <AlertTriangle className="w-10 h-10 text-destructive" aria-hidden="true" />
              <p className="text-sm text-foreground">Não foi possível carregar o player.</p>
              <button type="button" onClick={reload} className="btn-3d px-5 py-3 rounded-xl bg-primary text-primary-foreground font-silkscreen uppercase text-xs tracking-wider">
                Tentar novamente
              </button>
              <a href={PLAYER_URL} target="_blank" rel="noopener noreferrer" className="text-xs underline text-primary">
                Abrir em nova guia
              </a>
            </div>
          )}
        </div>
      </main>

      {creds && (
        <section className="px-2 sm:px-6 pb-2">
          <div className="rounded-2xl border-2 border-secondary/50 bg-card/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-silkscreen text-[11px] uppercase tracking-widest text-primary">
                Acesso rápido ao player
              </h2>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              O player é um serviço externo e não permite login automático. Toque para copiar e cole na tela de login.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Login", value: creds.user, field: "user" as const },
                { label: "Senha", value: creds.pass, field: "pass" as const },
              ].map((item) => (
                <button
                  key={item.field}
                  type="button"
                  onClick={() => copyValue(item.value, item.field)}
                  className="flex items-center justify-between gap-3 rounded-xl border-2 border-secondary/60 bg-background/40 px-3 py-2 text-left transition-colors hover:border-primary"
                >
                  <span className="min-w-0">
                    <span className="block font-silkscreen text-[9px] uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="block truncate text-sm text-foreground">{item.value}</span>
                  </span>
                  {copied === item.field ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pb-24 md:pb-6 pt-2 text-xs text-muted-foreground">
        <span>SOS01 © 2026 · Player integrado</span>
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${failed ? "bg-destructive" : "bg-green-500 animate-pulse"}`}
            aria-hidden="true"
          />
          {failed ? "Player Offline" : "Player Online"}
        </span>
      </footer>
    </div>
  );
}