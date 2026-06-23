import { createFileRoute } from "@tanstack/react-router";
import { isSafeProxyUrl } from "@/lib/proxy-url-guard";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface MediaData {
  media_url: string;
  media_type: "video";
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
  video_url?: string;
}

interface MediaResponse {
  success: boolean;
  data?: MediaData;
  error?: string;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isValidFacebookUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(facebook\.com|fb\.com|fb\.watch|m\.facebook\.com)/i.test(url);
}

// Resolve /share/v/<id>/ and other short links to the canonical /reel/ or /watch/ URL.
// Many providers reject the short share form.
async function resolveFacebookUrl(url: string): Promise<string> {
  try {
    if (!/\/share\/(v|r|p|video|reel)\//i.test(url) && !/fb\.watch/i.test(url)) {
      return url;
    }
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": UA,
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (r.url && /facebook\.com\/(reel|watch|video|.+\/videos)/i.test(r.url)) {
      return r.url.split("?")[0];
    }
  } catch {}
  return url;
}

// Provider 0: Snapsave (decodes their obfuscated response without eval — Cloudflare-safe)
const SNAP_CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
function snapConv(d: string, e: number, f: number): string {
  const src = SNAP_CHARSET.slice(0, e);
  const dst = SNAP_CHARSET.slice(0, f);
  let j: number = d
    .split("")
    .reverse()
    .reduce((a: number, b: string, c: number) => {
      const idx = src.indexOf(b);
      return idx !== -1 ? a + idx * Math.pow(e, c) : a;
    }, 0);
  let k = "";
  while (j > 0) {
    k = dst[j % f] + k;
    j = (j - (j % f)) / f;
  }
  return k || "0";
}
function decodeSnapsave(src: string): string | null {
  const m = src.match(
    /return decodeURIComponent\(escape\(r\)\)\}\("([^"]+)",(\d+),"([^"]+)",(\d+),(\d+),(\d+)\)/,
  );
  if (!m) return null;
  const h = m[1];
  const n = m[3];
  const t = +m[4];
  const e = +m[5];
  let r = "";
  const esc: string[] = [];
  for (let j = 0; j < n.length; j++) esc.push(n[j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  for (let i = 0; i < h.length; i++) {
    let s = "";
    while (i < h.length && h[i] !== n[e]) {
      s += h[i];
      i++;
    }
    for (let j = 0; j < n.length; j++) s = s.replace(new RegExp(esc[j], "g"), String(j));
    r += String.fromCharCode(parseInt(snapConv(s, e, 10), 10) - t);
  }
  try {
    return decodeURIComponent(escape(r));
  } catch {
    return r;
  }
}
async function fetchSnapsave(url: string): Promise<MediaResponse | null> {
  const r = await fetch("https://snapsave.app/action.php?lang=en", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": UA,
      Origin: "https://snapsave.app",
      Referer: "https://snapsave.app/",
      Accept: "*/*",
    },
    body: new URLSearchParams({ url }).toString(),
  });
  if (!r.ok) return null;
  const body = await r.text();
  const html = decodeSnapsave(body);
  if (!html) return null;
  // Prefer HD; fall back to first available v2 token URL.
  const allLinks = [...html.matchAll(/https:\/\/d\.rapidcdn\.app\/v2\?token=[A-Za-z0-9._-]+/g)].map(
    (x) => x[0],
  );
  if (!allLinks.length) return null;
  // Look for the row labeled HD (720p / 1080p) to prefer it; otherwise take the first.
  const hdIdx = html.search(/720p|1080p|\(HD\)/i);
  let mediaUrl = allLinks[0];
  if (hdIdx >= 0) {
    for (const link of allLinks) {
      if (html.indexOf(link) > hdIdx - 200 && html.indexOf(link) < hdIdx + 800) {
        mediaUrl = link;
        break;
      }
    }
  }
  const thumb =
    html.match(/https:\/\/d\.rapidcdn\.app\/thumb\?token=[A-Za-z0-9._-]+/)?.[0] || "";
  const title =
    html.match(/<strong>([^<]+)<\/strong>/)?.[1]?.trim() || "Facebook Video";
  return {
    success: true,
    data: {
      media_url: mediaUrl,
      media_type: "video",
      thumbnail: thumb,
      title: title.substring(0, 100),
      author: "Facebook",
    },
  };
}

// Provider 1: social-download-all-in-one (covers FB/IG/TT/YT)
async function fetchSocialAllInOne(url: string, key: string): Promise<MediaResponse | null> {
  const r = await fetch("https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "social-download-all-in-one.p.rapidapi.com",
    },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) return null;
  const j: any = await r.json();
  const medias: any[] = j?.medias || [];
  const video = medias.find((m) => m?.type === "video" && m?.url) || medias.find((m) => m?.url);
  if (!video?.url) return null;
  return {
    success: true,
    data: {
      media_url: video.url,
      media_type: "video",
      thumbnail: j?.thumbnail || video?.thumbnail || "",
      title: (j?.title || "Facebook Video").substring(0, 100),
      author: j?.author || "Facebook",
      duration: j?.duration ? Number(j.duration) : undefined,
    },
  };
}

// Provider 2: auto-download-all-in-one-big
async function fetchAutoAllInOne(url: string, key: string): Promise<MediaResponse | null> {
  const r = await fetch("https://auto-download-all-in-one-big.p.rapidapi.com/v1/social/autolink", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "auto-download-all-in-one-big.p.rapidapi.com",
    },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) return null;
  const j: any = await r.json();
  const medias: any[] = j?.medias || [];
  const video = medias.find((m) => m?.type === "video" && m?.url) || medias.find((m) => m?.url);
  if (!video?.url) return null;
  return {
    success: true,
    data: {
      media_url: video.url,
      media_type: "video",
      thumbnail: j?.thumbnail || "",
      title: (j?.title || "Facebook Video").substring(0, 100),
      author: j?.author || "Facebook",
    },
  };
}

// Provider 3: HTML scrape (last resort)
async function tryHtmlScrape(url: string): Promise<MediaResponse | null> {
  try {
    const target = url.replace("://www.facebook.com", "://mbasic.facebook.com");
    const r = await fetch(target, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const html = await r.text();
    const hd = html.match(/"browser_native_hd_url":"([^"]+)"/)?.[1];
    const sd = html.match(/"browser_native_sd_url":"([^"]+)"/)?.[1];
    const playable = html.match(/"playable_url(?:_quality_hd)?":"([^"]+)"/)?.[1];
    const raw = hd || sd || playable;
    if (!raw) return null;
    const videoUrl = raw.replace(/\\u0025/g, "%").replace(/\\u002F/g, "/").replace(/\\\//g, "/").replace(/\\u0026/g, "&");
    const thumb = (html.match(/"thumbnailUrl":"([^"]+)"/)?.[1] ||
      html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ||
      "").replace(/\\u002F/g, "/").replace(/\\u0026/g, "&").replace(/&amp;/g, "&");
    const title = (html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || "Facebook Video").substring(0, 100);
    return {
      success: true,
      data: { media_url: videoUrl, media_type: "video", thumbnail: thumb, title, author: "Facebook" },
    };
  } catch {
    return null;
  }
}

function addProxyUrls(data: MediaData, routePath: string): MediaData {
  const baseUrl = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const proxy = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.media_url)}&type=video`;
  data.proxy_url = proxy;
  data.video_url = proxy;
  if (data.thumbnail) {
    data.proxy_thumbnail_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`;
  }
  return data;
}

async function downloadFacebookMedia(rawUrl: string, functionUrl: string, rapidApiKey: string): Promise<MediaResponse> {
  const url = await resolveFacebookUrl(rawUrl);
  const key = rapidApiKey.trim();
  const providers: Array<{ name: string; run: () => Promise<MediaResponse | null> }> = [];
  // Snapsave is free and currently the most reliable; try it first.
  providers.push({ name: "snapsave", run: () => fetchSnapsave(url) });
  if (key) {
    providers.push({ name: "social-all-in-one", run: () => fetchSocialAllInOne(url, key) });
    providers.push({ name: "auto-all-in-one", run: () => fetchAutoAllInOne(url, key) });
  }
  providers.push({ name: "html-scrape", run: () => tryHtmlScrape(url) });

  for (const p of providers) {
    try {
      const res = await p.run();
      if (res?.success && res.data?.media_url) {
        console.log(`✅ Facebook via ${p.name}`);
        res.data = addProxyUrls(res.data, functionUrl);
        return res;
      }
      console.warn(`⚠️ Facebook provider ${p.name} sem mídia`);
    } catch (e) {
      console.warn(`⚠️ Facebook provider ${p.name} falhou:`, (e as Error).message);
    }
  }

  return {
    success: false,
    error: "Não foi possível processar o vídeo do Facebook. Verifique se o link está correto e se o vídeo é público.",
  };
}

async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        Referer: "https://www.facebook.com/",
        ...(range ? { Range: range } : {}),
      },
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: "Falha ao baixar mídia" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const contentType = response.headers.get("content-type") || (mediaType === "video" ? "video/mp4" : "image/jpeg");
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
      "Content-Disposition": mediaType === "video" ? "inline" : `attachment; filename="facebook_media_${Date.now()}.jpg"`,
    });
    const cl = response.headers.get("content-length");
    const cr = response.headers.get("content-range");
    if (cl) headers.set("Content-Length", cl);
    if (cr) headers.set("Content-Range", cr);
    return new Response(response.body, { status: response.status === 206 ? 206 : 200, headers });
  } catch (error) {
    console.error("❌ [Facebook proxy] erro:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao fazer proxy" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/download-facebook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const action = requestUrl.searchParams.get("action");

        if (action === "proxy") {
          const mediaUrl = requestUrl.searchParams.get("media_url");
          const type = requestUrl.searchParams.get("type") || "video";
          if (!mediaUrl) {
            return new Response(JSON.stringify({ success: false, error: "media_url é obrigatória" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (!isSafeProxyUrl(mediaUrl)) {
            return new Response(JSON.stringify({ success: false, error: "media_url não permitida" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return handleProxy(request, mediaUrl, type);
        }

        const url = requestUrl.searchParams.get("url") || "";
        if (!isValidFacebookUrl(url)) {
          return new Response(JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Facebook" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const rapidApiKey = process.env.RAPIDAPI_KEY || "";
        const result = await downloadFacebookMedia(url, requestUrl.pathname, rapidApiKey);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },

      POST: async ({ request }) => {
        const requestUrl = new URL(request.url);
        let url = "";
        try {
          const body = await request.json();
          url = body?.url || "";
        } catch {
          url = requestUrl.searchParams.get("url") || "";
        }
        if (!isValidFacebookUrl(url)) {
          return new Response(JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Facebook" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const rapidApiKey = process.env.RAPIDAPI_KEY || "";
        const result = await downloadFacebookMedia(url, requestUrl.pathname, rapidApiKey);
        try {
          const { reportDownloaderResult } = await import("@/lib/downloader-status.server");
          reportDownloaderResult("facebook", !!result.success);
        } catch {}
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },
    },
  },
});