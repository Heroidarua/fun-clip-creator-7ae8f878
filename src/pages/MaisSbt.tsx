import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Tv, ArrowLeft, Maximize, ExternalLink } from "lucide-react";

const SBT_URL = "https://mais.sbt.com.br/";

export default function MaisSbt() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (loading) {
        setBlocked(true);
        setLoading(false);
      }
    }, 6000);
    return () => window.clearTimeout(t);
  }, [loading]);

  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      el.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[100] bg-black"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Floating controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <Link
          to="/"
          aria-label="Voltar para o SOS01"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white text-xs font-silkscreen uppercase tracking-wider hover:bg-black/80 hover:border-[#28B6FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar
        </Link>
        <button
          onClick={handleFullscreen}
          aria-label="Alternar tela cheia"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 backdrop-blur border border-white/15 text-white text-xs font-silkscreen uppercase tracking-wider hover:bg-black/80 hover:border-[#B66DFF] transition-colors"
        >
          <Maximize className="w-3.5 h-3.5" aria-hidden="true" />
          Tela cheia
        </button>
      </div>

      {/* Always-visible "open in new tab" — required for Google login (Google blocks OAuth in iframes) */}
      <a
        href={SBT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir +SBT em nova aba"
        className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#FFD93D] text-[#0E4A7B] text-xs font-silkscreen uppercase tracking-wider border border-black/10 hover:brightness-110 transition-all shadow-[0_3px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_1px_0_rgba(0,0,0,0.5)]"
      >
        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        Abrir / Login Google
      </a>

      {/* Google-login notice banner */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-[92vw]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 backdrop-blur border border-[#B66DFF]/50 text-[#F5F9FF] text-[11px] sm:text-xs">
          <Tv className="w-3.5 h-3.5 text-[#28B6FF] shrink-0" aria-hidden="true" />
          <span className="leading-tight">
            Para logar com Google, abra em nova aba — o Google não permite login dentro de iframes.
          </span>
          <a
            href={SBT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-silkscreen uppercase tracking-wider text-[#FFD93D] hover:text-white shrink-0"
          >
            Abrir →
          </a>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && !blocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-5 animate-in fade-in">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-[#28B6FF]/30" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#28B6FF] border-r-[#B66DFF] animate-spin"
              style={{ boxShadow: "0 0 24px rgba(40,182,255,0.6), 0 0 36px rgba(182,109,255,0.4)" }}
            />
            <Tv className="absolute inset-0 m-auto w-7 h-7 text-[#28B6FF]" aria-hidden="true" />
          </div>
          <p
            className="text-[#F5F9FF] text-2xl tracking-wider"
            style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 12px rgba(40,182,255,0.8)" }}
          >
            CARREGANDO +SBT...
          </p>
        </div>
      )}

      {/* Fallback when iframe is blocked */}
      {blocked ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black p-6 animate-in fade-in">
          <div
            className="max-w-md w-full text-center p-8 sm:p-10 rounded-2xl border-2 border-[#28B6FF]/60 bg-[#0E4A7B]/40 backdrop-blur"
            style={{ boxShadow: "0 0 32px rgba(40,182,255,0.35), inset 0 0 24px rgba(182,109,255,0.15)" }}
          >
            <div className="mx-auto w-20 h-20 rounded-2xl border-2 border-[#28B6FF] flex items-center justify-center mb-5 animate-pulse"
              style={{ boxShadow: "0 0 24px rgba(40,182,255,0.6)" }}
            >
              <Tv className="w-10 h-10 text-[#28B6FF]" aria-hidden="true" />
            </div>
            <h1
              className="text-3xl sm:text-4xl text-[#F5F9FF] mb-3"
              style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 10px rgba(40,182,255,0.7)" }}
            >
              +SBT não permite incorporação
            </h1>
            <p className="text-[#E8EEF5]/80 text-sm mb-7 leading-relaxed">
              O +SBT bloqueia a exibição dentro de outros sites. Você pode abrir o +SBT diretamente em uma nova aba.
            </p>
            <a
              href={SBT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-3d inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#FFD93D] text-[#0E4A7B] font-silkscreen uppercase tracking-wider text-base hover:brightness-110 transition-all"
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
              Abrir +SBT
            </a>
            <Link
              to="/"
              className="block mt-4 text-xs font-silkscreen uppercase tracking-wider text-[#28B6FF] hover:text-[#B66DFF] transition-colors"
            >
              ← Voltar ao SOS01
            </Link>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src={SBT_URL}
          title="+SBT"
          onLoad={() => setLoading(false)}
          onError={() => {
            setBlocked(true);
            setLoading(false);
          }}
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            border: "none",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            display: "block",
          }}
        />
      )}
    </div>
  );
}
