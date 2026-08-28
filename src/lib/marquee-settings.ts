export type MarqueeDirection = "rtl" | "ltr";

export type MarqueeSettings = {
  speed: number;
  color: string;
  direction: MarqueeDirection;
  pause_on_hover: boolean;
};

export const DEFAULT_MARQUEE_SETTINGS: MarqueeSettings = {
  speed: 28,
  color: "primary",
  direction: "rtl",
  pause_on_hover: true,
};

export type SidebarMarqueeSettings = MarqueeSettings & { text: string };

export const DEFAULT_SIDEBAR_MARQUEE_SETTINGS: SidebarMarqueeSettings = {
  ...DEFAULT_MARQUEE_SETTINGS,
  text: "FAÇA UMA DOAÇÃO DE DONATE",
};

type Palette = { solid: string; soft: string; border: string; bg: string };

const token = (name: string): Palette => ({
  solid: `hsl(var(--${name}))`,
  soft: `hsl(var(--${name}) / 0.5)`,
  border: `hsl(var(--${name}) / 0.25)`,
  bg: `hsl(var(--${name}) / 0.12)`,
});

export const MARQUEE_COLOR_STYLES: Record<string, Palette> = {
  primary: token("primary"),
  accent: token("accent"),
  secondary: token("secondary"),
  success: { solid: "hsl(142 70% 45%)", soft: "hsl(142 70% 45% / 0.5)", border: "hsl(142 70% 45% / 0.25)", bg: "hsl(142 70% 45% / 0.12)" },
  warning: { solid: "hsl(45 95% 55%)", soft: "hsl(45 95% 55% / 0.5)", border: "hsl(45 95% 55% / 0.25)", bg: "hsl(45 95% 55% / 0.12)" },
  danger: token("destructive"),
  foreground: token("foreground"),
};

export const MARQUEE_COLOR_OPTIONS = [
  { value: "primary", label: "Azul neon (primária)" },
  { value: "accent", label: "Destaque" },
  { value: "secondary", label: "Secundária" },
  { value: "success", label: "Verde" },
  { value: "warning", label: "Amarelo" },
  { value: "danger", label: "Vermelho" },
  { value: "foreground", label: "Neutro" },
] as const;