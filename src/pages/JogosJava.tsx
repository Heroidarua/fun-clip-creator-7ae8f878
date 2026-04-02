import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Joystick, Maximize2, Minimize2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { useRef, useState, useEffect } from "react";

const JogosJava = () => {
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;

    if (!document.fullscreenElement) {
      iframeContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Jogos 2️⃣ - ClipSave | Clássicos Java para Celular</title>
        <meta name="description" content="Jogue os melhores jogos Java clássicos diretamente no navegador. Reviva a nostalgia dos games de celular antigos." />
      </Helmet>
      
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Joystick className="w-10 h-10 text-accent animate-pulse" />
              <h1 className="font-pixel text-2xl sm:text-3xl text-accent neon-text">
                JOGOS
              </h1>
              <Joystick className="w-10 h-10 text-accent animate-pulse" />
            </div>
            <p className="font-pixel text-xs sm:text-sm text-muted-foreground">
              TOP 50° Jogos para você jogar!
            </p>
            <p className="font-pixel text-[10px] text-primary/70 mt-2 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Alguns jogos podem demorar para carregar devido ao tamanho
            </p>
          </div>
          
          {/* Iframe com jogos do Game Distribution */}
          <div 
            ref={iframeContainerRef}
            className={`relative w-full rounded-sm overflow-hidden bg-black ${
              isFullscreen 
                ? 'fixed inset-0 z-50 flex items-center justify-center' 
                : 'border-4 border-accent/50 shadow-[8px_8px_0_hsl(var(--accent)/0.3)]'
            }`}
          >
            <button
              onClick={toggleFullscreen}
              className={`absolute z-10 flex items-center gap-2 px-3 py-2 bg-accent/90 hover:bg-accent text-accent-foreground rounded-sm transition-all duration-200 border-2 border-accent-foreground/20 shadow-[3px_3px_0_hsl(var(--background)/0.5)] hover:shadow-[1px_1px_0_hsl(var(--background)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] font-pixel text-[10px] ${
                isFullscreen ? 'top-4 right-4' : 'top-3 right-3'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">SAIR</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">TELA CHEIA</span>
                </>
              )}
            </button>
            <iframe
              src="https://html5.gamedistribution.com/"
              title="Jogos HTML5"
              className={`border-0 ${
                isFullscreen 
                  ? 'w-screen h-screen object-contain' 
                  : 'w-full h-[70vh] sm:h-[80vh]'
              }`}
              allow="fullscreen; autoplay"
              loading="lazy"
              style={isFullscreen ? { 
                width: '100vw', 
                height: '100vh',
                maxWidth: '100%',
                maxHeight: '100%'
              } : undefined}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default JogosJava;
