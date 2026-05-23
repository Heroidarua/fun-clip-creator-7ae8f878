import { Sparkles, LayoutDashboard, Gamepad2, Share2, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useToast } from "@/hooks/use-toast";

const NAV = [
  { to: "/hub", label: "AI Hub" },
  { to: "/ferramentas", label: "Ferramentas" },
  { to: "/jogos", label: "Jogos" },
  { to: "/blog", label: "Blog" },
  { to: "/precos", label: "Preços" },
] as const;

const Header = () => {
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[hsl(var(--background)/0.78)] border-b border-border/70"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo — editorial mark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center shadow-[var(--shadow-elegant)] transition-transform group-hover:-rotate-3">
              <span className="font-display italic text-lg leading-none">s</span>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-background" />
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

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {item.label}
                <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleShare}
              className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <div className="hidden sm:block"><NotificationBell /></div>
            <ThemeToggle />
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-foreground"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-border bg-[hsl(var(--background)/0.95)] backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 max-w-7xl flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-border my-2" />
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-foreground text-background text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Abrir Dashboard
            </Link>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to="/hub" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> AI Hub
              </Link>
              <span className="text-border">·</span>
              <Link to="/jogos" onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Gamepad2 className="w-3.5 h-3.5 text-accent" /> Jogos
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
