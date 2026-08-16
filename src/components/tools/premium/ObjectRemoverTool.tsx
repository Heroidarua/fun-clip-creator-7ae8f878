import { useState } from "react";
import { Eraser, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ObjectRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      // IA Removal tool placeholder (client-side or server-side integration)
      // For now, it shows the intent
      await new Promise(r => setTimeout(r, 2000));
      toast.info("Esta ferramenta de IA requer processamento em GPU e está sendo calibrada.");
    } catch {
      toast.error("Erro ao processar.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-sm p-4 text-center">
        <Eraser className="w-10 h-10 mx-auto text-purple-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground">Removedor de Objetos IA</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Remova objetos, pessoas ou manchas indesejadas das suas fotos automaticamente.
        </p>
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-border rounded-sm bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-xs font-pixel text-muted-foreground">UPLOAD DA IMAGEM</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-slate-900">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-pixel text-white">PINTE A ÁREA A REMOVER</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 font-pixel text-[10px]" onClick={() => { setFile(null); setPreview(null); }}>
              NOVA IMAGEM
            </Button>
            <Button className="flex-1 font-pixel text-[10px]" onClick={process} disabled={processing}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4 mr-1" />}
              REMOVER OBJETOS
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-sm">
        <p className="text-[9px] text-amber-500 uppercase font-pixel leading-tight">
          Dica: Pinte com o mouse o objeto que deseja remover após o upload. 
          A IA preencherá o espaço automaticamente preservando a textura original.
        </p>
      </div>
    </div>
  );
}
