import {
  requestYoutubeDownload,
  absoluteDownloadUrl,
} from "@/services/youtubeDownloader";

const GENERIC_ERROR =
  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.";

/** Acima deste tamanho o arquivo não é processado no navegador. */
export const BROWSER_PROCESS_LIMIT = 500 * 1024 * 1024; // 500MB

const TOO_LARGE = "TOO_LARGE";

export function safeFileName(title: string) {
  return title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 100) || "youtube";
}

export function saveBlob(blob: Blob, filename: string) {
  try {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    return true;
  } catch (e) {
    console.error("saveBlob error:", e);
    return false;
  }
}

interface StreamResult {
  bytes: Uint8Array;
  contentType: string;
  directUrl: string;
  muxed: boolean;
}

function triggerBrowserDownload(fileUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Baixa o stream completo em memória, informando o progresso.
 * Quando o arquivo já vem com áudio embutido (muxed), o download é entregue
 * diretamente pelo navegador.
 */
async function fetchStream(
  videoUrl: string,
  container: "mp4" | "m4a",
  quality: string,
  onRatio: (ratio: number | null) => void,
): Promise<StreamResult> {
  const ticket = await requestYoutubeDownload(videoUrl, container, quality);
  const fileUrl = absoluteDownloadUrl(ticket.downloadUrl);

  const res = await fetch(fileUrl, { signal: AbortSignal.timeout(300000) });
  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !res.body || contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || GENERIC_ERROR);
  }

  const muxed = res.headers.get("x-yt-muxed") === "1";
  const total = Number(res.headers.get("content-length") || 0);

  if (total > BROWSER_PROCESS_LIMIT) {
    await res.body.cancel().catch(() => undefined);
    const err = new Error(TOO_LARGE) as Error & {
      directUrl?: string;
      muxed?: boolean;
    };
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

  return { bytes, contentType, directUrl: fileUrl, muxed };
}

export interface DownloadOptions {
  url: string;
  type: "video" | "audio";
  quality?: string;
  title: string;
  onStage?: (stage: string) => void;
  onProgress?: (percent: number | null, stage?: string) => void;
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
      const stage = "Baixando o áudio...";
      onStage?.(stage);
      const audio = await fetchStream(url, "m4a", quality, (r) =>
        onProgress?.(r == null ? null : Math.round(r * 100), stage),
      );
      saveBlob(
        new Blob([audio.bytes.slice().buffer as ArrayBuffer], {
          type: audio.contentType || "audio/mp4",
        }),
        `${name}.m4a`,
      );
      onProgress?.(100, "Download concluído!");
      return;
    }

    const videoStage = "Baixando o vídeo...";
    onStage?.(videoStage);
    const video = await fetchStream(url, "mp4", quality || "best", (r) =>
      onProgress?.(r == null ? null : Math.round(r * 60), videoStage),
    );

    if (video.muxed) {
      saveBlob(
        new Blob([video.bytes.slice().buffer as ArrayBuffer], { type: "video/mp4" }),
        `${name}.mp4`,
      );
      onProgress?.(100, "Download concluído!");
      return;
    }

    const audioStage = "Baixando o áudio...";
    onStage?.(audioStage);
    const audio = await fetchStream(url, "m4a", "best", (r) =>
      onProgress?.(60 + (r == null ? 0 : Math.round(r * 20)), audioStage),
    );
    
    const muxStage = "Juntando áudio e vídeo...";
    onStage?.(muxStage);
    const { muxVideoAndAudio } = await import("@/lib/youtube-mux");
    const blob = await muxVideoAndAudio(video.bytes, audio.bytes, (ratio) =>
      onProgress?.(80 + Math.min(20, Math.round((ratio || 0) * 20)), muxStage),
    );
    saveBlob(blob, `${name}.mp4`);
    onProgress?.(100, "Download Concluído!");
  } catch (e) {
    const err = e as Error & { directUrl?: string; muxed?: boolean };
    if (err.message === TOO_LARGE) {
      if (err.directUrl && (type === "audio" || err.muxed)) {
        triggerBrowserDownload(
          err.directUrl,
          `${name}.${type === "audio" ? "m4a" : "mp4"}`,
        );
        return;
      }
      throw new Error(
        "Este arquivo passa de 500 MB e não pode ser processado no navegador. Escolha uma qualidade menor.",
      );
    }
    throw new Error(err.message || GENERIC_ERROR);
  }
}
