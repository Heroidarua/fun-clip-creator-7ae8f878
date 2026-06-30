import { createServerFn } from "@tanstack/react-start";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type PinType = "video" | "image" | "gif";

export interface ResolvedPin {
  type: PinType;
  url: string;
  thumbnail: string;
  title: string;
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

function isPinterestUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)*(pinterest\.[a-z.]+|pin\.it)/i.test(url);
}

async function followRedirect(url: string): Promise<string> {
  if (!/pin\.it/i.test(url)) return url;
  try {
    const r = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_UA,
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    if (r.url && /pinterest\.[a-z.]+\//i.test(r.url)) return r.url.split("?")[0];
  } catch {}
  return url;
}

function extractPinId(url: string): string | null {
  const m = url.match(/\/pin\/(\d{6,})/);
  return m ? m[1] : null;
}

type PidgetsPin = {
  id?: string;
  is_video?: boolean;
  images?: Record<string, { url: string; width: number; height: number }>;
  videos?: { video_list?: Record<string, { url: string; width?: number; height?: number }> } | null;
  story_pin_data?: {
    pages?: Array<{
      blocks?: Array<{
        type?: string;
        video?: { video_list?: Record<string, { url: string }> };
        image?: { images?: Record<string, { url: string }> };
      }>;
    }>;
  } | null;
  description?: string;
  grid_title?: string;
  title?: string;
};

function pickBestImage(images: Record<string, { url: string; width?: number; height?: number }>): string | null {
  const entries = Object.entries(images);
  if (!entries.length) return null;
  const orig = images["orig"] || images["originals"];
  if (orig?.url) return orig.url;
  entries.sort((a, b) => (b[1].width || 0) - (a[1].width || 0));
  return entries[0][1].url || null;
}

function pickBestVideo(videoList: Record<string, { url: string; width?: number; height?: number }>): string | null {
  const entries = Object.entries(videoList);
  if (!entries.length) return null;
  const order = ["V_HLSV4", "V_HLSV3_MOBILE", "V_720P", "V_HLSV3_WEB", "V_480P", "V_240P"];
  // Prefer mp4 over m3u8 for direct downloads
  const mp4s = entries.filter(([, v]) => /\.mp4(\?|$)/i.test(v.url));
  if (mp4s.length) {
    mp4s.sort((a, b) => (b[1].width || 0) - (a[1].width || 0));
    return mp4s[0][1].url;
  }
  for (const key of order) {
    if (videoList[key]?.url) return videoList[key].url;
  }
  return entries[0][1].url || null;
}

async function fetchPinFromPidgets(pinId: string): Promise<ResolvedPin | null> {
  const res = await fetch(
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
  if (!res.ok) return null;
  const json: any = await res.json().catch(() => null);
  const pin: PidgetsPin | undefined = json?.data?.[0];
  if (!pin || (pin as any).error) return null;

  let videoUrl: string | null = null;
  if (pin.videos?.video_list) videoUrl = pickBestVideo(pin.videos.video_list);
  if (!videoUrl && pin.story_pin_data?.pages?.length) {
    for (const page of pin.story_pin_data.pages) {
      for (const block of page.blocks || []) {
        if (block.video?.video_list) {
          const v = pickBestVideo(block.video.video_list);
          if (v) { videoUrl = v; break; }
        }
      }
      if (videoUrl) break;
    }
  }

  let imageUrl: string | null = null;
  if (pin.images) imageUrl = pickBestImage(pin.images);
  if (!imageUrl && pin.story_pin_data?.pages?.length) {
    for (const page of pin.story_pin_data.pages) {
      for (const block of page.blocks || []) {
        if (block.image?.images) {
          const i = pickBestImage(block.image.images);
          if (i) { imageUrl = i; break; }
        }
      }
      if (imageUrl) break;
    }
  }

  const mediaUrl = videoUrl || imageUrl;
  if (!mediaUrl) return null;

  let type: PinType = videoUrl ? "video" : "image";
  if (type === "image" && /\.gif(\?|$)/i.test(mediaUrl)) type = "gif";

  const title = (pin.grid_title || pin.title || pin.description || "Pinterest").toString();

  return {
    type,
    url: decodeEntities(mediaUrl),
    thumbnail: decodeEntities(imageUrl || mediaUrl),
    title: decodeEntities(title).substring(0, 100),
  };
}

export const resolvePin = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    if (!input || typeof input.url !== "string") {
      throw new Error("URL inválida");
    }
    const url = input.url.trim();
    if (!isPinterestUrl(url)) {
      throw new Error("URL precisa ser do Pinterest ou pin.it");
    }
    return { url };
  })
  .handler(async ({ data }): Promise<ResolvedPin> => {
    try {
      const resolvedUrl = await followRedirect(data.url);
      const pinId = extractPinId(resolvedUrl);
      if (!pinId) {
        throw new Error("Não foi possível identificar o ID do pin. Use o link do pin (pinterest.com/pin/...) ou pin.it.");
      }
      const pin = await fetchPinFromPidgets(pinId);
      if (!pin) {
        throw new Error("Pin indisponível, privado ou não encontrado.");
      }
      return pin;
    } catch (err: any) {
      console.error("[resolvePin] error:", err?.message || err);
      throw new Error(err?.message || "Falha ao processar o pin");
    }
  });