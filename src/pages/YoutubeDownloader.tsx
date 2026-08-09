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
/** Acima deste tamanho o navegador baixa direto (sem manter em memória). */
const STREAM_TO_MEMORY_LIMIT = 200 * 1024 * 1024;

export default function YoutubeDownloaderPage() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<YoutubeInfo | null>(null);
  const [selected, setSelected] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

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
      const ticket = await requestYoutubeDownload(info.url, format.container, format.quality);
      const fileUrl = absoluteDownloadUrl(ticket.downloadUrl);

      const res = await fetch(fileUrl);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || GENERIC_ERROR);
      }

      const total = Number(res.headers.get("content-length") || 0);
      if (!res.body || (total && total > STREAM_TO_MEMORY_LIMIT)) {
        window.location.href = fileUrl;
        return;
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
          if (total) setProgress(Math.round((received / total) * 100));
        }
      }

      const blob = new Blob(chunks as BlobPart[], {
        type: res.headers.get("content-type") || "application/octet-stream",
      });
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${info.title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 100) || "youtube"}.${format.container}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      setProgress(100);
    } catch (e) {
      setError((e as Error).message || GENERIC_ERROR);
    } finally {
      setDownloading(false);
    }
  }, [info, selected, downloading]);

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
                <YoutubeDownloadProgress label="Preparando seu download..." progress={progress} />
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
