export type ConsentValue = "accepted" | "rejected";

const STORAGE_KEY = "sos01-cookie-consent";
const EVENT_NAME = "sos01-consent-change";

export const getConsent = (): ConsentValue | null => {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
};

export const setConsent = (value: ConsentValue) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore storage failures
  }
  window.dispatchEvent(new CustomEvent<ConsentValue>(EVENT_NAME, { detail: value }));
};

export const onConsentChange = (callback: (value: ConsentValue) => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => callback((event as CustomEvent<ConsentValue>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
};
