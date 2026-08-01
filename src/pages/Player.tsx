import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const MEDIA_TITLE = "SOS01 Player";
const FAV_KEY = "sos01:player:favorite";

interface CatalogItem {
  id: string;
  title: string;
  year?: number;
  thumb: string;
}

const embedUrl = (id: string) => `https://archive.org/embed/${encodeURIComponent(id)}`;

export default function Player() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [current, setCurrent] = useState<CatalogItem | null>(null);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState(false);
  const [loadingFrame, setLoadingFrame] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setFavorite(localStorage.getItem(FAV_KEY) === "1");
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingList(true);
    setListError(false);

    fetch(`/api/player-catalog?q=${encodeURIComponent(query)}`)
      .then((res) => res.json() as Promise<{ success: boolean; items: CatalogItem[] }>)
      .then((data) => {
        if (!active) return;
        const list = data.items ?? [];
        setItems(list);
        setListError(!data.success || list.length === 0);
        setCurrent((prev) => prev ?? list[0] ?? null);
      })
      .catch(() => {
        if (active) setListError(true);
      })
      .finally(() => {
        if (active) setLoadingList(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  const currentUrl = useMemo(() => (current ? embedUrl(current.id) : ""), [current]);

  const selectItem = useCallback((item: CatalogItem) => {
    setCurrent(item);
    setLoadingFrame(true);
    setReloadKey((k) => k + 1);
  }, []);

  const reload = useCallback(() => {
    setLoadingFrame(true);
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
          <Link to="/" aria-label="Voltar" className={iconBtn + " shrink-0"}>
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <p className="font-silkscreen text-[10px] uppercase tracking-widest text-primary">SOS01 Player</p>
            <h1 className="truncate text-xl sm:text-2xl leading-none" style={{ fontFamily: "'VT323', monospace" }}>
              {current?.title ?? MEDIA_TITLE}
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
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir em nova guia"
              className={iconBtn + " hidden sm:inline-flex"}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
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

      <main className="flex-1 px-2 sm:px-6 py-3 sm:py-5 space-y-6">
        <div
          ref={containerRef}
          className="relative w-full h-[calc(100vh-330px)] min-h-[300px] overflow-hidden rounded-2xl border-2 border-secondary/50 bg-black shadow-2xl"
        >
          {currentUrl ? (
            <iframe
              key={`${current?.id}-${reloadKey}`}
              src={currentUrl}
              title={current?.title ?? MEDIA_TITLE}
              loading="eager"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              onLoad={() => setLoadingFrame(false)}
              className={`w-full h-full border-0 transition-opacity duration-500 ${loadingFrame ? "opacity-0" : "opacity-100"}`}
            />
          ) : null}

          {(loadingFrame || !currentUrl) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0d1117] animate-fade-in">
              <span className="font-silkscreen text-2xl sm:text-3xl text-primary" style={{ textShadow: "0 0 12px currentColor" }}>
                SOS01
              </span>
              <p className="text-sm text-muted-foreground">
                {currentUrl ? "Carregando mídia..." : "Escolha um título abaixo para assistir"}
              </p>
            </div>
          )}
        </div>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-silkscreen text-xs uppercase tracking-widest text-primary">Catálogo</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(term);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Buscar filme..."
                  aria-label="Buscar filme"
                  className="h-10 w-52 rounded-xl border-2 border-secondary/60 bg-card/60 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <button type="submit" className="btn-3d h-10 rounded-xl bg-primary px-4 font-silkscreen text-[10px] uppercase tracking-wider text-primary-foreground">
                Buscar
              </button>
            </form>
          </div>

          {loadingList && (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Carregando catálogo...
            </div>
          )}

          {!loadingList && listError && (
            <div className="flex flex-col items-start gap-3 rounded-xl border-2 border-secondary/50 bg-card/40 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
                Nenhum título encontrado. Tente outra busca.
              </p>
            </div>
          )}

          {!loadingList && items.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    aria-current={current?.id === item.id}
                    className={`group w-full overflow-hidden rounded-xl border-2 bg-card/50 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary ${
                      current?.id === item.id ? "border-primary" : "border-secondary/50"
                    }`}
                  >
                    <img
                      src={item.thumb}
                      alt={`Capa de ${item.title}`}
                      loading="lazy"
                      className="aspect-[2/3] w-full bg-black object-cover"
                    />
                    <span className="block px-2 py-2 text-xs leading-tight text-foreground/90 line-clamp-2">
                      {item.title}
                      {item.year ? ` (${item.year})` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 pb-24 md:pb-6 pt-2 text-xs text-muted-foreground">
        <span>SOS01 © 2026 · Player integrado · Acervo público Internet Archive</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" aria-hidden="true" />
          Player Online
        </span>
      </footer>
    </div>
  );
}
