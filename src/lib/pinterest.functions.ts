import { createServerFn } from "@tanstack/react-start";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BOT_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

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
    const url = await followRedirect(data.url);

    const res = await fetch(url, {
      headers: {
        "User-Agent": BOT_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) throw new Error("Pin indisponível ou privado.");
    const html = await res.text();

    const ogVideo =
      html.match(/<meta[^>]+property=["']og:video(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
      null;
    const ogImage =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] || null;
    const ogTitle =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] || "Pinterest";

    // Best mp4 from embedded JSON
    let bestVideo: string | null = null;
    const videoListMatch = html.match(/"video_list"\s*:\s*\{([\s\S]*?)\}\s*,/);
    if (videoListMatch) {
      const urls = [...videoListMatch[1].matchAll(/"url"\s*:\s*"([^"]+\.(?:mp4|m3u8))"/gi)].map((m) =>
        m[1].replace(/\\u002F/g, "/").replace(/\\\//g, "/"),
      );
      const mp4s = urls.filter((u) => u.endsWith(".mp4"));
      if (mp4s.length) bestVideo = mp4s[mp4s.length - 1];
    }

    let mediaUrl = bestVideo || ogVideo || "";
    let type: PinType = mediaUrl ? "video" : "image";

    if (!mediaUrl && ogImage) {
      mediaUrl = ogImage.replace(/\/\d+x(?:\d+)?\//, "/originals/");
    }
    if (!mediaUrl) throw new Error("Não foi possível extrair a mídia desse pin.");

    if (type === "image" && /\.gif(\?|$)/i.test(mediaUrl)) type = "gif";

    return {
      type,
      url: decodeEntities(mediaUrl),
      thumbnail: decodeEntities(ogImage || mediaUrl),
      title: decodeEntities(ogTitle).substring(0, 100),
    };
  });