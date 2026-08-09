import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import YoutubeUrlInput from "@/components/youtube-downloader/YoutubeUrlInput";
import YoutubeVideoPreview from "@/components/youtube-downloader/YoutubeVideoPreview";
import YoutubeFormatSelector from "@/components/youtube-downloader/YoutubeFormatSelector";
import YoutubeDownloadProgress from "@/components/youtube-downloader/YoutubeDownloadProgress";
import {
  fetchYoutubeInfo,
  requestYoutubeDownload,
  absoluteDownloadUrl,
  type YoutubeInfo,
} from "@/services/youtubeDownloader";
import { AlertCircle, Download, RotateCcw, Trash2 } from "lucide-react";

const GENERIC_ERROR =
  "Não foi possível processar este vídeo. Verifique a URL e tente novamente.";

function safeName(title: string) {
  return title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 100) || "youtube";
}

function saveBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export default function YoutubeDownloaderPage() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<YoutubeInfo | null>(null);
  const [selected, setSelected] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState("Preparando seu download...");
  const [error, setError] = useState("");

  const fetchStream = useCallback(
    async (
      videoUrl: string,
      container: "mp4" | "m4a",
      quality: string,
      onRatio: (r: number | null) => void,
    ): Promise<{ bytes: Uint8Array; contentType: string }> => {
      const ticket = await requestYoutubeDownload(videoUrl, container, quality);
      const res = await fetch(absoluteDownloadUrl(ticket.downloadUrl));
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || GENERIC_ERROR);
      }
      const total = Number(res.headers.get("content-length") || 0);
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
      for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.length;
      }
      return {
        bytes,
        contentType: res.headers.get("content-type") || "application/octet-stream",
      };
    },
    [],
  );

  const analyze = useCallback(async () => {
    if (!url.trim() || analyzing) return;
    setAnalyzing(true);
    setError("");
    setInfo(null);
    try {
      const data = await fetchYoutubeInfo(url.trim());
      setInfo(data);
      setSelected(data.formats[0]?.id ?? "");
    } catch (e) {
      setError((e as Error).message || GENERIC_ERROR);
    } finally {
      setAnalyzing(false);
    }
  }, [url, analyzing]);

  const clearAll = useCallback(() => {
    setUrl("");
    setInfo(null);
    setSelected("");
    setError("");
    setProgress(null);
  }, []);

  const download = useCallback(async () => {
    if (!info || downloading) return;
    const format = info.formats.find((f) => f.id === selected);
    if (!format) return;

    setDownloading(true);
    setError("");
    setProgress(null);
    try {
      if (format.type === "audio") {
        setStage("Baixando o áudio...");
        const audio = await fetchStream(info.url, "m4a", format.quality, (r) =>
          setProgress(r == null ? null : Math.round(r * 100)),
        );
        saveBlob(
          new Blob([audio.bytes.slice().buffer as ArrayBuffer], { type: audio.contentType }),
          `${safeName(info.title)}.m4a`,
        );
      } else {
        setStage("Baixando o vídeo...");
        const video = await fetchStream(info.url, "mp4", format.quality, (r) =>
          setProgress(r == null ? null : Math.round(r * 60)),
        );
        setStage("Baixando o áudio...");
        const audio = await fetchStream(info.url, "m4a", "best", (r) =>
          setProgress(60 + (r == null ? 0 : Math.round(r * 20))),
        );
        setStage("Juntando áudio e vídeo (isso pode levar alguns segundos)...");
        const { muxVideoAndAudio } = await import("@/lib/youtube-mux");
        const blob = await muxVideoAndAudio(video.bytes, audio.bytes, (ratio) =>
          setProgress(80 + Math.min(20, Math.round((ratio || 0) * 20))),
        );
        saveBlob(blob, `${safeName(info.title)}.mp4`);
      }
      setProgress(100);
    } catch (e) {
      setError((e as Error).message || GENERIC_ERROR);
    } finally {
      setDownloading(false);
    }
  }, [info, selected, downloading, fetchStream]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumbs
          items={[
            { name: "Início", path: "/" },
            { name: "Ferramentas", path: "/ferramentas" },
            { name: "Downloader de Vídeos do YouTube", path: "/ferramentas/youtube-downloader" },
          ]}
        />

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Downloader de Vídeos do YouTube
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Baixe conteúdos que você tem autorização para baixar.
          </p>
        </header>

        <section className="space-y-6 rounded-md border border-border bg-card/40 p-4 sm:p-6">
          <YoutubeUrlInput
            value={url}
            onChange={setUrl}
            onSubmit={analyze}
            loading={analyzing}
            disabled={downloading}
          />

          {analyzing && <YoutubeDownloadProgress label="Analisando vídeo..." />}

          {error && (
            <div className="space-y-3 rounded-md border border-destructive/40 bg-destructive/10 p-3">
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (info ? download() : analyze())}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border-2 border-border px-4 text-sm font-medium text-foreground"
                >
                  <RotateCcw className="h-4 w-4" /> Nova tentativa
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border-2 border-border px-4 text-sm font-medium text-foreground"
                >
                  <Trash2 className="h-4 w-4" /> Limpar
                </button>
              </div>
            </div>
          )}

          {info && (
            <div className="space-y-5">
              <YoutubeVideoPreview info={info} />
              <YoutubeFormatSelector
                formats={info.formats}
                selected={selected}
                onSelect={setSelected}
              />

              {downloading && (
                <YoutubeDownloadProgress label={stage} progress={progress} />
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={download}
                  disabled={downloading || !selected}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground disabled:opacity-60 sm:flex-none"
                >
                  <Download className="h-4 w-4" /> Baixar
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-border px-6 text-sm font-medium text-foreground"
                >
                  <Trash2 className="h-4 w-4" /> Limpar
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Use apenas com conteúdos próprios ou que você tenha autorização para baixar. Os links
            gerados são temporários e expiram automaticamente.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
