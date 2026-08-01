import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, Loader2, X, CheckCircle, Image as ImageIcon, Eraser, Sparkles, SlidersHorizontal, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import ImageCompareSlider from "./ImageCompareSlider";
import BackgroundSelector from "./BackgroundSelector";
import BackgroundAdjustmentsPanel, { BackgroundAdjustments, DEFAULT_ADJUSTMENTS } from "./BackgroundAdjustments";
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

interface BackgroundRemoverProps {
  onSuccess?: () => void;
}

const BackgroundRemover = ({ onSuccess }: BackgroundRemoverProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [bgAdjustments, setBgAdjustments] = useState<BackgroundAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeProvider, setActiveProvider] = useState<"local" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Create composite image when background, result, or adjustments change
  useEffect(() => {
    if (resultUrl && selectedBackground) {
      createCompositeImage();
    } else {
      setCompositeImage(null);
    }
  }, [resultUrl, selectedBackground, bgAdjustments]);

  const createCompositeImage = useCallback(async () => {
    if (!resultUrl || !selectedBackground) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const foregroundImg = new Image();
    foregroundImg.crossOrigin = "anonymous";

    foregroundImg.onload = () => {
      canvas.width = foregroundImg.width;
      canvas.height = foregroundImg.height;

      const applyFilters = () => {
        const { blur, brightness, contrast, saturation, opacity } = bgAdjustments;
        ctx.filter = `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.globalAlpha = opacity / 100;
      };

      const resetFilters = () => {
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      };

      const drawBackground = (bgImg?: HTMLImageElement) => {
        ctx.save();
        applyFilters();
        
        if (bgImg) {
          // Apply transformations for custom image backgrounds
          const { offsetX, offsetY, scale, rotation, flipH, flipV } = bgAdjustments;
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          ctx.translate(centerX, centerY);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale((flipH ? -1 : 1) * scale / 100, (flipV ? -1 : 1) * scale / 100);
          
          const bgWidth = canvas.width;
          const bgHeight = canvas.height;
          const offsetPxX = (offsetX / 100) * canvas.width;
          const offsetPxY = (offsetY / 100) * canvas.height;
          
          ctx.drawImage(
            bgImg,
            -bgWidth / 2 + offsetPxX,
            -bgHeight / 2 + offsetPxY,
            bgWidth,
            bgHeight
          );
        }
        
        ctx.restore();
        resetFilters();
        ctx.drawImage(foregroundImg, 0, 0);
        setCompositeImage(canvas.toDataURL("image/png"));
      };

      // Check if background is a data URL (custom image) or CSS value
      if (selectedBackground.startsWith("data:") || selectedBackground.startsWith("http")) {
        // Custom image background
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => drawBackground(bgImg);
        bgImg.src = selectedBackground;
      } else if (selectedBackground.startsWith("linear-gradient")) {
        // Gradient background
        const gradientMatch = selectedBackground.match(/linear-gradient\((\d+)deg,\s*([^,]+)\s+\d+%,\s*([^)]+)\s+\d+%\)/);
        if (gradientMatch) {
          const angle = parseInt(gradientMatch[1]) * (Math.PI / 180);
          const color1 = gradientMatch[2].trim();
          const color2 = gradientMatch[3].trim();

          const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
          const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
          const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width;
          const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);

          ctx.save();
          applyFilters();
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
          resetFilters();
        }
        ctx.drawImage(foregroundImg, 0, 0);
        setCompositeImage(canvas.toDataURL("image/png"));
      } else {
        // Solid color background
        ctx.save();
        applyFilters();
        ctx.fillStyle = selectedBackground;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        resetFilters();
        ctx.drawImage(foregroundImg, 0, 0);
        setCompositeImage(canvas.toDataURL("image/png"));
      }
    };

    foregroundImg.src = resultUrl;
  }, [resultUrl, selectedBackground, bgAdjustments]);

  // Reduz a imagem antes do processamento para acelerar bastante a remoção
  const downscaleImage = (source: File, maxSize = 1024): Promise<Blob> =>
    new Promise((resolve) => {
      const img = new Image();
      const sourceUrl = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(sourceUrl);
        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
        if (ratio === 1) {
          resolve(source);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(source);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob ?? source), "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(sourceUrl);
        resolve(source);
      };
      img.src = sourceUrl;
    });

  const removeBackgroundLocally = async (input: Blob): Promise<Blob> => {
    const runModel = (model: "isnet_quint8" | "isnet_fp16") =>
      imglyRemoveBackground(input, {
        model,
        device: "cpu",
        output: { format: "image/png", quality: 0.9 },
        progress: (_key, current, total) => {
          if (total <= 0) return;
          const pct = Math.min(95, Math.round((current / total) * 90));
          setProgress(pct);
        },
      });

    try {
      return await runModel("isnet_quint8");
    } catch (error) {
      console.warn("Modelo leve indisponível; tentando modelo compatível.", error);
      setProgress(5);
      return runModel("isnet_fp16");
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes("image/")) {
      toast({
        title: "❌ Formato inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    setResultUrl(null);
    setShowCompare(false);
    setSelectedBackground(null);
    setCompositeImage(null);
    setShowBackgroundSelector(false);
    setBgAdjustments(DEFAULT_ADJUSTMENTS);
    
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

  const handleRemoveBackground = async () => {
    if (!file || !preview) return;

    setProcessing(true);
    setProgress(0);
    setActiveProvider("local");

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 85));
    }, 500);

    try {
      // 100% gratuito: processamento local no navegador (sem API paga, sem créditos).
      setProgress(5);
      const input = await downscaleImage(file, 1024);
      const blob = await removeBackgroundLocally(input);
      clearInterval(progressInterval);

      const outputUrl = URL.createObjectURL(blob);
      setResultUrl((previousUrl) => {
        if (previousUrl?.startsWith("blob:")) URL.revokeObjectURL(previousUrl);
        return outputUrl;
      });
      setProgress(100);
      setShowCompare(true);
      setShowBackgroundSelector(true);
      onSuccess?.();
      toast({
        title: "✅ Fundo removido!",
        description: "Processado gratuitamente no seu navegador",
      });
    } catch (error: unknown) {
      console.error("Background removal error:", error);
      setActiveProvider(null);
      const message = error instanceof Error ? error.message : "";
      toast({
        title: "❌ Erro no processamento",
        description: message.includes("memory")
          ? "Seu dispositivo ficou sem memória. Tente uma foto menor."
          : "Não foi possível carregar o modelo. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    const imageToDownload = compositeImage || resultUrl;
    if (!imageToDownload || !file) return;
    
    const link = document.createElement('a');
    link.href = imageToDownload;
    const suffix = compositeImage ? '_novo_fundo' : '_sem_fundo';
    link.download = file.name.replace(/\.[^/.]+$/, '') + suffix + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (resultUrl?.startsWith("blob:")) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setProgress(0);
    setActiveProvider(null);
    setShowCompare(false);
    setSelectedBackground(null);
    setCompositeImage(null);
    setShowBackgroundSelector(false);
    setBgAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const handleBackgroundChange = (bg: string | null) => {
    setSelectedBackground(bg);
    setBgAdjustments(DEFAULT_ADJUSTMENTS);
  };

  const isCustomImageBackground = selectedBackground?.startsWith("data:") || selectedBackground?.startsWith("http");

  const displayImage = compositeImage || resultUrl;

  return (
    <div className="space-y-4">
      {/* Hidden canvas for compositing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Info indicator */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-sm border border-border/50">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#FFD93D]" />
          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground">100% gratuito</strong> · processado no seu navegador, sem limites
          </span>
        </div>
      </div>

      {!file ? (
        <div
          className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors cursor-pointer ${
            dragOver 
              ? 'border-[hsl(280,100%,60%)] bg-[hsl(280,100%,60%)]/10' 
              : 'border-muted-foreground/30 hover:border-[hsl(280,100%,60%)]/50'
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
            Formatos: JPG, PNG, WebP (máx. 5MB)
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[hsl(280,100%,60%)]">
            <Sparkles className="w-3 h-3" />
            <span>Grátis · roda no seu navegador</span>
          </div>
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
          {/* Image comparison */}
          {displayImage && showCompare && preview ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Arraste para comparar</span>
              </div>
              <ImageCompareSlider
                beforeImage={preview}
                afterImage={displayImage}
                beforeLabel="Original"
                afterLabel={compositeImage ? "Com Fundo" : "Sem Fundo"}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Original */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Original</p>
                <div className="relative rounded-sm overflow-hidden bg-muted/30 aspect-square">
                  <img
                    src={preview!}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  {compositeImage ? "Com Fundo" : "Sem Fundo"}
                </p>
                <div 
                  className="relative rounded-sm overflow-hidden aspect-square" 
                  style={!compositeImage ? {
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  } : undefined}
                >
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Resultado"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Background Selector */}
          {showBackgroundSelector && resultUrl && (
            <>
              <BackgroundSelector
                selectedBackground={selectedBackground}
                onSelectBackground={handleBackgroundChange}
              />
              <BackgroundAdjustmentsPanel
                adjustments={bgAdjustments}
                onAdjustmentsChange={setBgAdjustments}
                hasBackground={!!selectedBackground}
                isImageBackground={!!isCustomImageBackground}
              />
            </>
          )}

          {/* Progress bar */}
          {processing && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                {activeProvider === "local" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#FFD93D]/10 text-[#FFD93D] text-xs font-pixel">
                    <Cpu className="w-3 h-3" />
                    gratuito · local
                  </span>
                ) : null}
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {`Removendo fundo no seu navegador... ${progress}%`}
              </p>
            </div>
          )}

          {/* Success state */}
          {resultUrl && (
            <div className="flex items-center justify-between gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-500">
                  {compositeImage ? "Novo fundo aplicado!" : "Fundo removido com sucesso!"}
                </span>
              </div>
              {activeProvider === "local" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#FFD93D]/10 text-[#FFD93D] text-xs font-pixel">
                  <Cpu className="w-3 h-3" />
                  gratuito · local
                </span>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {!resultUrl ? (
              <Button
                onClick={handleRemoveBackground}
                disabled={processing}
                className="flex-1 font-pixel text-xs bg-[hsl(280,100%,60%)] hover:bg-[hsl(280,100%,50%)]"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    PROCESSANDO...
                  </>
                ) : (
                  <>
                    <Eraser className="w-4 h-4 mr-2" />
                    REMOVER FUNDO
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
                  onClick={() => setShowCompare(!showCompare)}
                  variant="outline"
                  className="font-pixel text-xs"
                  title={showCompare ? "Ver lado a lado" : "Comparar com slider"}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-pixel text-xs"
              disabled={processing}
            >
              {resultUrl ? "NOVA" : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;
