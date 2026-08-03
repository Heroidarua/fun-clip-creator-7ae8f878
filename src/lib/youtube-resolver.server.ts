export interface YouTubeData {
  video_url: string;
  audio_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration: number;
  download_page_url?: string;
}

export interface YouTubeResponse {
  success: boolean;
  data?: YouTubeData;
  error?: string;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function saveFromUrl(videoId: string): string {
  return `https://ssyoutube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function fallbackThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function withTimeout(ms = 6500): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
    ? AbortSignal.timeout(ms)
    : undefined;
}

async function fetchMediaDownloader(videoId: string, key: string): Promise<YouTubeResponse | null> {
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
  if (!r.ok) return r.status === 429 ? ({ success: false, rateLimited: true } as any) : null;
  const data: any = await r.json().catch(() => null);
  if (!data || (data.errorId && data.errorId !== "Success")) return null;
  const videoItems: any[] = data.videos?.items || [];
  const audioItems: any[] = data.audios?.items || [];
  const muxed = videoItems.find((v) => /mp4a/.test(v.mimeType || "") && v.extension === "mp4");
  const bestVideo =
    muxed ||
    videoItems.filter((v) => v.extension === "mp4").sort((a, b) => (b.height || b.quality || 0) - (a.height || a.quality || 0))[0] ||
    videoItems[0];
  const bestAudio =
    audioItems.filter((a) => a.extension === "m4a" || a.extension === "mp4").sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0] || audioItems[0];
  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || "";
  if (!videoUrl && !audioUrl) return null;
  const thumbnail = (data.thumbnails && data.thumbnails[data.thumbnails.length - 1]?.url) || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  return {
    success: true,
    data: { video_url: videoUrl, audio_url: audioUrl, thumbnail, title: data.title || "YouTube Video", author: data.channel?.name || "YouTube", duration: Number(data.lengthSeconds || 0) },
  };
}

function parseAggregator(j: any, videoId: string): YouTubeResponse | null {
  const medias: any[] = j?.medias || [];
  if (!medias.length) return null;
  const videos = medias.filter((m) => m?.url && (m?.type === "video" || /mp4/i.test(m?.extension || m?.ext || "")));
  const audios = medias.filter((m) => m?.url && (m?.type === "audio" || /m4a|mp3/i.test(m?.extension || m?.ext || "")));
  const bestVideo = videos.sort((a, b) => (parseInt(b?.quality || "0") || 0) - (parseInt(a?.quality || "0") || 0))[0] || medias.find((m) => m?.url);
  const bestAudio = audios[0];
  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || bestVideo?.url || "";
  if (!videoUrl && !audioUrl) return null;
  return {
    success: true,
    data: {
      video_url: videoUrl, audio_url: audioUrl,
      thumbnail: j?.thumbnail || bestVideo?.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      title: (j?.title || "YouTube Video").substring(0, 120),
      author: j?.author || j?.source || "YouTube",
      duration: Number(j?.duration || 0),
    },
  };
}

async function fetchSocialAllInOne(url: string, videoId: string, key: string): Promise<YouTubeResponse | null> {
  const r = await fetch("https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink", {
    method: "POST", signal: withTimeout(6500),
    headers: { "Content-Type": "application/json", "X-RapidAPI-Key": key, "X-RapidAPI-Host": "social-download-all-in-one.p.rapidapi.com" },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) return null;
  const j: any = await r.json().catch(() => null);
  return parseAggregator(j, videoId);
}

async function fetchAutoAllInOne(url: string, videoId: string, key: string): Promise<YouTubeResponse | null> {
  const r = await fetch("https://auto-download-all-in-one-big.p.rapidapi.com/v1/social/autolink", {
    method: "POST", signal: withTimeout(6500),
    headers: { "Content-Type": "application/json", "X-RapidAPI-Key": key, "X-RapidAPI-Host": "auto-download-all-in-one-big.p.rapidapi.com" },
    body: JSON.stringify({ url }),
  });
  if (!r.ok) return null;
  const j: any = await r.json().catch(() => null);
  return parseAggregator(j, videoId);
}

async function fetchYtStream(videoId: string, key: string): Promise<YouTubeResponse | null> {
  const r = await fetch(`https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=${videoId}`, {
    signal: withTimeout(6500),
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": "ytstream-download-youtube-videos.p.rapidapi.com" },
  });
  if (!r.ok) return null;
  const j: any = await r.json().catch(() => null);
  if (!j || j?.status === "fail") return null;
  const formats: any[] = [...(j.formats || []), ...(j.adaptiveFormats || [])];
  
  // Prefer formats that have both video and audio (muxed)
  const videos = formats.filter((f) => f?.url && /video\/mp4/.test(f?.mimeType || "") && f?.hasAudio !== false);
  // Fallback to any mp4 video if no muxed format is found
  const anyVideo = videos.length ? videos : formats.filter((f) => f?.url && /video\/mp4/.test(f?.mimeType || ""));
  const audios = formats.filter((f) => f?.url && /audio\/(mp4|mpeg|m4a)/.test(f?.mimeType || ""));
  
  const bestVideo = anyVideo.sort((a, b) => (b?.height || 0) - (a?.height || 0))[0];
  const bestAudio = audios.sort((a, b) => (b?.bitrate || 0) - (a?.bitrate || 0))[0] || formats.find(f => /audio/.test(f?.mimeType || ""));
  
  const videoUrl = bestVideo?.url || "";
  const audioUrl = bestAudio?.url || "";
  if (!videoUrl && !audioUrl) return null;
  
  const thumb = (j.thumbnail && j.thumbnail[j.thumbnail.length - 1]?.url) || fallbackThumbnail(videoId);
  return {
    success: true,
    data: { 
      video_url: videoUrl, 
      audio_url: audioUrl, 
      thumbnail: thumb, 
      title: j.title || "YouTube Video", 
      author: j.channelTitle || j.author || "YouTube", 
      duration: Number(j.lengthSeconds || 0) 
    },
  };
}

async function fetchY2Mate(videoId: string): Promise<YouTubeResponse | null> {
  try {
    const analyze = await fetch("https://www.y2mate.com/mates/analyzeV2/ajax", {
      method: "POST", signal: withTimeout(6500),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": BROWSER_UA, Origin: "https://www.y2mate.com", Referer: "https://www.y2mate.com/", Accept: "*/*",
      },
      body: new URLSearchParams({ k_query: `https://www.youtube.com/watch?v=${videoId}`, k_page: "home", hl: "en", q_auto: "0" }).toString(),
    });
    
    if (!analyze.ok) return null;
    const info: any = await analyze.json().catch(() => null);
    if (!info || info.status !== "ok") return null;
    
    const vid = info.vid;
    const mp4 = info?.links?.mp4 || {};
    const mp3 = info?.links?.mp3 || {};
    const mp4Entries = Object.values(mp4) as any[];
    
    // Find best quality video with audio
    const progressive = mp4Entries.find((m) => /mp4/i.test(m?.f || "") && /^\d+p$/i.test(m?.q || "") && /audio/i.test(m?.q_text || ""));
    const bestMp4 = progressive || mp4Entries.sort((a, b) => (parseInt(b?.q || "0") || 0) - (parseInt(a?.q || "0") || 0))[0];
    const bestMp3 = (Object.values(mp3) as any[]).sort((a, b) => (parseInt(b?.q || "0") || 0) - (parseInt(a?.q || "0") || 0))[0];

    async function convert(k: string): Promise<string | null> {
      try {
        const conv = await fetch("https://www.y2mate.com/mates/convertV2/index", {
          method: "POST", signal: withTimeout(6500),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": BROWSER_UA, Origin: "https://www.y2mate.com", Referer: "https://www.y2mate.com/", Accept: "*/*",
          },
          body: new URLSearchParams({ vid, k }).toString(),
        });
        if (!conv.ok) return null;
        const j: any = await conv.json().catch(() => null);
        return j?.dlink || null;
      } catch {
        return null;
      }
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
  } catch (error) {
    console.error("fetchY2Mate error:", error);
    return null;
  }
}

async function fetchYoutubePreview(videoId: string): Promise<YouTubeResponse> {
  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const downloadPageUrl = saveFromUrl(videoId);
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`, {
      signal: withTimeout(4000),
      headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
    });
    const j: any = r.ok ? await r.json().catch(() => null) : null;
    return {
      success: true,
      data: {
        video_url: downloadPageUrl, audio_url: "",
        thumbnail: j?.thumbnail_url || fallbackThumbnail(videoId),
        title: (j?.title || "YouTube Video").substring(0, 120),
        author: j?.author_name || "YouTube",
        duration: 0, download_page_url: downloadPageUrl,
      },
    };
  } catch {
    return {
      success: true,
      data: {
        video_url: downloadPageUrl, audio_url: "",
        thumbnail: fallbackThumbnail(videoId),
        title: "YouTube Video", author: "YouTube",
        duration: 0, download_page_url: downloadPageUrl,
      },
    };
  }
}

export async function resolveYoutube(rawUrl: string, videoId: string): Promise<YouTubeResponse> {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const providers: Array<{ name: string; run: () => Promise<YouTubeResponse | null> }> = [];
  
  // Prioritize Y2Mate as it's often more reliable for direct links
  providers.push({ name: "y2mate", run: () => fetchY2Mate(videoId) });

  if (key) {
    providers.push({ name: "ytstream", run: () => fetchYtStream(videoId, key) });
    providers.push({ name: "youtube-media-downloader", run: () => fetchMediaDownloader(videoId, key) });
  }

  // Fallback providers
  if (key) {
    providers.push({ name: "social-all-in-one", run: () => fetchSocialAllInOne(rawUrl, videoId, key) });
    providers.push({ name: "auto-all-in-one", run: () => fetchAutoAllInOne(rawUrl, videoId, key) });
  }

  for (const p of providers) {
    try {
      const res = await p.run();
      if (res?.success && res.data && (res.data.video_url || res.data.audio_url)) {
        // If Y2Mate returned a result but it's just the fallback thumbnail, 
        // try to see if it has a real one or keep searching if needed.
        console.log(`✅ YouTube via ${p.name}`);
        return res;
      }
    } catch (e) {
      console.warn(`⚠️ YouTube provider ${p.name} falhou:`, (e as Error).message);
    }
  }

  // Final fallback: fetch preview if all else fails
  const preview = await fetchYoutubePreview(videoId);
  return preview;
}

export function isDirectMediaUrl(u: string | undefined | null): boolean {
  if (!u) return false;
  if (!/^https?:\/\//i.test(u)) return false;
  if (/ssyoutube\.com|savefrom\.net|y2mate\.com\/(?!.*dlink)/i.test(u)) return false;
  return true;
}

export { BROWSER_UA };
