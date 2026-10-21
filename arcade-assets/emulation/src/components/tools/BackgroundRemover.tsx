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

  const MODEL_INPUT_SIZE = 1024;
  const MAX_OUTPUT_SIZE = 2048;

  const loadImage = (source: Blob | string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = typeof source === "string" ? source : URL.createObjectURL(source);
      img.onload = () => {
        if (typeof source !== "string") URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        if (typeof source !== "string") URL.revokeObjectURL(url);
        reject(new Error("Falha ao carregar imagem"));
      };
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  // Redimensiona em etapas (halving) para preservar nitidez e evitar serrilhado
  const resizeToCanvas = (img: CanvasImageSource, width: number, height: number) => {
    let sourceCanvas: CanvasImageSource = img;
    let currentW = width;
    let currentH = height;
    const startW = (img as HTMLImageElement).naturalWidth ?? width;
    const startH = (img as HTMLImageElement).naturalHeight ?? height;

    let w = startW;
    let h = startH;
    while (w / 2 > width && h / 2 > height) {
      w = Math.round(w / 2);
      h = Math.round(h / 2);
      const step = document.createElement("canvas");
      step.width = w;
      step.height = h;
      const stepCtx = step.getContext("2d");
      if (!stepCtx) break;
      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = "high";
      stepCtx.drawImage(sourceCanvas, 0, 0, w, h);
      sourceCanvas = step;
    }

    const canvas = document.createElement("canvas");
    canvas.width = currentW;
    canvas.height = currentH;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceCanvas, 0, 0, currentW, currentH);
    }
    return canvas;
  };

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob falhou"))), "image/png");
    });

  // Prepara a entrada do modelo: recorta bordas vazias e normaliza o tamanho
  const prepareModelInput = async (source: File): Promise<Blob> => {
    const img = await loadImage(source);
    const ratio = Math.min(1, MODEL_INPUT_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
    if (ratio === 1) return source;
    const canvas = resizeToCanvas(
      img,
      Math.round(img.naturalWidth * ratio),
      Math.round(img.naturalHeight * ratio),
    );
    return canvasToBlob(canvas);
  };

  // Aplica o alfa do recorte (baixa resolução) sobre a imagem original em alta,
  // com leve realce de contraste no canal alfa para manter bordas nítidas.
  const refineCutout = async (source: File, cutout: Blob): Promise<Blob> => {
    const [original, mask] = await Promise.all([loadImage(source), loadImage(cutout)]);

    const scale = Math.min(1, MAX_OUTPUT_SIZE / Math.max(original.naturalWidth, original.naturalHeight));
    const width = Math.round(original.naturalWidth * scale);
    const height = Math.round(original.naturalHeight * scale);

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!maskCtx) return cutout;
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = "high";
    maskCtx.drawImage(mask, 0, 0, width, height);

    // Realce das bordas: limpa resíduos de fundo (alfa baixo) e solidifica o objeto,
    // mantendo transição suave apenas na faixa intermediária.
    try {
      const imageData = maskCtx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const LOW = 0.32;   // abaixo disso é fundo residual -> transparente
      const HIGH = 0.68;  // acima disso é objeto -> totalmente opaco
      const lut = new Uint8ClampedArray(256);
      for (let i = 0; i < 256; i++) {
        const a = i / 255;
        let v: number;
        if (a <= LOW) v = 0;
        else if (a >= HIGH) v = 1;
        else {
          const t = (a - LOW) / (HIGH - LOW);
          v = t * t * (3 - 2 * t); // smoothstep: borda suave sem halo
        }
        lut[i] = Math.round(v * 255);
      }
      for (let i = 3; i < data.length; i += 4) {
        data[i] = lut[data[i]];
      }
      maskCtx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.warn("Não foi possível refinar as bordas do recorte.", error);
    }

    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;
    const ctx = output.getContext("2d");
    if (!ctx) return cutout;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const highRes = resizeToCanvas(original, width, height);
    ctx.drawImage(highRes, 0, 0);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    return canvasToBlob(output);
  };

  const hasWebGPU = () =>
    typeof navigator !== "undefined" && "gpu" in navigator;

  const removeBackgroundLocally = async (input: Blob): Promise<Blob> => {
    const runModel = (model: "isnet_quint8" | "isnet_fp16", device: "gpu" | "cpu") =>
      imglyRemoveBackground(input, {
        model,
        device,
        output: { format: "image/png", quality: 1 },
        progress: (_key, current, total) => {
          if (total <= 0) return;
          const pct = Math.min(95, Math.round((current / total) * 90));
          setProgress(pct);
        },
      });

    // GPU (WebGPU) com modelo de maior qualidade quando disponível: mais rápido e
    // com menos falhas no recorte. Cai para CPU/modelo leve em dispositivos antigos.
    const attempts: Array<[("isnet_quint8" | "isnet_fp16"), ("gpu" | "cpu")]> = hasWebGPU()
      ? [["isnet_fp16", "gpu"], ["isnet_quint8", "gpu"], ["isnet_quint8", "cpu"]]
      : [["isnet_quint8", "cpu"], ["isnet_fp16", "cpu"]];

    let lastError: unknown;
    for (const [model, device] of attempts) {
      try {
        return await runModel(model, device);
      } catch (error) {
        lastError = error;
        console.warn(`Falha no recorte (${model}/${device}); tentando alternativa.`, error);
        setProgress(5);
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Falha ao remover o fundo");
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
      const input = await prepareModelInput(file);
      const cutout = await removeBackgroundLocally(input);
      setProgress(96);
      let blob = cutout;
      try {
        blob = await refineCutout(file, cutout);
      } catch (error) {
        console.warn("Refino de bordas indisponível; usando recorte padrão.", error);
      }
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
