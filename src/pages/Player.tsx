import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";

const PLAYER_URL = "https://wplayer.link/dashboard?view=movies";
const LOAD_TIMEOUT_MS = 12000;

export default function Player() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (loaded) return;
    const timer = window.setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [loaded, reloadKey]);

  const retry = useCallback(() => {
    setFailed(false);
    setLoaded(false);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <h1 className="sr-only">SOS01 Player</h1>
      <iframe
        key={reloadKey}
        src={PLAYER_URL}
        title="SOS01 Player"
        loading="eager"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        referrerPolicy="no-referrer"
        onLoad={() => {
          setLoaded(true);
          setFailed(false);
        }}
        onError={() => setFailed(true)}
        className="h-full w-full border-0"
      />

      {!loaded && !failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
          <span className="font-silkscreen text-2xl text-primary" style={{ textShadow: "0 0 12px currentColor" }}>
            SOS01
          </span>
          <p className="text-sm text-muted-foreground">Carregando player...</p>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-silkscreen text-sm uppercase tracking-widest text-primary">Falha ao carregar</p>
            <p className="max-w-md text-sm text-muted-foreground">
              O conteúdo do player não pôde ser exibido aqui. Tente novamente ou abra em uma nova aba.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="btn-3d inline-flex h-11 items-center gap-2 rounded-xl border-2 border-secondary/60 bg-card/60 px-4 font-silkscreen text-[10px] uppercase tracking-wider text-foreground"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Tentar novamente
            </button>
            <a
              href={PLAYER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 font-silkscreen text-[10px] uppercase tracking-wider text-primary-foreground"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Abrir em nova aba
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
