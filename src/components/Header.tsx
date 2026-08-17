import {
  LayoutDashboard,
  Gamepad2,
  Wrench,
  BookOpen,
  Tag,
  Share2,
  Menu,
  X,
  ArrowRight,
  Tv,
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import InstallAppButton from "@/components/InstallAppButton";
import IPTVModal from "@/components/IPTVModal";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV = [
  { to: "/ferramentas", label: "Ferramentas", icon: Wrench, desc: "QR, PDF, áudio, imagens" },
  { to: "/jogos", label: "Jogos", icon: Gamepad2, desc: "Clássicos retrô grátis" },
  { to: "/nasa", label: "🌎 NASA", icon: Wrench, desc: "Satélites em tempo real", premium: true },
  { to: "/mais-sbt", label: "+SBT 📺", icon: Tv, desc: "Assista +SBT grátis" },
  { to: "/iptv", label: "IPTV", icon: Tv, desc: "Pluto TV grátis" },
  { to: "/player", label: "IPTV 1.0 🎬", icon: Tv, desc: "Canais e mídia premium", premium: true },
  { to: "/blog", label: "Blog", icon: BookOpen, desc: "Guias e novidades" },
  { to: "/precos", label: "Preços", icon: Tag, desc: "Planos e benefícios" },
] as const;

const Header = () => {
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [iptvModalOpen, setIptvModalOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "sos01 — Utilidades digitais",
          text: "Ferramentas, AI e entretenimento — tudo em um só lugar.",
          url: window.location.origin,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast({ title: "Link copiado", description: "Pronto para compartilhar." });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[hsl(var(--background)/0.85)] border-b border-border/70 shadow-[0_1px_0_0_hsl(var(--border)/0.4)]"
          : "backdrop-blur-sm bg-[hsl(var(--background)/0.6)] border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo — 3D icon */}
          <Link to="/" className="md:hidden flex items-center gap-3 group shrink-0" aria-label="Ir para a página inicial">
            <div className="relative" style={{ perspective: '800px' }}>
              <div
                className="relative w-12 h-12 rounded-2xl transition-transform duration-500 ease-out group-hover:[transform:rotateY(22deg)_rotateX(8deg)_scale(1.06)]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateY(-12deg) rotateX(6deg)',
                }}
              >
                <img
                  src="/favicon.png"
                  alt="sos01"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 45%, rgba(0,0,0,0.12) 100%)',
                  }}
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-xl tracking-tight text-foreground">
                sos<span className="italic text-accent">01</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                Studio Digital
              </span>
            </div>
          </Link>


          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <InstallAppButton />
            <div className="hidden sm:block"><NotificationBell /></div>

            <div className="hidden sm:block"><NotificationBell /></div>
          </div>
        </div>
      </div>

      {/* Modal moved to /player page */}
    </header>
  );
};

export default Header;
