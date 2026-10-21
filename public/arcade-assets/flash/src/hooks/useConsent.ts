import { useEffect, useState } from "react";
import { getConsent, onConsentChange, type ConsentValue } from "@/lib/consent";

export const useConsent = () => {
  const [consent, setConsentState] = useState<ConsentValue | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsentState(getConsent());
    setReady(true);
    return onConsentChange(setConsentState);
  }, []);

  return { consent, ready, hasAccepted: consent === "accepted" };
};
