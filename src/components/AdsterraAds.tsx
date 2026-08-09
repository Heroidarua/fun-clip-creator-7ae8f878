import { useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";
import { loadAdsterraScripts } from "@/lib/adsterra";

/**
 * Monta os scripts globais da Adsterra (Popunder + Social Bar) uma única vez,
 * após o consentimento de cookies. Não renderiza nada no layout.
 */
const AdsterraAds = () => {
  const { hasAccepted } = useConsent();

  useEffect(() => {
    if (hasAccepted) loadAdsterraScripts();
  }, [hasAccepted]);

  return null;
};

export default AdsterraAds;
