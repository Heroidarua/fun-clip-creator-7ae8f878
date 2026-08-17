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
  RefreshCcw,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { spinRoulette } from "@/lib/iptv.functions";
import confetti from "canvas-confetti";

interface IPTVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROULETTE_ITEMS = [
  { label: "🍀 QUASE!", color: "#FF4D4D", won: false },
  { label: "😅 NÃO FOI", color: "#FFD93D", won: false },
  { label: "🎁 TENTE DE NOVO", color: "#B66DFF", won: false },
  { label: "🔐 BLOQUEADO", color: "#28B6FF", won: false },
  { label: "⭐ QUASE!", color: "#FF4D4D", won: false },
  { label: "⚡ TENTE DE NOVO", color: "#FFD93D", won: false },
  { label: "🔥 ACESSO!", color: "#4ADE80", won: true },
  { label: "🍀 MAIS UMA", color: "#B66DFF", won: false },
];

export default function IPTVModal({ isOpen, onClose }: IPTVModalProps) {
  const { toast } = useToast();
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [rotation, setRotation] = useState(0);
  const constraintsRef = useRef(null);

  // Criar um ID de sessão persistente no localStorage para controle básico
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("iptv_session_id");
    if (saved) return saved;
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("iptv_session_id", id);
    return id;
  });

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

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSpin = async () => {
    if (isSpinning || cooldown > 0 || credentials) return;

    try {
      setIsSpinning(true);
      setSpinResult(null);

      // Chamar o backend para decidir o resultado
      const result = await spinRoulette({ data: { sessionId } });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Limite atingido",
          description: result.message || "Tente novamente mais tarde."
        });
        setIsSpinning(false);
        return;
      }

      // Calcular rotação para parar no item sorteado
      // Cada item ocupa 45 graus (360 / 8)
      const targetIndex = result.outcomeIndex;
      const extraSpins = 5; // Girar 5 vezes completas antes de parar
      const targetRotation = rotation + (extraSpins * 360) + (360 - (targetIndex * 45));
      
      setRotation(targetRotation);

      // Aguardar animação terminar (4 segundos)
      setTimeout(() => {
        setIsSpinning(false);
        setSpinResult(result);
        setCooldown(5); // 5 segundos de cooldown após o giro

        if (result.won) {
          setCredentials(result.credentials);
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#28B6FF', '#B66DFF', '#FFD93D', '#4ADE80']
          });
          toast({
            title: "🔥 PARABÉNS!",
            description: "Você desbloqueou o acesso IPTV!",
          });
        } else {
          toast({
            title: result.outcomeLabel,
            description: "Não foi dessa vez. Tente novamente!",
          });
        }
      }, 4000);

    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro no servidor",
        description: "Não foi possível realizar o sorteio."
      });
      setIsSpinning(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "✅ Copiado!",
        description: `${field} copiado com sucesso.`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao copiar" });
    }
  };

  const handleCopyAll = async () => {
    if (!credentials) return;
    const text = `Servidor: ${credentials.url}\nUsuário: ${credentials.login}\nSenha: ${credentials.senha}`;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "✅ Credenciais copiadas!" });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao copiar" });
    }
  };

  const resetGame = () => {
    setSpinResult(null);
    setCredentials(null);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center" ref={constraintsRef}>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/40 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />
          
          <motion.div
            drag
            dragConstraints={constraintsRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="pointer-events-auto relative w-[95vw] sm:w-[400px] bg-card/95 backdrop-blur-2xl border-2 border-primary/30 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative border-b border-border/50 bg-primary/5 p-4 flex items-center justify-between cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl shadow-inner">
                  <Tv className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-display text-foreground leading-none">IPTV 1.0</h2>
                  <span className="text-[10px] font-silkscreen text-primary uppercase tracking-tighter">Roleta da Sorte</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-destructive/10 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {!credentials ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-display text-foreground">Será que a sorte está com você?</h3>
                    <p className="text-sm text-muted-foreground">Gire a roleta para tentar desbloquear o acesso premium.</p>
                  </div>

                  {/* Roulette UI */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4">
                    {/* The Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                      <div className="w-6 h-8 bg-foreground clip-path-triangle rotate-180 shadow-lg" 
                           style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                    </div>

                    {/* The Wheel */}
                    <motion.div 
                      className="w-full h-full rounded-full border-8 border-foreground shadow-2xl relative overflow-hidden bg-background"
                      animate={{ rotate: rotation }}
                      transition={{ duration: 4, ease: [0.12, 0, 0.39, 0] }}
                      style={{ 
                        transformOrigin: 'center center',
                        boxShadow: '0 0 40px rgba(40,182,255,0.2), inset 0 0 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      {ROULETTE_ITEMS.map((item, i) => (
                        <div 
                          key={i}
                          className="absolute w-full h-full top-0 left-0"
                          style={{ 
                            transform: `rotate(${i * 45}deg)`,
                            background: `conic-gradient(from 157.5deg at 50% 50%, ${item.color} 0deg 45deg, transparent 45deg)`,
                          }}
                        >
                          <span 
                            className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-display text-white whitespace-nowrap rotate-[180deg]"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </motion.div>

                    {/* Center Pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-foreground rounded-full border-4 border-background z-10 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                  </div>

                  {/* Status Messages */}
                  <AnimatePresence mode="wait">
                    {isSpinning && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-primary font-silkscreen text-xs animate-pulse"
                      >
                        🎰 Girando... Procurando sua sorte...
                      </motion.div>
                    )}
                    {spinResult && !spinResult.won && !isSpinning && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-4 bg-destructive/5 rounded-2xl border border-destructive/20 w-full"
                      >
                        <p className="text-lg font-display text-destructive mb-1">{spinResult.outcomeLabel}</p>
                        <p className="text-xs text-muted-foreground italic">"Hoje ela não quis colaborar. Tente novamente!"</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleSpin}
                    disabled={isSpinning || cooldown > 0}
                    className="btn-3d w-full py-4 bg-primary text-primary-foreground rounded-2xl font-silkscreen text-sm flex items-center justify-center gap-2 group transition-all"
                  >
                    {isSpinning ? (
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : cooldown > 0 ? (
                      `Aguarde ${cooldown}s...`
                    ) : (
                      <>
                        <Tv className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        GIRAR A ROLETA
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center p-4 bg-primary/10 rounded-2xl border-2 border-primary/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/20 to-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-xl font-display text-primary">ACESSO DESBLOQUEADO!</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-silkscreen mt-1">Parabéns! Você teve sorte.</p>
                  </div>

                  <div className="space-y-4">
                    {/* URL Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-silkscreen text-muted-foreground/70 uppercase flex items-center gap-2 px-1">
                        <ExternalLink className="w-3 h-3" /> Servidor
                      </label>
                      <div className="flex gap-2">
                        <motion.div 
                          initial={{ filter: "blur(8px)" }}
                          animate={{ filter: "blur(0px)" }}
                          transition={{ delay: 0.5 }}
                          className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm font-mono flex items-center overflow-hidden"
                        >
                          {credentials.url}
                        </motion.div>
                        <button onClick={() => handleCopy(credentials.url, "Servidor")} className="p-3 bg-secondary rounded-xl hover:bg-primary/20 transition-all">
                          {copiedField === "Servidor" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* User Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-silkscreen text-muted-foreground/70 uppercase flex items-center gap-2 px-1">
                        <User className="w-3 h-3" /> Usuário
                      </label>
                      <div className="flex gap-2">
                        <motion.div 
                          initial={{ filter: "blur(8px)" }}
                          animate={{ filter: "blur(0px)" }}
                          transition={{ delay: 1 }}
                          className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm font-mono flex items-center overflow-hidden"
                        >
                          {credentials.login}
                        </motion.div>
                        <button onClick={() => handleCopy(credentials.login, "Usuário")} className="p-3 bg-secondary rounded-xl hover:bg-primary/20 transition-all">
                          {copiedField === "Usuário" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Pass Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-silkscreen text-muted-foreground/70 uppercase flex items-center gap-2 px-1">
                        <Key className="w-3 h-3" /> Senha
                      </label>
                      <div className="flex gap-2">
                        <motion.div 
                          initial={{ filter: "blur(8px)" }}
                          animate={{ filter: "blur(0px)" }}
                          transition={{ delay: 1.5 }}
                          className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-3 text-sm font-mono flex items-center overflow-hidden"
                        >
                          {credentials.senha}
                        </motion.div>
                        <button onClick={() => handleCopy(credentials.senha, "Senha")} className="p-3 bg-secondary rounded-xl hover:bg-primary/20 transition-all">
                          {copiedField === "Senha" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={handleCopyAll} className="flex items-center justify-center gap-2 py-3 bg-secondary/50 border border-border/50 rounded-xl text-xs font-silkscreen hover:bg-secondary transition-all">
                      <ClipboardCheck className="w-4 h-4" /> COPIAR TUDO
                    </button>
                    <button onClick={() => window.open(credentials.url, "_blank")} className="btn-3d py-3 bg-primary text-primary-foreground rounded-xl text-xs font-silkscreen flex items-center justify-center gap-2">
                      ABRIR PLAYER <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={resetGame}
                    className="w-full text-[10px] font-silkscreen text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCcw className="w-3 h-3" /> TENTAR OUTRA CONTA
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="p-3 bg-primary/5 border-t border-border/30 flex items-center justify-between px-6">
              <div className="flex items-center gap-2 text-[9px] font-silkscreen text-muted-foreground">
                <Lock className="w-3 h-3" /> PROTEGIDO POR SOS01
              </div>
              {spinResult && spinResult.spinsLeft !== undefined && (
                <div className="text-[9px] font-silkscreen text-primary uppercase">
                  Tentativas Restantes: {spinResult.spinsLeft}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
