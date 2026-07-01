import { createFileRoute } from "@tanstack/react-router";

function isSafeProxyUrl(u: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== "https:") return false;
    return (
      /(^|\.)pinimg\.com$/i.test(url.hostname) ||
      /(^|\.)pinterest\.[a-z.]+$/i.test(url.hostname) ||
      /(^|\.)rapidcdn\.app$/i.test(url.hostname) ||
      /(^|\.)snapsave\.app$/i.test(url.hostname)
    );
  } catch {
    return false;
  }
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

type MediaType = "video" | "image" | "gif";

interface PinterestData {
  media_url: string;
  media_type: MediaType;
  thumbnail: string;
  title: string;
  author: string;
  proxy_url?: string;
  video_url?: string;
  proxy_thumbnail_url?: string;
}

interface PinterestResponse {
  success: boolean;
  data?: PinterestData;
  error?: string;
}

// UA usado para BAIXAR o pin (Chrome real, evita bloqueio de hotlink no pinimg.com)
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// UA usado para SCRAPING da página do pin. O Pinterest só devolve as meta
// tags og:* para crawlers conhecidos; com Chrome UA volta uma SPA vazia.
const BOT_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

function isValidPinterestUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(pinterest\.[a-z.]+|pin\.it)/i.test(url);
}

async function resolveShortLink(url: string): Promise<string> {
  try {
    if (!/pin\.it/i.test(url)) return url;
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": BROWSER_UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
    });
    if (r.url && /pinterest\.[a-z.]+\//i.test(r.url)) return r.url.split("?")[0];
  } catch {}
  return url;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function scrapePinterest(url: string): Promise<PinterestResponse> {
  const r = await fetch(url, {
    headers: {
      "User-Agent": BOT_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
    redirect: "follow",
  });
  if (!r.ok) {
    return { success: false, error: "Pin não encontrado ou indisponível." };
  }
  const html = await r.text();

  const ogVideo =
    html.match(/<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:video:url["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+property=["']og:video:secure_url["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    null;

  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;

  const ogTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    "Pinterest";

  // Tenta achar o melhor mp4 dentro do JSON embutido
  let bestVideo: string | null = null;
  const videoListMatch = html.match(/"video_list"\s*:\s*\{([\s\S]*?)\}\s*,/);
  if (videoListMatch) {
    const urls = [...videoListMatch[1].matchAll(/"url"\s*:\s*"([^"]+\.(?:mp4|m3u8))"/gi)].map(
      (m) => m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"),
    );
    const mp4s = urls.filter((u) => u.endsWith(".mp4"));
    if (mp4s.length) bestVideo = mp4s[mp4s.length - 1];
  }

  let mediaUrl = bestVideo || ogVideo || "";
  let mediaType: MediaType = mediaUrl ? "video" : "image";

  if (!mediaUrl && ogImage) {
    // Promove para /originals/ (resolução máxima)
    mediaUrl = ogImage.replace(/\/\d+x(?:\d+)?\//, "/originals/");
  }

  if (!mediaUrl) {
    return {
      success: false,
      error: "Não foi possível extrair a mídia desse pin. Verifique se ele é público.",
    };
  }

  if (mediaType === "image" && /\.gif(\?|$)/i.test(mediaUrl)) {
    mediaType = "gif";
  }

  return {
    success: true,
    data: {
      media_url: decodeEntities(mediaUrl),
      media_type: mediaType,
      thumbnail: decodeEntities(ogImage || mediaUrl),
      title: decodeEntities(ogTitle).substring(0, 100),
      author: "Pinterest",
    },
  };
}

// Provider 0: Pidgets — API pública oficial do próprio Pinterest.
// Retorna JSON com images + videos.video_list mesmo sem autenticação, sem
// depender do HTML SPA (que hoje vem vazio para bots).
function extractPinIdFromUrl(u: string): string | null {
  const m = u.match(/\/pin\/(?:[^/]+--)?(\d{6,})/);
  return m ? m[1] : null;
}
function pickBestPidgetsImage(images: any): string | null {
  if (!images) return null;
  const orig = images.orig?.url || images.originals?.url;
  if (orig) return orig;
  const keys = Object.keys(images).sort((a, b) => {
    const na = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return nb - na;
  });
  return keys.length ? images[keys[0]]?.url || null : null;
}
function pickBestVideoUrl(videoList: any): string | null {
  if (!videoList) return null;
  const entries = Object.values(videoList) as any[];
  const mp4 = entries
    .filter((v) => v?.url && /\.mp4(\?|$)/i.test(v.url))
    .sort((a, b) => (b?.width || 0) - (a?.width || 0));
  return mp4[0]?.url || entries.find((v) => v?.url)?.url || null;
}
async function fetchPidgets(url: string): Promise<PinterestResponse | null> {
  const pinId = extractPinIdFromUrl(url);
  if (!pinId) return null;
  const r = await fetch(
    `https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=${encodeURIComponent(pinId)}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": BROWSER_UA,
        Origin: "https://www.pinterest.com",
        Referer: "https://www.pinterest.com/",
      },
    },
  );
  if (!r.ok) return null;
  const j: any = await r.json().catch(() => null);
  const pin: any = j?.data?.[0];
  if (!pin || pin.error) return null;

  let videoUrl: string | null = null;
  if (pin.videos?.video_list) videoUrl = pickBestVideoUrl(pin.videos.video_list);
  if (!videoUrl && pin.story_pin_data?.pages?.length) {
    for (const page of pin.story_pin_data.pages) {
      for (const block of page.blocks || []) {
        if (block.video?.video_list) {
          const v = pickBestVideoUrl(block.video.video_list);
          if (v) { videoUrl = v; break; }
        }
      }
      if (videoUrl) break;
    }
  }

  const imageUrl = pickBestPidgetsImage(pin.images);
  const mediaUrl = videoUrl || imageUrl;
  if (!mediaUrl) return null;

  let mediaType: MediaType = videoUrl ? "video" : "image";
  if (mediaType === "image" && /\.gif(\?|$)/i.test(mediaUrl)) mediaType = "gif";

  const title = (pin.grid_title || pin.title || pin.description || "Pinterest").toString().substring(0, 100);
  return {
    success: true,
    data: {
      media_url: decodeEntities(mediaUrl),
      media_type: mediaType,
      thumbnail: decodeEntities(imageUrl || mediaUrl),
      title: decodeEntities(title),
      author: "Pinterest",
    },
  };
}

// Provider 1: RapidAPI social-download-all-in-one (mesmo do Facebook)
async function fetchSocialAllInOne(url: string, key: string): Promise<PinterestResponse | null> {
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
  const video = medias.find((m) => m?.type === "video" && m?.url);
  const media = video || medias.find((m) => m?.url);
  if (!media?.url) return null;
  const mediaType: MediaType = video ? "video" : /\.gif(\?|$)/i.test(media.url) ? "gif" : "image";
  return {
    success: true,
    data: {
      media_url: media.url,
      media_type: mediaType,
      thumbnail: j?.thumbnail || media?.thumbnail || media.url,
      title: (j?.title || "Pinterest").substring(0, 100),
      author: j?.author || "Pinterest",
    },
  };
}

// Provider 2: RapidAPI auto-download-all-in-one-big (mesmo do Facebook)
async function fetchAutoAllInOne(url: string, key: string): Promise<PinterestResponse | null> {
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
  const video = medias.find((m) => m?.type === "video" && m?.url);
  const media = video || medias.find((m) => m?.url);
  if (!media?.url) return null;
  const mediaType: MediaType = video ? "video" : /\.gif(\?|$)/i.test(media.url) ? "gif" : "image";
  return {
    success: true,
    data: {
      media_url: media.url,
      media_type: mediaType,
      thumbnail: j?.thumbnail || media.url,
      title: (j?.title || "Pinterest").substring(0, 100),
      author: j?.author || "Pinterest",
    },
  };
}

function addProxyUrls(data: PinterestData, routePath: string): PinterestData {
  const base = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const type = data.media_type === "video" ? "video" : "image";
  data.proxy_url = `${base}?action=proxy&media_url=${encodeURIComponent(data.media_url)}&type=${type}`;
  if (data.media_type === "video") data.video_url = data.proxy_url;
  if (data.thumbnail) {
    data.proxy_thumbnail_url = `${base}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`;
  }
  return data;
}

async function downloadPinterest(rawUrl: string, functionUrl: string): Promise<PinterestResponse> {
  const url = await resolveShortLink(rawUrl);
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const providers: Array<{ name: string; run: () => Promise<PinterestResponse | null> }> = [
    { name: "pidgets", run: () => fetchPidgets(url) },
  ];
  if (key) {
    providers.push({ name: "social-all-in-one", run: () => fetchSocialAllInOne(url, key) });
    providers.push({ name: "auto-all-in-one", run: () => fetchAutoAllInOne(url, key) });
  }
  providers.push({ name: "html-scrape", run: () => scrapePinterest(url) });

  for (const p of providers) {
    try {
      const res = await p.run();
      if (res?.success && res.data?.media_url) {
        console.log(`✅ Pinterest via ${p.name}`);
        res.data = addProxyUrls(res.data, functionUrl);
        return res;
      }
      console.warn(`⚠️ Pinterest provider ${p.name} sem mídia`);
    } catch (e) {
      console.warn(`⚠️ Pinterest provider ${p.name} falhou:`, (e as Error).message);
    }
  }

  return {
    success: false,
    error: "Não foi possível processar o pin. Verifique se o link está correto e se o pin é público.",
  };
}

async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "*/*",
        Referer: "https://www.pinterest.com/",
        ...(range ? { Range: range } : {}),
      },
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: "Falha ao baixar mídia" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const contentType =
      response.headers.get("content-type") ||
      (mediaType === "video" ? "video/mp4" : "image/jpeg");
    const ext = mediaType === "video" ? "mp4" : contentType.includes("gif") ? "gif" : "jpg";
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
      "Content-Disposition":
        mediaType === "video" ? "inline" : `attachment; filename="pinterest_${Date.now()}.${ext}"`,
    });
    const cl = response.headers.get("content-length");
    const cr = response.headers.get("content-range");
    if (cl) headers.set("Content-Length", cl);
    if (cr) headers.set("Content-Range", cr);
    return new Response(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("❌ [Pinterest proxy] erro:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao fazer proxy" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/download-pinterest")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const action = requestUrl.searchParams.get("action");

        if (action === "proxy") {
          const mediaUrl = requestUrl.searchParams.get("media_url");
          const type = requestUrl.searchParams.get("type") || "image";
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
        if (!isValidPinterestUrl(url)) {
          return new Response(JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Pinterest" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const result = await downloadPinterest(url, requestUrl.pathname);
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
        if (!isValidPinterestUrl(url)) {
          return new Response(JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Pinterest" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const result = await downloadPinterest(url, requestUrl.pathname);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },
    },
  },
});
    
