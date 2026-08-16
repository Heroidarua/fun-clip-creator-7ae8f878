import { useState, useEffect, useRef } from "react";
import { Tv, ChevronLeft, Maximize, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export default function MaisSbt() {
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      if (loading) {
        setBlocked(true);
        setLoading(false);
      }
    }, 6000);

    return () => {
      document.body.style.overflow = "auto";
      clearTimeout(timer);
    };
  }, [loading]);

  const handleLoad = () => {
    setLoading(false);
    setBlocked(false);
  };

  const toggleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen().catch(() => {
          // Fallback if direct iframe fullscreen fails
          document.documentElement.requestFullscreen();
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Top Bar Controls */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <Link to="/">
            <Button variant="outline" className="h-9 px-3 gap-2 bg-black/60 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="h-9 px-3 bg-black/60 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {!blocked && !loading && (
          <Button 
            variant="outline" 
            onClick={toggleFullscreen}
            className="h-9 px-3 gap-2 bg-black/60 backdrop-blur-md border-white/20 text-white hover:bg-white/20 pointer-events-auto"
          >
            <Maximize className="w-4 h-4" />
            <span className="hidden sm:inline">Tela Cheia</span>
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="w-16 h-16 rounded-2xl border-4 border-t-[hsl(var(--primary))] border-r-[hsl(var(--accent))] border-b-white/10 border-l-white/10 animate-spin" />
          <div className="text-center">
            <h2 className="font-pixel text-xl text-primary neon-text mb-2">CARREGANDO...</h2>
            <p className="text-white/40 text-[10px] font-pixel tracking-widest uppercase">Preparando sua TV</p>
          </div>
        </div>
      )}

      {blocked ? (
        <div className="max-w-md w-full p-8 mx-4 bg-[#0a0a0a] border-2 border-primary/30 rounded-2xl text-center shadow-[0_0_50px_-12px_rgba(40,182,255,0.3)] animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Tv className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl text-white mb-4">O +SBT não permite incorporação</h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            Por questões de segurança, este conteúdo só pode ser visualizado diretamente no site oficial do +SBT.
          </p>
          <a 
            href="https://mais.sbt.com.br/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-3d w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold transition-transform hover:scale-[1.02]"
          >
            <span>ABRIR +SBT OFICIAL</span>
            <Maximize className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          src="https://mais.sbt.com.br/"
          className={`w-full h-full border-none transition-opacity duration-700 ${loading ? 'opacity-0' : 'opacity-100'}`}
          allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
          onLoad={handleLoad}
          title="+SBT Player"
        />
      )}
    </div>
  );
}
