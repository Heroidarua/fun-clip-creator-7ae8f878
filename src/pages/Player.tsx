import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MonitorPlay, ArrowLeft, Search, Loader2, X, AlertTriangle } from "lucide-react";

interface CatalogItem {
  id: string;
  title: string;
  year?: number;
  thumb: string;
}

export default function Player() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CatalogItem | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/player-catalog?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data: { items?: CatalogItem[] }) => {
        if (active) setItems(data.items ?? []);
      })
      .catch(() => active && setItems([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [query]);

  const openItem = useCallback(async (item: CatalogItem) => {
    setSelected(item);
    setSrc(null);
    setError(null);
    setMediaLoading(true);
    try {
      const res = await fetch(`/api/player-media?id=${encodeURIComponent(item.id)}`);
      const data = (await res.json()) as { success?: boolean; src?: string; error?: string };
      if (data.success && data.src) setSrc(data.src);
      else setError(data.error ?? "Não foi possível carregar este título.");
    } catch {
      setError("Falha de conexão ao carregar o vídeo.");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    videoRef.current?.pause();
    setSelected(null);
    setSrc(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-primary/30 bg-background/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <MonitorPlay className="w-5 h-5 text-primary" aria-hidden="true" />
            <h1 className="text-lg font-bold text-foreground">IPTV 1.0</h1>
          </div>
          <form
            className="ml-auto flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(term);
            }}
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar título..."
                aria-label="Buscar título"
                className="pl-9 pr-3 py-2 w-40 sm:w-64 rounded-lg bg-muted/40 border border-border text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            Carregando catálogo...
          </div>
        ) : items.length === 0 ? (
          <p className="text-center py-24 text-muted-foreground">Nenhum título encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className="group text-left rounded-xl overflow-hidden border border-border hover:border-primary transition-all bg-card"
              >
                <img
                  src={item.thumb}
                  alt={`Capa de ${item.title}`}
                  loading="lazy"
                  className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground line-clamp-2">{item.title}</p>
                  {item.year && <p className="text-[10px] text-muted-foreground mt-1">{item.year}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">{selected.title}</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar player"
                className="ml-auto p-2 rounded-lg border border-border text-foreground hover:border-primary"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-primary/40 bg-black aspect-video flex items-center justify-center">
              {mediaLoading && <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />}
              {!mediaLoading && error && (
                <p className="flex items-center gap-2 text-sm text-destructive px-4 text-center">
                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                  {error}
                </p>
              )}
              {!mediaLoading && src && (
                <video
                  ref={videoRef}
                  src={src}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                  onError={() => setError("Este título não pôde ser reproduzido.")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
