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
  // Compat com componentes antigos do Kwai
  video_url?: string;
}

interface MediaResponse {
  success: boolean;
  data?: MediaData;
  error?: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function getKwHeaders(sessionCookie = ""): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": pick(USER_AGENTS),
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://www.kwai.com/",
    Origin: "https://www.kwai.com",
  };
  const cookie = sessionCookie;
  if (cookie && cookie.trim()) {
    headers.Cookie = cookie.trim();
  }
  return headers;
}

function decodeJsonString(s: string): string {
  return s
    .replace(/\\u002F/gi, "/")
    .replace(/\\u0026/gi, "&")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
}

function extractMeta(html: string, property: string): string {
  const re = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
    "i",
  );
  const m = html.match(re);
  return (m?.[1] || m?.[2] || "").replace(/&amp;/g, "&");
}

async function expandShortUrl(url: string, sessionCookie = ""): Promise<string> {
  // Follow redirects on any short / share link so the canonical /video/<id> URL is used downstream.
  if (!/kw\.ai|s\.kwai\.com|\/share\/|\/short-video\/|\/p\//i.test(url)) return url;
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: getKwHeaders(sessionCookie),
      signal: AbortSignal.timeout(6000),
    });
    const finalUrl = (r.url || url).split("?")[0];
    return finalUrl;
  } catch {
    return url;
  }
}

// Method 1: scrape the page HTML (og:video + JSON blobs)
async function tryPageScrape(url: string, sessionCookie = ""): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [Kwai page] Buscando HTML...");
    const headers = { ...getKwHeaders(sessionCookie), "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" };
    const r = await fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (!r.ok) {
      console.warn("⚠️ [Kwai page] status", r.status);
      return null;
    }
    const html = await r.text();

    const ogVideo =
      extractMeta(html, "og:video") || extractMeta(html, "og:video:url") || extractMeta(html, "og:video:secure_url");
    const ogImage = extractMeta(html, "og:image");
    const ogTitle = extractMeta(html, "og:title") || "Kwai Video";
    const ogDesc = extractMeta(html, "og:description");

    let videoUrl = ogVideo;
    if (!videoUrl) {
      // JSON-LD VideoObject (current Kwai SSR shape)
      const m = html.match(/"contentUrl"\s*:\s*"([^"]+\.mp4[^"]*)"/i);
      if (m) videoUrl = decodeJsonString(m[1]);
    }
    if (!videoUrl) {
      const m = html.match(/"(?:playUrl|mainMvUrl|photoUrl|videoUrl|srcNoMark|src)"\s*:\s*"([^"]+\.mp4[^"]*)"/i);
      if (m) videoUrl = decodeJsonString(m[1]);
    }
    if (!videoUrl) {
      const m = html.match(/"playUrlV2"\s*:\s*\{[^}]*?"url"\s*:\s*"([^"]+\.mp4[^"]*)"/i);
      if (m) videoUrl = decodeJsonString(m[1]);
    }
    if (!videoUrl) {
      // Last resort: any mp4 URL on a Kwai CDN host
      const m = html.match(/https?:\\?\/\\?\/[^"'\s\\]+\.kwai\.net\\?\/[^"'\s\\]+\.mp4[^"'\s\\]*/i);
      if (m) videoUrl = decodeJsonString(m[0]).replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
    }
    if (!videoUrl) {
      const m = html.match(/https?:\\?\/\\?\/[^"'\s\\]+(?:kuaishouzt|gifshow|kwimgs|kwaicdn)\.com\\?\/[^"'\s\\]+\.mp4[^"'\s\\]*/i);
      if (m) videoUrl = decodeJsonString(m[0]).replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
    }
    if (!videoUrl) {
      const m = html.match(/<source[^>]+src=["'](https?:\/\/[^"']+\.mp4[^"']*)["']/i);
      if (m) videoUrl = m[1];
    }
    if (!videoUrl) return null;

    // Title / thumbnail from JSON-LD when og tags are absent
    let thumb = ogImage;
    if (!thumb) {
      const t = html.match(/"thumbnailUrl"\s*:\s*\[?\s*"([^"]+)"/i);
      if (t) thumb = decodeJsonString(t[1]);
    }
    let title = ogTitle;
    if (!title || title === "Kwai Video") {
      const n = html.match(/"name"\s*:\s*"([^"]{4,160})"/);
      if (n) title = n[1];
    }
    const authorMatch = title.match(/^(.*?)\s+\(@/) || title.match(/^(.*?)\s+(?:on|no|en)\s+Kwai/i) || ogDesc.match(/@([A-Za-z0-9._-]+)/);
    const author = authorMatch?.[1] || "Kwai";

    return {
      success: true,
      data: {
        media_url: videoUrl,
        media_type: "video",
        thumbnail: thumb || "",
        title: (title || "Kwai Video").substring(0, 100),
        author,
      },
    };
  } catch (e) {
    console.error("❌ [Kwai page] erro:", e);
    return null;
  }
}

// Method 2: mobile m.kwai.com / m.kuaishou.com (CN domain bypasses anti-bot harder)
async function tryMobile(url: string, sessionCookie = ""): Promise<MediaResponse | null> {
  const candidates: string[] = [];
  const mobile = url
    .replace("://www.kwai.com", "://m.kwai.com")
    .replace("://kwai.com", "://m.kwai.com");
  if (mobile !== url) candidates.push(mobile);
  // Tenta também o domínio chinês (Kuaishou) — frequentemente serve SSR completo
  const kuaishou = url
    .replace("://www.kwai.com", "://m.kuaishou.com")
    .replace("://kwai.com", "://m.kuaishou.com")
    .replace("://m.kwai.com", "://m.kuaishou.com");
  if (kuaishou !== url && !candidates.includes(kuaishou)) candidates.push(kuaishou);

  for (const c of candidates) {
    try {
      console.log("🔍 [Kwai mobile] tentando", c);
      const r = await tryPageScrape(c, sessionCookie);
      if (r?.success) return r;
    } catch (e) {
      console.error("❌ [Kwai mobile] erro:", e);
    }
  }
  return null;
}

// Method 3: GraphQL visionVideoDetail (best-effort, requires photoId)
async function tryGraphQL(url: string, sessionCookie = ""): Promise<MediaResponse | null> {
  try {
    const m = url.match(/(?:\/video\/|\/p\/|photoId=)([A-Za-z0-9_-]+)/);
    const photoId = m?.[1];
    if (!photoId) return null;

    console.log("🔍 [Kwai GraphQL] photoId =", photoId);
    const r = await fetch("https://www.kwai.com/graphql", {
      method: "POST",
      headers: {
          ...getKwHeaders(sessionCookie),
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(7000),
      body: JSON.stringify({
        operationName: "visionVideoDetail",
        variables: { photoId, page: "detail" },
        query:
          "query visionVideoDetail($photoId: String, $page: String, $webPageArea: String) {\n  visionVideoDetail(photoId: $photoId, page: $page, webPageArea: $webPageArea) {\n    status\n    author { id name __typename }\n    photo { id duration caption coverUrl photoUrl __typename }\n    __typename\n  }\n}\n",
      }),
    });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;

    const json = await r.json();
    const detail = json?.data?.visionVideoDetail;
    const photo = detail?.photo;
    if (!photo?.photoUrl) return null;

    return {
      success: true,
      data: {
        media_url: photo.photoUrl,
        media_type: "video",
        thumbnail: photo.coverUrl || "",
        title: (photo.caption || "Kwai Video").substring(0, 100),
        author: detail.author?.name || "Kwai",
        duration: photo.duration || undefined,
      },
    };
  } catch (e) {
    console.error("❌ [Kwai GraphQL] erro:", e);
    return null;
  }
}

// Method: ovosnap public parser
async function tryOvoSnap(url: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [Kwai ovosnap] tentando…");
    const r = await fetch("https://ovosnap.com/api/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": pick(USER_AGENTS),
        Origin: "https://ovosnap.com",
        Referer: "https://ovosnap.com/kuaishou",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify({ url, type: "kuaishou" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j: any = await r.json().catch(() => null);
    const videoUrl: string | undefined =
      j?.videoUrl || j?.video_url || j?.data?.videoUrl || j?.data?.url || j?.medias?.[0]?.url;
    if (!videoUrl) return null;
    return {
      success: true,
      data: {
        media_url: videoUrl,
        media_type: "video",
        thumbnail: j?.cover || j?.thumbnail || j?.data?.cover || "",
        title: (j?.title || j?.data?.title || "Kwai Video").substring(0, 100),
        author: j?.author || j?.data?.author || "Kwai",
      },
    };
  } catch (e) {
    console.error("❌ [Kwai ovosnap] erro:", e);
    return null;
  }
}

// Method: AIO-DL plugin (thedownvideo.com)
async function tryAioDl(url: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [Kwai aio-dl] tentando…");
    const r = await fetch("https://thedownvideo.com/wp-json/aio-dl/video-data/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": pick(USER_AGENTS),
        Origin: "https://thedownvideo.com",
        Referer: "https://thedownvideo.com/kwai-video-downloader",
        Accept: "*/*",
      },
      body: new URLSearchParams({ url, token: "" }).toString(),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const j: any = await r.json().catch(() => null);
    const medias: any[] = j?.medias || [];
    const mp4 = medias.find((m) => /mp4/i.test(m?.extension || m?.formattedSize || m?.url || "")) || medias[0];
    const videoUrl: string | undefined = mp4?.url;
    if (!videoUrl) return null;
    return {
      success: true,
      data: {
        media_url: videoUrl,
        media_type: "video",
        thumbnail: j?.thumbnail || j?.cover || "",
        title: (j?.title || "Kwai Video").substring(0, 100),
        author: j?.author || "Kwai",
        duration: j?.duration || undefined,
      },
    };
  } catch (e) {
    console.error("❌ [Kwai aio-dl] erro:", e);
    return null;
  }
}

function addProxyUrls(data: MediaData, routePath: string): MediaData {
  const baseUrl = routePath.startsWith("/") ? routePath : `/${routePath}`;

  const proxy = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.media_url)}&type=${data.media_type}`;
  data.proxy_url = proxy;
  data.proxy_thumbnail_url = data.thumbnail
    ? `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`
    : undefined;
  // Mantém compat com UIs que esperam `video_url`
  data.video_url = proxy;
  return data;
}

async function downloadKwaiMedia(rawUrl: string, functionUrl: string, sessionCookie = ""): Promise<MediaResponse> {
  console.log("🚀 [Kwai] download para:", rawUrl);
  const url = await expandShortUrl(rawUrl, sessionCookie);

  const methods = [
    () => tryOvoSnap(url),
    () => tryAioDl(url),
    () => tryMobile(url, sessionCookie),
    () => tryPageScrape(url, sessionCookie),
    () => tryGraphQL(url, sessionCookie),
    () => trySaveKwai(url),
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      const result = await methods[i]();
      if (result?.success && result.data) {
        result.data = addProxyUrls(result.data, functionUrl);
        return result;
      }
    } catch (e) {
      console.error(`[Kwai] método ${i + 1} falhou:`, e);
    }
  }

  return {
    success: false,
    error:
      "Não foi possível processar o vídeo do Kwai. Verifique se o link está correto e se o vídeo é público.",
  };
}

// Method 4: savekwai.com public scraper (best-effort fallback)
async function trySaveKwai(url: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [Kwai savekwai] tentando…");
    const r = await fetch("https://savekwai.com/api/ajaxSearch", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": pick(USER_AGENTS),
        Origin: "https://savekwai.com",
        Referer: "https://savekwai.com/",
        Accept: "*/*",
      },
      body: new URLSearchParams({ q: url, lang: "en" }).toString(),
      signal: AbortSignal.timeout(7000),
    });
    if (!r.ok) return null;
    const j: any = await r.json().catch(() => null);
    const html: string = j?.data || "";
    if (!html) return null;
    const mp4 = html.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/i)?.[1];
    if (!mp4) return null;
    const thumb = html.match(/<img[^>]+src="(https?:\/\/[^"]+)"/i)?.[1] || "";
    const title =
      html.match(/<h3[^>]*>([^<]+)<\/h3>/i)?.[1]?.trim() ||
      html.match(/<p[^>]*>([^<]+)<\/p>/i)?.[1]?.trim() ||
      "Kwai Video";
    return {
      success: true,
      data: {
        media_url: mp4,
        media_type: "video",
        thumbnail: thumb,
        title: title.substring(0, 100),
        author: "Kwai",
      },
    };
  } catch (e) {
    console.error("❌ [Kwai savekwai] erro:", e);
    return null;
  }
}

async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent": pick(USER_AGENTS),
        Accept: "*/*",
        Referer: "https://www.kwai.com/",
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
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
      "Content-Disposition": mediaType === "video" ? "inline" : `attachment; filename="kwai_media_${Date.now()}.jpg"`,
    });

    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    if (contentLength) headers.set("Content-Length", contentLength);
    if (contentRange) headers.set("Content-Range", contentRange);

    return new Response(response.body, {
      status: response.status === 206 ? 206 : 200,
      headers,
    });
  } catch (error) {
    console.error("❌ [Kwai proxy] erro:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao fazer proxy da mídia" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

function isValidKwaiUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(kwai\.com|kw\.ai|kwai-video\.com|kwai\.net)/i.test(url);
}

export const Route = createFileRoute("/api/download-kwai")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const action = requestUrl.searchParams.get("action");

          if (action === "proxy") {
            const mediaUrl = requestUrl.searchParams.get("media_url");
            const mediaType = requestUrl.searchParams.get("type") || "video";
            if (!mediaUrl) {
              return new Response(
                JSON.stringify({ success: false, error: "media_url é obrigatória" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
            if (!isSafeProxyUrl(mediaUrl)) {
              return new Response(
                JSON.stringify({ success: false, error: "media_url não permitida" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
            return handleProxy(request, mediaUrl, mediaType);
          }

          const url = requestUrl.searchParams.get("url") || "";
          if (!url) {
            return new Response(JSON.stringify({ success: false, error: "URL é obrigatória" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (!isValidKwaiUrl(url)) {
            return new Response(
              JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Kwai" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const sessionCookie = process.env.KWAI_SESSION_COOKIE || "";
          const result = await downloadKwaiMedia(url, requestUrl.pathname, sessionCookie);
          try {
            try {
              const { reportDownloaderResult } = await import("@/lib/downloader-status.server");
              reportDownloaderResult("kwai", !!result.success);
            } catch (e) {
              console.warn("Failed to report status:", e);
            }
          } catch {}
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("❌ [Kwai] erro geral:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const body = await request.json().catch(() => ({} as Record<string, unknown>));
          const url = ((body as { url?: string }).url || "").trim();

          if (!url) {
            return new Response(JSON.stringify({ success: false, error: "URL é obrigatória" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (!isValidKwaiUrl(url)) {
            return new Response(
              JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Kwai" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const sessionCookie = process.env.KWAI_SESSION_COOKIE || "";
          const result = await downloadKwaiMedia(url, requestUrl.pathname, sessionCookie);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("❌ [Kwai] erro geral POST:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
