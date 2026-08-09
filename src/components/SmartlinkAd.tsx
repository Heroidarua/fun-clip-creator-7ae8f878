import { ExternalLink } from "lucide-react";
import { ADSTERRA_CONFIG } from "@/lib/adsterra";
import { useConsent } from "@/hooks/useConsent";
import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";
import { cn } from "@/lib/utils";

interface SmartlinkAdProps {
  label?: string;
  className?: string;
}

/**
 * Espaço publicitário opcional (Smartlink Adsterra).
 * Nunca redireciona sozinho — abre apenas por clique do usuário.
 */
const SmartlinkAd = ({ label = "Ver oferta", className }: SmartlinkAdProps) => {
  const { hasAccepted } = useConsent();
  const { isActive, loading } = useDownloaderStatus();

  const enabled =
    ADSTERRA_CONFIG.smartlink.enabled &&
    !loading &&
    isActive(ADSTERRA_CONFIG.smartlink.featureKey);

  if (!enabled || !hasAccepted) return null;

  return (
    <aside
      aria-label="Publicidade"
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-4 text-center",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
        Publicidade
      </span>
      <a
        href={ADSTERRA_CONFIG.smartlink.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
      >
        {label}
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </aside>
  );
};

export default SmartlinkAd;
