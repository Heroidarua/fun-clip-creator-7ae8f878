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
  { to: "/jogos", label: "Jogos", icon: Gamepad2, desc: "2900+ Clássicos retrô grátis" },
  { to: "/mais-sbt", label: "+SBT 📺", icon: Tv, desc: "Assista +SBT grátis" },
  { to: "/iptv", label: "PLUTO TV", icon: Tv, desc: "Pluto TV grátis" },
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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
              <span className="font-display text-2xl tracking-tight text-foreground">
                sos<span className="italic text-accent">01</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <InstallAppButton />
            <ThemeToggle />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <IPTVModal isOpen={iptvModalOpen} onClose={() => setIptvModalOpen(false)} />
    </>
  );
};

export default Header;
