import { useState, useRef, useEffect } from "react";
import { Download, Loader2, QrCode, Upload, X, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

const COLOR_PRESETS = [
  { name: "Preto", fg: "#000000", bg: "#FFFFFF" },
  { name: "Azul", fg: "#1E40AF", bg: "#DBEAFE" },
  { name: "Verde", fg: "#166534", bg: "#DCFCE7" },
  { name: "Roxo", fg: "#7C3AED", bg: "#EDE9FE" },
  { name: "Vermelho", fg: "#DC2626", bg: "#FEE2E2" },
  { name: "Laranja", fg: "#EA580C", bg: "#FFEDD5" },
];

interface QRCodeGeneratorProps {
  onSuccess?: () => void;
}

const QRCodeGenerator = ({ onSuccess }: QRCodeGeneratorProps) => {
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [logo, setLogo] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogoSelect = (file: File) => {
    if (!file.type.includes("image/")) {
      toast({
        title: "❌ Formato inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "❌ Arquivo muito grande",
        description: "A logo deve ter no máximo 2MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setLogo(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const generateQRCode = async () => {
    if (!text.trim()) {
      toast({
        title: "Texto obrigatório",
        description: "Digite um texto ou URL para gerar o QR Code",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      // Generate QR code as data URL
      const qrOptions = {
        width: 400,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logo ? 'H' : 'M' as const,
      };

      const dataUrl = await QRCode.toDataURL(text, qrOptions);

      if (logo) {
        // If logo is provided, draw it in the center
        const canvas = canvasRef.current!;
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d')!;

        // Draw QR code
        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = dataUrl;
        });
        ctx.drawImage(qrImg, 0, 0, 400, 400);

        // Draw logo in center
        const logoImg = new Image();
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
          logoImg.src = logo;
        });

        const logoSize = 80;
        const logoX = (400 - logoSize) / 2;
        const logoY = (400 - logoSize) / 2;

        // White background for logo
        ctx.fillStyle = bgColor;
        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        setQrDataUrl(canvas.toDataURL('image/png'));
      } else {
        setQrDataUrl(dataUrl);
      }

      onSuccess?.();
      toast({
        title: "✅ QR Code gerado!",
        description: "Clique em Baixar para salvar",
      });
    } catch (error) {
      console.error("QR generation error:", error);
      toast({
        title: "❌ Erro ao gerar",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setText("");
    setQrDataUrl(null);
    setLogo(null);
    setFgColor("#000000");
    setBgColor("#FFFFFF");
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setFgColor(preset.fg);
    setBgColor(preset.bg);
    setShowColorPicker(false);
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {/* Text/URL Input */}
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Digite texto ou URL..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-background/50 border-[hsl(160,100%,40%)]/30 focus:border-[hsl(160,100%,40%)]"
        />
      </div>

      {/* Color & Logo Options */}
      <div className="flex flex-wrap gap-2">
        {/* Color Picker Toggle */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="font-pixel text-[10px] gap-2"
          >
            <div 
              className="w-4 h-4 rounded-sm border border-foreground/30" 
              style={{ background: `linear-gradient(135deg, ${fgColor} 50%, ${bgColor} 50%)` }}
            />
            CORES
          </Button>

          {/* Color Picker Dropdown */}
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-sm shadow-lg z-50 min-w-[200px]">
              <p className="text-xs text-muted-foreground mb-2">Presets:</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="p-2 rounded-sm border border-border hover:border-primary transition-colors"
                    title={preset.name}
                  >
                    <div 
                      className="w-full h-6 rounded-sm" 
                      style={{ background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)` }}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">QR Code:</label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{fgColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground w-16">Fundo:</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{bgColor}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo Upload */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => logoInputRef.current?.click()}
          className="font-pixel text-[10px] gap-2"
        >
          {logo ? (
            <>
              <img src={logo} alt="Logo" className="w-4 h-4 rounded-sm object-cover" />
              LOGO ✓
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" />
              ADD LOGO
            </>
          )}
        </Button>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleLogoSelect(e.target.files[0])}
        />

        {logo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogo(null)}
            className="text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* QR Code Preview */}
      {qrDataUrl && (
        <div className="flex justify-center p-4 bg-white rounded-sm">
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="w-48 h-48 object-contain"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!qrDataUrl ? (
          <Button
            onClick={generateQRCode}
            disabled={generating || !text.trim()}
            className="flex-1 font-pixel text-xs bg-[hsl(160,100%,40%)] hover:bg-[hsl(160,100%,35%)]"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                GERANDO...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                GERAR QR CODE
              </>
            )}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDownload}
              className="flex-1 font-pixel text-xs bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              BAIXAR PNG
            </Button>
            <Button
              onClick={() => setQrDataUrl(null)}
              variant="outline"
              className="font-pixel text-xs"
            >
              EDITAR
            </Button>
          </>
        )}
        {(qrDataUrl || logo || text) && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="font-pixel text-xs"
          >
            NOVO
          </Button>
        )}
      </div>

      {/* Helper text */}
      {!qrDataUrl && (
        <p className="text-xs text-muted-foreground text-center">
          Gere QR Codes para URLs, textos, WhatsApp e muito mais!
        </p>
      )}
    </div>
  );
};

export default QRCodeGenerator;
