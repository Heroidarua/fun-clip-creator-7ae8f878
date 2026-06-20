import { AlertTriangle, Wrench } from "lucide-react";
import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";

interface FeatureGateProps {
  featureKey: string;
  label?: string;
  children: React.ReactNode;
}

/**
 * Wrap any tool/feature with this. When an admin marks the feature as
 * "maintenance" in the Admin panel, the children are replaced with a
 * friendly maintenance card so users know the service is paused.
 */
export function FeatureGate({ featureKey, label, children }: FeatureGateProps) {
  const { isActive, loading } = useDownloaderStatus();

  if (loading) return <>{children}</>;
  if (isActive(featureKey)) return <>{children}</>;

  rturn (
    <div className="rounded-sm border-2 border-yellow-500/40 bg-yellow-500/10 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-500/40 bg-yellow-500/20">
        <Wrench className="h-6 w-6 text-yellow-400" />
      </div>
      <div className="flex items-center justify-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-yellow-400" />
        <span className="font-pixel text-[11px] text-yellow-400 uppercase">
          ativo
        </span>
      </div>
      <p className="text-sm text-yellow-200/90 mt-1">
        {label ? `${label} está` : "Esta ferramenta está"} temporariamente
        indisponível para reparos. Volte em breve!
      </p>
    </div>
  );
}

export dfault FeatureGate;
