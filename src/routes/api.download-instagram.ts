import { createFileRoute } from "@tanstack/react-router";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface CarouselItem {
  index: number;
  media_url: string;
  media_type: "video" | "image";
  thumbnail: string;
  proxy_url?: string;
}

interface MediaData {
  media_url: string;
  media_type: "video" | "image";
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
  is_carousel?: boolean;
  carousel_items?: CarouselItem[];
}

interface MediaResponse {
  success: boolean;
  data?: MediaData;
  error?: string;
}

const RAPIDAPI_HOST = "instagram-downloader-download-instagram-videos-stories.p.rapidapi.com";

async function fetchViaRapidApi(url: string): Promise<MediaResponse | null> {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
  if (!RAPIDAPI_KEY) {
    console.warn("⚠️ RAPIDAPI_KEY não configurada.");
    return null;
  }

  try {
    const apiUrl = `https://${RAPIDAPI_HOST}/index?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();

    // Normalize various possible response shapes
    const urlList: string[] = Array.isArray(data.url_list)
      ? data.url_list
      : Array.isArray(data.media)
        ? data.media.map((m: any) => m.url || m)
        : data.url
          ? [data.url]
          : [];

    if (urlList.length === 0) return null;

    const firstUrl = urlList[0];
    const isVideo = firstUrl.includes(".mp4");

    const mediaData: MediaData = {
      media_url: firstUrl,
      media_type: isVideo ? "video" : "image",
      thumbnail: data.thumbnail || (isVideo ? "" : firstUrl),
      title: data.title || data.caption || "Instagram Media",
      author: data.author || data.owner || "Usuário",
      is_carousel: urlList.length > 1,
    };

    if (urlList.length > 1) {
      mediaData.carousel_items = urlList.map((u, i) => ({
        index: i,
        media_url: u,
        media_type: u.includes(".mp4") ? "video" : "image",
        thumbnail: u.includes(".mp4") ? "" : u,
      }));
    }

    return { success: true, data: mediaData };
  } catch (error) {
    console.error("❌ RapidAPI Error:", error);
    return null;
  }
}

async function tryDirectScrape(url: string): Promise<MediaResponse | null> {
  try {
    const shortcode = url.match(/(?:p|reel|reels)\/([A-Za-z0-9-_]+)/)?.[1];
    if (!shortcode) return null;

    const response = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    const videoMatch = html.match(/"video_url":"(.*?)"/);
    const imageMatch = html.match(/"display_url":"(.*?)"/);

    if (videoMatch && videoMatch[1]) {
      return {
        success: true,
        data: {
          media_url: videoMatch[1].replace(/\\u0026/g, "&"),
          media_type: "video",
          thumbnail: imageMatch?.[1] ? imageMatch[1].replace(/\\u0026/g, "&") : "",
          title: "Instagram Video",
          author: "Desconhecido",
        },
      };
    }

    if (imageMatch && imageMatch[1]) {
      const img = imageMatch[1].replace(/\\u0026/g, "&");
      return {
        success: true,
        data: {
          media_url: img,
          media_type: "image",
          thumbnail: img,
          title: "Instagram Image",
          author: "Desconhecido",
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}

function addProxyUrls(data: MediaData, routePath: string): MediaData {
  const baseUrl = routePath.startsWith("/") ? routePath : `/${routePath}`;
  data.proxy_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.media_url)}&type=${data.media_type}`;
  if (data.thumbnail) {
    data.proxy_thumbnail_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`;
  }
  if (data.is_carousel && data.carousel_items) {
    data.carousel_items = data.carousel_items.map((item) => ({
      ...item,
      proxy_url: `${baseUrl}?action=proxy&media_url=${encodeURIComponent(item.media_url)}&type=${item.media_type}`,
    }));
  }
  return data;
}

async function downloadInstagramMedia(url: string, functionUrl: string): Promise<MediaResponse> {
  console.log("🚀 Iniciando processo para:", url);

  const rapidResult = await fetchViaRapidApi(url);
  if (rapidResult?.success && rapidResult.data) {
    rapidResult.data = addProxyUrls(rapidResult.data, functionUrl);
    return rapidResult;
  }

  const directResult = await tryDirectScrape(url);
  if (directResult?.success && directResult.data) {
    directResult.data = addProxyUrls(directResult.data, functionUrl);
    return directResult;
  }

  return {
    success: false,
    error:
      "Falha ao baixar. O Instagram bloqueou a requisição direta. Configure uma API Key de proxy (RapidAPI) no backend para funcionar consistentemente.",
  };
}

async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const contentType =
      response.headers.get("content-type") || (mediaType === "video" ? "video/mp4" : "image/jpeg");
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000",
      "Accept-Ranges": "bytes",
      "Content-Disposition": mediaType === "video" ? "inline" : "attachment",
    });

    if (response.headers.has("content-length")) headers.set("Content-Length", response.headers.get("content-length")!);
    if (response.headers.has("content-range")) headers.set("Content-Range", response.headers.get("content-range")!);

    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error("❌ Falha no stream:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao streamar mídia" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/download-instagram")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const action = requestUrl.searchParams.get("action");

        if (action === "proxy") {
          const mediaUrl = requestUrl.searchParams.get("media_url");
          const type = requestUrl.searchParams.get("type") || "video";
          if (!mediaUrl)
            return new Response(JSON.stringify({ error: "URL falta" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          return handleProxy(request, mediaUrl, type);
        }

        const url = requestUrl.searchParams.get("url");
        if (!url || !url.includes("instagram.com")) {
          return new Response(JSON.stringify({ success: false, error: "URL inválida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const result = await downloadInstagramMedia(url, requestUrl.pathname);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },

      POST: async ({ request }) => {
        let url = "";
        try {
          const body = await request.json();
          url = body?.url || "";
        } catch {
          url = new URL(request.url).searchParams.get("url") || "";
        }

        if (!url || !url.includes("instagram.com")) {
          return new Response(JSON.stringify({ success: false, error: "URL inválida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const result = await downloadInstagramMedia(url, new URL(request.url).pathname);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },
    },
  },
});
