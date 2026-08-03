import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Gamepad2, Globe2, Tv, Radio, PlayCircle, BookOpen, LayoutDashboard, Share2, PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import IPTVModal from "./IPTVModal";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function SidebarNav() {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [iptvModalOpen, setIptvModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const ITEMS = [
    { to: "/", label: t('nav.home'), icon: Home, desc: "Início" },
    { to: "/ferramentas", label: t('nav.tools'), icon: Wrench, desc: "Utilidades" },
    { to: "/jogos", label: t('nav.games'), icon: Gamepad2, desc: "Diversão" },
    { to: "/nasa", label: t('nav.nasa'), icon: Globe2, desc: "Espaço" },
    { to: "/mais-sbt", label: t('nav.sbt'), icon: Tv, desc: "TV Ao Vivo" },
    { to: "/iptv", label: t('nav.iptv'), icon: Radio, desc: "Canais" },
    { to: "/player", label: t('nav.iptv_premium'), icon: PlayCircle, desc: "Premium" },
    { to: "/blog", label: t('nav.blog'), icon: BookOpen, desc: "Notícias" },
    { to: "/dashboard", label: "Painel", icon: LayoutDashboard, desc: "Admin" },
  ] as const;

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  return (
    <>
      <nav
        aria-label="Navegação lateral"
        className={`fixed left-0 top-0 bottom-0 z-50 border-r-2 border-secondary bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out hidden md:flex flex-col ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header / Logo */}
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          {!isCollapsed && (
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-display text-xl tracking-tight text-foreground">
                sos<span className="italic text-accent">01</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <TooltipProvider delayDuration={0}>
            {ITEMS.map(({ to, label, icon: Icon, desc }) => {
              const active = isActive(to);
              return (
                <Tooltip key={to}>
                  <TooltipTrigger asChild>
                    <Link
                      to={to}
                      onClick={(e) => {
                        if (to === "/player") {
                          e.preventDefault();
                          setIptvModalOpen(true);
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                        active
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground border-transparent"
                      } border-2`}
                    >
                      <div className="relative shrink-0">
                        <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                        {active && (
                          <span className="absolute -top-1 -right-1 led-active scale-75" />
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate leading-tight">{label}</span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-60 truncate">{desc}</span>
                        </div>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p className="font-bold">{label}</p>
                      <p className="text-[10px] opacity-70">{desc}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border/50 space-y-2">
          {!isCollapsed && <span className="text-[10px] text-muted-foreground uppercase tracking-widest block text-center mb-2">v2.0.1</span>}
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <nav
        className={`md:hidden fixed inset-y-0 left-0 z-[60] w-72 bg-background/98 backdrop-blur-xl border-r-2 border-secondary shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-border/50">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 group">
              <span className="font-display text-xl tracking-tight text-foreground">
                sos<span className="italic text-accent">01</span>
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
            >
              <PanelLeftClose className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            {ITEMS.map(({ to, label, icon: Icon, desc }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (to === "/player") {
                      e.preventDefault();
                      setIptvModalOpen(true);
                    }
                  }}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                    active
                      ? "bg-primary/10 border-primary text-primary shadow-sm"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground border-transparent"
                  } border-2`}
                >
                  <div className="relative shrink-0">
                    <Icon className={`w-6 h-6 ${active ? "scale-110" : ""}`} />
                    {active && <span className="absolute -top-1 -right-1 led-active scale-75" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-bold truncate leading-tight">{label}</span>
                    <span className="text-xs uppercase tracking-tighter opacity-60 truncate">{desc}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="p-6 border-t border-border/50 flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">v2.0.1</span>
          </div>
        </div>
      </nav>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Trigger Button (Floating on Mobile) */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        aria-label="Abrir menu"
      >
        <Menu className="w-7 h-7" />
      </button>

      <IPTVModal isOpen={iptvModalOpen} onClose={() => setIptvModalOpen(false)} />

      {/* Main Layout Adjustments for Sidebar & Mobile Nav */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          main, header, footer {
            margin-left: ${isCollapsed ? '80px' : '256px'};
            transition: margin-left 300ms ease-in-out;
          }
        }
        @media (max-width: 767px) {
          main {
            padding-bottom: 2rem;
          }
        }
      `}} />
    </>
  );
}
