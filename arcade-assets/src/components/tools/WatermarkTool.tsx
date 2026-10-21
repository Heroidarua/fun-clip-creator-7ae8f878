import { useState, useRef } from "react";
import { Upload, Type, Image as ImageIcon, Download, RefreshCw, Loader2, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Position = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface WatermarkToolProps {
  onSuccess?: () => void;
}

const WatermarkTool = ({ onSuccess }: WatermarkToolProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState("@seuusuario");
  const [fontSize, setFontSize] = useState([24]);
  const [opacity, setOpacity] = useState([70]);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text');
  const [logoSize, setLogoSize] = useState([100]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "❌ Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "❌ Arquivo inválido",
          description: "Por favor, selecione uma imagem para o logo.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPositionCoordinates = (
    canvasWidth: number,
    canvasHeight: number,
    elementWidth: number,
    elementHeight: number,
    padding: number = 20
  ) => {
    const positions: Record<Position, { x: number; y: number }> = {
      'top-left': { x: padding, y: padding + elementHeight },
      'top-center': { x: (canvasWidth - elementWidth) / 2, y: padding + elementHeight },
      'top-right': { x: canvasWidth - elementWidth - padding, y: padding + elementHeight },
      'center-left': { x: padding, y: canvasHeight / 2 },
      'center': { x: (canvasWidth - elementWidth) / 2, y: canvasHeight / 2 },
      'center-right': { x: canvasWidth - elementWidth - padding, y: canvasHeight / 2 },
      'bottom-left': { x: padding, y: canvasHeight - padding },
      'bottom-center': { x: (canvasWidth - elementWidth) / 2, y: canvasHeight - padding },
      'bottom-right': { x: canvasWidth - elementWidth - padding, y: canvasHeight - padding },
    };
    return positions[position];
  };

  const applyWatermark = async () => {
    if (!image) {
      toast({
        title: "Imagem obrigatória",
        description: "Por favor, selecione uma imagem primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      toast({
        title: "Texto obrigatório",
        description: "Por favor, digite o texto da marca d'água.",
        variant: "destructive",
      });
      return;
    }

    if (watermarkType === 'logo' && !logo) {
      toast({
        title: "Logo obrigatório",
        description: "Por favor, selecione uma imagem de logo.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas não disponível");

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Contexto não disponível");

      // Load main image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = image;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply watermark
      ctx.globalAlpha = opacity[0] / 100;

      if (watermarkType === 'text') {
        const size = fontSize[0];
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = size;

        const pos = getPositionCoordinates(canvas.width, canvas.height, textWidth, textHeight);
        
        ctx.strokeText(watermarkText, pos.x, pos.y);
        ctx.fillText(watermarkText, pos.x, pos.y);
      } else if (watermarkType === 'logo' && logo) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        
        await new Promise<void>((resolve, reject) => {
          logoImg.onload = () => resolve();
          logoImg.onerror = reject;
          logoImg.src = logo;
        });

        const scale = logoSize[0] / 100;
        const maxLogoWidth = canvas.width * 0.3 * scale;
        const logoRatio = logoImg.width / logoImg.height;
        const drawWidth = Math.min(logoImg.width * scale, maxLogoWidth);
        const drawHeight = drawWidth / logoRatio;

        const pos = getPositionCoordinates(canvas.width, canvas.height, drawWidth, drawHeight);
        
        // Adjust Y for logo (since getPositionCoordinates is designed for text baseline)
        const adjustedY = pos.y - drawHeight;
        
        ctx.drawImage(logoImg, pos.x, adjustedY, drawWidth, drawHeight);
      }

      ctx.globalAlpha = 1;

      const result = canvas.toDataURL('image/png');
      setResultImage(result);
      onSuccess?.();

      toast({
        title: "✅ Marca d'água aplicada!",
        description: "Sua imagem está pronta para download.",
      });
    } catch (error) {
      console.error("Watermark error:", error);
      toast({
        title: "❌ Erro ao aplicar",
        description: "Não foi possível aplicar a marca d'água.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `imagem-com-marca-dagua.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ Download iniciado!",
      description: "Sua imagem está sendo baixada.",
    });
  };

  const handleReset = () => {
    setImage(null);
    setLogo(null);
    setResultImage(null);
    setWatermarkText("@seuusuario");
    setFontSize([24]);
    setOpacity([70]);
    setLogoSize([100]);
    setPosition('bottom-right');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const positions: { value: Position; label: string }[] = [
    { value: 'top-left', label: '↖' },
    { value: 'top-center', label: '↑' },
    { value: 'top-right', label: '↗' },
    { value: 'center-left', label: '←' },
    { value: 'center', label: '●' },
    { value: 'center-right', label: '→' },
    { value: 'bottom-left', label: '↙' },
    { value: 'bottom-center', label: '↓' },
    { value: 'bottom-right', label: '↘' },
  ];

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Image Upload */}
      <div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <Button
          onClick={() => imageInputRef.current?.click()}
          variant="outline"
          className="w-full h-20 border-dashed border-2 flex flex-col gap-1"
        >
          <Upload className="w-5 h-5" />
          <span className="text-xs">
            {image ? "Trocar imagem" : "Selecionar imagem"}
          </span>
        </Button>
      </div>

      {/* Image Preview */}
      {image && (
        <div className="relative aspect-video bg-muted rounded-sm overflow-hidden">
          <img
            src={resultImage || image}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Watermark Type Tabs */}
      <Tabs value={watermarkType} onValueChange={(v) => setWatermarkType(v as 'text' | 'logo')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="text-xs">
            <Type className="w-4 h-4 mr-1" /> Texto
          </TabsTrigger>
          <TabsTrigger value="logo" className="text-xs">
            <ImageIcon className="w-4 h-4 mr-1" /> Logo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-3 mt-3">
          <Input
            placeholder="Digite o texto..."
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
            className="text-sm"
          />
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Tamanho: {fontSize[0]}px
            </label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={12}
              max={72}
              step={1}
            />
          </div>
        </TabsContent>

        <TabsContent value="logo" className="space-y-3 mt-3">
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <Button
            onClick={() => logoInputRef.current?.click()}
            variant="outline"
            className="w-full h-12 border-dashed"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            {logo ? "Trocar logo" : "Selecionar logo"}
          </Button>
          {logo && (
            <div className="w-16 h-16 bg-muted rounded-sm overflow-hidden mx-auto">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Tamanho: {logoSize[0]}%
            </label>
            <Slider
              value={logoSize}
              onValueChange={setLogoSize}
              min={20}
              max={200}
              step={5}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Opacity */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Opacidade: {opacity[0]}%
        </label>
        <Slider
          value={opacity}
          onValueChange={setOpacity}
          min={10}
          max={100}
          step={5}
        />
      </div>

      {/* Position Grid */}
      <div>
        <label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Move className="w-3 h-3" /> Posição
        </label>
        <div className="grid grid-cols-3 gap-1">
          {positions.map((pos) => (
            <button
              key={pos.value}
              onClick={() => setPosition(pos.value)}
              className={`p-2 text-xs rounded-sm border transition-all ${
                position === pos.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 border-border hover:bg-muted'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={applyWatermark}
          disabled={!image || processing}
          className="flex-1 font-pixel text-xs bg-[hsl(320,100%,50%)] hover:bg-[hsl(320,100%,40%)]"
        >
          {processing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "APLICAR"
          )}
        </Button>
        {resultImage && (
          <>
            <Button
              onClick={handleDownload}
              className="font-pixel text-xs bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-pixel text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default WatermarkTool;
