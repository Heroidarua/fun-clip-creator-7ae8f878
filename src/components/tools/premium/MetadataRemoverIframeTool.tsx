import React, { useState } from "react";
import { Loader2, ExternalLink, ShieldCheck, Info } from "lucide-react";

const MetadataRemoverIframeTool = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full space-y-6">
      {/* Aviso de Privacidade */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Privacidade Garantida</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta ferramenta processa seus arquivos diretamente no seu navegador. 
            Nenhum dado é enviado para servidores externos, garantindo anonimato total e segurança.
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
          className="w-full h-full border-none relative z-0"
          title="Removedor de Metadados Profissional"
          onLoad={() => {
            console.log("Iframe loaded");
            setLoading(false);
          }}
          allow="clipboard-write; clipboard-read; camera; microphone"
          loading="eager"
        />

      </div>

      {/* Instruções Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-tight text-foreground">Como usar</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Arraste suas fotos para o painel acima ou clique para selecionar. A ferramenta removerá automaticamente tags EXIF e dados de GPS.
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
