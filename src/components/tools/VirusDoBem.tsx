import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Share2, Check, Sparkles } from "lucide-react";

const PRANK_URL = "https://is.gd/8P4M50";
const SHARE_TEXT = "Olha isso 😂👇";

export default function VirusDoBem() {
  const { toast } = useToast();
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PRANK_URL);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Agora é só colar e enviar.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Copie o link manualmente do campo acima.",
        variant: "destructive",
      });
    }
  };

  const handleOpen = () => {
    window.open(PRANK_URL, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined" || !(navigator as any).share) {
      toast({
        title: "Compartilhamento indisponível",
        description: "Use o botão Copiar Link para enviar.",
      });
      return;
    }
    try {
      await (navigator as any).share({
        title: "Vírus do Bem",
        text: `${SHARE_TEXT}\n${PRANK_URL}`,
        url: PRANK_URL,
      });
    } catch {
      // usuário cancelou — não exibe erro
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {!generated ? (
        <div className="text-center space-y-6">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_30px_-5px_hsl(150_80%_45%/0.5)]">
              <VirusIcon className="w-11 h-11 text-emerald-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-pixel text-lg text-emerald-500">🦠 VÍRUS DO BEM</h2>
            <p className="text-sm text-muted-foreground">
              Gere seu link e compartilhe com seus amigos. 😈
            </p>
          </div>

          <button
            onClick={handleGenerate}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-sm font-pixel text-sm text-primary-foreground bg-emerald-600 hover:bg-emerald-500 transition-all shadow-[4px_4px_0_hsl(var(--accent))] active:translate-y-0.5 active:shadow-none"
          >
            <Sparkles className="w-4 h-4" />
            GERAR LINK
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 mb-2">
              <VirusIcon className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="font-pixel text-base text-emerald-500">LINK GERADO!</h2>
            <p className="text-xs text-muted-foreground">
              Copie, abra ou compartilhe o link da pegadinha.
            </p>
          </div>

          <div className="relative group">
            <label htmlFor="prank-link" className="sr-only">
              Link da pegadinha
            </label>
            <input
              id="prank-link"
              readOnly
              value={PRANK_URL}
              onFocus={(e) => e.target.select()}
              className="w-full bg-background border-2 border-emerald-500/40 rounded-sm px-4 py-3 pr-24 font-mono text-sm text-foreground focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleCopy}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-pixel bg-emerald-600 text-primary-foreground hover:bg-emerald-500 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "COPIADO" : "COPIAR"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-emerald-500/40 font-pixel text-xs text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <Copy className="w-4 h-4" />
              COPIAR LINK
            </button>

            <button
              onClick={handleOpen}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-emerald-500/40 font-pixel text-xs text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ABRIR LINK
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-emerald-500/40 font-pixel text-xs text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              COMPARTILHAR
            </button>
          </div>

          {copied && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-500 animate-in fade-in zoom-in duration-200">
              <Check className="w-4 h-4" />
              Link copiado!
            </div>
          )}

          <button
            onClick={() => setGenerated(false)}
            className="block mx-auto text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            Gerar outro link
          </button>
        </div>
      )}

      <div className="mt-8 rounded-sm border border-amber-400/30 bg-amber-400/5 p-4 flex gap-3">
        <span className="text-amber-500 text-lg leading-none">⚠️</span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Este é um link de pegadinha/redirecionamento externo. O SOS01 não controla o
          conteúdo exibido no destino.
        </p>
      </div>
    </div>
  );
}

function VirusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="14" cy="13" r="1" fill="currentColor" />
      <path
        d="M10.5 14c.5.7 1.7.8 2.5.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
