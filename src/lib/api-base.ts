// Returns the absolute API base when the site is being served from a
// non-Lovable origin (e.g. Netlify, custom static host). Server routes
// (`/api/download-*`) only exist on the Lovable deploy, so we route to
// the published Lovable URL with CORS enabled.
const LOVABLE_API_ORIGIN = "https://fun-clip-creator.lovable.app";

function isLovableHost(host: string): boolean {
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

type ProxyCandidate = {
  proxy_video_url?: string;
  proxy_audio_url?: string;
  proxy_thumbnail_url?: string;
  proxy_url?: string;
  carousel_items?: unknown[];
  [k: string]: unknown;
};

export function rewriteProxy<T extends ProxyCandidate | ProxyCandidate[] | null | undefined>(
  obj: T,
): T {
  if (!obj) return obj;
  const base = apiBase();
  if (!base) return obj;

  const keys = [
    "proxy_video_url",
    "proxy_audio_url",
    "proxy_thumbnail_url",
    "proxy_url",
  ];

  if (Array.isArray(obj)) {
    // map over array and rewrite each item if it's an object
    const out = obj.map((item) => {
      if (item && typeof item === "object") return rewriteProxy(item as ProxyCandidate);
      return item;
    }) as unknown as T;
    return out;
  }

  // obj is an object
  const out: ProxyCandidate = { ...(obj as ProxyCandidate) };

  for (const k of keys) {
    const v = out[k];
    if (typeof v === "string" && v.startsWith("/")) out[k] = base + v;
  }

  if (Array.isArray(out.carousel_items)) {
    out.carousel_items = out.carousel_items.map((it) => {
      if (it && typeof it === "object") return rewriteProxy(it as ProxyCandidate);
      return it;
    });
  }

  return out as T;
}
