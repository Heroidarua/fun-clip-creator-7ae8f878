import { useState, useRef } from "react";
import { Upload, Download, Loader2, X, CheckCircle, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type ThumbnailSize = {
  name: string;
  width: number;
  height: number;
  platform: string;
};

const THUMBNAIL_SIZES: ThumbnailSize[] = [
  { name: "YouTube", width: 1280, height: 720, platform: "youtube" },
  { name: "Instagram Post", width: 1080, height: 1080, platform: "instagram" },
  { name: "TikTok", width: 1080, height: 1920, platform: "tiktok" },
  { name: "Twitter", width: 1200, height: 675, platform: "twitter" },
];

interface ThumbnailGeneratorProps {
  onSuccess?: () => void;
}

const ThumbnailGenerator = ({ onSuccess }: ThumbnailGeneratorProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ThumbnailSize>(THUMBNAIL_SIZES[0]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [overlayText, setOverlayText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes("image/")) {
      toast({
        title: "❌ Formato inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setThumbnailUrl(null);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleGenerate = async () => {
    if (!file || !preview) return;

    setProcessing(true);
    setProgress(0);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = preview;
      });

      setProgress(30);

      const canvas = canvasRef.current!;
      canvas.width = selectedSize.width;
      canvas.height = selectedSize.height;
      const ctx = canvas.getContext('2d')!;

      // Calculate cover dimensions
      const scale = Math.max(
        selectedSize.width / img.width,
        selectedSize.height / img.height
      );
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (selectedSize.width - scaledWidth) / 2;
      const y = (selectedSize.height - scaledHeight) / 2;

      // Draw image
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      setProgress(60);

      // Add overlay text if provided
      if (overlayText) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, selectedSize.height * 0.7, selectedSize.width, selectedSize.height * 0.3);

        // Text
        const fontSize = Math.min(selectedSize.width / 12, 80);
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(overlayText, selectedSize.width / 2, selectedSize.height * 0.85, selectedSize.width * 0.9);
      }

      setProgress(90);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);
      setProgress(100);
      onSuccess?.();

      toast({
        title: "✅ Thumbnail gerada!",
        description: `Tamanho: ${selectedSize.width}x${selectedSize.height}px`,
      });
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      toast({
        title: "❌ Erro ao gerar",
        description: "Não foi possível gerar a thumbnail.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!thumbnailUrl) return;
    
    const link = document.createElement('a');
    link.href = thumbnailUrl;
    link.download = `thumbnail_${selectedSize.platform}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    setFile(null);
    setPreview(null);
    setThumbnailUrl(null);
    setProgress(0);
    setOverlayText("");
  };

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-[hsl(45,100%,50%)] bg-[hsl(45,100%,50%)]/10' 
              : 'border-muted-foreground/30 hover:border-[hsl(45,100%,50%)]/50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste uma imagem aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground/70">
            Formatos: JPG, PNG, WebP
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-sm overflow-hidden bg-muted/30 aspect-video">
            <img
              src={thumbnailUrl || preview!}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!processing && !thumbnailUrl && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Size selector */}
          <div className="grid grid-cols-2 gap-2">
            {THUMBNAIL_SIZES.map((size) => (
              <button
                key={size.platform}
                onClick={() => setSelectedSize(size)}
                disabled={processing}
                className={`p-2 rounded-sm border-2 text-xs transition-colors ${
                  selectedSize.platform === size.platform
                    ? 'border-[hsl(45,100%,50%)] bg-[hsl(45,100%,50%)]/10 text-[hsl(45,100%,50%)]'
                    : 'border-muted-foreground/30 hover:border-[hsl(45,100%,50%)]/50'
                }`}
              >
                <div className="font-medium">{size.name}</div>
                <div className="text-muted-foreground text-[10px]">{size.width}x{size.height}</div>
              </button>
            ))}
          </div>

          {/* Overlay text input */}
          <Input
            type="text"
            placeholder="Texto para overlay (opcional)"
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            disabled={processing}
            className="bg-background/50 border-[hsl(45,100%,50%)]/30 focus:border-[hsl(45,100%,50%)]"
          />

          {/* Progress bar */}
          {processing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Gerando thumbnail... {progress}%
              </p>
            </div>
          )}

          {/* Success state */}
          {thumbnailUrl && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-500">Thumbnail gerada com sucesso!</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!thumbnailUrl ? (
              <Button
                onClick={handleGenerate}
                disabled={processing}
                className="flex-1 font-pixel text-xs bg-[hsl(45,100%,50%)] hover:bg-[hsl(45,100%,45%)] text-black"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    GERANDO...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    GERAR THUMBNAIL
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
                  BAIXAR
                </Button>
                <Button
                  onClick={() => { setThumbnailUrl(null); }}
                  variant="outline"
                  className="font-pixel text-xs"
                >
                  EDITAR
                </Button>
              </>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-pixel text-xs"
              disabled={processing}
            >
              NOVA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailGenerator;
