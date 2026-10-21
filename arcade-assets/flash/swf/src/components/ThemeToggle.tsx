import { Moon, Sun, Coffee, Waves, TreePine, ChevronDown } from "lucide-react";
import { useTheme, Theme, themeConfig } from "@/hooks/useTheme";
import { useState, useRef, useEffect } from "react";

const themeIcons: Record<Theme, React.ReactNode> = {
  dark: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />,
  light: <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-retro-yellow" />,
  sepia: <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />,
  ocean: <Waves className="w-4 h-4 sm:w-5 sm:h-5" />,
  forest: <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />,
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes: Theme[] = ["dark", "light", "sepia", "ocean", "forest"];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-primary/20 hover:bg-primary/40 rounded-sm transition-all duration-200 border-2 border-primary/50 hover:border-primary shadow-[3px_3px_0_hsl(var(--primary)/0.3)] hover:shadow-[1px_1px_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px]"
        aria-label="Selecionar tema"
        title="Escolher tema"
      >
        <span className="text-foreground">{themeIcons[theme]}</span>
        <ChevronDown className={`w-3 h-3 text-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-card border-2 border-primary/50 rounded-sm shadow-[4px_4px_0_hsl(var(--primary)/0.3)] z-[100] overflow-hidden">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-150 hover:bg-primary/20 ${
                theme === t ? "bg-primary/30 text-primary" : "text-foreground"
              }`}
            >
              <span className={theme === t ? "text-primary" : "text-muted-foreground"}>
                {themeIcons[t]}
              </span>
              <span className="text-sm font-medium font-orbitron">
                {themeConfig[t].label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
