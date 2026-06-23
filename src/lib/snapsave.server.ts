// Shared helper to call snapsave.app and decode its obfuscated response.
// Works for Facebook and Instagram public URLs. Cloudflare-Workers safe (no eval).

const SNAP_CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function snapConv(d: string, e: number, f: number): string {
  const src = SNAP_CHARSET.slice(0, e);
  const dst = SNAP_CHARSET.slice(0, f);
  let j: number = d
    .split("")
    .reverse()
    .reduce((a: number, b: string, c: number) => {
      const idx = src.indexOf(b);
      return idx !== -1 ? a + idx * Math.pow(e, c) : a;
    }, 0);
  let k = "";
  while (j > 0) {
    k = dst[j % f] + k;
    j = (j - (j % f)) / f;
  }
  return k || "0";
}

export function decodeSnapsave(src: string): string | null {
  const m = src.match(
    /return decodeURIComponent\(escape\(r\)\)\}\("([^"]+)",(\d+),"([^"]+)",(\d+),(\d+),(\d+)\)/,
  );
  if (!m) return null;
  const h = m[1];
  const n = m[3];
  const t = +m[4];
  const e = +m[5];
  let r = "";
  const esc: string[] = [];
  for (let j = 0; j < n.length; j++) esc.push(n[j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  for (let i = 0; i < h.length; i++) {
    let s = "";
    while (i < h.length && h[i] !== n[e]) {
      s += h[i];
      i++;
    }
    for (let j = 0; j < n.length; j++) s = s.replace(new RegExp(esc[j], "g"), String(j));
    r += String.fromCharCode(parseInt(snapConv(s, e, 10), 10) - t);
  }
  try {
    return decodeURIComponent(escape(r));
  } catch {
    return r;
  }
}

export interface SnapsaveMedia {
  url: string;
  type: "video" | "image";
  thumbnail?: string;
  quality?: string;
}

export interface SnapsaveResult {
  title: string;
  thumbnail: string;
  medias: SnapsaveMedia[];
}

/**
 * Calls snapsave.app and returns decoded media list. Returns null on any failure.
 * Endpoint accepts Facebook and Instagram URLs.
 */
export async function callSnapsave(url: string): Promise<SnapsaveResult | null> {
  try {
    const r = await fetch("https://snapsave.app/action.php?lang=en", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": UA,
        Origin: "https://snapsave.app",
        Referer: "https://snapsave.app/",
        Accept: "*/*",
      },
      body: new URLSearchParams({ url }).toString(),
    });
    if (!r.ok) return null;
    const body = await r.text();
    const html = decodeSnapsave(body);
    if (!html) return null;

    // Collect every CDN link Snapsave emits (rapidcdn / snapsave / direct fbcdn/cdninstagram).
    const linkRegex =
      /https:\/\/(?:d\.rapidcdn\.app|snapsave\.app|[a-z0-9.-]+\.fbcdn\.net|[a-z0-9.-]+\.cdninstagram\.com)\/[^"'\s<>]+/gi;
    const allLinks = Array.from(new Set([...html.matchAll(linkRegex)].map((m) => m[0])));
    if (!allLinks.length) return null;

    // Thumbnail candidates first (cover image), then media files.
    const thumb =
      allLinks.find((l) => /thumb|\.jpg|\.jpeg|\.png|\.webp/i.test(l)) ||
      html.match(/<img[^>]+src="([^"]+)"/)?.[1] ||
      "";

    const medias: SnapsaveMedia[] = [];
    // Prefer HD video; we use surrounding text to guess quality label.
    for (const link of allLinks) {
      const isImage = /\.jpg|\.jpeg|\.png|\.webp|thumb/i.test(link);
      const idx = html.indexOf(link);
      const ctx = idx >= 0 ? html.slice(Math.max(0, idx - 200), idx + 200) : "";
      const quality =
        ctx.match(/(1080p|720p|480p|360p|HD|SD)/i)?.[1] || undefined;
      medias.push({
        url: link,
        type: isImage ? "image" : "video",
        thumbnail: thumb,
        quality,
      });
    }

    // Sort videos by quality (HD/1080/720 first)
    const rank = (q?: string) => {
      if (!q) return 0;
      const Q = q.toUpperCase();
      if (Q.includes("1080")) return 4;
      if (Q.includes("HD") || Q.includes("720")) return 3;
      if (Q.includes("480")) return 2;
      if (Q.includes("360") || Q.includes("SD")) return 1;
      return 0;
    };
    medias.sort((a, b) => {
      if (a.type !== b.type) return a.type === "video" ? -1 : 1;
      return rank(b.quality) - rank(a.quality);
    });

    const title =
      html.match(/<strong>([^<]+)<\/strong>/)?.[1]?.trim() ||
      html.match(/<p[^>]*>([^<]{5,120})<\/p>/)?.[1]?.trim() ||
      "";

    return { title, thumbnail: thumb, medias };
  } catch {
    return null;
  }
}