import { useCallback, useEffect, useState, type RefObject } from "react";
import { Download, Maximize2, Minimize2, PictureInPicture2, ExternalLink } from "lucide-react";

interface PlayerControlsBarProps {
  /** Container que entra em tela cheia (inclui os controles customizados). */
  containerRef: RefObject<HTMLElement | null>;
  /** Usa o sistema de download já existente do SOS01. */
  onDownload?: () => void;
  /** Vídeo HTML5 (quando houver) para Picture-in-Picture. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  /** Fallback quando não há suporte a PiP (ex.: player em iframe). */
  externalUrl?: string;
  className?: string;
}

function isFullscreenActive(el: HTMLElement | null) {
  const doc = document as Document & { webkitFullscreenElement?: Element };
  const current = document.fullscreenElement || doc.webkitFullscreenElement || null;
  return !!current && (!el || current === el || el.contains(current));
}

export default function PlayerControlsBar({
  containerRef,
  onDownload,
  videoRef,
  externalUrl,
  className = "",
}: PlayerControlsBarProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(isFullscreenActive(containerRef.current));
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange as EventListener);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange as EventListener);
    };
  }, [containerRef]);

  useEffect(() => {
    setPipSupported(
      !!videoRef?.current &&
        typeof document !== "undefined" &&
        (document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled === true,
    );
  }, [videoRef]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current as
      | (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    if (!el) return;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    try {
      if (isFullscreenActive(el)) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      } else if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    } catch {
      /* navegador sem suporte: mantém o player inline */
    }
  }, [containerRef]);

  const togglePip = useCallback(async () => {
    const video = videoRef?.current as
      | (HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> })
      | null
      | undefined;
    if (!video?.requestPictureInPicture) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* ignorado */
    }
  }, [videoRef]);

  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 active:bg-white/25 sm:h-9 sm:w-9";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-white/15 bg-black/70 px-2 py-1 shadow-lg backdrop-blur-md">
        {onDownload && (
          <button type="button" onClick={onDownload} className={btn} title="Baixar" aria-label="Baixar">
            <Download className="h-5 w-5" />
          </button>
        )}
        {pipSupported ? (
          <button
            type="button"
            onClick={togglePip}
            className={btn}
            title="Picture-in-Picture"
            aria-label="Picture-in-Picture"
          >
            <PictureInPicture2 className="h-5 w-5" />
          </button>
        ) : externalUrl ? (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={btn}
            title="Abrir no YouTube"
            aria-label="Abrir no YouTube"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={btn}
          title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
          aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
