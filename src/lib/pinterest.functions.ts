import { createServerFn } from "@tanstack/react-start";
import { validatePinterestUrl } from "./pinterest-validation";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type PinType = "video" | "image" | "gif";

export interface ResolvedPin {
  type: PinType;
  url: string;
  thumbnail: string;
  title: string;
}

export type ResolvePinResult =
  | { ok: true; pin: ResolvedPin }
  | { ok: false; error: string };

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
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

// Primary source: Pinterest's own internal JSON API (PinResource/get).
// This is what pinterest.com itself calls in the browser — it returns the
// full pin payload (videos.video_list, images, story_pin_data, etc.) even
// when the pidgets widget API 404s on the same pin.
async function fetchPinFromPinResource(pinId: string): Promise<ResolvedPin | null> {
  const data = {
    options: {
      id: pinId,
      field_set_key: "unauth_react_main_pin",
      noCache: true,
      fetch_visual_search_objects: false,
    },
    context: {},
  };
  const qs = new URLSearchParams({
    source_url: `/pin/${pinId}/`,
    data: JSON.stringify(data),
  });
  const res = await fetch(`https://www.pinterest.com/resource/PinResource/get/?${qs}`, {
    headers: {
      Accept: "application/json, text/javascript, */*, q=0.01",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": BROWSER_UA,
      "X-Requested-With": "XMLHttpRequest",
      "X-Pinterest-AppState": "active",
      "X-APP-VERSION": "8747091",
      Referer: `https://www.pinterest.com/pin/${pinId}/`,
    },
  });
  if (!res.ok) return null;
  const json: any = await res.json().catch(() => null);
  const pin: PidgetsPin | undefined = json?.resource_response?.data;
  if (!pin) return null;

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

// Last-resort fallback: scrape og:video / og:image from the pin page HTML.
async function fetchPinFromOg(pinId: string): Promise<ResolvedPin | null> {
  try {
    const r = await fetch(`https://www.pinterest.com/pin/${pinId}/`, {
      headers: {
        // Bot UA is required — the browser UA returns an empty SPA shell.
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!r.ok) return null;
    const html = await r.text();

    const ogVideo =
      html.match(/<meta[^>]+property=["']og:video(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "Pinterest";

    let mediaUrl = ogVideo || "";
    let type: PinType = mediaUrl ? "video" : "image";
    if (!mediaUrl && ogImage) mediaUrl = ogImage.replace(/\/\d+x(?:\d+)?\//, "/originals/");
    if (!mediaUrl) return null;
    if (type === "image" && /\.gif(\?|$)/i.test(mediaUrl)) type = "gif";

    return {
      type,
      url: decodeEntities(mediaUrl),
      thumbnail: decodeEntities(ogImage || mediaUrl),
      title: decodeEntities(ogTitle).substring(0, 100),
    };
  } catch {
    return null;
  }
}

export const resolvePin = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    const url = typeof input?.url === "string" ? input.url.trim() : "";
    return { url };
  })
  .handler(async ({ data }): Promise<ResolvePinResult> => {
    try {
      const v = validatePinterestUrl(data.url);
      if (!v.valid) return { ok: false, error: v.error };
      let pinId = v.kind === "pin" ? v.pinId! : null;
      if (!pinId) {
        const resolvedUrl = await followRedirect(v.normalized);
        pinId = extractPinId(resolvedUrl);
        if (!pinId)
          return {
            ok: false,
            error:
              "Não foi possível abrir o link curto do Pinterest. Cole o link completo do pin (pinterest.com/pin/...).",
          };
      }
      const pin = await fetchPinFromPidgets(pinId);
      const finalPin =
        (await fetchPinFromPinResource(pinId)) ||
        pin ||
        (await fetchPinFromOg(pinId));
      if (!finalPin)
        return {
          ok: false,
          error:
            "Pin indisponível: pode ter sido removido, ser privado, restrito por idade ou estar bloqueado na sua região.",
        };
      return { ok: true, pin: finalPin };
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message : "Falha ao processar o pin";
      console.error("[resolvePin] error:", msg);
      return { ok: false, error: "Falha temporária ao acessar o Pinterest. Tente novamente em instantes." };
    }
  });