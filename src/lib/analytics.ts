export const trackDownload = (platform: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", "download", {
      event_category: "engagement",
      event_label: platform,
    });
  }
};
