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
        <div className="fixed inset-0 z-[100] pointer-events-none" ref={constraintsRef}>
          {/* Background Overlay - Clickable */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/20 backdrop-blur-[2px] pointer-events-auto"
            onClick={onClose}
          />
          
          {/* Floating Draggable Window - Responsivo */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-md bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl sm:rounded-3xl shadow-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
            style={{ x: "-50%", y: "-50%" }}
          >
            {/* Drag Handle & Header */}
            <div className="relative group cursor-grab active:cursor-grabbing border-b border-border/50 bg-primary/5 sticky top-0 z-10">
              <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 opacity-30 group-hover:opacity-100 transition-opacity hidden sm:block">
                <GripHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <div className="flex items-center justify-between p-4 sm:p-6 sm:pt-8">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="p-1.5 sm:p-2.5 bg-primary/20 rounded-lg sm:rounded-xl shadow-inner flex-shrink-0">
                    <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h2 className="text-base sm:text-xl font-display text-foreground tracking-tight leading-none">
                    📺 Credenciais
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all active:scale-90 flex-shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary/10">
                <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                  "Copie as credenciais abaixo e utilize-as para entrar no IPTV."
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Login Field */}
                <div className="space-y-1.5">
                  <label className="text-[8px] sm:text-[10px] font-silkscreen uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1">
                    <User className="w-3 h-3 flex-shrink-0" /> Usuário
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-foreground font-mono text-xs sm:text-sm select-all flex items-center break-all">
                      {IPTV_CREDENTIALS.login}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.login, "Login")}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                      title="Copiar usuário"
                    >
                      {copiedField === "Login" ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[8px] sm:text-[10px] font-silkscreen uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1.5 sm:gap-2 ml-0.5 sm:ml-1">
                    <Key className="w-3 h-3 flex-shrink-0" /> Senha
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-foreground font-mono text-xs sm:text-sm select-all flex items-center break-all">
                      {IPTV_CREDENTIALS.senha}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.senha, "Senha")}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-lg sm:rounded-xl transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
                      title="Copiar senha"
                    >
                      {copiedField === "Senha" ? <Check className="w-4 h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 border-2 border-dashed border-primary/20 hover:border-primary/50 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-lg sm:rounded-xl transition-all active:scale-95 text-xs sm:text-sm font-medium"
                >
                  <ClipboardCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Copiar Tudo</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 sm:pt-0 border-t border-border/30">
              <button
                onClick={openIPTV}
                className="btn-3d w-full flex items-center justify-center gap-2 py-3 sm:py-4 px-4 sm:px-6 bg-primary text-primary-foreground rounded-lg sm:rounded-2xl font-silkscreen uppercase tracking-wider text-xs sm:text-sm shadow-lg hover:shadow-xl transition-shadow active:scale-95"
              >
                <span>➡️ Abrir IPTV</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              </button>
              
              <p className="mt-3 sm:mt-4 text-[7px] sm:text-[10px] text-center text-muted-foreground italic px-2">
                Dica: Arraste este painel para o lado se ele estiver atrapalhando (desktop).
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
