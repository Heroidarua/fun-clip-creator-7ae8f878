import { Link, useLocation } from "@tanstack/react-router";
import { Home, Gamepad2, Wrench, BookOpen, Tv } from "lucide-react";

const ITEMS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/jogos", icon: Gamepad2, label: "Jogos" },
  { to: "/mais-sbt", icon: Tv, label: "+SBT" },
  { to: "/quadrinhos", icon: BookOpen, label: "HQs" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Hide on MaisSBT fullscreen and IPTV players
  if (currentPath === "/mais-sbt" || currentPath.startsWith("/player")) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[45] bg-background/80 backdrop-blur-lg border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around h-16">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "animate-in zoom-in-95" : ""}`} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
