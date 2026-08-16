export interface YouTubeData {
  video_url: string;
  audio_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration: number;
  download_page_url?: string;
  /** User-Agent que deve ser usado ao baixar as URLs acima (evita 403 no googlevideo). */
  media_ua?: string;
  /** Altura do vídeo escolhido, quando conhecida. */
  height?: number;
  /** true quando o arquivo de vídeo já contém áudio embutido. */
  muxed?: boolean;
}

/** Equivalente às expressões de formato do yt-dlp (best / 720p+ / worst). */
export type YouTubeQuality = "best" | "high" | "worst";

export interface YouTubeResponse {
  success: boolean;
  data?: YouTubeData;
  error?: string;
}

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function saveFromUrl(videoId: string): string {
  // Retorna string vazia para evitar redirecionamento para o ssyoutube quando não há link direto
  return "";
}

export function fallbackThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function withTimeout(ms = 6500): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
    ? AbortSignal.timeout(ms)
    : undefined;
}

/**
 * Extração nativa via InnerTube (API interna do YouTube).
 * Clientes de app (iOS/Android) devolvem URLs diretas de googlevideo.com
 * sem cifra de assinatura, permitindo o proxy do próprio backend do SOS01.
 */
const INNERTUBE_CLIENTS = [
  {
    name: "ANDROID_VR",
    userAgent:
      "com.google.android.apps.youtube.vr.oculus/1.62.27 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
    clientNameHeader: "28",
    context: {
      client: {
        clientName: "ANDROID_VR",
        clientVersion: "1.62.27",
        deviceMake: "Oculus",
        deviceModel: "Quest 3",
        osName: "Android",
        osVersion: "12L",
        androidSdkVersion: 32,
        hl: "pt",
        gl: "BR",
      },
    },
  },
  {
    name: "IOS",
    userAgent:
      "com.google.ios.youtube/20.03.02 (iPhone16,2; U; CPU iOS 18_2_1 like Mac OS X;)",
    clientNameHeader: "5",
    context: {
      client: {
        clientName: "IOS",
        clientVersion: "20.03.02",
        deviceMake: "Apple",
        deviceModel: "iPhone16,2",
        osName: "iPhone",
        osVersion: "18.2.1.22C161",
        hl: "pt",
        gl: "BR",
      },
    },
  },
  {
    name: "TVHTML5_EMBED",
    userAgent:
      "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
    clientNameHeader: "85",
    context: {
      client: {
        clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        clientVersion: "2.0",
        hl: "pt",
        gl: "BR",
      },
      thirdParty: { embedUrl: "https://www.youtube.com/" },
    },
  },
  {
    name: "MWEB",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    clientNameHeader: "2",
    context: {
      client: {
        clientName: "MWEB",
        clientVersion: "2.20240726.01.00",
        hl: "pt",
        gl: "BR",
      },
    },
  },
] as const;

function pickInnertubeFormats(player: any, quality: YouTubeQuality | string = "best") {
  const streaming = player?.streamingData || {};
  const hasUrl = (f: any) => typeof f?.url === "string" && f.url.startsWith("http");
  const progressive: any[] = (streaming.formats || []).filter(hasUrl);
  const adaptive: any[] = (streaming.adaptiveFormats || []).filter(hasUrl);
  const formats = [...progressive, ...adaptive];

  const desc = (a: any, b: any) => (b.height || 0) - (a.height || 0);
  const asc = (a: any, b: any) => (a.height || 0) - (b.height || 0);

  // Progressivo (vídeo + áudio no mesmo arquivo) é o que o navegador reproduz direto
  let muxed = progressive
    .filter((f) => /video\/mp4/.test(f.mimeType || "") && /mp4a/.test(f.mimeType || ""))
    .filter((f) => (f.height || 0) <= 720) // Limit to 720p
    .sort(quality === "worst" ? asc : desc);

  // Priorização de qualidade baseada na string recebida
  if (quality === "high" || (typeof quality === 'string' && quality.includes("720p"))) {
    const hd = muxed.filter((f) => (f.height || 0) === 720);
    if (hd.length) muxed = hd;
  }

  // Sem progressivo (vídeo sem áudio embutido): o proxy precisa transferir o
  // arquivo inteiro, então limitamos o tamanho para não estourar o servidor.
  const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB
  const size = (f: any) => Number(f.contentLength || 0);
  let videoOnly = adaptive
    .filter(
      (f) =>
        /video\/mp4/.test(f.mimeType || "") &&
        (f.height || 0) <= 720, // Limit to 720p
    )
    .sort(quality === "worst" ? asc : desc);
  
  if (quality === "high" || (typeof quality === 'string' && quality.includes("720p"))) {
    const hd = videoOnly.filter((f) => (f.height || 0) === 720);
    if (hd.length) videoOnly = hd;
  }
  const fitsSize = videoOnly.filter((f) => size(f) > 0 && size(f) <= MAX_BYTES);
  if (fitsSize.length) {
    videoOnly = fitsSize;
  } else if (videoOnly.length) {
    videoOnly = [...videoOnly].sort((a, b) => size(a) - size(b));
  }

  const audioOnly = formats
    .filter((f) => /audio\/(mp4|mpeg)/.test(f.mimeType || ""))
    .sort((a, b) =>
      quality === "worst"
        ? (a.bitrate || 0) - (b.bitrate || 0)
        : (b.bitrate || 0) - (a.bitrate || 0),
    );

  // Fallback to any audio if mp4/mpeg not found
  if (!audioOnly.length) {
    const anyAudio = formats
      .filter((f) => /audio/i.test(f.mimeType || ""))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    if (anyAudio.length) audioOnly.push(anyAudio[0]);
  }

  const chosen = muxed[0] || videoOnly[0];

  return {
    video: chosen?.url || "",
    audio: audioOnly[0]?.url || "",
    hasMuxed: Boolean(muxed[0]?.url),
    height: Number(chosen?.height || 0),
  };
}

let visitorDataCache: { value: string; at: number } | null = null;

/** O InnerTube exige visitorData para liberar os links de mídia sem 403. */
async function fetchVisitorData(): Promise<string> {
  if (visitorDataCache && Date.now() - visitorDataCache.at < 30 * 60_000) {
    return visitorDataCache.value;
  }
  try {
    const r = await fetch("https://www.youtube.com/sw.js_data", {
      signal: withTimeout(6000),
      headers: { "User-Agent": BROWSER_UA, Accept: "*/*" },
    });
    if (!r.ok) return "";
    const text = await r.text();
    const match = /"(C[gG][^"]{20,})"/.exec(text);
    const value = match?.[1] || "";
    if (value) visitorDataCache = { value, at: Date.now() };
    return value;
  } catch {
    return "";
  }
}

async function fetchInnerTube(
  videoId: string,
  quality: YouTubeQuality | string = "best",
): Promise<YouTubeResponse | null> {
  let fallbackResult: YouTubeResponse | null = null;
  const visitorData = await fetchVisitorData();
  for (const client of INNERTUBE_CLIENTS) {
    try {
      const context = visitorData
        ? { ...client.context, client: { ...client.context.client, visitorData } }
        : client.context;
      const r = await fetch(
        "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        {
          method: "POST",
          signal: withTimeout(8000),
          headers: {
            "Content-Type": "application/json",
            "User-Agent": client.userAgent,
            "X-YouTube-Client-Name": client.clientNameHeader,
            "X-YouTube-Client-Version": client.context.client.clientVersion,
            Origin: "https://www.youtube.com",
            Accept: "application/json",
            ...(visitorData ? { "X-Goog-Visitor-Id": visitorData } : {}),
          },
          body: JSON.stringify({
            videoId,
            context,
            contentCheckOk: true,
            racyCheckOk: true,
          }),
        },
      );
      if (!r.ok) continue;
      const player: any = await r.json().catch(() => null);
      const status = player?.playabilityStatus?.status;
      if (!player || (status && status !== "OK")) continue;

      const { video, audio, hasMuxed, height } = pickInnertubeFormats(player, quality);
      if (!video && !audio) continue;

      const details = player.videoDetails || {};
      const thumbs: any[] = details.thumbnail?.thumbnails || [];
      const result: YouTubeResponse = {
        success: true,
        data: {
          video_url: video || audio || "",
          audio_url: audio || video || "",
          thumbnail: thumbs[thumbs.length - 1]?.url || fallbackThumbnail(videoId),
          title: (details.title || "YouTube Video").substring(0, 120),
          author: details.author || "YouTube",
          duration: Number(details.lengthSeconds || 0),
          media_ua: client.userAgent,
          height,
          muxed: hasMuxed,
        },
      };
      // Prioriza cliente que oferece vídeo com áudio embutido
      if (hasMuxed) {
        console.log(
          `✅ InnerTube (${client.name}) extraiu link direto com áudio (${height || "?"}p, ${quality})`,
        );
        return result;
      }
      fallbackResult = fallbackResult || result;
    } catch (e) {
      console.warn(`InnerTube ${client.name} falhou:`, (e as Error).message);
    }
  }
  return fallbackResult;
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
  return fetchY2MateInner(videoId);
}

/** Instâncias públicas do Piped — a primeira que responder é usada. */
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.leptons.xyz",
];

async function fetchPiped(
  videoId: string,
  quality: YouTubeQuality | string = "best",
): Promise<YouTubeResponse | null> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const r = await fetch(`${instance}/streams/${videoId}`, {
        signal: withTimeout(7000),
        headers: { Accept: "application/json", "User-Agent": BROWSER_UA },
      });
      if (!r.ok) continue;
      const j: any = await r.json().catch(() => null);
      if (!j || j.error) continue;

      const videoStreams: any[] = Array.isArray(j.videoStreams) ? j.videoStreams : [];
      const audioStreams: any[] = Array.isArray(j.audioStreams) ? j.audioStreams : [];

      const height = (s: any) => parseInt(String(s?.quality || "0"), 10) || 0;
      const muxed = videoStreams
        .filter((s) => !s.videoOnly && /mp4/i.test(s.mimeType || s.format || ""))
        .sort((a, b) => height(b) - height(a));

      let chosen = muxed[0];
      if (quality === "worst" && muxed.length) chosen = muxed[muxed.length - 1];
      if (quality === "high" || (typeof quality === 'string' && quality.includes("720p"))) chosen = muxed.find((s) => height(s) === 720) || muxed[0];

      const bestAudio = [...audioStreams]
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
        .find((s) => /mp4|m4a/i.test(s.mimeType || s.format || "")) || audioStreams[0];

      const videoUrl = chosen?.url || "";
      const audioUrl = bestAudio?.url || "";
      if (!videoUrl && !audioUrl) continue;

      return {
        success: true,
        data: {
          video_url: videoUrl,
          audio_url: audioUrl,
          thumbnail: j.thumbnailUrl || fallbackThumbnail(videoId),
          title: (j.title || "YouTube Video").substring(0, 120),
          author: j.uploader || "YouTube",
          duration: Number(j.duration || 0),
          media_ua: BROWSER_UA,
          height: chosen ? height(chosen) : undefined,
          muxed: !!chosen,
        },
      };
    } catch {
      /* tenta a próxima instância */
    }
  }
  return null;
}

async function fetchY2MateInner(videoId: string): Promise<YouTubeResponse | null> {
  try {
    const analyze = await fetch("https://www.y2mate.com/mates/analyzeV2/ajax", {
      method: "POST", signal: withTimeout(7500),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": BROWSER_UA, Origin: "https://www.y2mate.com", Referer: "https://www.y2mate.com/", Accept: "*/*",
      },
      body: new URLSearchParams({ k_query: `https://www.youtube.com/watch?v=${videoId}`, k_page: "home", hl: "pt", q_auto: "0" }).toString(),
    });
    
    if (!analyze.ok) return null;
    const info: any = await analyze.json().catch(() => null);
    if (!info || info.status !== "ok") return null;
    
    const vid = info.vid;
    const mp4 = info?.links?.mp4 || {};
    const mp3 = info?.links?.mp3 || {};
    
    // Procura por resoluções mp4 e seleciona a melhor que tenha um token 'k'
    const mp4Keys = Object.keys(mp4).sort((a, b) => parseInt(b) - parseInt(a));
    const mp3Keys = Object.keys(mp3).sort((a, b) => parseInt(b) - parseInt(a));
    
    const bestMp4Key = mp4Keys[0] ? mp4[mp4Keys[0]]?.k : null;
    const bestMp3Key = mp3Keys[0] ? mp3[mp3Keys[0]]?.k : null;

    async function convert(k: string): Promise<string | null> {
      try {
        const conv = await fetch("https://www.y2mate.com/mates/convertV2/index", {
          method: "POST", signal: withTimeout(7500),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": BROWSER_UA, Origin: "https://www.y2mate.com", Referer: "https://www.y2mate.com/", Accept: "*/*",
          },
          body: new URLSearchParams({ vid, k }).toString(),
        });
        if (!conv.ok) return null;
        const j: any = await conv.json().catch(() => null);
        
        // O y2mate agora retorna o link direto no campo 'dlink'
        let finalUrl = j?.dlink || j?.url || null;
        
        // Tenta limpar o link se ele vier escapado ou com parâmetros extras que o y2mate às vezes coloca
        if (finalUrl && typeof finalUrl === 'string') {
          finalUrl = finalUrl.replace(/\\/g, '');
        }
        
        return finalUrl;
      } catch {
        return null;
      }
    }

    const videoUrl = bestMp4Key ? await convert(bestMp4Key) : "";
    const audioUrl = bestMp3Key ? await convert(bestMp3Key) : "";
    
    if (!videoUrl && !audioUrl) return null;
    
    return {
      success: true,
      data: {
        video_url: videoUrl || audioUrl || "", 
        audio_url: audioUrl || videoUrl || "",
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
  const downloadPageUrl = "";
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

function buildProviders(rawUrl: string, videoId: string, quality: YouTubeQuality | string) {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const providers: Array<{ name: string; run: () => Promise<YouTubeResponse | null> }> = [];
  
  // Extração nativa pelo próprio backend (links diretos googlevideo)
  providers.push({ name: "innertube", run: () => fetchInnerTube(videoId, quality) });
  providers.push({ name: "piped", run: () => fetchPiped(videoId, quality) });
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
  return providers;
}

export async function resolveYoutube(
  rawUrl: string,
  videoId: string,
  quality: YouTubeQuality | string = "best",
): Promise<YouTubeResponse> {
  const providers = buildProviders(rawUrl, videoId, quality);

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

/**
 * Percorre os provedores um a um, entregando cada resultado para o chamador.
 * Permite que o proxy tente o próximo link quando o YouTube devolve 403
 * (link expirado / atrelado a outro IP ou User-Agent).
 */
export async function* resolveYoutubeCandidates(
  rawUrl: string,
  videoId: string,
  quality: YouTubeQuality | string = "best",
): AsyncGenerator<YouTubeData> {
  for (const p of buildProviders(rawUrl, videoId, quality)) {
    try {
      const res = await p.run();
      if (res?.success && res.data && (res.data.video_url || res.data.audio_url)) {
        console.log(`▶️ YouTube candidato: ${p.name}`);
        yield res.data;
      }
    } catch (e) {
      console.warn(`⚠️ YouTube provider ${p.name} falhou:`, (e as Error).message);
    }
  }
}

export function isDirectMediaUrl(u: string | undefined | null): boolean {
  if (!u) return false;
  if (!/^https?:\/\//i.test(u)) return false;
  
  // Known download landing pages that require user interaction
  if (!u || /ssyoutube\.com|savefrom\.net|en\.y2mate\.com\/youtube/i.test(u)) return false;
  
  // If it's a known direct media source or a y2mate delivery link, allow it
  if (u.includes("googlevideo.com") || u.includes("y2mate.com") || u.includes("dlink") || u.includes(".mp4") || u.includes(".m4a")) return true;
  
  // Block the main search/analyze pages
  if (/y2mate\.com\/(?!.*(dlink|convert|download))/i.test(u)) return false;
  
  return true;
}

export { BROWSER_UA };
