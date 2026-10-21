
export type ButtonShape = "rounded-full" | "rounded-lg" | "rounded-none" | "rounded-md";

export type ButtonSettings = {
  color: string;
  shape: ButtonShape;
  animate: boolean;
};

export const DEFAULT_BUTTON_SETTINGS: ButtonSettings = {
  color: "success",
  shape: "rounded-full",
  animate: true,
};

export const BUTTON_SHAPE_OPTIONS = [
  { value: "rounded-full", label: "Totalmente Arredondado" },
  { value: "rounded-lg", label: "Cantos Suaves" },
  { value: "rounded-md", label: "Médio" },
  { value: "rounded-none", label: "Quadrado" },
] as const;

export const BUTTON_COLOR_OPTIONS = [
  { value: "primary", label: "Azul Neon" },
  { value: "success", label: "Verde Vibrante" },
  { value: "accent", label: "Rosa Destaque" },
  { value: "warning", label: "Amarelo" },
  { value: "danger", label: "Vermelho" },
  { value: "foreground", label: "Neutro" },
] as const;
