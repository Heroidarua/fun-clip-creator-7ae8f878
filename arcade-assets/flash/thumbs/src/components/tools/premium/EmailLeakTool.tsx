import { useState } from "react";
import { ShieldAlert, Search, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { checkEmailLeak } from "@/lib/tools/email-leak.functions";

export default function EmailLeakTool() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ safe: boolean; details?: string } | null>(null);
  const checkFn = useServerFn(checkEmailLeak);

  const check = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Insira um e-mail válido.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await checkFn({ data: { email } });
      setResult(data);
      if (!data.safe) {
        toast.warning("Atenção: Possível vazamento detectado.");
      } else {
        toast.success("E-mail parece seguro.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao verificar. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 text-center">
        <ShieldAlert className="w-10 h-10 mx-auto text-red-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground uppercase">Verificador de Vazamento</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Descubra se seu e-mail foi comprometido em vazamentos de dados online.
        </p>
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="seu-email@exemplo.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="font-mono text-xs h-10"
        />
        <Button onClick={check} disabled={loading} className="shrink-0 font-pixel text-[10px] h-10 shadow-cartridge">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
          BUSCAR
        </Button>
      </div>

      {result && (
        <div className={`p-4 border-2 rounded-sm space-y-2 animate-in fade-in slide-in-from-top-2 shadow-cartridge ${
          result.safe ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
        }`}>
          <div className="flex items-center gap-2">
            {result.safe ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-pixel text-[10px]">
              {result.safe ? "STATUS: SEGURO" : "STATUS: VULNERÁVEL"}
            </span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-pixel text-[9px]">
            {result.details}
          </p>
          {!result.safe && (
            <p className="text-[10px] text-muted-foreground italic border-t border-red-500/20 pt-2 mt-2">
              Dica: Use senhas complexas e ative a autenticação em dois fatores (2FA).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
