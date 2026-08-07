import { useState, useRef, useEffect } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Key, 
  User, 
  ExternalLink, 
  ClipboardCheck, 
  Tv,
  GripHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface IPTVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IPTV_CREDENTIALS = {
  login: "sos01.com.br",
  senha: "19601525488",
  url: "https://wplayer.link/"
};

export default function IPTVModal({ isOpen, onClose }: IPTVModalProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "✅ Copiado!",
        description: `${field} copiado para a área de transferência.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Tente copiar manualmente.",
      });
    }
  };

  const handleCopyAll = async () => {
    const text = `Login: ${IPTV_CREDENTIALS.login}\nSenha: ${IPTV_CREDENTIALS.senha}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Credenciais copiadas!",
        description: "Login e senha copiados com sucesso.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
      });
    }
  };

  const openIPTV = () => {
    window.open(IPTV_CREDENTIALS.url, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center" ref={constraintsRef}>
          {/* Background Overlay - Clickable */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/20 backdrop-blur-[2px] pointer-events-auto"
            onClick={onClose}
          />
          
          {/* Floating Draggable Window - Centralizado e Compacto */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="pointer-events-auto relative w-[90vw] sm:w-[360px] md:w-[380px] bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl sm:rounded-3xl shadow-2xl"
          >
            {/* Drag Handle & Header */}
            <div className="relative group cursor-grab active:cursor-grabbing border-b border-border/50 bg-primary/5">
              <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 opacity-30 group-hover:opacity-100 transition-opacity hidden sm:block">
                <GripHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <div className="flex items-center justify-between p-3 sm:p-5 sm:pt-7">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-primary/20 rounded-lg sm:rounded-xl shadow-inner flex-shrink-0">
                    <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h2 className="text-sm sm:text-lg font-display text-foreground tracking-tight leading-none truncate">
                    📺 Credenciais
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all active:scale-90 flex-shrink-0 ml-2"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
              <div className="bg-primary/5 rounded-lg sm:rounded-xl p-2.5 sm:p-3 border border-primary/10">
                <p className="text-[11px] sm:text-xs text-muted-foreground text-center leading-snug">
                  Copie as credenciais e use no IPTV.
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* Login Field */}
                <div className="space-y-1">
                  <label className="text-[7px] sm:text-[9px] font-silkscreen uppercase tracking-[0.1em] sm:tracking-[0.15em] text-muted-foreground/70 flex items-center gap-1.5 ml-0.5">
                    <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> Usuário
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-foreground font-mono text-[10px] sm:text-xs select-all flex items-center break-all min-h-[32px] sm:min-h-[36px]">
                      {IPTV_CREDENTIALS.login}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.login, "Login")}
                      className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-lg transition-all active:scale-95 flex items-center justify-center flex-shrink-0 min-h-[32px] sm:min-h-[36px]"
                      title="Copiar usuário"
                    >
                      {copiedField === "Login" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-[7px] sm:text-[9px] font-silkscreen uppercase tracking-[0.1em] sm:tracking-[0.15em] text-muted-foreground/70 flex items-center gap-1.5 ml-0.5">
                    <Key className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> Senha
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-foreground font-mono text-[10px] sm:text-xs select-all flex items-center break-all min-h-[32px] sm:min-h-[36px]">
                      {IPTV_CREDENTIALS.senha}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.senha, "Senha")}
                      className="px-2.5 sm:px-3 py-2 sm:py-2.5 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-lg transition-all active:scale-95 flex items-center justify-center flex-shrink-0 min-h-[32px] sm:min-h-[36px]"
                      title="Copiar senha"
                    >
                      {copiedField === "Senha" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyAll}
                className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 border-2 border-dashed border-primary/20 hover:border-primary/50 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-95 text-[10px] sm:text-xs font-medium"
              >
                <ClipboardCheck className="w-3 h-3 flex-shrink-0" />
                <span>Copiar Tudo</span>
              </button>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-5 pb-3 sm:pb-5 border-t border-border/30">
              <button
                onClick={openIPTV}
                className="btn-3d w-full flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 sm:px-5 bg-primary text-primary-foreground rounded-lg sm:rounded-xl font-silkscreen uppercase tracking-wider text-[10px] sm:text-xs shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              >
                <span>➡️ Abrir IPTV</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              </button>
              
              <p className="mt-2 sm:mt-3 text-[7px] sm:text-[9px] text-center text-muted-foreground italic px-1">
                Dica: Arraste em desktop para mover.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
