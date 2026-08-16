import { useState, useEffect, useRef } from "react";
import { Clipboard, Search, Download, Headphones, Gamepad2, Book, Music, Camera, CheckCircle, AlertTriangle, Play, X, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";
import ScrollReveal from "./ScrollReveal";
import { parseYouTubeUrl } from "@/lib/youtube-url";
import {
  fetchYoutubeInfo,
  formatBytes,
  absoluteDownloadUrl,
  type YoutubeFormat,
  type YoutubeInfo,
} from "@/services/youtubeDownloader";
import { downloadYoutubeMedia, BROWSER_PROCESS_LIMIT } from "@/lib/youtube-download-flow";
import { checkYoutubeJobStatus } from "@/services/youtubeJobs";

// Status Badge Component
const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-pixel ${
    isActive 
      ? "bg-green-500/20 text-green-400 border border-green-500/30" 
      : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
  }`}>
    {isActive ? (
      <>
        <CheckCircle className="w-3 h-3" />
        ATIVO
      </>
    ) : (
      <>
        <AlertTriangle className="w-3 h-3" />
        MANUTENÇÃO
      </>
    )}
  </div>
);

export const MediaPreviewOverlay = ({
  title,
  author,
  duration,
  mediaUrl,
}: {
  title: string;
  author: string;
  duration?: number;
  mediaUrl?: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !mediaUrl) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-4 text-left">
      {mediaUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group">
          <video
            ref={videoRef}
            src={mediaUrl}
            className={`w-full h-full object-contain transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted={false}
            playsInline
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="z-20 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/50 bg-background/80 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:scale-110 transition-transform cursor-pointer"
              >
                <Play className="ml-1 h-6 w-6 fill-current" />
              </button>
            </div>
          )}
          {isPlaying && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-background/60 text-primary hover:bg-background/80 transition-colors"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                )}
              </button>
              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-background/60 text-primary hover:bg-background/80 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              </button>
            </div>
          )}
        </div>
      )}
      <div className={`relative z-10 transition-opacity duration-300 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {!mediaUrl && (
          <div className="mb-3 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-background/85 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </div>
          </div>
        )}
        <p className="font-pixel text-[10px] text-primary">PRÉVIA PRONTA</p>
        <p className="mt-2 line-clamp-2 font-orbitron text-sm text-foreground">{title}</p>
        <div className="mt-2 flex items-center justify-between gap-3 font-retro text-xs text-muted-foreground">
          <span className="truncate">@{author}</span>
          {typeof duration === 'number' && duration > 0 ? <span>{Math.round(duration)}s</span> : null}
        </div>
      </div>
    </div>
  );
};

export default function HeroSection() {
  const { toast } = useToast();
  const { isActive, loading: statusLoading } = useDownloaderStatus();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeInfo, setYoutubeInfo] = useState<YoutubeInfo | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [downloadStage, setDownloadStage] = useState<string | null>(null);
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const youtubeActive = statusLoading || isActive("youtube");

  const resetYoutube = () => {
    setYoutubeInfo(null);
    setYoutubeError(null);
    setSelectedFormat("");
    setDownloadStage(null);
    setDownloadPercent(null);
    setJobId(null);
  };

  const handleYoutubeSearch = async () => {
    if (!youtubeUrl.trim()) return;
    const parsed = parseYouTubeUrl(youtubeUrl);
    if (!parsed) {
      setYoutubeError("URL do YouTube inválida.");
      return;
    }

    setYoutubeLoading(true);
    setYoutubeError(null);
    try {
      const info = await fetchYoutubeInfo(youtubeUrl);
      setYoutubeInfo(info);
      if (info.formats.length > 0) {
        setSelectedFormat(info.formats[0].id);
      }
    } catch (err: any) {
      setYoutubeError(err.message || "Erro ao buscar informações do vídeo.");
    } finally {
      setYoutubeLoading(false);
    }
  };

  useEffect(() => {
    let timer: number;
    if (jobId && downloadStage === "Processando tarefa no servidor...") {
      const poll = async () => {
        try {
          const status = await checkYoutubeJobStatus(jobId);
          if (status.status === 'COMPLETED') {
            setJobId(null);
            const format = youtubeInfo?.formats.find(f => f.id === selectedFormat);
            if (!format || !youtubeInfo) return;

            setDownloadStage("Iniciando download...");
            await downloadYoutubeMedia({
              url: youtubeInfo.url,
              type: format.type,
              quality: format.quality,
              title: youtubeInfo.title,
              onStage: setDownloadStage,
              onProgress: setDownloadPercent
            });
            
            toast({
              title: "Sucesso!",
              description: "Seu download foi concluído.",
            });
            resetYoutube();
          } else if (status.status === 'FAILED') {
            setJobId(null);
            setYoutubeError(status.error || "A tarefa falhou no servidor.");
            setDownloadStage(null);
          } else {
            setDownloadPercent(status.progress);
            timer = window.setTimeout(poll, 2000);
          }
        } catch (err: any) {
          setJobId(null);
          setYoutubeError(err.message || "Erro ao acompanhar a tarefa.");
          setDownloadStage(null);
        }
      };
      timer = window.setTimeout(poll, 2000);
    }
    return () => clearTimeout(timer);
  }, [jobId, downloadStage, youtubeInfo, selectedFormat, toast]);

  const handleYoutubeDownload = async () => {
    if (!youtubeInfo || !selectedFormat) return;
    const format = youtubeInfo.formats.find(f => f.id === selectedFormat);
    if (!format) return;

    setDownloadStage("Preparando tarefa...");
    setDownloadPercent(0);
    setYoutubeError(null);

    try {
      const { requestYoutubeDownload } = await import("@/services/youtubeDownloader");
      const res = await requestYoutubeDownload(youtubeInfo.url, format.container, format.quality);
      
      if (res.success && (res as any).jobId) {
        setJobId((res as any).jobId);
        setDownloadStage("Processando tarefa no servidor...");
      } else {
        // Fallback para download direto se não houver jobId (versão antiga da API ou erro)
        await downloadYoutubeMedia({
          url: youtubeInfo.url,
          type: format.type,
          quality: format.quality,
          title: youtubeInfo.title,
          onStage: setDownloadStage,
          onProgress: setDownloadPercent
        });
        toast({
          title: "Sucesso!",
          description: "Seu download foi concluído.",
        });
        resetYoutube();
      }
    } catch (err: any) {
      setYoutubeError(err.message || "Erro ao processar o download.");
      setDownloadStage(null);
      setDownloadPercent(null);
    }
  };

  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-archivo font-black mb-6 tracking-tight uppercase italic text-glow-retro">
              Tudo em um só <span className="text-primary">LUGAR</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-manrope max-w-2xl mx-auto mb-8">
              A maior plataforma gratuita de utilidades, downloads e entretenimento da internet brasileira.
            </p>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <ScrollReveal delay={200}>
            <div className="bg-card border-2 border-primary/20 rounded-xl overflow-hidden shadow-2xl relative group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
              
              <div className="p-1 border-b-2 border-primary/20 flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-4 px-3 py-2">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <img src={youtubeIcon} alt="YouTube" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-archivo font-bold text-sm tracking-wide">YOUTUBE DOWNLOADER</h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vídeos e Áudios em HD</p>
                  </div>
                </div>
                <div className="pr-4">
                  <StatusBadge isActive={youtubeActive} />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      placeholder="Cole aqui o link do YouTube..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="pl-10 h-14 bg-background border-2 border-primary/20 focus:border-primary transition-all rounded-lg font-manrope text-base"
                    />
                  </div>
                  <Button 
                    size="lg"
                    disabled={youtubeLoading || !youtubeActive}
                    onClick={handleYoutubeSearch}
                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-archivo font-black uppercase tracking-wider rounded-lg shadow-[4px_4px_0_hsl(var(--primary)/0.3)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    {youtubeLoading ? "BUSCANDO..." : "BUSCAR"}
                  </Button>
                </div>

                {!youtubeActive && <div className="mt-4 p-3 rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 animate-pulse text-xs text-yellow-500 uppercase font-pixel tracking-widest">Serviço em Manutenção</div>}

                {youtubeError && (
                  <div className="mt-4 p-4 rounded-lg border-2 border-destructive/20 bg-destructive/10 flex items-start gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-destructive uppercase tracking-wide">Erro no Processamento</p>
                      <p className="text-xs text-destructive/80 font-manrope mt-1">{youtubeError}</p>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => jobId ? setDownloadStage("Processando tarefa no servidor...") : handleYoutubeSearch()} className="h-8 text-[10px] gap-2 border-destructive/30 hover:bg-destructive/10">
                          <RotateCcw className="w-3 h-3" /> TENTAR NOVAMENTE
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetYoutube} className="h-8 text-[10px] gap-2 border-primary/20">
                          <Trash2 className="w-3 h-3" /> LIMPAR
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {youtubeInfo && (
                  <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/20 shadow-lg group/media">
                      <MediaPreviewOverlay 
                        title={youtubeInfo.title}
                        author={youtubeInfo.author}
                        duration={youtubeInfo.duration}
                        mediaUrl={absoluteDownloadUrl(`/api/youtube/file?videoId=${youtubeInfo.videoId}&token=preview`)}
                      />
                    </div>

                    <div className="space-y-4 text-left">
                      <h4 className="font-archivo font-black text-xs uppercase tracking-widest text-primary">SELECIONE A QUALIDADE</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {youtubeInfo.formats.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setSelectedFormat(f.id)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              selectedFormat === f.id 
                                ? "border-primary bg-primary/10 shadow-[inner_0_0_12px_rgba(var(--primary),0.2)]" 
                                : "border-primary/10 bg-muted/30 hover:border-primary/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {f.type === 'audio' ? <Headphones className="w-3 h-3 text-primary" /> : <Camera className="w-3 h-3 text-primary" />}
                              <span className="font-archivo font-bold text-[10px] uppercase tracking-tighter">{f.label}</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground font-manrope">{f.container.toUpperCase()} • {formatBytes(f.estimatedBytes)}</p>
                          </button>
                        ))}
                      </div>

                      {downloadStage && (
                        <div className="p-4 rounded-lg bg-muted/50 border-2 border-primary/20 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-archivo font-bold uppercase tracking-widest text-primary animate-pulse">{downloadStage}</span>
                            {downloadPercent !== null && <span className="text-[10px] font-pixel text-primary">{downloadPercent}%</span>}
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden border border-primary/10">
                            <div 
                              className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                              style={{ width: `${downloadPercent ?? 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={handleYoutubeDownload}
                          disabled={!!downloadStage || !selectedFormat}
                          className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-archivo font-black uppercase tracking-widest rounded-lg shadow-[4px_4px_0_hsl(var(--primary)/0.3)] transition-all"
                        >
                          <Download className="mr-2 w-5 h-5" /> BAIXAR AGORA
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={resetYoutube}
                          className="h-14 w-14 border-2 border-primary/20 hover:bg-muted rounded-lg p-0"
                        >
                          <X className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
