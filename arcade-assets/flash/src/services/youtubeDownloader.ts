import { apiBase } from "@/lib/api-base";

export interface YoutubeFormat {
  id: string;
  container: "mp4" | "m4a";
  type: "video" | "audio";
  quality: string;
  label: string;
  estimatedBytes: number | null;
}

export interface YoutubeInfo {
  videoId: string;
  url: string;
  title: string;
  author: string;
  thumbnail: string;
  duration: number;
  formats: YoutubeFormat[];
}

const GENERIC_ERROR =
  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor da ferramenta. Verifique sua conexão e tente novamente em instantes.",
    );
  }
  const data = await res.json().catch(() => null);
  if (!data) {
    throw new Error(
      "O serviço de download está temporariamente indisponível. Tente novamente em alguns minutos.",
    );
  }
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || GENERIC_ERROR);
  }
  return data as T;
}

export function fetchYoutubeInfo(url: string): Promise<YoutubeInfo & { success: true }> {
  return postJson("/api/youtube/info", { url });
}

export function requestYoutubeDownload(
  url: string,
  format: "mp4" | "m4a",
  quality: string,
): Promise<{ success: true; downloadUrl: string; expiresIn: number }> {
  return postJson("/api/youtube/download", { url, format, quality });
}

export function fetchYoutubeJobStatus(id: string): Promise<{
  success: true;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  title?: string;
  error?: string;
}> {
  return fetch(`${apiBase()}/api/youtube/status/${id}`).then((r) => r.json());
}

export function absoluteDownloadUrl(path: string): string {
  return `${apiBase()}${path}`;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}
