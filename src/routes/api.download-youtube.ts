import { createFileRoute } from "@tanstack/react-router";
import { parseYouTubeUrl } from "@/lib/youtube-url";

interface YouTubeData {
  video_url: string;
  audio_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration: number;
  download_page_url?: string;
}

interface YouTubeResponse {
  success: boolean;
  data?: YouTubeData;
  error?: string;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function saveFromUrl(videoId: string): string {
  return `https://ssyoutube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function fallbackThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function withTimeout(ms = 6500): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
    ? AbortSignal.timeout(ms)
    : undefined;
}

// Provider 1 (primary): youtube-media-downloader
async function fetchMediaDownloader(
  videoId: string,
  key: string,
): Promise<YouTubeResponse | null> {
  const r = await fetch(
    `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`,
    {
      signal: withTimeout(6500),
      headers: {
        "x-rapidapi-host": "youtube-media-downloader.p.rapidapi.com",
        "x-rapidapi-key": key,
        Accept: "application/json",
        "User-Agent": BROWSER_UA,
      },
    },
  );
  if (!r.ok) {
    console.warn(`youtube-media-downloader HTTP ${r.status}`);
    return r.status === 429 ? ({ success: false, rateLimited: true } as any) : null;
  }
  const data: any = await r.json().catch(() => null);
  if (!data || (data.errorId && data.errorId !== "Success")) return null;

  const videoItems: any[] = data.videos?.items || [];
  const audioItems: any[] = data.audios?.items || [];
  const muxed = videoItems.find(
    (v) => /mp4a/.test(v.mimeType || "") && v.extension === "mp4",
  );
  const bestVideo =
    muxed ||
    videoItems
      .filter((v) => v.extension === "mp4")
      .sort(
        (a, b) => (b.height || b.quality || 0) - (a.height || a.quality || 0),
      )[0] ||
    videoItems[0];
  const bestAudio =
    audioItems
      .filter((a) => a.extension === "m4a" || a.extension === "mp4")
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0] || audioItems[0];

  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || "";
  if (!videoUrl && !audioUrl) return null;

  const thumbnail =
    (data.thumbnails && data.thumbnails[data.thumbnails.length - 1]?.url) ||
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    success: true,
    data: {
      video_url: videoUrl,
      audio_url: audioUrl,
      thumbnail,
      title: data.title || "YouTube Video",
      author: data.channel?.name || "YouTube",
      duration: Number(data.lengthSeconds || 0),
    },
  };
}

// Aggregator response parser
function parseAggregator(j: any, videoId: string): YouTubeResponse | null {
  const medias: any[] = j?.medias || [];
  if (!medias.length) return null;
  const videos = medias.filter(
    (m) => m?.url && (m?.type === "video" || /mp4/i.test(m?.extension || m?.ext || "")),
  );
  const audios = medias.filter(
    (m) => m?.url && (m?.type === "audio" || /m4a|mp3/i.test(m?.extension || m?.ext || "")),
  );
  const bestVideo =
    videos.sort(
      (a, b) => (parseInt(b?.quality || "0") || 0) - (parseInt(a?.quality || "0") || 0),
    )[0] || medias.find((m) => m?.url);
  const bestAudio = audios[0];
  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || bestVideo?.url || "";
  if (!videoUrl && !audioUrl) return null;
  return {
    success: true,
    data: {
      video_url: videoUrl,
      audio_url: audioUrl,
      thumbnail:
        j?.thumbnail ||
        bestVideo?.thumbnail ||
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      title: (j?.title || "YouTube Video").substring(0, 120),
      author: j?.author || j?.source || "YouTube",
      duration: Number(j?.duration || 0),
    },
  };
}

// Provider 2 (fallback): social-download-all-in-one
async function fetchSocialAllInOne(
  url: string,
  videoId: string,
  key: string,
): Promise<YouTubeResponse | null> {
  const r = await fetch(
    "https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink",
    {
      method: "POST",
      signal: withTimeout(6500),
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "social-download-all-in-one.p.rapidapi.com",
      },
      body: JSON.stringify({ url }),
    },
  );
  if (!r.ok) {
    console.warn(`social-all-in-one HTTP ${r.status}`);
    return null;
  }
  const j: any = await r.json().catch(() => null);
  return parseAggregator(j, videoId);
}

// Provider 3 (fallback): auto-download-all-in-one-big
async function fetchAutoAllInOne(
  url: string,
  videoId: string,
  key: string,
): Promise<YouTubeResponse | null> {
  const r = await fetch(
    "https://auto-download-all-in-one-big.p.rapidapi.com/v1/social/autolink",
    {
      method: "POST",
      signal: withTimeout(6500),
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "auto-download-all-in-one-big.p.rapidapi.com",
      },
      body: JSON.stringify({ url }),
    },
  );
  if (!r.ok) {
    console.warn(`auto-all-in-one HTTP ${r.status}`);
    return null;
  }
  const j: any = await r.json().catch(() => null);
  return parseAggregator(j, videoId);
}

// Provider 4 (fallback): ytstream-download-youtube-videos
async function fetchYtStream(
  videoId: string,
  key: string,
): Promise<YouTubeResponse | null> {
  const r = await fetch(
    `https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`,
    {
      signal: withTimeout(6500),
      headers: {
        "X-RapidAPI-Key": key,
        "X-RapidAPI-Host": "ytstream-download-youtube-videos.p.rapidapi.com",
      },
    },
  );
  if (!r.ok) {
    console.warn(`ytstream HTTP ${r.status}`);
    return null;
  }
  const j: any = await r.json().catch(() => null);
  if (!j || j?.status === "fail") return null;

  const formats: any[] = [...(j.formats || []), ...(j.adaptiveFormats || [])];
  const videos = formats.filter(
    (f) => f?.url && /video\/mp4/.test(f?.mimeType || "") && f?.hasAudio !== false,
  );
  const anyVideo = videos.length
    ? videos
    : formats.filter((f) => f?.url && /video\/mp4/.test(f?.mimeType || ""));
  const audios = formats.filter(
    (f) => f?.url && /audio\/mp4/.test(f?.mimeType || ""),
  );
  const bestVideo = anyVideo.sort(
    (a, b) => (b?.height || 0) - (a?.height || 0),
  )[0];
  const bestAudio = audios.sort(
    (a, b) => (b?.bitrate || 0) - (a?.bitrate || 0),
  )[0];

  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || "";
  if (!videoUrl && !audioUrl) return null;

  const thumb =
    (j.thumbnail && j.thumbnail[j.thumbnail.length - 1]?.url) ||
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return {
    success: true,
    data: {
      video_url: videoUrl,
      audio_url: audioUrl,
      thumbnail: thumb,
      title: j.title || "YouTube Video",
      author: j.channelTitle || j.author || "YouTube",
      duration: Number(j.lengthSeconds || 0),
    },
  };
}

// Provider 5 (public, no key): Y2Mate — mesmo backend usado por SaveFrom/SaveData.
// Fluxo: analyzeV2 → convertV2. Não exige RapidAPI.
async function fetchY2Mate(
  videoId: string,
): Promise<YouTubeResponse | null> {
  try {
    const analyze = await fetch(
      "https://www.y2mate.com/mates/analyzeV2/ajax",
      {
        method: "POST",
        signal: withTimeout(6500),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": BROWSER_UA,
          Origin: "https://www.y2mate.com",
          Referer: "https://www.y2mate.com/",
          Accept: "*/*",
        },
        body: new URLSearchParams({
          k_query: `https://www.youtube.com/watch?v=${videoId}`,
          k_page: "home",
          hl: "en",
          q_auto: "0",
        }).toString(),
      },
    );
    if (!analyze.ok) return null;
    const info: any = await analyze.json().catch(() => null);
    if (!info || info.status !== "ok") return null;

    const vid = info.vid;
    const mp4 = info?.links?.mp4 || {};
    const mp3 = info?.links?.mp3 || {};
    // Pick highest resolution mp4 with audio (progressive first)
    const mp4Entries = Object.values(mp4) as any[];
    const progressive = mp4Entries.find((m) => /mp4/i.test(m?.f || "") && /^\d+p$/i.test(m?.q || "") && /audio/i.test(m?.q_text || ""));
    const bestMp4 =
      progressive ||
      mp4Entries.sort(
        (a, b) => (parseInt(b?.q || "0") || 0) - (parseInt(a?.q || "0") || 0),
      )[0];
    const bestMp3 = Object.values(mp3)[0] as any;

    async function convert(k: string): Promise<string | null> {
      const conv = await fetch("https://www.y2mate.com/mates/convertV2/index", {
        method: "POST",
        signal: withTimeout(6500),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": BROWSER_UA,
          Origin: "https://www.y2mate.com",
          Referer: "https://www.y2mate.com/",
          Accept: "*/*",
        },
        body: new URLSearchParams({ vid, k }).toString(),
      });
      if (!conv.ok) return null;
      const j: any = await conv.json().catch(() => null);
      return j?.dlink || null;
    }

    const videoUrl = bestMp4?.k ? await convert(bestMp4.k) : "";
    const audioUrl = bestMp3?.k ? await convert(bestMp3.k) : "";
    if (!videoUrl && !audioUrl) return null;

    return {
      success: true,
      data: {
        video_url: videoUrl || "",
        audio_url: audioUrl || "",
        thumbnail: fallbackThumbnail(videoId),
        title: info.title || "YouTube Video",
        author: info.a || "YouTube",
        duration: Number(info.t || 0),
        download_page_url: saveFromUrl(videoId),
      },
    };
  } catch (e) {
    console.warn("y2mate error:", (e as Error).message);
    return null;
  }
}

async function fetchYoutubePreview(videoId: string): Promise<YouTubeResponse> {
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const downloadPageUrl = saveFromUrl(videoId);

  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`,
      {
        signal: withTimeout(4000),
        headers: {
          Accept: "application/json",
          "User-Agent": BROWSER_UA,
        },
      },
    );
    const j: any = r.ok ? await r.json().catch(() => null) : null;

    return {
      success: true,
      data: {
        video_url: downloadPageUrl,
        audio_url: "",
        thumbnail: j?.thumbnail_url || fallbackThumbnail(videoId),
        title: (j?.title || "YouTube Video").substring(0, 120),
        author: j?.author_name || "YouTube",
        duration: 0,
        download_page_url: downloadPageUrl,
      },
    };
  } catch {
    return {
      success: true,
      data: {
        video_url: downloadPageUrl,
        audio_url: "",
        thumbnail: fallbackThumbnail(videoId),
        title: "YouTube Video",
        author: "YouTube",
        duration: 0,
        download_page_url: downloadPageUrl,
      },
    };
  }
}

export async function resolveYoutube(
  rawUrl: string,
  videoId: string,
): Promise<YouTubeResponse> {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const providers: Array<{
    name: string;
    run: () => Promise<YouTubeResponse | null>;
  }> = [];
  if (key) {
    providers.push({ name: "youtube-media-downloader", run: () => fetchMediaDownloader(videoId, key) });
    providers.push({ name: "ytstream", run: () => fetchYtStream(videoId, key) });
  }
  // Y2Mate (público, estilo SaveFrom/SaveData) — sem chave, usado quando os providers pagos caem ou estão fora de cota
  providers.push({ name: "y2mate", run: () => fetchY2Mate(videoId) });
  if (key) {
    providers.push({ name: "social-all-in-one", run: () => fetchSocialAllInOne(rawUrl, videoId, key) });
    providers.push({ name: "auto-all-in-one", run: () => fetchAutoAllInOne(rawUrl, videoId, key) });
  }

  let sawRateLimit = false;
  for (const p of providers) {
    try {
      const res = await p.run();
      if (res?.success && res.data && (res.data.video_url || res.data.audio_url)) {
        console.log(`✅ YouTube via ${p.name}`);
        return res;
      }
      console.warn(`⚠️ YouTube provider ${p.name} sem mídia`);
      if ((res as any)?.rateLimited) sawRateLimit = true;
    } catch (e) {
      console.warn(`⚠️ YouTube provider ${p.name} falhou:`, (e as Error).message);
    }
  }

  console.warn(
    sawRateLimit
      ? "⚠️ YouTube: cota direta atingida; usando preview + SaveFrom"
      : "⚠️ YouTube: providers diretos falharam; usando preview + SaveFrom",
  );
  return fetchYoutubePreview(videoId);
}

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export const Route = createFileRoute("/api/download-youtube")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders() }),

      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
          if (!rawUrl || rawUrl.length > 2048) {
            return Response.json(
              { success: false, error: "URL ausente ou muito longa." },
              { status: 400, headers: corsHeaders() },
            );
          }

          const parsed = parseYouTubeUrl(rawUrl);
          if (!parsed) {
            return Response.json(
              { success: false, error: "URL do YouTube inválida." },
              { status: 400, headers: corsHeaders() },
            );
          }
          if (parsed.kind !== "video" && parsed.kind !== "shorts") {
            return Response.json(
              {
                success: false,
                error:
                  parsed.kind === "channel"
                    ? "Esse link é de um canal. Cole o link de um vídeo ou shorts."
                    : "Esse link é de uma playlist. Cole o link de um vídeo específico.",
              },
              { status: 400, headers: corsHeaders() },
            );
          }
          const videoId = parsed.videoId!;
          const canonicalUrl = parsed.canonicalUrl || rawUrl;

          const result = await resolveYoutube(canonicalUrl, videoId);

          const { reportDownloaderResult } = await import(
            "@/lib/downloader-status.server"
          );
          reportDownloaderResult("youtube", result.success);

          return Response.json(result, {
            status: result.success ? 200 : 502,
            headers: corsHeaders(),
          });
        } catch (error: any) {
          console.error("YouTube download error:", error);
          return Response.json(
            {
              success: false,
              error: error?.message || "Erro ao processar vídeo do YouTube",
            },
            { status: 500, headers: corsHeaders() },
          );
        }
      },
    },
  },
});
