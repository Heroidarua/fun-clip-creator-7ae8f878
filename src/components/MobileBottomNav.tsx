import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wrench, Gamepad2, BookOpen, LayoutDashboard, Globe2 } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/ferramentas", label: "Tools", icon: Wrench },
  { to: "/jogos", label: "Jogos", icon: Gamepad2 },
  { to: "/nasa", label: "NASA", icon: Globe2 },
  { to: "/blog", label: "Blog", icon: BookOpen },
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
] as const;

export default function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  return (
    <nav
      aria-label="Navegação inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t-2 border-secondary bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-6 h-[64px]">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <li key={to} className="flex">
              <Link
                to={to}
                aria-current={active ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-silkscreen uppercase tracking-wider transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className={`relative flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all ${
                    active
                      ? "border-primary bg-primary/10 shadow-neon-blue"
                      : "border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {active && (
                    <span className="absolute -top-1 -right-1 led-active" aria-hidden="true" />
                  )}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}