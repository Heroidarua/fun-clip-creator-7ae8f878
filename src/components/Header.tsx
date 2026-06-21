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
} from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
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
  { to: "/blog", label: "Blog", icon: BookOpen, desc: "Guias e novidades" },
  { to: "/precos", label: "Preços", icon: Tag, desc: "Planos e benefícios" },
] as const;

const Header = () => {
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-[hsl(var(--background)/0.85)] border-b border-border/70 shadow-[0_1px_0_0_hsl(var(--border)/0.4)]"
          : "backdrop-blur-sm bg-[hsl(var(--background)/0.6)] border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">
          {/* Logo — editorial mark */}
          <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Ir para a página inicial">
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
          <TooltipProvider delayDuration={0} disableHoverableContent>
            <nav
              aria-label="Navegação principal"
              className="hidden lg:flex items-center gap-0.5 p-1 rounded-full border border-border/60 bg-card/50"
            >
              {NAV.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Tooltip key={item.to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        aria-current={active ? "page" : undefined}
                        aria-label={`${item.label} — ${item.desc}`}
                        className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          active
                            ? "bg-foreground text-background"
                            : "text-foreground/80 hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        {item.label}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      sideOffset={10}
                      collisionPadding={12}
                      className="pointer-events-none"
                    >
                      <span className="font-medium">{item.label}</span>
                      <span className="block text-[10px] opacity-80">{item.desc}</span>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleShare}
              className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full border border-border hover:border-foreground/40 text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Compartilhar"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="hidden sm:block"><NotificationBell /></div>
            <ThemeToggle />
            <Link
              to="/dashboard"
              aria-label="Abrir meu painel"
              title="Abrir meu painel"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-elegant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span>Painel</span>
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-border text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="lg:hidden fixed inset-0 top-16 z-40 bg-foreground/20 backdrop-blur-[2px] animate-in fade-in"
          />
          {/* Drawer */}
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="lg:hidden absolute left-0 right-0 top-full z-50 border-t border-border bg-background shadow-xl animate-in slide-in-from-top-2"
          >
            <nav aria-label="Navegação móvel" className="container mx-auto px-4 py-5 max-w-7xl flex flex-col gap-1.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground px-2 pb-1">
                Navegação
              </p>
              {NAV.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    aria-label={`${item.label} — ${item.desc}`}
                    className={`group flex items-center gap-3 px-3 py-3 min-h-11 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                      active
                        ? "border-foreground/20 bg-muted"
                        : "border-transparent hover:bg-muted/60"
                    }`}
                  >
                    <span
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        active ? "bg-foreground text-background" : "bg-muted text-foreground"
                      }`}
                      aria-hidden="true"
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-base font-medium text-foreground leading-tight">
                        {item.label}
                      </span>
                      <span className="block text-xs text-foreground/70 truncate">
                        {item.desc}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-foreground/60 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </Link>
                );
              })}

              <div className="h-px bg-border my-3" />

              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                aria-label="Abrir meu painel"
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-11 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-[var(--shadow-elegant)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                Abrir meu painel
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  handleShare();
                }}
                aria-label="Compartilhar o site"
                className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 rounded-full border border-border text-sm text-foreground/80 hover:text-foreground hover:border-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                Compartilhar o site
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
