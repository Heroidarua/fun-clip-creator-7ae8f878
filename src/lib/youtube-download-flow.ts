import {
  requestYoutubeDownload,
  absoluteDownloadUrl,
} from "@/services/youtubeDownloader";

const GENERIC_ERROR =
  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.";

/** Acima deste tamanho o arquivo não é processado no navegador. */
export const BROWSER_PROCESS_LIMIT = 300 * 1024 * 1024; // Aumentado para suportar 1080p e 4K

const TOO_LARGE = "TOO_LARGE";

export function safeFileName(title: string) {
  return title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 100) || "youtube";
}

export function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

interface StreamResult {
  bytes: Uint8Array;
  contentType: string;
  directUrl: string;
  muxed: boolean;
}

async function fetchStream(
  videoUrl: string,
  container: "mp4" | "m4a",
  quality: string,
  onRatio: (ratio: number | null) => void,
): Promise<StreamResult> {
  const ticket = await requestYoutubeDownload(videoUrl, container, quality);
  const fileUrl = absoluteDownloadUrl(ticket.downloadUrl);
  const res = await fetch(fileUrl).catch((err) => {
    console.error("Fetch error:", err);
    throw new Error("Erro de conexão com o servidor de download. Tente novamente.");
  });
  
  if (!res.ok || !res.body) {
    let errorDetail = GENERIC_ERROR;
    try {
      const data = await res.json();
      errorDetail = data?.error || errorDetail;
    } catch {
      errorDetail = `Servidor retornou erro ${res.status}. Tente outra qualidade.`;
    }
    throw new Error(errorDetail);
  }
  const total = Number(res.headers.get("content-length") || 0);
  const muxed = res.headers.get("x-yt-muxed") !== "0";
  if (total > BROWSER_PROCESS_LIMIT) {
    await res.body.cancel().catch(() => {});
    const err = new Error(TOO_LARGE) as Error & { directUrl?: string; muxed?: boolean };
    err.directUrl = fileUrl;
    err.muxed = muxed;
    throw err;
  }
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      onRatio(total ? received / total : null);
    }
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return {
    bytes,
    contentType: res.headers.get("content-type") || "application/octet-stream",
    directUrl: fileUrl,
    muxed,
  };
}

export interface DownloadOptions {
  url: string;
  type: "video" | "audio";
  quality?: string;
  title: string;
  onStage?: (stage: string) => void;
  onProgress?: (percent: number | null) => void;
}

/**
 * Executa o mesmo fluxo da ferramenta dedicada: baixa o stream em blocos,
 * junta áudio e vídeo quando necessário e salva o arquivo final.
 */
export async function downloadYoutubeMedia({
  url,
  type,
  quality = "best",
  title,
  onStage,
  onProgress,
}: DownloadOptions): Promise<void> {
  const name = safeFileName(title);
  try {
    if (type === "audio") {
      onStage?.("Baixando o áudio...");
      const audio = await fetchStream(url, "m4a", quality, (r) =>
        onProgress?.(r == null ? null : Math.round(r * 100)),
      );
      saveBlob(
        new Blob([audio.bytes.slice().buffer as ArrayBuffer], { type: audio.contentType }),
        `${name}.m4a`,
      );
      onProgress?.(100);
      return;
    }

    onStage?.("Baixando o vídeo...");
    const video = await fetchStream(url, "mp4", quality, (r) =>
      onProgress?.(r == null ? null : Math.round(r * 60)),
    );

    if (video.muxed) {
      console.log("Arquivo já possui áudio (muxed), pulando etapa de muxagem.");
      saveBlob(
        new Blob([video.bytes.slice().buffer as ArrayBuffer], { type: "video/mp4" }),
        `${name}.mp4`,
      );
      onProgress?.(100);
      return;
    }

    onStage?.("Baixando o áudio...");
    const audio = await fetchStream(url, "m4a", "best", (r) =>
      onProgress?.(60 + (r == null ? 0 : Math.round(r * 20))),
    );
    onStage?.("Juntando áudio e vídeo (isso pode levar alguns segundos)...");
    const { muxVideoAndAudio } = await import("@/lib/youtube-mux");
    const blob = await muxVideoAndAudio(video.bytes, audio.bytes, (ratio) =>
      onProgress?.(80 + Math.min(20, Math.round((ratio || 0) * 20))),
    );
    saveBlob(blob, `${name}.mp4`);
    onProgress?.(100);
  } catch (e) {
    const err = e as Error & { directUrl?: string; muxed?: boolean };
    if (err.message === TOO_LARGE) {
      if (err.directUrl && (type === "audio" || err.muxed)) {
        window.location.href = err.directUrl;
        return;
      }
      throw new Error(
        `Este arquivo passa de ${BROWSER_PROCESS_LIMIT / (1024 * 1024)} MB e não pode ser processado no navegador. Escolha uma qualidade menor ou formato direto.`,
      );
    }
    throw new Error(err.message || GENERIC_ERROR);
  }
}
