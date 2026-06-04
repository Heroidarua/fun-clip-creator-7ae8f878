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
  proxy_thumbnail_url?: string;
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

const USER_AGENTS = [
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function getIgHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": pick(USER_AGENTS),
    Accept: "*/*",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Referer: "https://www.instagram.com/",
    Origin: "https://www.instagram.com",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
  };
  const cookie = process.env.IG_SESSION_COOKIE;
  if (cookie && cookie.trim()) {
    headers.Cookie = cookie.trim();
  }
  return headers;
}

function getInstagramId(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:p|reel|reels)\/([A-Za-z0-9-_]+)/,
    /instagr\.am\/p\/([A-Za-z0-9-_]+)/,
  ];
  for (const regex of patterns) {
    const match = url.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

function isStoryUrl(url: string): boolean {
  return url.includes("/stories/");
}

function extractStoryId(url: string): string | null {
  const match = url.match(/stories\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

// Method 1: Instagram API v1 (posts/reels) - with carousel support
async function tryApiV1(shortcode: string, functionUrl: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [API v1] Tentando /api/v1/media/...");
    const apiUrl = `https://www.instagram.com/api/v1/media/${shortcode}/info/`;
    const response = await fetch(apiUrl, { headers: getIgHeaders() });

    if (!response.ok) {
      console.warn("⚠️ [API v1] Non-OK response:", response.status);
      return null;
    }

    const data = await response.json();
    const items = data.items;
    if (!items || items.length === 0) return null;

    const media = items[0];
    const username = media.user?.username || "Usuário";
    const caption = media.caption?.text || "Instagram Media";

    // Handle carousel
    if (media.carousel_media && media.carousel_media.length > 0) {
      console.log(`✅ [API v1] Carousel com ${media.carousel_media.length} itens`);
      const carouselItems: CarouselItem[] = media.carousel_media.map((item: any, index: number) => {
        const isVideo = !!item.video_versions;
        const mediaUrl = isVideo
          ? item.video_versions[0].url
          : item.image_versions2.candidates[0].url;
        return {
          index,
          media_url: mediaUrl,
          media_type: isVideo ? "video" as const : "image" as const,
          thumbnail: item.image_versions2?.candidates?.[0]?.url || "",
        };
      });

      const firstItem = carouselItems[0];
      return {
        success: true,
        data: {
          media_url: firstItem.media_url,
          media_type: firstItem.media_type,
          thumbnail: firstItem.thumbnail,
          title: caption.substring(0, 100),
          author: username,
          is_carousel: true,
          carousel_items: carouselItems,
        },
      };
    }

    const isVideo = !!media.video_versions;
    const mediaUrl = isVideo
      ? media.video_versions[0].url
      : media.image_versions2.candidates[0].url;

    return {
      success: true,
      data: {
        media_url: mediaUrl,
        media_type: isVideo ? "video" : "image",
        thumbnail: media.image_versions2?.candidates?.[0]?.url || "",
        title: caption.substring(0, 100),
        author: username,
        duration: media.video_duration || undefined,
        is_carousel: false,
      },
    };
  } catch (error) {
    console.error("❌ [API v1] Error:", error);
    return null;
  }
}

// Method 2: Instagram API v1 (stories)
async function tryStoryApiV1(storyId: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [API v1 Stories] Tentando...");
    const apiUrl = `https://www.instagram.com/api/v1/feed/reels_media/?reel_ids=${storyId}`;
    const response = await fetch(apiUrl, { headers: getIgHeaders() });

    if (!response.ok) return null;

    const data = await response.json();
    const reelsMedia = data.reels_media;
    if (!reelsMedia || reelsMedia.length === 0 || !reelsMedia[0].items?.length) return null;

    const item = reelsMedia[0].items[0];
    const isVideo = !!item.video_versions;
    const mediaUrl = isVideo
      ? item.video_versions[0].url
      : item.image_versions2.candidates[0].url;

    return {
      success: true,
      data: {
        media_url: mediaUrl,
        media_type: isVideo ? "video" : "image",
        thumbnail: item.image_versions2?.candidates?.[0]?.url || "",
        title: "Instagram Story",
        author: reelsMedia[0].user?.username || "Usuário",
        is_carousel: false,
      },
    };
  } catch (error) {
    console.error("❌ [API v1 Stories] Error:", error);
    return null;
  }
}

// Method 3: GraphQL endpoint - with carousel support
async function tryGraphQL(shortcode: string, functionUrl: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [GraphQL] Tentando endpoint GraphQL...");
    const docId = "8845758582119845";
    const variables = JSON.stringify({
      shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null,
    });

    const graphqlUrl = `https://www.instagram.com/graphql/query/?doc_id=${docId}&variables=${encodeURIComponent(variables)}`;
    const response = await fetch(graphqlUrl, { headers: getIgHeaders() });

    if (!response.ok) return null;

    const data = await response.json();
    const media = data.data?.xdt_shortcode_media;
    if (!media) return null;

    const username = media.owner?.username || "Usuário";
    const caption = media.edge_media_to_caption?.edges?.[0]?.node?.text || "Instagram Media";

    // Handle carousel
    if (media.edge_sidecar_to_children?.edges?.length > 0) {
      console.log(`✅ [GraphQL] Carousel com ${media.edge_sidecar_to_children.edges.length} itens`);
      const carouselItems: CarouselItem[] = media.edge_sidecar_to_children.edges.map((edge: any, index: number) => {
        const node = edge.node;
        const isVideo = node.is_video;
        return {
          index,
          media_url: isVideo ? node.video_url : node.display_url,
          media_type: isVideo ? "video" as const : "image" as const,
          thumbnail: node.display_url || "",
        };
      });

      const firstItem = carouselItems[0];
      return {
        success: true,
        data: {
          media_url: firstItem.media_url,
          media_type: firstItem.media_type,
          thumbnail: firstItem.thumbnail,
          title: caption.substring(0, 100),
          author: username,
          is_carousel: true,
          carousel_items: carouselItems,
        },
      };
    }

    const isVideo = media.is_video;
    return {
      success: true,
      data: {
        media_url: isVideo ? media.video_url : media.display_url,
        media_type: isVideo ? "video" : "image",
        thumbnail: media.display_url || "",
        title: caption.substring(0, 100),
        author: username,
        duration: media.video_duration || undefined,
        is_carousel: false,
      },
    };
  } catch (error) {
    console.error("❌ [GraphQL] Error:", error);
    return null;
  }
}

// Method 4: OpenGraph meta tags
async function tryOpenGraph(url: string): Promise<MediaResponse | null> {
  try {
    console.log("🔍 [OpenGraph] Buscando meta tags...");
    const response = await fetch(url, {
      headers: {
        ...getIgHeaders(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    const extractMeta = (property: string): string => {
      const re = new RegExp(
        `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
        "i",
      );
      const match = html.match(re);
      return (match?.[1] || match?.[2] || "").replace(/&amp;/g, "&");
    };

    const ogVideo = extractMeta("og:video") || extractMeta("og:video:secure_url");
    const ogImage = extractMeta("og:image");
    const ogTitle = extractMeta("og:title") || "Instagram Media";
    const authorMatch = ogTitle.match(/^([^\s]+)\s+on\s+Instagram/i);
    const author = authorMatch?.[1] || "Usuário";

    if (ogVideo) {
      return {
        success: true,
        data: {
          media_url: ogVideo,
          media_type: "video",
          thumbnail: ogImage || "",
          title: ogTitle.substring(0, 100),
          author,
          is_carousel: false,
        },
      };
    }

    if (ogImage) {
      return {
        success: true,
        data: {
          media_url: ogImage,
          media_type: "image",
          thumbnail: ogImage,
          title: ogTitle.substring(0, 100),
          author,
          is_carousel: false,
        },
      };
    }

    return null;
  } catch (error) {
    console.error("❌ [OpenGraph] Error:", error);
    return null;
  }
}

// Add proxy URLs to media data
function addProxyUrls(data: MediaData, routePath: string): MediaData {
  const baseUrl = routePath.startsWith("/") ? routePath : `/${routePath}`;

  data.proxy_url = `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.media_url)}&type=${data.media_type}`;
  data.proxy_thumbnail_url = data.thumbnail
    ? `${baseUrl}?action=proxy&media_url=${encodeURIComponent(data.thumbnail)}&type=image`
    : undefined;

  if (data.is_carousel && data.carousel_items) {
    data.carousel_items = data.carousel_items.map((item) => ({
      ...item,
      proxy_url: `${baseUrl}?action=proxy&media_url=${encodeURIComponent(item.media_url)}&type=${item.media_type}`,
      proxy_thumbnail_url: item.thumbnail
        ? `${baseUrl}?action=proxy&media_url=${encodeURIComponent(item.thumbnail)}&type=image`
        : undefined,
    }));
  }

  return data;
}

async function downloadInstagramMedia(url: string, functionUrl: string): Promise<MediaResponse> {
  console.log("🚀 Iniciando download para:", url);

  if (isStoryUrl(url)) {
    const storyId = extractStoryId(url);
    if (!storyId) return { success: false, error: "URL de story inválida" };

    const methods = [() => tryStoryApiV1(storyId), () => tryOpenGraph(url)];
    for (let i = 0; i < methods.length; i++) {
      try {
        const result = await methods[i]();
        if (result?.success && result.data) {
          result.data = addProxyUrls(result.data, functionUrl);
          return result;
        }
      } catch (error) {
        console.error(`Método ${i + 1} falhou:`, error);
      }
    }
    return { success: false, error: "Não foi possível baixar o Story. Stories precisam ser públicos e ativos." };
  }

  const shortcode = getInstagramId(url);
  if (!shortcode) return { success: false, error: "URL inválida do Instagram" };

  console.log("✅ Shortcode extraído:", shortcode);

  const methods = [
    () => tryApiV1(shortcode, functionUrl),
    () => tryGraphQL(shortcode, functionUrl),
    () => tryOpenGraph(url),
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      const result = await methods[i]();
      if (result?.success && result.data) {
        result.data = addProxyUrls(result.data, functionUrl);
        return result;
      }
    } catch (error) {
      console.error(`Método ${i + 1} falhou:`, error);
    }
  }

  return {
    success: false,
    error: "Não foi possível processar a mídia. Verifique se o link está correto e se o perfil é público.",
  };
}

// Proxy handler: streams media content directly
async function handleProxy(request: Request, mediaUrl: string, mediaType: string): Promise<Response> {
  try {
    const range = request.headers.get("range");
    const response = await fetch(mediaUrl, {
      method: "GET",
      headers: {
        "User-Agent": pick(USER_AGENTS),
        Accept: "*/*",
        Referer: "https://www.instagram.com/",
        ...(range ? { Range: range } : {}),
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: "Falha ao baixar mídia" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("content-type") ||
      (mediaType === "video" ? "video/mp4" : "image/jpeg");
    const headers = new Headers({
      ...corsHeaders,
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Accept-Ranges": response.headers.get("accept-ranges") || "bytes",
      "Content-Disposition": mediaType === "video" ? "inline" : `attachment; filename="instagram_media_${Date.now()}.jpg"`,
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
    console.error("❌ [Proxy] Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Erro ao fazer proxy da mídia" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

export const Route = createFileRoute("/api/download-instagram")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, { status: 204, headers: corsHeaders });
      },

      GET: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          const action = requestUrl.searchParams.get("action");

          // Proxy action
          if (action === "proxy") {
            const mediaUrl = requestUrl.searchParams.get("media_url");
            const mediaType = requestUrl.searchParams.get("type") || "video";
            if (!mediaUrl) {
              return new Response(
                JSON.stringify({ success: false, error: "media_url é obrigatória" }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
              );
            }
            return handleProxy(request, mediaUrl, mediaType);
          }

          // Fetch media info via GET
          const url = requestUrl.searchParams.get("url") || "";
          if (!url) {
            return new Response(JSON.stringify({ success: false, error: "URL é obrigatória" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const validUrlRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/;
          if (!validUrlRegex.test(url)) {
            return new Response(
              JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Instagram" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const result = await downloadInstagramMedia(url, requestUrl.pathname);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("❌ Erro geral:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const requestUrl = new URL(request.url);
          let url = "";

          try {
            const body = await request.json();
            url = (body?.url as string)?.trim() || "";
          } catch {
            url = requestUrl.searchParams.get("url") || "";
          }

          if (!url) {
            return new Response(JSON.stringify({ success: false, error: "URL é obrigatória" }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const validUrlRegex = /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)/;
          if (!validUrlRegex.test(url)) {
            return new Response(
              JSON.stringify({ success: false, error: "Por favor, insira uma URL válida do Instagram" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const result = await downloadInstagramMedia(url, requestUrl.pathname);

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (error) {
          console.error("❌ Erro geral:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Erro interno do servidor" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
