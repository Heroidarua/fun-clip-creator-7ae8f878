import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Gamepad2, Globe2, Tv, Radio, PlayCircle, BookOpen, LayoutDashboard, Share2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useEffect } from "react";
import IPTVModal from "./IPTVModal";
import ThemeToggle from "./ThemeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, desc: "Início" },
  { to: "/ferramentas", label: "Ferramentas", icon: Wrench, desc: "Utilidades" },
  { to: "/jogos", label: "Jogos", icon: Gamepad2, desc: "Diversão" },
  { to: "/nasa", label: "NASA", icon: Globe2, desc: "Espaço" },
  { to: "/mais-sbt", label: "+SBT", icon: Tv, desc: "TV Ao Vivo" },
  { to: "/iptv", label: "IPTV", icon: Radio, desc: "Canais" },
  { to: "/player", label: "IPTV 1.0", icon: PlayCircle, desc: "Premium" },
  { to: "/blog", label: "Blog", icon: BookOpen, desc: "Notícias" },
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard, desc: "Admin" },
] as const;

export default function SidebarNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [iptvModalOpen, setIptvModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
             <ThemeToggle />
             {!isCollapsed && <span className="text-[10px] text-muted-foreground uppercase tracking-widest">v2.0.1</span>}
          </div>
        </div>
      </nav>

      {/* Mobile Nav (remains at bottom for ergonomics on mobile) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-secondary bg-background/95 backdrop-blur-md safe-area-bottom"
        style={{ height: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        <ul className="flex items-center justify-around h-[64px] px-2 overflow-x-auto no-scrollbar">
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <li key={to} className="shrink-0">
                <Link
                  to={to}
                  onClick={(e) => {
                    if (to === "/player") {
                      e.preventDefault();
                      setIptvModalOpen(true);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] mt-0.5 font-bold uppercase tracking-tighter truncate w-12 text-center">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
            padding-bottom: calc(64px + env(safe-area-inset-bottom) + 1rem);
          }
        }
      `}} />
    </>
  );
}
