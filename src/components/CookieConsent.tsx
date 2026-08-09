import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { setConsent } from "@/lib/consent";
import { useConsent } from "@/hooks/useConsent";
import { loadAdsterraScripts } from "@/lib/adsterra";

const ANALYTICS_ID = "G-JD2L3ZPP4T";

let scriptsLoaded = false;

const loadTrackingScripts = () => {
  if (scriptsLoaded || typeof document === "undefined") return;
  scriptsLoaded = true;

  const analytics = document.createElement("script");
  analytics.async = true;
  analytics.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(analytics);

  const analyticsInit = document.createElement("script");
  analyticsInit.text = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${ANALYTICS_ID}');`;
  document.head.appendChild(analyticsInit);

  loadAdsterraScripts();
};

const CookieConsent = () => {
  const { consent, ready } = useConsent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (consent === "accepted") {
      loadTrackingScripts();
      setVisible(false);
      return;
    }
    setVisible(consent === null);
  }, [consent, ready]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Usamos cookies para medir audiência e exibir anúncios de parceiros. Nada é
              carregado antes da sua autorização. Saiba mais na nossa{" "}
              <Link to="/privacidade" className="text-primary underline underline-offset-2">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
          <div className="flex shrink-0 gap-2 sm:flex-col md:flex-row">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setConsent("rejected")}
            >
              Recusar
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => setConsent("accepted")}
            >
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
