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
  MessageCircle
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
  
  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `📺 *Credenciais IPTV SOS01*\n\n` +
      `👤 *Login:* ${IPTV_CREDENTIALS.login}\n` +
      `🔑 *Senha:* ${IPTV_CREDENTIALS.senha}\n\n` +
      `🔗 *Acesse aqui:* ${IPTV_CREDENTIALS.url}\n\n` +
      `SOS01.com.br - Ferramentas e Entretenimento Grátis!`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
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
          
          {/* Floating Draggable Window */}
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card/95 backdrop-blur-xl border-2 border-primary/30 rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-solid overflow-hidden"
            style={{ x: "-50%", y: "-50%" }}
          >
            {/* Drag Handle & Header */}
            <div className="relative group cursor-grab active:cursor-grabbing border-b border-border/50 bg-primary/5">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
                <GripHorizontal className="w-5 h-5" />
              </div>
              
              <div className="flex items-center justify-between p-6 pt-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/20 rounded-xl shadow-inner">
                    <Tv className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-display text-foreground tracking-tight leading-none">
                    📺 Credenciais
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all active:scale-90"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  "Copie as credenciais abaixo e utilize-as para entrar no IPTV."
                </p>
              </div>

              <div className="space-y-4">
                {/* Login Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-silkscreen uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <User className="w-3 h-3" /> Usuário
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground font-mono text-sm select-all flex items-center">
                      {IPTV_CREDENTIALS.login}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.login, "Login")}
                      className="px-4 py-3 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[50px] border border-transparent hover:border-primary/20"
                    >
                      {copiedField === "Login" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-silkscreen uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <Key className="w-3 h-3" /> Senha
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-foreground font-mono text-sm select-all flex items-center">
                      {IPTV_CREDENTIALS.senha}
                    </div>
                    <button
                      onClick={() => handleCopy(IPTV_CREDENTIALS.senha, "Senha")}
                      className="px-4 py-3 bg-secondary hover:bg-primary/20 hover:text-primary text-secondary-foreground rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[50px] border border-transparent hover:border-primary/20"
                    >
                      {copiedField === "Senha" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyAll}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/20 hover:border-primary/50 text-primary/80 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all text-sm font-medium"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Copiar Tudo
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 rounded-2xl transition-all text-sm font-medium group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  WhatsApp
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-0">
              <button
                onClick={openIPTV}
                className="btn-3d w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-silkscreen uppercase tracking-wider text-sm shadow-[0_4px_0_0_rgba(0,0,0,0.2)]"
              >
                ➡️ Abrir IPTV
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
              
              <p className="mt-4 text-[10px] text-center text-muted-foreground italic">
                Dica: Arraste este painel para o lado se ele estiver atrapalhando.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
