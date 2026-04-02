import { Move, ZoomIn, RotateCw, Maximize2, Sun, Contrast, Droplets, Eye, FlipHorizontal2, FlipVertical2, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface BackgroundAdjustments {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  opacity: number;
  flipH: boolean;
  flipV: boolean;
}

interface BackgroundAdjustmentsProps {
  adjustments: BackgroundAdjustments;
  onAdjustmentsChange: (adjustments: BackgroundAdjustments) => void;
  hasBackground: boolean;
  isImageBackground?: boolean;
}

const DEFAULT_ADJUSTMENTS: BackgroundAdjustments = {
  offsetX: 0,
  offsetY: 0,
  scale: 100,
  rotation: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  opacity: 100,
  flipH: false,
  flipV: false,
};

const BackgroundAdjustmentsPanel = ({ 
  adjustments, 
  onAdjustmentsChange, 
  hasBackground,
  isImageBackground = false
}: BackgroundAdjustmentsProps) => {
  if (!hasBackground) return null;

  const handleReset = () => {
    onAdjustmentsChange(DEFAULT_ADJUSTMENTS);
  };

  const updateAdjustment = (key: keyof BackgroundAdjustments, value: number | boolean) => {
    onAdjustmentsChange({ ...adjustments, [key]: value });
  };

  const SliderControl = ({ 
    icon: Icon, 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1,
    unit = "%"
  }: { 
    icon: any; 
    label: string; 
    value: number; 
    onChange: (v: number) => void; 
    min: number; 
    max: number; 
    step?: number;
    unit?: string;
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </div>
        <span className="font-mono">{value}{unit}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="h-4"
      />
    </div>
  );

  return (
    <div className="space-y-3 p-3 bg-muted/30 rounded-sm border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Maximize2 className="w-4 h-4 text-primary" />
          <span>Ajustar Fundo</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Resetar
        </Button>
      </div>

      <Tabs defaultValue="transform" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-7">
          <TabsTrigger value="transform" className="text-[10px] h-6">Posição</TabsTrigger>
          <TabsTrigger value="filters" className="text-[10px] h-6">Filtros</TabsTrigger>
        </TabsList>

        <TabsContent value="transform" className="space-y-3 mt-3">
          {/* Position controls - only for image backgrounds */}
          {isImageBackground && (
            <>
              <SliderControl
                icon={Move}
                label="Posição X"
                value={adjustments.offsetX}
                onChange={(v) => updateAdjustment("offsetX", v)}
                min={-100}
                max={100}
              />
              <SliderControl
                icon={() => <Move className="w-3 h-3 rotate-90" />}
                label="Posição Y"
                value={adjustments.offsetY}
                onChange={(v) => updateAdjustment("offsetY", v)}
                min={-100}
                max={100}
              />
              <SliderControl
                icon={ZoomIn}
                label="Escala"
                value={adjustments.scale}
                onChange={(v) => updateAdjustment("scale", v)}
                min={50}
                max={300}
                step={5}
              />
              <SliderControl
                icon={RotateCw}
                label="Rotação"
                value={adjustments.rotation}
                onChange={(v) => updateAdjustment("rotation", v)}
                min={0}
                max={360}
                step={5}
                unit="°"
              />

              {/* Flip buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant={adjustments.flipH ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateAdjustment("flipH", !adjustments.flipH)}
                  className={cn(
                    "flex-1 h-7 text-[10px] gap-1",
                    adjustments.flipH && "bg-primary text-primary-foreground"
                  )}
                >
                  <FlipHorizontal2 className="w-3 h-3" />
                  Flip H
                </Button>
                <Button
                  variant={adjustments.flipV ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateAdjustment("flipV", !adjustments.flipV)}
                  className={cn(
                    "flex-1 h-7 text-[10px] gap-1",
                    adjustments.flipV && "bg-primary text-primary-foreground"
                  )}
                >
                  <FlipVertical2 className="w-3 h-3" />
                  Flip V
                </Button>
              </div>
            </>
          )}

          {!isImageBackground && (
            <p className="text-[10px] text-muted-foreground text-center py-2">
              Controles de posição disponíveis apenas para fundos de imagem
            </p>
          )}
        </TabsContent>

        <TabsContent value="filters" className="space-y-3 mt-3">
          <SliderControl
            icon={Eye}
            label="Opacidade"
            value={adjustments.opacity}
            onChange={(v) => updateAdjustment("opacity", v)}
            min={0}
            max={100}
          />
          <SliderControl
            icon={Sun}
            label="Brilho"
            value={adjustments.brightness}
            onChange={(v) => updateAdjustment("brightness", v)}
            min={0}
            max={200}
          />
          <SliderControl
            icon={Contrast}
            label="Contraste"
            value={adjustments.contrast}
            onChange={(v) => updateAdjustment("contrast", v)}
            min={0}
            max={200}
          />
          <SliderControl
            icon={Droplets}
            label="Saturação"
            value={adjustments.saturation}
            onChange={(v) => updateAdjustment("saturation", v)}
            min={0}
            max={200}
          />
          <SliderControl
            icon={() => <div className="w-3 h-3 rounded-full bg-gradient-to-r from-transparent to-muted-foreground" />}
            label="Desfoque"
            value={adjustments.blur}
            onChange={(v) => updateAdjustment("blur", v)}
            min={0}
            max={20}
            step={1}
            unit="px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundAdjustmentsPanel;
export { DEFAULT_ADJUSTMENTS };
