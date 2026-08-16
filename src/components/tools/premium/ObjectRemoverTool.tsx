import { useState, useRef, useEffect } from "react";
import { Eraser, Upload, Loader2, Download, Undo, RefreshCw, Brush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as fabric from "fabric";
import { removeObject } from "@/lib/tools/object-remover.functions";

export default function ObjectRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
    }
  };

  useEffect(() => {
    if (!preview || !canvasRef.current || !containerRef.current || result) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = (width * 9) / 16; // Mantém aspect ratio 16:9

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      isDrawingMode: true,
      backgroundColor: "transparent",
      enableRetinaScaling: false
    });

    const brush = new fabric.PencilBrush(canvas);
    brush.width = brushSize;
    brush.color = "rgba(255, 0, 0, 0.5)"; // Vermelho semi-transparente para a máscara
    canvas.freeDrawingBrush = brush;

    fabric.FabricImage.fromURL(preview).then((img) => {
      // Redimensiona imagem para caber no canvas
      const scaleX = width / img.width!;
      const scaleY = height / img.height!;
      const scale = Math.min(scaleX, scaleY);
      
      img.set({
        scaleX: scale,
        scaleY: scale,
        left: width / 2,
        top: height / 2,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false
      });
      
      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    fabricCanvas.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, [preview, result, brushSize]);

  const undo = () => {
    if (!fabricCanvas.current) return;
    const objects = fabricCanvas.current.getObjects();
    if (objects.length > 0) {
      fabricCanvas.current.remove(objects[objects.length - 1]);
      fabricCanvas.current.renderAll();
    }
  };

  const process = async () => {
    if (!fabricCanvas.current || !file) return;
    
    setProcessing(true);
    try {
      // 1. Gerar a máscara (canvas sem a imagem de fundo)
      const canvas = fabricCanvas.current;
      const originalBG = canvas.backgroundImage;
      canvas.backgroundImage = undefined;
      const maskBase64 = canvas.toDataURL({ format: "png", multiplier: 1 });
      canvas.backgroundImage = originalBG;
      canvas.renderAll();

      // 2. Converter imagem original para base64
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      toast.info("A IA está removendo o objeto selecionado...");
      
      const processedImage = await removeObject({
        data: {
          image: imageBase64,
          mask: maskBase64
        }
      });

      setResult(processedImage as string);
      toast.success("Objeto removido com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar imagem.");
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `sos01-removedor-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-sm p-4 text-center">
        <Eraser className="w-10 h-10 mx-auto text-purple-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground uppercase">Removedor de Objetos IA</h3>
        <p className="text-xs text-muted-foreground mt-1 text-balance">
          Pinte sobre o objeto que deseja remover e a IA fará o resto.
        </p>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-sm bg-muted/50 cursor-pointer hover:bg-muted transition-all hover:border-primary/50 shadow-inner group">
          <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-pixel text-muted-foreground uppercase">Enviar Imagem</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      ) : (
        <div className="space-y-4">
          {!result ? (
            <>
              <div 
                ref={containerRef}
                className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-slate-950 shadow-cartridge"
              >
                <canvas ref={canvasRef} />
                {processing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                    <span className="text-[10px] font-pixel text-white uppercase tracking-widest animate-pulse">
                      IA Processando...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-between bg-muted/30 p-2 rounded-sm border border-border">
                <div className="flex gap-2 items-center">
                  <span className="text-[9px] font-pixel text-muted-foreground uppercase mr-2 flex items-center">
                    <Brush className="w-3 h-3 mr-1" /> Tamanho:
                  </span>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 h-1 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[9px] font-mono text-primary">{brushSize}px</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[9px] font-pixel" onClick={undo} disabled={processing}>
                    <Undo className="w-3 h-3 mr-1" /> DESFAZER
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2 text-[9px] font-pixel text-destructive hover:text-destructive" onClick={() => { setFile(null); setPreview(null); }} disabled={processing}>
                    <RefreshCw className="w-3 h-3 mr-1" /> RESET
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full font-pixel text-[11px] shadow-cartridge py-6 btn-3d" 
                onClick={process} 
                disabled={processing}
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Eraser className="w-5 h-5 mr-2" />}
                REMOVER OBJETO COM IA
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video w-full border-2 border-green-500/50 overflow-hidden rounded-sm bg-slate-950 shadow-cartridge">
                <img src={result} alt="Resultado" className="w-full h-full object-contain" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-[8px] font-pixel uppercase rounded-sm animate-bounce shadow-lg">
                  Pronto!
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 font-pixel text-[10px]" onClick={() => setResult(null)}>
                  VOLTAR E EDITAR
                </Button>
                <Button className="flex-1 font-pixel text-[10px] shadow-cartridge bg-green-600 hover:bg-green-700" onClick={download}>
                  <Download className="w-4 h-4 mr-1" /> BAIXAR IMAGEM
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-sm">
        <p className="text-[9px] text-amber-500 uppercase font-pixel leading-tight">
          Dica: Pinte cuidadosamente a área do objeto. Quanto mais precisa for a seleção, melhor será o preenchimento automático da IA.
        </p>
      </div>
    </div>
  );
}
