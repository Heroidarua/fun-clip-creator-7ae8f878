import { apiBase } from "@/lib/api-base";

export interface InstagramMedia {
  url: string;
  type: "video" | "image";
  thumbnail: string;
  quality?: string;
}

export interface InstagramInfo {
  success: boolean;
  media_url: string;
  media_type: "video" | "image";
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  is_carousel?: boolean;
  carousel_items?: InstagramMedia[];
  error?: string;
}

const GENERIC_ERROR = "Não foi possível processar este link. Verifique se o perfil é público.";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new Error(data?.error || GENERIC_ERROR);
  }
  return data as T;
}

export function fetchInstagramInfo(url: string): Promise<InstagramInfo> {
  return postJson("/api/instagram/info", { url });
}

export function requestInstagramDownload(
  mediaUrl: string,
  mediaType: "video" | "image",
  title: string
): Promise<{ success: true; downloadUrl: string; expiresIn: number }> {
  return postJson("/api/instagram/download", { mediaUrl, mediaType, title });
}

export function absoluteDownloadUrl(path: string): string {
  return `${apiBase()}${path}`;
}
