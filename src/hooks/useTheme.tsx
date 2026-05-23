import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "dark" | "light" | "sepia" | "ocean" | "forest";

export const themeConfig: Record<Theme, { label: string; icon: string }> = {
  dark: { label: "Escuro", icon: "moon" },
  light: { label: "Claro", icon: "sun" },
  sepia: { label: "Sépia", icon: "coffee" },
  ocean: { label: "Oceano", icon: "waves" },
  forest: { label: "Floresta", icon: "trees" },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: Theme[] = ["dark", "light", "sepia", "ocean", "forest"];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("sos01-theme");
    return (stored as Theme) || "light";
  });

  useEffect(() => {
    localStorage.setItem("sos01-theme", theme);
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeState(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
