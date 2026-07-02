import { useEffect, useState } from "react";
import { Download, Smartphone, Share as ShareIcon, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Props = {
  variant?: "pill" | "mobile";
  onClick?: () => void;
};

const InstallAppButton = ({ variant = "pill", onClick }: Props) => {
  const { toast } = useToast();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      toast({ title: "Aplicativo instalado", description: "Abra pelo ícone na tela inicial." });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) {
      setInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [toast]);

  const handleClick = async () => {
    onClick?.();
    if (installed) {
      toast({ title: "Já instalado", description: "O app já está na sua tela inicial." });
      return;
    }

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;

    if (deferred) {
      try {
        await deferred.prompt();
        const { outcome } = await deferred.userChoice;
        if (outcome === "accepted") {
          setDeferred(null);
        }
        return;
      } catch {
        // fall through
      }
    }

    if (isIOS) {
      setShowIOS(true);
      return;
    }

    // Android/desktop sem evento nativo — mostra guia manual
    setShowIOS(true);
  };

  const base =
    variant === "mobile"
      ? "flex items-center justify-center gap-2 px-4 py-3 min-h-11 rounded-full border-2 border-foreground text-sm font-semibold text-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      : "hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border hover:border-foreground/40 text-foreground/80 hover:text-foreground text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <button onClick={handleClick} className={base} aria-label="Baixar o aplicativo">
        <Download className="w-4 h-4" aria-hidden="true" />
        <span>Baixar app</span>
      </button>

      <Dialog open={showIOS} onOpenChange={setShowIOS}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" /> Instalar o SOS01
            </DialogTitle>
            <DialogDescription>
              Instale o app na tela inicial do seu celular — sem loja, direto pelo navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <section>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-background text-xs"></span>
                iPhone / iPad (Safari)
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1.5 pl-2">
                <li className="flex gap-2"><span>1.</span><span>Toque no ícone <ShareIcon className="inline w-4 h-4 mx-0.5" /> Compartilhar na barra inferior.</span></li>
                <li className="flex gap-2"><span>2.</span><span>Escolha <strong>Adicionar à Tela de Início</strong> <Plus className="inline w-4 h-4 mx-0.5" />.</span></li>
                <li className="flex gap-2"><span>3.</span><span>Confirme em <strong>Adicionar</strong>. Pronto — abra pelo ícone.</span></li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-foreground text-background text-xs"></span>
                Android (Chrome)
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1.5 pl-2">
                <li className="flex gap-2"><span>1.</span><span>Toque no menu <strong>⋮</strong> no canto superior direito.</span></li>
                <li className="flex gap-2"><span>2.</span><span>Escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span></li>
                <li className="flex gap-2"><span>3.</span><span>Confirme em <strong>Instalar</strong>. O ícone aparecerá na tela inicial.</span></li>
              </ol>
            </section>

            <button
              onClick={() => setShowIOS(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <X className="w-4 h-4" /> Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallAppButton;