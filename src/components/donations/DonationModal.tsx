import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Loader2, Copy, Check, QrCode, Timer, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPixDonation, checkDonationStatus } from "@/lib/donations/mercado-pago.functions";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DONATION_OPTIONS = [
  { value: 5, description: "Cafezinho para os Devs" },
  { value: 10, description: "Manter o SOS01 no ar" },
  { value: 20, description: "Suporte Premium SOS" },
  { value: 50, description: "VIP SOS Master" },
];

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"select" | "generating" | "payment" | "success" | "error">("select");
  const [amount, setAmount] = useState<number | "custom">(10);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [donationData, setDonationData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);

  // Gera a imagem do QR Code quando o Mercado Pago não retorna a imagem pronta
  useEffect(() => {
    let active = true;
    const code = donationData?.qrCode;
    if (!code || donationData?.qrCodeBase64) {
      setQrImage(null);
      return;
    }
    import("qrcode").then(({ default: QRCode }) =>
      QRCode.toDataURL(code, { width: 320, margin: 1 }).then((url) => {
        if (active) setQrImage(url);
      }),
    );
    return () => {
      active = false;
    };
  }, [donationData?.qrCode, donationData?.qrCodeBase64]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("select");
        setAmount(10);
        setCustomAmount("");
        setDonationData(null);
      }, 300);
    }
  }, [isOpen]);

  // Verificação de status via servidor (dados de doação não são públicos)
  useEffect(() => {
    if (!donationData?.id || step !== "payment") return;
    let active = true;

    const interval = setInterval(async () => {
      try {
        const result = await checkDonationStatus({ data: { id: donationData.id } } as any);
        if (!active) return;
        if (result?.status === "approved") {
          clearInterval(interval);
          setStep("success");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#22c55e", "#ffffff", "#16a34a"],
          });
        }
      } catch {
        // silencioso: tentaremos novamente no próximo ciclo
      }
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [donationData?.id, step]);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (step === "payment" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setStep("error");
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGeneratePix = async () => {
    const finalAmount = amount === "custom" ? parseFloat(customAmount) : amount;
    
    if (!finalAmount || finalAmount < 1) {
      toast({ title: "Valor inválido", description: "O valor mínimo é R$ 1,00", variant: "destructive" });
      return;
    }

    setStep("generating");
    try {
      // Log public key presence in dev for debugging
      if (import.meta.env.DEV) {
        console.log("Mercado Pago Public Key present:", !!import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      }

      const { data: { user } } = await supabase.auth.getUser();
      const result = await createPixDonation({
        data: {
          amount: finalAmount,
          userId: user?.id
        }
      } as any);
      setDonationData(result);
      
      if (result.publicKey && import.meta.env.DEV) {
        console.log("Mercado Pago Public Key initialized");
      }
      setTimeLeft(600);
      setStep("payment");
    } catch (err: any) {
      console.error("Donation error:", err);
      setStep("error");
      
      const msg = String(err?.message ?? "");
      const errorMessage =
        msg.includes("PIX_NAO_HABILITADO") || msg.includes("communication_error")
          ? "O Pix ainda não está liberado na conta de recebimento. Cadastre uma chave Pix no Mercado Pago e tente novamente."
          : "Tente novamente em instantes.";

      toast({ 
        title: "Erro ao gerar Pix", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  const copyToClipboard = () => {
    if (donationData?.qrCode) {
      navigator.clipboard.writeText(donationData.qrCode);
      setCopied(true);
      toast({ title: "Copiado!", description: "Código Pix copiado com sucesso." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden border-2 border-secondary/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <Heart className="w-6 h-6 text-green-500 fill-green-500" />
            Apoie o SOS01
          </DialogTitle>
          <DialogDescription className="text-balance">
            O SOS01 é desenvolvido de forma independente. Sua contribuição ajuda a manter nossos servidores e recursos funcionando.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "select" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[40vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-secondary/20">
                {DONATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                      amount === opt.value 
                        ? "border-green-500 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.2)] scale-[1.02]" 
                        : "border-secondary/30 bg-secondary/5 hover:border-green-500/50 hover:bg-green-500/5"
                    }`}
                    onClick={() => setAmount(opt.value)}
                  >
                    <span className={`text-xl sm:text-2xl font-black mb-0.5 sm:mb-1 transition-colors duration-300 ${
                      amount === opt.value ? "text-green-600" : "text-foreground"
                    }`}>
                      R$ {opt.value}
                    </span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-muted-foreground group-hover:text-green-600/70 transition-colors text-center px-1">
                      {opt.description}
                    </span>
                    
                    {amount === opt.value && (
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-ping" />
                    )}
                  </button>
                ))}
                
                <button
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-500 col-span-1 sm:col-span-2 ${
                    amount === "custom" 
                      ? "border-green-500 bg-green-500/5 shadow-[0_0_20px_rgba(34,197,94,0.2)] scale-[1.02]" 
                      : "border-secondary/30 bg-secondary/5 hover:border-green-500/50 hover:bg-green-500/5"
                  }`}
                  onClick={() => setAmount("custom")}
                >
                  <span className={`text-base sm:text-lg font-black transition-colors duration-300 ${
                    amount === "custom" ? "text-green-600" : "text-foreground"
                  }`}>
                    Outro Valor
                  </span>
                </button>
              </div>

              {amount === "custom" && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    placeholder="0,00"
                    className="pl-10 h-12 text-lg font-bold"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              )}

              <Button 
                className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 gap-2 btn-3d"
                onClick={handleGeneratePix}
              >
                <Heart className="w-5 h-5" />
                GERAR PIX
              </Button>
            </div>
          )}

          {step === "generating" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
              <p className="font-bold text-lg animate-pulse">Gerando seu Pix...</p>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-green-500">Seu Pix está pronto!</h3>
                <p className="text-2xl font-display">Valor: R$ {donationData?.amount.toFixed(2)}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-inner mx-auto max-w-[200px]">
                {donationData?.qrCodeBase64 ? (
                  <img src={`data:image/png;base64,${donationData.qrCodeBase64}`} alt="QR Code Pix" className="w-full h-auto" />
                ) : qrImage ? (
                  <img src={qrImage} alt="QR Code Pix" className="w-full h-auto" />
                ) : (
                  <QrCode className="w-32 h-32 text-muted-foreground opacity-20" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest text-center">Pix Copia e Cola</p>
                <div className="relative">
                  <div className="bg-muted p-3 pr-12 rounded-lg text-xs font-mono break-all line-clamp-2 border border-border">
                    {donationData?.qrCode}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-primary/10"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {donationData?.isStatic && (
                <p className="text-[11px] text-center text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  Pagamento via chave Pix direta. Após pagar, a confirmação pode levar alguns minutos.
                </p>
              )}

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-yellow-500 font-bold bg-yellow-500/10 px-4 py-2 rounded-full animate-pulse">
                  <Timer className="w-4 h-4" />
                  <span>Aguardando pagamento... {formatTime(timeLeft)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Após o pagamento, esta tela será atualizada automaticamente.
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in slide-in-from-bottom duration-500">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display">DOAÇÃO RECEBIDA!</h3>
                <p className="text-muted-foreground">Muito obrigado por apoiar o SOS01! 💚</p>
              </div>
              <Button className="w-full mt-4" onClick={onClose}>Fechar</Button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Não foi possível gerar o Pix</h3>
                <p className="text-sm text-muted-foreground">
                  Houve um erro técnico ou o Pix expirou.
                </p>
              </div>
              <Button className="w-full mt-4" onClick={() => setStep("select")}>Tentar novamente</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
