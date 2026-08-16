// Returns the absolute API base when the site is being served from a
// non-Lovable origin (e.g. Netlify, custom static host). Server routes
// (`/api/download-*`) only exist on the Lovable deploy, so we route to
// the published Lovable URL with CORS enabled.
const LOVABLE_API_ORIGIN = "https://fun-clip-creator.lovable.app";

function isLovableHost(host: string): boolean {
  if (host.includes(".lovable.app") || host.includes(".lovableproject.com")) {
    return true;
  }

  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host === "localhost" ||
    host.startsWith("127.") ||
    host.startsWith("192.168.")
  );
}

export function apiBase(): string {
  if (typeof window === "undefined") return "";
  return isLovableHost(window.location.hostname) ? "" : LOVABLE_API_ORIGIN;
}

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return apiBase() + path;
}

// Rewrites server-returned proxy URLs (which are relative like
// `/api/download-tiktok?action=proxy&...`) to absolute Lovable URLs
// when running off-Lovable, so <video>/<img> can load them.
export function rewriteProxy<T extends Record<string, any>>(obj: T | null | undefined): T | null | undefined {
  if (!obj) return obj;
  const base = apiBase();
  if (!base) return obj;
  const keys = ["proxy_video_url", "proxy_audio_url", "proxy_thumbnail_url", "proxy_url"];
  const out: any = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const k of keys) {
    const v = out[k];
    if (typeof v === "string" && v.startsWith("/")) out[k] = base + v;
  }
  if (Array.isArray((out as any).carousel_items)) {
    out.carousel_items = (out as any).carousel_items.map((it: any) => rewriteProxy(it));
  }
  return out;
}