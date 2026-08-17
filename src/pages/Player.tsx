import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MonitorPlay, ArrowLeft, Tv } from "lucide-react";
import IPTVModal from "@/components/IPTVModal";

export default function Player() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <MonitorPlay className="w-10 h-10 text-[#28B6FF]" aria-hidden="true" />
        </div>
        <h1
          className="text-3xl sm:text-4xl text-[#F5F9FF] mb-3 font-display"
          style={{ textShadow: "0 0 10px rgba(40,182,255,0.7)" }}
        >
          IPTV 1.0
        </h1>
        <p className="text-[#E8EEF5]/80 text-sm mb-7 leading-relaxed font-silkscreen uppercase tracking-wider">
          Roleta da Sorte
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-3d inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#FFD93D] text-[#0E4A7B] font-silkscreen uppercase tracking-wider text-base hover:brightness-110 transition-all"
          >
            <Tv className="w-5 h-5" />
            Tentar a Sorte
          </button>
          
          <p className="text-[10px] text-[#E8EEF5]/50 italic">
            Desbloqueie credenciais premium girando a roleta.
          </p>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-1.5 text-xs font-silkscreen uppercase tracking-wider text-[#28B6FF] hover:text-[#B66DFF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Voltar ao SOS01
        </Link>
      </div>

      <IPTVModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
