import { useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";
import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";
import { loadAdsterraScripts } from "@/lib/adsterra";

/**
 * Monta os scripts globais da Adsterra (Popunder + Social Bar) uma única vez,
 * após o consentimento de cookies e apenas se ativados no painel de ADM.
 */
const AdsterraAds = () => {
  const { hasAccepted } = useConsent();
  const { isActive, loading } = useDownloaderStatus();

  useEffect(() => {
    if (!hasAccepted || loading) return;
    loadAdsterraScripts(isActive);
  }, [hasAccepted, loading, isActive]);

  return null;
};

export default AdsterraAds;
