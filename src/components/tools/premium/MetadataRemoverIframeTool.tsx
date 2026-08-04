import React, { useState } from "react";
import { Loader2 } from "lucide-react";

const MetadataRemoverIframeTool = () => {
  const [loading, setLoading] = useState(true);


  return (
    <div className="w-full h-full">
      <div className="relative w-full h-full overflow-hidden shadow-inner">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black gap-3 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-pixel text-center px-4 uppercase tracking-[0.2em]">INICIANDO AMBIENTE SEGURO...</p>
          </div>
        )}
        
        <iframe
          src="https://ianonymous3000.github.io/metadata-remover/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          className="w-full h-full border-none relative z-[1] isolate"
          title="Removedor de Metadados Profissional"
          onLoad={() => setLoading(false)}
          allow="clipboard-write; clipboard-read; camera; microphone; payment; geolocation; fullscreen; browse; publickey-credentials-get; midi; encrypted-media; picture-in-picture"
          sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads allow-storage-access-by-user-activation"
          loading="eager"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        iframe {
          color-scheme: dark;
        }
        /* Garantir que o scroll interno do iframe funcione bem */
        * {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.3) transparent;
        }
      `}} />
    </div>
  );
};

export default MetadataRemoverIframeTool;
