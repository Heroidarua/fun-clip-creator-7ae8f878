import { useState } from "react";
import { Check, ImagePlus, Palette, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackgroundSelectorProps {
  onSelectBackground: (background: string | null) => void;
  selectedBackground: string | null;
}

const PRESET_BACKGROUNDS = [
  { id: "transparent", type: "pattern", label: "Transparente", value: null },
  { id: "solid-white", type: "solid", label: "Branco", value: "#FFFFFF" },
  { id: "solid-black", type: "solid", label: "Preto", value: "#000000" },
  { id: "solid-red", type: "solid", label: "Vermelho", value: "#EF4444" },
  { id: "solid-blue", type: "solid", label: "Azul", value: "#3B82F6" },
  { id: "solid-green", type: "solid", label: "Verde", value: "#22C55E" },
  { id: "solid-purple", type: "solid", label: "Roxo", value: "#A855F7" },
  { id: "solid-yellow", type: "solid", label: "Amarelo", value: "#EAB308" },
  { id: "solid-pink", type: "solid", label: "Rosa", value: "#EC4899" },
  { id: "solid-orange", type: "solid", label: "Laranja", value: "#F97316" },
  { id: "solid-cyan", type: "solid", label: "Ciano", value: "#06B6D4" },
  { id: "gradient-sunset", type: "gradient", label: "Pôr do Sol", value: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)" },
  { id: "gradient-ocean", type: "gradient", label: "Oceano", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "gradient-forest", type: "gradient", label: "Floresta", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "gradient-night", type: "gradient", label: "Noite", value: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
  { id: "gradient-candy", type: "gradient", label: "Candy", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "gradient-sky", type: "gradient", label: "Céu", value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
  { id: "gradient-neon", type: "gradient", label: "Neon", value: "linear-gradient(135deg, #00f260 0%, #0575e6 100%)" },
  { id: "gradient-fire", type: "gradient", label: "Fogo", value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)" },
];

const BackgroundSelector = ({ onSelectBackground, selectedBackground }: BackgroundSelectorProps) => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"colors" | "gradients" | "custom">("colors");

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomImage(result);
        onSelectBackground(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const solidColors = PRESET_BACKGROUNDS.filter(bg => bg.type === "solid" || bg.type === "pattern");
  const gradients = PRESET_BACKGROUNDS.filter(bg => bg.type === "gradient");

  const renderBackgroundOption = (bg: typeof PRESET_BACKGROUNDS[0]) => {
    const isSelected = selectedBackground === bg.value;
    const isTransparent = bg.id === "transparent";

    return (
      <button
        key={bg.id}
        onClick={() => onSelectBackground(bg.value)}
        className={cn(
          "relative w-10 h-10 rounded-md border-2 transition-all hover:scale-110",
          isSelected ? "border-primary ring-2 ring-primary/50" : "border-border/50 hover:border-primary/50"
        )}
        title={bg.label}
        style={{
          background: isTransparent
            ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
            : bg.value || undefined,
          backgroundSize: isTransparent ? '10px 10px' : undefined,
          backgroundPosition: isTransparent ? '0 0, 0 5px, 5px -5px, -5px 0px' : undefined,
        }}
      >
        {isSelected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-sm border border-border/50">
      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
        <Palette className="w-4 h-4 text-primary" />
        <span>Adicionar Fundo</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-sm">
        <button
          onClick={() => setActiveTab("colors")}
          className={cn(
            "flex-1 px-2 py-1.5 text-[10px] font-medium rounded-sm transition-colors",
            activeTab === "colors" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Cores
        </button>
        <button
          onClick={() => setActiveTab("gradients")}
          className={cn(
            "flex-1 px-2 py-1.5 text-[10px] font-medium rounded-sm transition-colors",
            activeTab === "gradients" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Gradientes
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={cn(
            "flex-1 px-2 py-1.5 text-[10px] font-medium rounded-sm transition-colors",
            activeTab === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Personalizado
        </button>
      </div>

      {/* Colors Tab */}
      {activeTab === "colors" && (
        <div className="flex flex-wrap gap-2">
          {solidColors.map(renderBackgroundOption)}
        </div>
      )}

      {/* Gradients Tab */}
      {activeTab === "gradients" && (
        <div className="flex flex-wrap gap-2">
          {gradients.map(renderBackgroundOption)}
        </div>
      )}

      {/* Custom Tab */}
      {activeTab === "custom" && (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-border/50 rounded-sm cursor-pointer hover:border-primary/50 transition-colors">
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Carregar imagem de fundo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCustomImageUpload}
            />
          </label>

          {customImage && (
            <div className="flex gap-2">
              <button
                onClick={() => onSelectBackground(customImage)}
                className={cn(
                  "relative w-16 h-16 rounded-md border-2 transition-all overflow-hidden",
                  selectedBackground === customImage ? "border-primary ring-2 ring-primary/50" : "border-border/50 hover:border-primary/50"
                )}
              >
                <img src={customImage} alt="Custom" className="w-full h-full object-cover" />
                {selectedBackground === customImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
