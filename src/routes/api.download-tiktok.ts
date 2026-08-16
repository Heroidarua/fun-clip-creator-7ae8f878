import { createFileRoute } from "@tanstack/react-router";
import { isSafeProxyUrl } from "@/lib/proxy-url-guard";

const UA =
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

interface TikTokData {
  video_urls: { hd: string; sd: string; watermark: string };
  audio_url: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  proxy_video_url?: string;
  proxy_audio_url?: string;
  proxy_thumbnail_url?: string;
}

// Method 1: tikwm GET
async function tryTikwmGet(url: string): Promise<TikTokData | null> {
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const resp = await fetch(apiUrl, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    if (json.code !== 0 || !json.data) return null;
    return mapTikwm(json.data);
  } catch (e) {
    console.error("[tikwm GET]", e);
    return null;
  }
}

// Method 2: tikwm POST (different rate-limit pool)
async function tryTikwmPost(url: string): Promise<TikTokData | null> {
  try {
    const resp = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}&hd=1`,
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    if (json.code !== 0 || !json.data) return null;
    return mapTikwm(json.data);
  } catch (e) {
    console.error("[tikwm POST]", e);
    return null;
  }
}

// Method 3: tiklydown
async function tryTiklydown(url: string): Promise<TikTokData | null> {
  try {
    const apiUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`;
    const resp = await fetch(apiUrl, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const video = json?.video;
    if (!video?.noWatermark && !video?.watermark) return null;
    return {
      video_urls: {
        hd: video.noWatermark || video.watermark || "",
        sd: video.noWatermark || video.watermark || "",
        watermark: video.watermark || "",
      },
      audio_url: json?.music?.play_url || "",
      title: json?.title || "TikTok Video",
      author: json?.author?.name || json?.author?.unique_id || "Unknown",
      duration: json?.video?.duration || 0,
      thumbnail: json?.video?.cover || "",
    };
  } catch (e) {
    console.error("[tiklydown]", e);
    return null;
  }
}

// Method 4: ssstik.io scrape (robust fallback)
async function trySsstik(url: string): Promise<TikTokData | null> {
  try {
    const resp = await fetch("https://ssstik.io/abc?url=dl", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://ssstik.io",
        Referer: "https://ssstik.io/en",
      },
      body: `id=${encodeURIComponent(url)}&locale=en&tt=XXX`,
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const html = await resp.text();
    const links = Array.from(
      html.matchAll(/https:\/\/tikcdn\.io\/[^"\s)]+/g),
    ).map((m) => m[0]);
    const videoUrl = links.find((l) => /\/ssstik\/\d+\?/.test(l));
    if (!videoUrl) return null;
    const audioUrl = links.find((l) => /\/ssstik\/m\//.test(l)) || "";
    const coverUrl = links.find((l) => /\/ssstik\/p\//.test(l)) || "";
    const titleMatch = html.match(
      /<p class="maintext">([\s\S]*?)<\/p>/,
    );
    const authorMatch = html.match(/<h2>([\s\S]*?)<\/h2>/);
    return {
      video_urls: { hd: videoUrl, sd: videoUrl, watermark: "" },
      audio_url: audioUrl,
      title: (titleMatch?.[1] || "TikTok Video").trim(),
      author: (authorMatch?.[1] || "Unknown").trim(),
      duration: 0,
      thumbnail: coverUrl,
    };
  } catch (e) {
    console.error("[ssstik]", e);
    return null;
  }
}

function mapTikwm(d: any): TikTokData {
  const tikwmBase = "https://www.tikwm.com";
  const prefixUrl = (path: string) =>
    path?.startsWith("http") ? path : `${tikwmBase}${path}`;
  return {
    video_urls: {
      hd: d.hdplay ? prefixUrl(d.hdplay) : prefixUrl(d.play),
      sd: prefixUrl(d.play),
      watermark: d.wmplay ? prefixUrl(d.wmplay) : "",
    },
    audio_url: d.music ? prefixUrl(d.music) : "",
    title: d.title || "TikTok Video",
    author: d.author?.nickname || d.author?.unique_id || "Unknown",
    duration: d.duration || 0,
    thumbnail: d.cover ? prefixUrl(d.cover) : d.origin_cover || "",
  };
}

function addProxyUrls(data: TikTokData, routePath: string): TikTokData {
  const baseUrl = routePath.startsWith("/") ? routePath : `/${routePath}`;

  data.proxy_video_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.video_urls.hd || data.video_urls.sd)}&type=video`;

  if (data.thumbnail) {
    data.proxy_thumbnail_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`;
  }

  if (data.audio_url) {
    data.proxy_audio_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.audio_url)}&type=audio`;
  }

  return data;
}

async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        Referer: "https://www.tiktok.com/",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: "Falha ao baixar mídia" }), {
        status: 200,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("content-type") ||
      (mediaType === "audio" ? "audio/mpeg" : "video/mp4");
    const headers = new Headers({
      ...corsHeaders(),
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
      "Content-Disposition": "inline",
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
    console.error("TikTok proxy error:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao fazer proxy da mídia" }), {
      status: 200,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/download-tiktok")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      },
      GET: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const action = requestUrl.searchParams.get("action");

          if (action === "proxy") {
            const mediaUrl = requestUrl.searchParams.get("media_url");
            const mediaType = requestUrl.searchParams.get("type") || "video";

            if (!mediaUrl) {
              return Response.json(
                { success: false, error: "media_url é obrigatória" },
                { status: 200, headers: corsHeaders() },
              );
            }

            if (!isSafeProxyUrl(mediaUrl)) {
              return Response.json(
                { success: false, error: "media_url não permitida" },
                { status: 400, headers: corsHeaders() },
              );
            }

            return handleProxy(request, mediaUrl, mediaType);
          }

          return Response.json(
            { success: false, error: "Ação inválida" },
            { status: 200, headers: corsHeaders() },
          );
        } catch (error: any) {
          return Response.json(
            { success: false, error: "Erro ao processar requisição" },
            { status: 200, headers: corsHeaders() },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const body = await request.json();
          const url = body?.url?.trim();

          if (!url || !url.includes("tiktok.com")) {
            return Response.json(
              { success: false, error: "URL do TikTok inválida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          const methods: Array<() => Promise<TikTokData | null>> = [
            () => tryTikwmPost(url),
            () => tryTikwmGet(url),
            () => trySsstik(url),
            () => tryTiklydown(url),
          ];

          for (const method of methods) {
            const result = await method();
            if (result && result.video_urls.hd) {
              const data = addProxyUrls(result, requestUrl.pathname);
              try {
                const { reportDownloaderResult } = await import("@/lib/downloader-status.server");
                reportDownloaderResult("tiktok", true);
              } catch (e) {
                console.warn("Failed to report status:", e);
              }
              return Response.json(
                { success: true, data },
                { headers: corsHeaders() }
              );
            }
          }

          {
            try {
              const { reportDownloaderResult } = await import("@/lib/downloader-status.server");
              reportDownloaderResult("tiktok", false);
            } catch (e) {
              console.warn("Failed to report status:", e);
            }
          }
          return Response.json(
            {
              success: false,
              error:
                "Não foi possível processar o vídeo. Todos os provedores estão indisponíveis no momento — tente novamente em alguns minutos.",
            },
            { status: 200, headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("TikTok download error:", error);
          return Response.json(
            {
              success: false,
              error: "Erro ao processar vídeo do TikTok",
            },
            { status: 200, headers: corsHeaders() }
          );
        }
      },
    },
  },
});

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
