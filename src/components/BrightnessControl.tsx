import { Sun, SunDim, Contrast, Droplets, Eye, RotateCcw, Settings2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface ScreenSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
}

const DEFAULT_SETTINGS: ScreenSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
};

const BrightnessControl = () => {
  const [settings, setSettings] = useState<ScreenSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    const stored = localStorage.getItem("sos01-screen-settings");
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("sos01-screen-settings", JSON.stringify(settings));
    const { brightness, contrast, saturation, sepia, grayscale } = settings;
    document.documentElement.style.filter = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100}) sepia(${sepia / 100}) grayscale(${grayscale / 100})`;
  }, [settings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateSetting = (key: keyof ScreenSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const isModified = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);

  const SliderControl = ({ 
    icon: Icon, 
    label, 
    value, 
    onChange, 
    min, 
    max 
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    min: number; 
    max: number;
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <span className="font-mono">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={5}
        className="h-4"
      />
    </div>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 bg-primary/20 hover:bg-primary/40 rounded-sm transition-all duration-200 border-2 border-primary/50 hover:border-primary shadow-[3px_3px_0_hsl(var(--primary)/0.3)] hover:shadow-[1px_1px_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px]"
        aria-label="Configurações de tela"
        title="Configurações de tela"
      >
        {isModified ? (
          <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        ) : settings.brightness >= 100 ? (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        ) : (
          <SunDim className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-card border-2 border-primary/50 rounded-sm shadow-[4px_4px_0_hsl(var(--primary)/0.3)] z-[100] p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-orbitron text-foreground flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-primary" />
              Tela
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!isModified}
              className="h-5 px-1.5 text-[9px] text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset
            </Button>
          </div>

          <Tabs defaultValue="light" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-6 mb-3">
              <TabsTrigger value="light" className="text-[9px] h-5">Luz</TabsTrigger>
              <TabsTrigger value="color" className="text-[9px] h-5">Cor</TabsTrigger>
            </TabsList>

            <TabsContent value="light" className="space-y-3 mt-0">
              <SliderControl
                icon={Sun}
                label="Brilho"
                value={settings.brightness}
                onChange={(v) => updateSetting("brightness", v)}
                min={50}
                max={150}
              />
              <SliderControl
                icon={Contrast}
                label="Contraste"
                value={settings.contrast}
                onChange={(v) => updateSetting("contrast", v)}
                min={50}
                max={150}
              />
            </TabsContent>

            <TabsContent value="color" className="space-y-3 mt-0">
              <SliderControl
                icon={Droplets}
                label="Saturação"
                value={settings.saturation}
                onChange={(v) => updateSetting("saturation", v)}
                min={0}
                max={200}
              />
              <SliderControl
                icon={() => <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-200 to-amber-600" />}
                label="Sépia"
                value={settings.sepia}
                onChange={(v) => updateSetting("sepia", v)}
                min={0}
                max={100}
              />
              <SliderControl
                icon={Eye}
                label="Escala de cinza"
                value={settings.grayscale}
                onChange={(v) => updateSetting("grayscale", v)}
                min={0}
                max={100}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-3 pt-2 border-t border-border/50 flex justify-between text-[8px] text-muted-foreground font-pixel">
            <span>Personalizar visualização</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrightnessControl;
