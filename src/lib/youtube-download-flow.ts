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

async function fetchStream(
  videoUrl: string,
  container: "mp4" | "m4a",
  quality: string,
  onRatio: (ratio: number | null) => void,
): Promise<StreamResult> {
  const ticket = await requestYoutubeDownload(videoUrl, container, quality);
  const fileUrl = absoluteDownloadUrl(ticket.downloadUrl);

  // O endpoint já responde com Content-Disposition: attachment. Abrir o link
  // diretamente evita baixar o mesmo arquivo duas vezes e funciona também em
  // celulares, onde um fetch grande pode ser encerrado pelo navegador.
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = "";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return {
    bytes: new Uint8Array(0),
    contentType: container === "m4a" ? "audio/mp4" : "video/mp4",
    directUrl: fileUrl,
    muxed: true,
  };
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
      const stage = "Processando Áudio...";
      onStage?.(stage);
      const audio = await fetchStream(url, "m4a", quality, (r) =>
        onProgress?.(r == null ? null : Math.round(r * 100), stage),
      );
      // O redirecionamento já foi feito dentro do fetchStream para m4a
      onProgress?.(100, "Concluído!");
      return;
    }

    const videoStage = "Processando Vídeo...";
    onStage?.(videoStage);
    const video = await fetchStream(url, "mp4", quality || "best", (r) =>
      onProgress?.(r == null ? null : Math.round(r * 60), videoStage),
    );

    if (video.muxed) {
      // O redirecionamento já foi feito dentro do fetchStream para vídeo muxed
      onProgress?.(100, "Concluído!");
      return;
    }

    const audioStage = "Processando Áudio...";
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
        window.location.href = err.directUrl;
        return;
      }
      throw new Error(
        "Este arquivo passa de 500 MB e não pode ser processado no navegador. Escolha uma qualidade menor.",
      );
    }
    throw new Error(err.message || GENERIC_ERROR);
  }
}
