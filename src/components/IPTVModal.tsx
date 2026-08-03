import { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Key, 
  User, 
  ExternalLink, 
  ClipboardCheck, 
  Tv 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IPTVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IPTV_CREDENTIALS = {
  login: "sos01.com.br",
  senha: "19601525488",
  url: "https://wplayer.link/dashboard?view=movies"
};

export default function IPTVModal({ isOpen, onClose }: IPTVModalProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Tv className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-display text-foreground tracking-tight">
              📺 Credenciais de Acesso
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-muted-foreground text-center">
            "Copie as credenciais abaixo e utilize-as para entrar no IPTV."
          </p>

          <div className="space-y-4">
            {/* Login Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-silkscreen uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                <User className="w-3 h-3" /> Login
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-foreground font-mono text-sm select-all">
                  {IPTV_CREDENTIALS.login}
                </div>
                <button
                  onClick={() => handleCopy(IPTV_CREDENTIALS.login, "Login")}
                  className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[50px]"
                  title="Copiar Login"
                >
                  {copiedField === "Login" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-silkscreen uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                <Key className="w-3 h-3" /> Senha
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-foreground font-mono text-sm select-all">
                  {IPTV_CREDENTIALS.senha}
                </div>
                <button
                  onClick={() => handleCopy(IPTV_CREDENTIALS.senha, "Senha")}
                  className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all active:scale-95 flex items-center justify-center min-w-[50px]"
                  title="Copiar Senha"
                >
                  {copiedField === "Senha" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyAll}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 rounded-2xl transition-all font-medium"
          >
            <ClipboardCheck className="w-5 h-5" />
            📋 Copiar Tudo
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={openIPTV}
            className="btn-3d w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-silkscreen uppercase tracking-wider text-base"
          >
            ➡️ Abrir IPTV
            <ExternalLink className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
