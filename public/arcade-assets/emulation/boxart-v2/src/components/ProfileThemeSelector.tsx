import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export const PROFILE_THEMES = {
  purple: {
    name: "Roxo",
    gradient: "from-purple-600/20 via-blue-600/20 to-cyan-600/20",
    border: "border-purple-500/30",
    accent: "purple-500",
    ring: "ring-purple-500/50",
    bg: "bg-purple-500",
  },
  blue: {
    name: "Azul",
    gradient: "from-blue-600/20 via-cyan-600/20 to-teal-600/20",
    border: "border-blue-500/30",
    accent: "blue-500",
    ring: "ring-blue-500/50",
    bg: "bg-blue-500",
  },
  green: {
    name: "Verde",
    gradient: "from-green-600/20 via-emerald-600/20 to-teal-600/20",
    border: "border-green-500/30",
    accent: "green-500",
    ring: "ring-green-500/50",
    bg: "bg-green-500",
  },
  red: {
    name: "Vermelho",
    gradient: "from-red-600/20 via-rose-600/20 to-pink-600/20",
    border: "border-red-500/30",
    accent: "red-500",
    ring: "ring-red-500/50",
    bg: "bg-red-500",
  },
  orange: {
    name: "Laranja",
    gradient: "from-orange-600/20 via-amber-600/20 to-yellow-600/20",
    border: "border-orange-500/30",
    accent: "orange-500",
    ring: "ring-orange-500/50",
    bg: "bg-orange-500",
  },
  pink: {
    name: "Rosa",
    gradient: "from-pink-600/20 via-rose-600/20 to-fuchsia-600/20",
    border: "border-pink-500/30",
    accent: "pink-500",
    ring: "ring-pink-500/50",
    bg: "bg-pink-500",
  },
  cyan: {
    name: "Ciano",
    gradient: "from-cyan-600/20 via-teal-600/20 to-blue-600/20",
    border: "border-cyan-500/30",
    accent: "cyan-500",
    ring: "ring-cyan-500/50",
    bg: "bg-cyan-500",
  },
} as const;

export type ProfileTheme = keyof typeof PROFILE_THEMES;

interface ProfileThemeSelectorProps {
  currentTheme: ProfileTheme;
  onThemeChange: (theme: ProfileTheme) => void;
  disabled?: boolean;
}

const ProfileThemeSelector = ({ currentTheme, onThemeChange, disabled }: ProfileThemeSelectorProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-pixel text-sm text-foreground">Tema do Perfil</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PROFILE_THEMES) as ProfileTheme[]).map((theme) => {
          const themeData = PROFILE_THEMES[theme];
          const isSelected = currentTheme === theme;
          
          return (
            <button
              key={theme}
              onClick={() => onThemeChange(theme)}
              disabled={disabled}
              className={cn(
                "relative w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center",
                themeData.bg,
                isSelected ? `ring-2 ${themeData.ring} ring-offset-2 ring-offset-background scale-110` : "hover:scale-105",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={themeData.name}
            >
              {isSelected && (
                <Check className="w-5 h-5 text-white drop-shadow-md" />
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3">
        Cor atual: <span className="text-foreground">{PROFILE_THEMES[currentTheme].name}</span>
      </p>
    </div>
  );
};

export default ProfileThemeSelector;
