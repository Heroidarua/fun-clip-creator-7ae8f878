// Pure helpers for validating and normalizing YouTube URLs.
// Safe to import from both client and server (no Node/Worker APIs).

export type YouTubeKind = "video" | "shorts" | "channel" | "playlist";

export interface YouTubeParsed {
  kind: YouTubeKind;
  videoId?: string;     // 11-char id for videos/shorts
  channelId?: string;   // UC... for channels
  handle?: string;      // @handle for channels
  playlistId?: string;
  canonicalUrl: string; // normalized watch / channel / playlist URL
}

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const CHANNEL_ID_RE = /^UC[a-zA-Z0-9_-]{22}$/;

const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/** Accept raw IDs or full URLs (with or without protocol). Returns a URL or null. */
function toUrl(input: string): URL | null {
  const s = input.trim();
  if (!s) return null;

  // Bare 11-char video id
  if (VIDEO_ID_RE.test(s)) {
    return new URL(`https://www.youtube.com/watch?v=${s}`);
  }
  // Bare channel id
  if (CHANNEL_ID_RE.test(s)) {
    return new URL(`https://www.youtube.com/channel/${s}`);
  }
  // Bare @handle
  if (/^@[\w.\-]{2,}$/.test(s)) {
    return new URL(`https://www.youtube.com/${s}`);
  }

  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withProto);
    if (!HOSTS.has(u.hostname.toLowerCase())) return null;
    return u;
  } catch {
    return null;
  }
}

export function parseYouTubeUrl(input: string): YouTubeParsed | null {
  const u = toUrl(input);
  if (!u) return null;

  const host = u.hostname.toLowerCase();
  const parts = u.pathname.split("/").filter(Boolean);

  // youtu.be/<id>
  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = parts[0];
    if (id && VIDEO_ID_RE.test(id)) {
      return {
        kind: "shorts" === parts[1] ? "shorts" : "video",
        videoId: id,
        canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
    return null;
  }

  // /watch?v=ID
  if (parts[0] === "watch") {
    const id = u.searchParams.get("v") || "";
    if (VIDEO_ID_RE.test(id)) {
      const playlistId = u.searchParams.get("list") || undefined;
      return {
        kind: "video",
        videoId: id,
        playlistId,
        canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
    return null;
  }

  // /shorts/ID
  if (parts[0] === "shorts" && parts[1] && VIDEO_ID_RE.test(parts[1])) {
    return {
      kind: "shorts",
      videoId: parts[1],
      canonicalUrl: `https://www.youtube.com/shorts/${parts[1]}`,
    };
  }

  // /embed/ID, /v/ID, /live/ID
  if (
    (parts[0] === "embed" || parts[0] === "v" || parts[0] === "live") &&
    parts[1] &&
    VIDEO_ID_RE.test(parts[1])
  ) {
    return {
      kind: "video",
      videoId: parts[1],
      canonicalUrl: `https://www.youtube.com/watch?v=${parts[1]}`,
    };
  }

  // /channel/UC...
  if (parts[0] === "channel" && parts[1] && CHANNEL_ID_RE.test(parts[1])) {
    return {
      kind: "channel",
      channelId: parts[1],
      canonicalUrl: `https://www.youtube.com/channel/${parts[1]}`,
    };
  }

  // /@handle or /@handle/...
  if (parts[0]?.startsWith("@")) {
    return {
      kind: "channel",
      handle: parts[0],
      canonicalUrl: `https://www.youtube.com/${parts[0]}`,
    };
  }

  // /user/NAME or /c/NAME — legacy channel forms
  if ((parts[0] === "user" || parts[0] === "c") && parts[1]) {
    return {
      kind: "channel",
      handle: parts[1],
      canonicalUrl: `https://www.youtube.com/${parts[0]}/${parts[1]}`,
    };
  }

  // /playlist?list=PL...
  if (parts[0] === "playlist") {
    const list = u.searchParams.get("list") || "";
    if (list) {
      return {
        kind: "playlist",
        playlistId: list,
        canonicalUrl: `https://www.youtube.com/playlist?list=${list}`,
      };
    }
  }

  return null;
}

/** Convenience: returns a downloadable video id (video or shorts) or null. */
export function getYouTubeVideoId(input: string): string | null {
  const p = parseYouTubeUrl(input);
  return p && (p.kind === "video" || p.kind === "shorts") ? p.videoId! : null;
}

/** Human-friendly error for invalid YT input. */
export function youtubeValidationError(input: string): string | null {
  const p = parseYouTubeUrl(input);
  if (!p) return "URL do YouTube inválida. Cole o link do vídeo, shorts ou youtu.be.";
  if (p.kind === "channel")
    return "Esse link é de um canal. Cole o link de um vídeo ou shorts.";
  if (p.kind === "playlist")
    return "Esse link é de uma playlist. Cole o link de um vídeo específico.";
  return null;
}