import { createFileRoute } from "@tanstack/react-router";

const UA =
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

interface TikTokData {
  video_urls: { hd: string; sd: string; watermark: string };
  audio_url: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
}

// Method 1: tikwm GET
async function tryTikwmGet(url: string): Promise<TikTokData | null> {
  try {
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const resp = await fetch(apiUrl, {
      headers: { "User-Agent": UA, Accept: "application/json" },
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

export const Route = createFileRoute("/api/download-tiktok")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      },
      POST: async ({ request }) => {
        try {
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
            () => tryTiklydown(url),
          ];

          for (const method of methods) {
            const result = await method();
            if (result && result.video_urls.hd) {
              return Response.json(
                { success: true, data: result },
                { headers: corsHeaders() }
              );
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
              error: error.message || "Erro ao processar vídeo do TikTok",
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
