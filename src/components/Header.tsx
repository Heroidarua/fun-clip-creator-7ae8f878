import { Gamepad2, Joystick, Share2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import spidermanWeb from "@/assets/spiderman-web.gif";
import FreeMario from "@/components/FreeMario";
import FreeLuigi from "@/components/FreeLuigi";
import FreeYoshi from "@/components/FreeYoshi";
import FreeSonic from "@/components/FreeSonic";
import FreeFlintstones from "@/components/FreeFlintstones";
import ThemeToggle from "@/components/ThemeToggle";
import BrightnessControl from "@/components/BrightnessControl";
import NotificationBell from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";


const RetroClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const day = time.getDate().toString().padStart(2, '0');
  const month = (time.getMonth() + 1).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center px-2 py-1 bg-background/50 border border-primary/50 rounded-sm">
      <span className="font-pixel text-[8px] sm:text-[10px] text-primary/70 tabular-nums">
        {day}/{month}
      </span>
      <span className="font-pixel text-[10px] sm:text-xs text-primary tabular-nums">
        {hours}
        <span className="animate-pulse">:</span>
        {minutes}
        <span className="animate-pulse">:</span>
        {seconds}
      </span>
    </div>
  );
};

const Header = () => {
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ClipSave - Plataforma de Utilidades Digitais",
          text: "Ferramentas digitais, entretenimento e jogos clássicos - tudo em um só lugar!",
          url: window.location.origin,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "✅ Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <>
      <header className="bg-gradient-header text-foreground border-b-4 border-primary/50 w-full relative">
        {/* Mario walking in header */}
        <FreeMario />
        {/* Luigi walking in header */}
        <FreeLuigi />
        {/* Yoshi walking in header */}
        <FreeYoshi />
        {/* Sonic running in header */}
        <FreeSonic />
        {/* Flintstones walking in header */}
        <FreeFlintstones />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-20"></div>
        
        {/* Arcade glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
        
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between max-w-full relative z-10">
          {/* Logo - Retro Style */}
          <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform group">
            {/* Pixel Logo Box */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-sm flex items-center justify-center shadow-[4px_4px_0_hsl(var(--accent))] group-hover:shadow-[2px_2px_0_hsl(var(--accent))] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all border-2 border-foreground/20">
              <Joystick className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <span className="font-pixel text-xs sm:text-sm text-primary neon-text tracking-wider">CLIP</span>
              <span className="font-pixel text-xs sm:text-sm text-[hsl(var(--accent))] tracking-wider">SAVE</span>
            </div>
          </Link>
          
          {/* Navigation & Clock */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Game Buttons Group - Highlighted */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-background/60 backdrop-blur-sm rounded-md border border-primary/30">
              <Link 
                to="/hub" 
                className="group relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-secondary hover:bg-secondary/80 rounded-sm transition-all duration-200 border-2 border-secondary-foreground/20 shadow-[3px_3px_0_hsl(var(--retro-magenta)/0.4)] hover:shadow-[1px_1px_0_hsl(var(--retro-magenta)/0.4)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground drop-shadow-[0_0_8px_hsl(var(--retro-magenta))]" />
                <span className="font-pixel text-[7px] sm:text-[10px] text-secondary-foreground tracking-wider">AI HUB</span>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--retro-magenta))] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[hsl(var(--retro-magenta))] text-primary-foreground text-[6px] font-bold items-center justify-center">✨</span>
                </span>
              </Link>
              <Link 
                to="/jogos" 
                className="group relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary/80 rounded-sm transition-all duration-200 border-2 border-primary-foreground/20 shadow-[3px_3px_0_hsl(var(--accent))] hover:shadow-[1px_1px_0_hsl(var(--accent))] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground drop-shadow-[0_0_8px_hsl(var(--primary-foreground))]" />
                <span className="font-pixel text-[7px] sm:text-[10px] text-primary-foreground tracking-wider">JOGOS</span>
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive text-destructive-foreground text-[6px] font-bold items-center justify-center">!</span>
                </span>
              </Link>
              <Link 
                to="/jogos-java" 
                className="group relative flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-accent hover:bg-accent/80 rounded-sm transition-all duration-200 border-2 border-accent-foreground/20 shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[1px_1px_0_hsl(var(--primary))] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Joystick className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground drop-shadow-[0_0_8px_hsl(var(--accent-foreground))]" />
                <span className="font-pixel text-[7px] sm:text-[10px] text-accent-foreground tracking-wider">JAVA</span>
              </Link>
            </div>
            <NotificationBell />
            <BrightnessControl />
            <ThemeToggle />
            <RetroClock />
          </div>
        </div>
      </header>
      
      {/* Spider-Man shooting web below header */}
      <div className="relative w-full h-32 sm:h-40 overflow-hidden bg-gradient-to-b from-background/80 to-transparent">
        <img 
          src={spidermanWeb} 
          alt="Spider-Man shooting web" 
          className="absolute left-1/2 -translate-x-1/2 -top-2 h-36 sm:h-48 w-auto object-contain"
        />
        
        {/* Share Button - Positioned on the right */}
        <div className="absolute right-4 sm:right-6 top-4 z-20">
          <Button 
            onClick={handleShare}
            variant="outline" 
            size="sm"
            className="group border-2 border-[hsl(var(--retro-cyan))]/50 hover:border-[hsl(var(--retro-cyan))] bg-background/80 backdrop-blur-sm hover:bg-[hsl(var(--retro-cyan))]/20 font-pixel text-[8px] sm:text-[10px] rounded-sm shadow-[3px_3px_0_hsl(var(--retro-cyan)/0.4)] hover:shadow-[1px_1px_0_hsl(var(--retro-cyan)/0.4)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all animate-pulse hover:animate-none"
          >
            <Share2 size={14} className="mr-1 sm:mr-2 text-[hsl(var(--retro-cyan))] group-hover:rotate-12 transition-transform" />
            <span className="text-[hsl(var(--retro-cyan))]">COMPARTILHAR</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Header;
