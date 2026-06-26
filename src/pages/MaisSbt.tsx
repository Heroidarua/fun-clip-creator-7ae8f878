import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Tv, ArrowLeft, ExternalLink } from "lucide-react";

const SBT_URL = "https://mais.sbt.com.br/";

export default function MaisSbt() {
  // Auto-open +SBT in a new tab so Google OAuth login works (Google blocks iframes).
  useEffect(() => {
    const t = window.setTimeout(() => {
      window.open(SBT_URL, "_blank", "noopener,noreferrer");
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div
        className="max-w-md w-full text-center p-8 sm:p-10 rounded-2xl border-2 border-[#28B6FF]/60 bg-[#0E4A7B]/40 backdrop-blur"
        style={{ boxShadow: "0 0 32px rgba(40,182,255,0.35), inset 0 0 24px rgba(182,109,255,0.15)" }}
      >
        <div
          className="mx-auto w-20 h-20 rounded-2xl border-2 border-[#28B6FF] flex items-center justify-center mb-5"
          style={{ boxShadow: "0 0 24px rgba(40,182,255,0.6)" }}
        >
          <Tv className="w-10 h-10 text-[#28B6FF]" aria-hidden="true" />
        </div>
        <h1
          className="text-3xl sm:text-4xl text-[#F5F9FF] mb-3"
          style={{ fontFamily: "'VT323', monospace", textShadow: "0 0 10px rgba(40,182,255,0.7)" }}
        >
          +SBT
        </h1>
        <p className="text-[#E8EEF5]/80 text-sm mb-7 leading-relaxed">
          Abrindo o +SBT em uma nova aba para você poder fazer login com sua conta Google normalmente.
          Se o navegador bloqueou o pop-up, use o botão abaixo.
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
          className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-silkscreen uppercase tracking-wider text-[#28B6FF] hover:text-[#B66DFF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar ao SOS01
        </Link>
      </div>
    </div>
  );
}
