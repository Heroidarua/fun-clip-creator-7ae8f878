import { createFileRoute } from "@tanstack/react-router";
import { isSafeProxyUrl } from "@/lib/proxy-url-guard";
import { callSnapsave } from "@/lib/snapsave.server";

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

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Resolve /share/ and other shortened links to canonical /p/ /reel/ /tv/.
async function resolveInstagramUrl(url: string): Promise<string> {
  try {
    if (!/\/share\//i.test(url) && !/instagr\.am/i.test(url)) return url;
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8" },
    });
    if (r.url && /instagram\.com\/.*(p|reel|reels|tv)\//i.test(r.url)) {
      return r.url.split("?")[0];
    }
  } catch {}
  return url;
}

// Snapsave supports Instagram public posts/reels and decodes without eval.
async function fetchInstagramSnapsave(url: string): Promise<MediaResponse | null> {
  const res = await callSnapsave(url);
  if (!res?.medias?.length) return null;
  const videos = res.medias.filter((m) => m.type === "video");
  const images = res.medias.filter((m) => m.type === "image" && !/thumb/i.test(m.url));
  const picked = videos[0] || images[0];
  if (!picked) return null;
  const out: MediaData = {
    media_url: picked.url,
    media_type: picked.type,
    thumbnail: picked.thumbnail || res.thumbnail || "",
    title: (res.title || "Instagram Media").substring(0, 100),
    author: "Instagram",
  };
  const all = [...videos, ...images];
  if (all.length > 1) {
    out.is_carousel = true;
    out.carousel_items = all.map((m, i) => ({
      index: i,
      media_url: m.url,
      media_type: m.type,
      thumbnail: m.thumbnail || res.thumbnail || "",
    }));
  }
  return { success: true, data: out };
}

async function resolveUsernameFromEmbed(shortcode: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/\?utm_source=ig_embed/) ||
      html.match(/class="UsernameText"[^>]*>([a-zA-Z0-9_.]+)</) ||
      html.match(/"username":"([a-zA-Z0-9_.]+)"/);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

// ---- RapidAPI providers (tried in order; first success wins) ----

async function fetchInstagram120(url: string, key: string, shortcode: string): Promise<MediaResponse | null> {
  let normalizedUrl = url;
  if (!/instagram\.com\/[a-zA-Z0-9_.]+\/(p|reel|reels|tv)\//.test(url)) {
    const username = await resolveUsernameFromEmbed(shortcode);
    if (!username) return null;
    normalizedUrl = `https://www.instagram.com/${username}/p/${shortcode}/`;
  }
  const response = await fetch("https://instagram120.p.rapidapi.com/api/instagram/links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "instagram120.p.rapidapi.com",
    },
    body: JSON.stringify({ url: normalizedUrl }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const items: any[] = Array.isArray(data) ? data : data?.result || [];
  if (!items.length) return null;

  type Extracted = { media_url: string; media_type: "video" | "image"; thumbnail: string };
  const extracted: Extracted[] = [];
  for (const item of items) {
    const urls = Array.isArray(item?.urls) ? item.urls : [];
    const sorted = [...urls].sort((a: any, b: any) => (b?.quality || 0) - (a?.quality || 0));
    const best = sorted[0];
    if (!best?.url) continue;
    const ext = String(best.extension || "").toLowerCase();
    const isVideo = ext === "mp4" || /\.mp4/i.test(best.url);
    extracted.push({
      media_url: best.url,
      media_type: isVideo ? "video" : "image",
      thumbnail: item?.pictureUrl || (isVideo ? "" : best.url),
    });
  }
  if (!extracted.length) return null;

  const first = extracted[0];
  const meta = items[0]?.meta || {};
  const out: MediaData = {
    media_url: first.media_url,
    media_type: first.media_type,
    thumbnail: first.thumbnail,
    title: meta.title || "Instagram Media",
    author: meta.username || "Usuário",
    is_carousel: extracted.length > 1,
  };
  if (extracted.length > 1) {
    out.carousel_items = extracted.map((e, i) => ({
      index: i,
      media_url: e.media_url,
      media_type: e.media_type,
      thumbnail: e.thumbnail,
    }));
  }
  return { success: true, data: out };
}

// social-download-all-in-one.p.rapidapi.com — supports IG/TT/FB/YT
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
  if (!medias.length) return null;
  const videos = medias.filter((m) => m.type === "video" && m.url);
  const images = medias.filter((m) => m.type === "image" && m.url);
  const picked = videos[0] || images[0];
  if (!picked?.url) return null;
  const out: MediaData = {
    media_url: picked.url,
    media_type: picked.type === "video" ? "video" : "image",
    thumbnail: j?.thumbnail || picked?.thumbnail || "",
    title: j?.title || "Instagram Media",
    author: j?.author || "Usuário",
    duration: j?.duration ? Number(j.duration) : undefined,
  };
  // carousel support
  const all = [...videos, ...images];
  if (all.length > 1) {
    out.is_carousel = true;
    out.carousel_items = all.map((m, i) => ({
      index: i,
      media_url: m.url,
      media_type: m.type === "video" ? "video" : "image",
      thumbnail: m.thumbnail || (m.type === "image" ? m.url : j?.thumbnail || ""),
    }));
  }
  return { success: true, data: out };
}

// auto-download-all-in-one-big.p.rapidapi.com — alternative aggregator
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
  if (!medias.length) return null;
  const picked = medias.find((m) => m.type === "video" && m.url) || medias.find((m) => m.url);
  if (!picked?.url) return null;
  const out: MediaData = {
    media_url: picked.url,
    media_type: picked.type === "video" ? "video" : "image",
    thumbnail: j?.thumbnail || "",
    title: j?.title || "Instagram Media",
    author: j?.author || "Usuário",
  };
  if (medias.length > 1) {
    out.is_carousel = true;
    out.carousel_items = medias.filter((m) => m.url).map((m, i) => ({
      index: i,
      media_url: m.url,
      media_type: m.type === "video" ? "video" : "image",
      thumbnail: m.thumbnail || (m.type === "image" ? m.url : j?.thumbnail || ""),
    }));
  }
  return { success: true, data: out };
}

// instagram-scraper-api2.p.rapidapi.com — by-shortcode endpoint
async function fetchScraperApi2(shortcode: string, key: string): Promise<MediaResponse | null> {
  const r = await fetch(
    `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(shortcode)}&include_insights=false`,
    {
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com",
      },
    }
  );
  if (!r.ok) return null;
  const j: any = await r.json();
  const d = j?.data;
  if (!d) return null;
  const videoUrl = d?.video_url || d?.video_versions?.[0]?.url;
  const thumb = d?.thumbnail_url || d?.display_url || d?.image_versions?.items?.[0]?.url || "";
  const carousel = d?.carousel_media || [];
  if (carousel.length > 1) {
    const items = carousel.map((c: any, i: number) => {
      const v = c?.video_url || c?.video_versions?.[0]?.url;
      const im = c?.thumbnail_url || c?.display_url || c?.image_versions?.items?.[0]?.url || "";
      return {
        index: i,
        media_url: v || im,
        media_type: v ? ("video" as const) : ("image" as const),
        thumbnail: im,
      };
    });
    return {
      success: true,
      data: {
        media_url: items[0].media_url,
        media_type: items[0].media_type,
        thumbnail: items[0].thumbnail,
        title: d?.caption?.text?.slice(0, 100) || "Instagram Media",
        author: d?.user?.username || d?.owner?.username || "Usuário",
        is_carousel: true,
        carousel_items: items,
      },
    };
  }
  if (!videoUrl && !thumb) return null;
  return {
    success: true,
    data: {
      media_url: videoUrl || thumb,
      media_type: videoUrl ? "video" : "image",
      thumbnail: thumb,
      title: d?.caption?.text?.slice(0, 100) || "Instagram Media",
      author: d?.user?.username || d?.owner?.username || "Usuário",
    },
  };
}

async function fetchViaRapidApi(url: string, rapidApiKey: string): Promise<MediaResponse | null> {
  const RAPIDAPI_KEY = rapidApiKey.trim();
  if (!RAPIDAPI_KEY) {
    console.warn("⚠️ RAPIDAPI_KEY não configurada.");
    return null;
  }
  const shortcode = url.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9-_]+)/)?.[1];
  if (!shortcode) return null;

  const providers: Array<{ name: string; run: () => Promise<MediaResponse | null> }> = [
    { name: "instagram120", run: () => fetchInstagram120(url, RAPIDAPI_KEY, shortcode) },
    { name: "social-all-in-one", run: () => fetchSocialAllInOne(url, RAPIDAPI_KEY) },
    { name: "auto-all-in-one", run: () => fetchAutoAllInOne(url, RAPIDAPI_KEY) },
    { name: "scraper-api2", run: () => fetchScraperApi2(shortcode, RAPIDAPI_KEY) },
  ];

  for (const p of providers) {
    try {
      const res = await p.run();
      if (res?.success && res.data?.media_url) {
        console.log(`✅ Instagram via ${p.name}`);
        return res;
      }
      console.warn(`⚠️ Instagram provider ${p.name} returned no media`);
    } catch (e) {
      console.warn(`⚠️ Instagram provider ${p.name} threw:`, (e as Error).message);
    }
  }
  return null;
}

async function tryDirectScrape(url: string): Promise<MediaResponse | null> {
  try {
    const shortcode = url.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9-_]+)/)?.[1];
    if (!shortcode) return null;

    // Use o pidgets do Instagram como uma forma leve de metadados
    const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html",
      },
    });

    if (embedRes.ok) {
      const html = await embedRes.text();
      const videoUrlMatch = html.match(/"video_url":"([^"]+)"/);
      const displayUrlMatch = html.match(/"display_url":"([^"]+)"/);
      
      if (videoUrlMatch || displayUrlMatch) {
        return {
          success: true,
          data: {
            media_url: (videoUrlMatch?.[1] || displayUrlMatch?.[1] || "").replace(/\\u0026/g, "&"),
            media_type: videoUrlMatch ? "video" : "image",
            thumbnail: (displayUrlMatch?.[1] || "").replace(/\\u0026/g, "&"),
            title: "Instagram Media",
            author: "Instagram User",
          },
        };
      }
    }

    // Fallback para scrape direto na página (pode falhar por causa do login)
    const response = await fetch(`https://www.instagram.com/p/${shortcode}/`, {
      headers: {
        "User-Agent": UA,
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
          author: "Instagram User",
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
          author: "Instagram User",
        },
      };
    }

    return null;
  } catch (e) {
    console.error("Direct scrape error:", e);
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

async function downloadInstagramMedia(url: string, functionUrl: string, rapidApiKey: string): Promise<MediaResponse> {
  console.log("🚀 Iniciando processo para:", url);
  url = await resolveInstagramUrl(url);

  // Snapsave first — funciona sem chave e cobre a maioria dos posts públicos.
  try {
    const snap = await fetchInstagramSnapsave(url);
    if (snap?.success && snap.data?.media_url) {
      console.log("✅ Instagram via snapsave");
      snap.data = addProxyUrls(snap.data, functionUrl);
      return snap;
    }
  } catch (e) {
    console.warn("⚠️ snapsave falhou:", (e as Error).message);
  }

  // Fallback for when snapsave fails - try to find other options or re-fetch.
  // Re-attempting snapsave one more time with a slightly modified URL or header if possible
  // or just move to RapidAPI.

  // RapidAPI providers como fallback (alguns endpoints exigem subscription paga).
  const rapidResult = await fetchViaRapidApi(url, rapidApiKey);
  if (rapidResult?.success && rapidResult.data) {
    console.log("✅ Instagram via RapidAPI");
    rapidResult.data = addProxyUrls(rapidResult.data, functionUrl);
    return rapidResult;
  }

  const directResult = await tryDirectScrape(url);
  if (directResult?.success && directResult.data) {
    console.log("✅ Instagram via Direct Scrape");
    directResult.data = addProxyUrls(directResult.data, functionUrl);
    return directResult;
  }

  return {
    success: false,
    error:
      "Não foi possível processar este post. Verifique se o link está correto e se o conteúdo é público.",
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
          if (!isSafeProxyUrl(mediaUrl)) {
            return new Response(JSON.stringify({ error: "media_url não permitida" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          return handleProxy(request, mediaUrl, type);
        }

        const url = requestUrl.searchParams.get("url");
        if (!url || !url.includes("instagram.com")) {
          return new Response(JSON.stringify({ success: false, error: "URL inválida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const rapidApiKey = process.env.RAPIDAPI_KEY || "";
        const result = await downloadInstagramMedia(url, requestUrl.pathname, rapidApiKey);
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
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

        if (!url || !url.includes("instagram.com")) {
          return new Response(JSON.stringify({ success: false, error: "URL inválida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const rapidApiKey = process.env.RAPIDAPI_KEY || "";
        const result = await downloadInstagramMedia(url, requestUrl.pathname, rapidApiKey);
        try {
          const { reportDownloaderResult } = await import("@/lib/downloader-status.server");
          reportDownloaderResult("instagram", !!result.success);
        } catch {}
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      },
    },
  },
});
