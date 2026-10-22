import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCspNonce } from "@/hooks/use-csp-nonce";

declare global {
  interface Window {
    RufflePlayer?: {
      newest: () => { createPlayer: () => HTMLElement & {
        config: Record<string, unknown>;
        addEventListener: (event: string, handler: () => void) => void;
        load: (opts: { url: string }) => Promise<unknown>;
        remove: () => void;
      } };
    };
  }
}

const RUFFLE_BASE = "/ruffle-0.6.0/";

let scriptPromise: Promise<void> | null = null;

function loadRuffleScript(nonce?: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.RufflePlayer) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = RUFFLE_BASE + "ruffle.js";
      s.async = true;
      if (nonce) s.nonce = nonce;
      s.onload = () => resolve();
      s.onerror = () => {
        scriptPromise = null;
        reject(new Error("Não foi possível carregar o Ruffle"));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

type Status = "loading" | "ready" | "error";

/**
 * Player Flash embutido: carrega o Ruffle self-hosted (MIT) e joga o .swf
 * vindo do nosso proxy same-origin (/api/arcade/proxy?p=/flash/swf/<id>.swf).
 */
export default function ArcadeRuffle({ swfUrl }: { swfUrl: string }) {
  const nonce = useCspNonce();
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<ReturnType<NonNullable<typeof window.RufflePlayer>["newest"]>["createPlayer"]> | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    const start = async () => {
      try {
        await loadRuffleScript(nonce);
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = "";
        const RP = window.RufflePlayer;
        if (!RP) throw new Error("Ruffle indisponível");
        const player = RP.newest().createPlayer();
        if (nonce) {
          player.shadowRoot?.querySelectorAll("style").forEach((style) => {
            style.setAttribute("nonce", nonce);
            style.textContent = style.textContent;
          });
        }
        player.className = "block h-full w-full";
        player.config = {
          publicPath: RUFFLE_BASE,
          letterbox: "on",
          contextMenu: "off",
          splashScreen: false,
          warnOnUnsupportedContent: false,
          autoplay: "on",
          logLevel: "warn",
          openUrlMode: "deny",
        };
        playerRef.current = player;
        player.addEventListener("error", () => {
          if (!cancelled) setStatus("error");
        });
        hostRef.current.appendChild(player);
        await player.load({ url: swfUrl });
        if (!cancelled) setStatus("ready");
      } catch (error) {
        console.error("[arcade] falha ao carregar SWF:", error);
        if (!cancelled) setStatus("error");
      }
    };

    void start();

    return () => {
      cancelled = true;
      try {
        playerRef.current?.remove?.();
      } catch {
        /* player já removido */
      }
      playerRef.current = null;
    };
  }, [swfUrl, attempt, nonce]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black/60">
      <div ref={hostRef} className="aspect-[4/3] w-full [&_canvas]:max-h-full [&_canvas]:max-w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          {status === "loading" ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Carregando o jogo…</p>
            </>
          ) : (
            <>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar este jogo agora. Tente de novo ou jogue direto no servidor do parceiro.
              </p>
              <Button size="sm" variant="outline" onClick={() => setAttempt((a) => a + 1)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tentar de novo
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
