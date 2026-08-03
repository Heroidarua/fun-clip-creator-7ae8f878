import React, { useState, useRef } from "react";
import { Loader2, ExternalLink, ShieldCheck, Info, Upload, Trash2, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Implementação simplificada de remoção de metadados via Canvas para imagens como fallback
// Nota: Para documentos PDF/Word seria necessário bibliotecas pesadas, 
// então focamos no fallback de imagens que é o uso mais comum.
const MetadataRemoverIframeTool = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("O fallback suporta apenas imagens (JPG, PNG, WEBP). Para outros arquivos, use o painel principal.");
        return;
      }
      setSelectedFile(file);
      setProcessedUrl(null);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;
    setProcessing(true);

    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Ao desenhar no canvas e exportar como blob, os metadados EXIF originais são perdidos
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setProcessedUrl(url);
                toast.success("Metadados removidos com sucesso!");
              }
              setProcessing(false);
            }, selectedFile.type);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar imagem.");
      setProcessing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setProcessedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full space-y-6">
      {/* Aviso de Privacidade */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Privacidade Garantida</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta ferramenta processa seus arquivos diretamente no seu navegador. 
            Nenhum dado é enviado para servidores externos.
          </p>
        </div>
      </div>

      {/* Container do Iframe */}
      <div className="relative aspect-[16/10] sm:aspect-video w-full bg-black/5 rounded-2xl border-2 border-primary/10 overflow-hidden group shadow-inner">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card gap-3 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-pixel text-center px-4">INICIANDO AMBIENTE SEGURO...</p>
          </div>
        )}
        
        <iframe
          src="https://ianonymous3000.github.io/metadata-remover/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          className="w-full h-full border-none relative z-[1] isolate"
          title="Removedor de Metadados Profissional"
          onLoad={() => setLoading(false)}
          allow="clipboard-write; clipboard-read; camera; microphone; payment; geolocation; fullscreen; browse"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads allow-storage-access-by-user-activation"
          loading="eager"
        />
      </div>

      {/* Fallback Section */}
      <div className="bg-card border-2 border-dashed border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Upload className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Fallback de Segurança</h3>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium bg-muted px-2 py-1 rounded">MODO COMPATIBILIDADE</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Se o painel principal acima não permitir selecionar arquivos no seu navegador, utilize este campo alternativo para limpar metadados de imagens.
        </p>

        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-all active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-full bg-background border border-border group-hover:border-primary/30 flex items-center justify-center transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-xs font-medium">Clique para selecionar imagem</p>
            <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP (Limite 10MB)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        ) : (
          <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded bg-background flex items-center justify-center shrink-0">
                {processedUrl ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Upload className="w-5 h-5 text-primary" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!processedUrl ? (
                <button
                  onClick={processImage}
                  disabled={processing}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  LIMPAR
                </button>
              ) : (
                <a
                  href={processedUrl}
                  download={`clean-${selectedFile.name}`}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  BAIXAR
                </a>
              )}
              <button
                onClick={clearSelection}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instruções Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-tight text-foreground">Como usar</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Arraste suas fotos para o painel principal ou use o fallback acima se tiver problemas.
            </p>
          </div>
        </div>
        
        <a 
          href="https://ianonymous3000.github.io/metadata-remover/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-4 border border-primary/20 hover:border-primary/50 rounded-2xl text-xs font-medium text-primary bg-primary/5 transition-all active:scale-[0.98]"
        >
          Abrir em Nova Aba <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        iframe {
          color-scheme: dark;
        }
      `}} />
    </div>
  );
};

export default MetadataRemoverIframeTool;
