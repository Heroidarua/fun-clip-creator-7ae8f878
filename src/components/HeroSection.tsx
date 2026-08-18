import { useState, useEffect, useRef } from "react";
import { Clipboard, Search, Download, Headphones, Gamepad2, Book, Music, Camera, CheckCircle, AlertTriangle, Play, Video, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "@tanstack/react-router";
import { createEnhancementJob, getJobStatus } from "@/lib/video-enhancer/jobs.functions";



import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";

import ScrollReveal from "./ScrollReveal";
import { apiUrl, rewriteProxy } from "@/lib/api-base";
import { parseYouTubeUrl, youtubeValidationError, getYouTubeVideoId } from "@/lib/youtube-url";
import {
  fetchYoutubeInfo,
  formatBytes,
  type YoutubeFormat,
  type YoutubeInfo,
} from "@/services/youtubeDownloader";
import { downloadYoutubeMedia, BROWSER_PROCESS_LIMIT } from "@/lib/youtube-download-flow";
import { useServerFn } from "@tanstack/react-start";
import { validatePinterestUrl } from "@/lib/pinterest-validation";
import tiktokIcon from "@/assets/tiktok-icon.png";
import instagramIcon from "@/assets/instagram-icon.png";
import kwaiIcon from "@/assets/kwai-icon.png";
import youtubeIcon from "@/assets/youtube-icon.png";
import facebookIcon from "@/assets/facebook-icon.png";

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

// Maintenance Warning Component
const MaintenanceWarning = () => (
  <div className="mt-4 p-3 rounded-sm border-2 border-yellow-500/30 bg-yellow-500/10 animate-pulse">
    <div className="flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 text-yellow-400" />
      <span className="font-pixel text-[10px] text-yellow-400">
        SERVIÇO EM MANUTENÇÃO
      </span>
    </div>
    <p className="font-orbitron text-[10px] text-yellow-400/80 text-center mt-1">
      Este downloader está temporariamente indisponível. Tente novamente mais tarde.
    </p>
  </div>
);

const MediaPreviewOverlay = ({
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
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !mediaUrl) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setPreviewError(false);
    setIsLoadingPreview(true);
    try {
      await videoRef.current.play();
      setIsPlaying(true);
    } catch {
      setPreviewError(true);
      setIsPlaying(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent p-4 text-left">
      {/* Mini Player */}
      {mediaUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group">
          <video
            ref={videoRef}
            src={mediaUrl}
            className={`w-full h-full object-contain transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted={false}
            playsInline
            preload="none"
            crossOrigin="anonymous"
            onWaiting={() => setIsLoadingPreview(true)}
            onPlaying={() => {
              setIsLoadingPreview(false);
              setIsPlaying(true);
            }}
            onError={() => {
              setPreviewError(true);
              setIsPlaying(false);
              setIsLoadingPreview(false);
            }}
          />
          
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <button
                onClick={togglePlay}
                disabled={isLoadingPreview}
                className="z-20 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/50 bg-background/80 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:scale-110 transition-transform cursor-pointer"
              >
                {isLoadingPreview ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Play className="ml-1 h-6 w-6 fill-current" />
                )}
              </button>
              {isLoadingPreview && (
                <span className="z-20 font-orbitron text-[10px] text-primary">
                  Carregando prévia...
                </span>
              )}
              {previewError && !isLoadingPreview && (
                <span className="z-20 max-w-[240px] text-center font-orbitron text-[10px] text-yellow-400">
                  Prévia indisponível para este vídeo — o download continua funcionando.
                </span>
              )}
            </div>
          )}

          {isPlaying && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-background/60 text-primary hover:bg-background/80 transition-colors"
                title={isMuted ? "Desmutar" : "Mutar"}
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

      {/* Media Info Overlay */}
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


interface VideoData {
  video_urls: {
    hd: string;
    sd: string;
    watermark: string;
  };
  audio_url: string;
  title: string;
  author: string;
  duration: number;
  thumbnail: string;
  proxy_video_url?: string;
  proxy_audio_url?: string;
  proxy_thumbnail_url?: string;
}

interface CarouselItem {
  index: number;
  media_url: string;
  media_type: 'video' | 'image';
  thumbnail: string;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
}

interface InstagramData {
  media_url: string;
  media_type: 'video' | 'image';
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
  is_carousel?: boolean;
  carousel_items?: CarouselItem[];
}

interface KwaiData {
  video_url: string;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
}

interface FacebookData {
  video_url: string;
  proxy_url?: string;
  proxy_thumbnail_url?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
}

interface PinterestData {
  media_url: string;
  media_type: 'video' | 'image' | 'gif';
  proxy_url?: string;
  video_url?: string;
  proxy_thumbnail_url?: string;
  thumbnail: string;
  title: string;
  author: string;
}

interface YouTubeData {
  video_url: string;
  audio_url?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  download_page_url?: string;
}


const HeroSection = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const { toast } = useToast();
  const { isActive } = useDownloaderStatus();
  const trackDownload = (_: string) => {};

  // Instagram states
  const [instagramUrl, setInstagramUrl] = useState("");
  const [instagramLoading, setInstagramLoading] = useState(false);
  const [instagramProgress, setInstagramProgress] = useState(0);
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [clickedInstagramButton, setClickedInstagramButton] = useState<string | null>(null);
  const [selectedCarouselIndex, setSelectedCarouselIndex] = useState(0);

  // Kwai states
  const [kwaiUrl, setKwaiUrl] = useState("");
  const [kwaiLoading, setKwaiLoading] = useState(false);
  const [kwaiProgress, setKwaiProgress] = useState(0);
  const [kwaiData, setKwaiData] = useState<KwaiData | null>(null);
  const [clickedKwaiButton, setClickedKwaiButton] = useState<string | null>(null);

  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeLoading, setYoutubeLoading] = useState(false);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [youtubeDownloadType, setYoutubeDownloadType] = useState<"video" | "audio">("video");
  const [clickedYoutubeButton, setClickedYoutubeButton] = useState<string | null>(null);
  const youtubeInfoRef = useRef<YoutubeInfo | null>(null);
  const [youtubeFormats, setYoutubeFormats] = useState<YoutubeFormat[]>([]);
  const [youtubeQuality, setYoutubeQuality] = useState<string>("");
  const [isYoutubeProcessing, setIsYoutubeProcessing] = useState(false);

  // Facebook states
  const [facebookUrl, setFacebookUrl] = useState("");
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [facebookProgress, setFacebookProgress] = useState(0);
  const [facebookData, setFacebookData] = useState<FacebookData | null>(null);
  const [clickedFacebookButton, setClickedFacebookButton] = useState<string | null>(null);

  // Pinterest states
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [pinterestProgress, setPinterestProgress] = useState(0);
  const [pinterestData, setPinterestData] = useState<PinterestData | null>(null);
  const [clickedPinterestButton, setClickedPinterestButton] = useState<string | null>(null);

  // Melhorar Vídeo states
  const [videoEnhancerUrl, setVideoEnhancerUrl] = useState("");
  const [videoEnhancerLoading, setVideoEnhancerLoading] = useState(false);
  const [videoEnhancerProgress, setVideoEnhancerProgress] = useState(0);
  const [videoEnhancerJobId, setVideoEnhancerJobId] = useState<string | null>(null);
  const [videoEnhancerStatus, setVideoEnhancerStatus] = useState<any>(null);
  const [clickedVideoEnhancerButton, setClickedVideoEnhancerButton] = useState<string | null>(null);

  const createEnhancementJobFn = useServerFn(createEnhancementJob);
  const getJobStatusFn = useServerFn(getJobStatus);




  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'tiktok';
    return null;
  };

  const getPlatformIcon = (platform: string | null) => {
    if (platform === 'tiktok') return <img src={tiktokIcon} alt="Logotipo do TikTok" className="w-5 h-5" width={20} height={20} />;
    return null;
  };

  const fetchJsonWithRetry = async (input: RequestInfo | URL, init?: RequestInit, retries = 2, delay = 700) => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(input, init);
        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt === retries) break;
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Falha temporária ao buscar a mídia.');
  };

  const openExternalDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePaste = async () => {
    setClickedButton("paste");
    setTimeout(() => setClickedButton(null), 300);
    
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      const platform = detectPlatform(text);
      setDetectedPlatform(platform);
      toast({
        title: "✅ Link colado com sucesso!",
        description: "Agora clique em 'Procurar' para encontrar o vídeo.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = async () => {
    setClickedButton("search");
    setTimeout(() => setClickedButton(null), 300);
    
    if (!url.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira um URL válido para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API TikTok com URL:", url.trim());
      
      const data = await fetchJsonWithRetry(apiUrl('/api/download-tiktok'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      setProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setVideoData(rewriteProxy(data.data));
        toast({
          title: "Vídeo encontrado!",
          description: "Pronto para download.",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: data.error || "Não foi possível processar o vídeo.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      clearInterval(progressInterval);
      
      let errorMessage = "Tente novamente em alguns momentos.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleDownload = async () => {
    setClickedButton("download");
    setTimeout(() => setClickedButton(null), 300);
    
    if (!videoData) return;

    const downloadUrl = downloadType === "video"
      ? (videoData.proxy_video_url || videoData.video_urls?.hd)
      : (videoData.proxy_audio_url || videoData.audio_url);
    
    if (!downloadUrl) {
      toast({
        title: "Erro",
        description: `URL de ${downloadType === "video" ? "vídeo" : "áudio"} não encontrada.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const downloadBlobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadBlobUrl;
      const fileExtension = downloadType === "video" ? "mp4" : "mp3";
      link.download = `${videoData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${downloadType === "video" ? "ultra_hd" : "audio"}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadBlobUrl);

      trackDownload('tiktok');
      toast({
        title: "Download iniciado!",
        description: `O ${downloadType === "video" ? "vídeo" : "áudio"} está sendo baixado.`,
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: `Não foi possível baixar o ${downloadType === "video" ? "vídeo" : "áudio"}.`,
        variant: "destructive",
      });
    }
  };

  // Instagram handlers
  const handleInstagramPaste = async () => {
    setClickedInstagramButton("paste");
    setTimeout(() => setClickedInstagramButton(null), 300);
    
    try {
      const text = await navigator.clipboard.readText();
      setInstagramUrl(text);
      toast({
        title: "✅ Link colado com sucesso!",
        description: "Agora clique em 'Procurar' para encontrar a mídia.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const handleInstagramSearch = async () => {
    setClickedInstagramButton("search");
    setTimeout(() => setClickedInstagramButton(null), 300);
    
    if (!instagramUrl.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira um URL válido do Instagram (vídeo, foto ou story).",
        variant: "destructive",
      });
      return;
    }

    setInstagramLoading(true);
    setInstagramProgress(0);
    setSelectedCarouselIndex(0);

    const progressInterval = setInterval(() => {
      setInstagramProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API Instagram com URL:", instagramUrl.trim());
      
      const data = await fetchJsonWithRetry(apiUrl('/api/download-instagram'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: instagramUrl.trim() }),
      });

      setInstagramProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setInstagramData(rewriteProxy(data.data));
        setSelectedCarouselIndex(0);
        const isCarousel = data.data.is_carousel && data.data.carousel_items?.length > 1;
        const mediaTypeText = isCarousel 
          ? `Carrossel com ${data.data.carousel_items.length} itens` 
          : (data.data.media_type === 'video' ? 'Vídeo' : 'Foto');
        toast({
          title: `${isCarousel ? 'Carrossel' : mediaTypeText} encontrado!`,
          description: isCarousel ? "Selecione o item que deseja baixar." : "Pronto para download.",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: data.error || "Não foi possível processar a mídia do Instagram.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      clearInterval(progressInterval);
      
      let errorMessage = "Tente novamente em alguns momentos.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setInstagramLoading(false);
        setInstagramProgress(0);
      }, 500);
    }
  };

  const handleInstagramDownload = async (itemIndex?: number) => {
    setClickedInstagramButton("download");
    setTimeout(() => setClickedInstagramButton(null), 300);
    
    if (!instagramData) return;

    try {
      let downloadUrl: string;
      let mediaType: 'video' | 'image';
      
      // If carousel and specific item selected
      if (instagramData.is_carousel && instagramData.carousel_items && itemIndex !== undefined) {
        const item = instagramData.carousel_items[itemIndex];
        downloadUrl = item.proxy_url || item.media_url;
        mediaType = item.media_type;
      } else if (instagramData.is_carousel && instagramData.carousel_items) {
        // Use selected carousel index
        const item = instagramData.carousel_items[selectedCarouselIndex];
        downloadUrl = item.proxy_url || item.media_url;
        mediaType = item.media_type;
      } else {
        // Single item
        downloadUrl = instagramData.proxy_url || instagramData.media_url;
        mediaType = instagramData.media_type;
      }
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const downloadBlobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadBlobUrl;
      const extension = mediaType === 'video' ? 'mp4' : 'jpg';
      const itemSuffix = itemIndex !== undefined ? `_${itemIndex + 1}` : '';
      link.download = `${instagramData.title.replace(/[^a-zA-Z0-9]/g, '_')}_instagram${itemSuffix}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadBlobUrl);

      const mediaTypeText = mediaType === 'video' ? 'vídeo' : 'foto';
      trackDownload('instagram');
      toast({
        title: "Download iniciado!",
        description: `${mediaTypeText.charAt(0).toUpperCase() + mediaTypeText.slice(1)} está sendo baixado.`,
      });
    } catch (error) {
      const mediaTypeText = instagramData?.media_type === 'video' ? 'vídeo' : 'foto';
      toast({
        title: "Erro no download",
        description: `Não foi possível baixar ${mediaTypeText === 'vídeo' ? 'o' : 'a'} ${mediaTypeText}.`,
        variant: "destructive",
      });
    }
  };

  // Kwai handlers
  const handleKwaiPaste = async () => {
    setClickedKwaiButton("paste");
    setTimeout(() => setClickedKwaiButton(null), 300);
    
    try {
      const text = await navigator.clipboard.readText();
      setKwaiUrl(text);
      toast({
        title: "✅ Link colado com sucesso!",
        description: "Agora clique em 'Procurar' para encontrar o vídeo.",
      });
    } catch (err) {
      toast({
        title: "❌ Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const handleKwaiSearch = async () => {
    setClickedKwaiButton("search");
    setTimeout(() => setClickedKwaiButton(null), 300);
    
    if (!kwaiUrl.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira um URL válido do Kwai.",
        variant: "destructive",
      });
      return;
    }

    setKwaiLoading(true);
    setKwaiProgress(0);

    const progressInterval = setInterval(() => {
      setKwaiProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API Kwai com URL:", kwaiUrl.trim());
      
      const data = await fetchJsonWithRetry(apiUrl('/api/download-kwai'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: kwaiUrl.trim() }),
      });

      setKwaiProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setKwaiData(rewriteProxy(data.data));
        toast({
          title: "Vídeo encontrado!",
          description: "Pronto para download.",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: data.error || "Não foi possível processar o vídeo do Kwai.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro completo:", error);
      clearInterval(progressInterval);
      
      let errorMessage = "Tente novamente em alguns momentos.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setKwaiLoading(false);
        setKwaiProgress(0);
      }, 500);
    }
  };

  const handleKwaiDownload = async () => {
    setClickedKwaiButton("download");
    setTimeout(() => setClickedKwaiButton(null), 300);
    
    if (!kwaiData) return;

    try {
      const response = await fetch(kwaiData.proxy_url || kwaiData.video_url);
      const blob = await response.blob();
      const downloadBlobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadBlobUrl;
      link.download = `${kwaiData.title.replace(/[^a-zA-Z0-9]/g, '_')}_kwai.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadBlobUrl);

      trackDownload('kwai');
      toast({
        title: "Download iniciado!",
        description: "O vídeo está sendo baixado.",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o vídeo.",
        variant: "destructive",
      });
    }
  };

  // YouTube handlers
  const handleYoutubePaste = async () => {
    setClickedYoutubeButton("paste");
    setTimeout(() => setClickedYoutubeButton(null), 300);
    
    try {
      const text = await navigator.clipboard.readText();
      setYoutubeUrl(text);
      const vid = getYouTubeVideoId(text);
      if (vid) {
        toast({
          title: "✅ Link colado!",
          description: "Clique em 'Buscar' para carregar o vídeo.",
        });
      } else {
        toast({
          title: "✅ Link colado",
          description: "Cole um link válido do YouTube (vídeo, shorts ou youtu.be).",
        });
      }
    } catch (err) {
      toast({
        title: "❌ Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const handleYoutubeSearch = async () => {
    setClickedYoutubeButton("search");
    setTimeout(() => setClickedYoutubeButton(null), 200);
    
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira um URL válido do YouTube.",
        variant: "destructive",
      });
      return;
    }

    const validationError = youtubeValidationError(youtubeUrl);
    const parsed = parseYouTubeUrl(youtubeUrl);
    if (validationError || !parsed) {
      toast({
        title: "URL inválida",
        description: validationError || "Cole um link de vídeo do YouTube.",
        variant: "destructive",
      });
      return;
    }
    const normalizedUrl = parsed.canonicalUrl;
    setYoutubeUrl(normalizedUrl);

    setYoutubeLoading(true);
    setYoutubeProgress(0);
    setYoutubeData(null);

    const progressInterval = setInterval(() => {
      setYoutubeProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const info = await fetchYoutubeInfo(normalizedUrl);
      youtubeInfoRef.current = info;
      const availableFormats = info.formats || [];
      setYoutubeFormats(availableFormats);
      
      const firstVideo = availableFormats.find((f) => f.type === "video");
      const highQualityVideo = availableFormats.find((f) => f.type === "video" && (f.quality === "high" || f.quality === "best" || f.id.includes("720")));
      
      setYoutubeDownloadType(firstVideo ? "video" : (availableFormats.some(f => f.type === "audio") ? "audio" : "video"));
      setYoutubeQuality((highQualityVideo || firstVideo || availableFormats[0])?.id ?? "");

      setYoutubeProgress(100);
      clearInterval(progressInterval);

      setYoutubeData({
        video_url: info.url,
        audio_url: info.formats.some((f) => f.type === "audio") ? info.url : undefined,
        thumbnail: info.thumbnail,
        title: info.title,
        author: info.author,
        duration: info.duration,
      });

      toast({
        title: "Vídeo encontrado!",
        description: "Escolha a qualidade e clique em BAIXAR.",
      });
    } catch (error: any) {
      console.error("Erro completo:", error);
      clearInterval(progressInterval);
      
      let errorMessage = "Tente novamente em alguns momentos.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro de conexão",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setYoutubeLoading(false);
        setYoutubeProgress(0);
      }, 500);
    }
  };

  // Após encontrar o vídeo, o usuário escolhe a qualidade antes de baixar.

  const selectYoutubeType = (type: "video" | "audio") => {
    setYoutubeDownloadType(type);
    const availableForType = youtubeFormats.filter((f) => f.type === type);
    if (availableForType.length > 0) {
      // Tenta manter a qualidade atual se existir no novo tipo (ex: "best") ou pega a primeira
      const currentQualityStillAvailable = availableForType.find(f => f.id === youtubeQuality);
      setYoutubeQuality(currentQualityStillAvailable ? youtubeQuality : availableForType[0].id);
    } else {
      setYoutubeQuality("");
    }
  };


  const handleYoutubeDownload = async (isAutoDownload = false) => {
    setClickedYoutubeButton("download");
    setTimeout(() => setClickedYoutubeButton(null), 200);
    
    if (!youtubeData) return;

    const info = youtubeInfoRef.current;
    const canonical =
      info?.url || parseYouTubeUrl(youtubeUrl)?.canonicalUrl || youtubeUrl.trim();
    const wantedType = youtubeDownloadType;
    const format =
      youtubeFormats.find((f) => f.id === youtubeQuality && f.type === wantedType) ||
      youtubeFormats.find((f) => f.type === wantedType) ||
      info?.formats.find((f) => f.type === wantedType);

    try {
      toast({
        title: "🚀 Preparando download...",
        description: "Baixando o arquivo. Isso pode levar alguns instantes...",
      });

      setIsYoutubeProcessing(true);
      setYoutubeLoading(true);
      setYoutubeProgress(0);

      await downloadYoutubeMedia({
        url: canonical,
        type: wantedType,
        quality: format?.id || "best", // Passamos o ID exato para a API de download resolver
        title: youtubeData.title || "youtube",
        onProgress: (p) => setYoutubeProgress(p ?? 0),
      });

      toast({
        title: "✅ Download concluído!",
        description: `O ${wantedType === "video" ? "vídeo" : "áudio"} foi salvo no seu dispositivo.`,
      });

    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "❌ Erro no download",
        description: error instanceof Error ? error.message : "Não foi possível processar o download. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsYoutubeProcessing(false);
      setYoutubeLoading(false);
      setYoutubeProgress(0);
    }
  };

  // Facebook handlers
  const handleFacebookPaste = async () => {
    setClickedFacebookButton("paste");
    setTimeout(() => setClickedFacebookButton(null), 300);
    try {
      const text = await navigator.clipboard.readText();
      setFacebookUrl(text);
      toast({ title: "✅ Link colado com sucesso!", description: "Agora clique em 'Buscar' para encontrar o vídeo." });
    } catch {
      toast({ title: "❌ Erro ao colar", description: "Não foi possível acessar a área de transferência.", variant: "destructive" });
    }
  };

  const handleFacebookSearch = async () => {
    setClickedFacebookButton("search");
    setTimeout(() => setClickedFacebookButton(null), 300);
    if (!facebookUrl.trim()) {
      toast({ title: "URL obrigatório", description: "Por favor, insira um URL válido do Facebook.", variant: "destructive" });
      return;
    }
    setFacebookLoading(true);
    setFacebookProgress(0);
    const progressInterval = setInterval(() => {
      setFacebookProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 15));
    }, 200);
    try {
      const data = await fetchJsonWithRetry(apiUrl('/api/download-facebook'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: facebookUrl.trim() }),
      });
      setFacebookProgress(100);
      clearInterval(progressInterval);
      if (data && data.success) {
        setFacebookData(rewriteProxy(data.data));
        toast({ title: "Vídeo encontrado!", description: "Pronto para download." });
      } else {
        toast({ title: "Erro ao processar", description: data.error || "Não foi possível processar o vídeo do Facebook.", variant: "destructive" });
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({ title: "Erro de conexão", description: error?.message || "Tente novamente em alguns momentos.", variant: "destructive" });
    } finally {
      setTimeout(() => { setFacebookLoading(false); setFacebookProgress(0); }, 500);
    }
  };

  const handleFacebookDownload = async () => {
    setClickedFacebookButton("download");
    setTimeout(() => setClickedFacebookButton(null), 300);
    if (!facebookData) return;
    try {
      const response = await fetch(facebookData.proxy_url || facebookData.video_url);
      const blob = await response.blob();
      const downloadBlobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadBlobUrl;
      link.download = `${facebookData.title.replace(/[^a-zA-Z0-9]/g, '_')}_facebook.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadBlobUrl);
      trackDownload('facebook');
      toast({ title: "Download iniciado!", description: "O vídeo está sendo baixado." });
    } catch {
      toast({ title: "Erro no download", description: "Não foi possível baixar o vídeo.", variant: "destructive" });
    }
  };

  // Pinterest handlers
  const handlePinterestPaste = async () => {
    setClickedPinterestButton("paste");
    setTimeout(() => setClickedPinterestButton(null), 300);
    try {
      const text = await navigator.clipboard.readText();
      setPinterestUrl(text);
      toast({ title: "✅ Link colado com sucesso!", description: "Agora clique em 'Buscar' para encontrar o pin." });
    } catch {
      toast({ title: "❌ Erro ao colar", description: "Não foi possível acessar a área de transferência.", variant: "destructive" });
    }
  };

  const handlePinterestSearch = async () => {
    setClickedPinterestButton("search");
    setTimeout(() => setClickedPinterestButton(null), 300);
    const validation = validatePinterestUrl(pinterestUrl);
    if (!validation.valid) {
      toast({ title: "Link inválido", description: validation.error, variant: "destructive" });
      return;
    }
    setPinterestData(null);
    setPinterestLoading(true);
    setPinterestProgress(0);
    const progressInterval = setInterval(() => {
      setPinterestProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 15));
    }, 200);
    try {
      const r = await fetch(apiUrl('/api/download-pinterest'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: validation.normalized }),
      });
      const result = await r.json();
      setPinterestProgress(100);
      clearInterval(progressInterval);
      if (!result?.success || !result?.data) {
        toast({
          title: "Pin indisponível",
          description: result?.error || "Não foi possível processar o pin.",
          variant: "destructive",
        });
        return;
      }
      setPinterestData(rewriteProxy(result.data) as PinterestData);
      const t =
        result.data.media_type === "video"
          ? "Vídeo"
          : result.data.media_type === "gif"
          ? "GIF"
          : "Imagem";
      toast({ title: `${t} encontrado!`, description: "Pronto para download." });
    } catch (error: any) {
      clearInterval(progressInterval);
      toast({ title: "Erro ao processar", description: error?.message || "Não foi possível processar o pin.", variant: "destructive" });
    } finally {
      setTimeout(() => { setPinterestLoading(false); setPinterestProgress(0); }, 500);
    }
  };

  const handlePinterestDownloadClick = () => {
    setClickedPinterestButton("download");
    setTimeout(() => setClickedPinterestButton(null), 300);
    trackDownload('pinterest');
    toast({ title: "Download iniciado!", description: "O conteúdo está sendo baixado." });
  };

  return (
    <section className="relative bg-background text-foreground flex flex-col w-full min-h-[100dvh] lg:min-h-[900px]">
      {/* Simple Black Background */}
      <div className="absolute inset-0 bg-background"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col justify-center py-6 sm:py-8 lg:py-12 max-w-full">
        {/* Retro Title */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          {/* Pixel badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border-2 border-primary mb-6 font-pixel text-[10px] text-primary">
            <Gamepad2 className="w-4 h-4" />
            AVALIAÇÃO DO SITE 5.0 ⭐
          </div>
          
          <h1 className="font-pixel text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 tracking-wider leading-relaxed">
            <span className="block text-primary neon-text mb-2">SOS 01.</span>
            <span className="block text-[hsl(var(--accent))]">Ferramentas Online Grátis, Jogos e Serviços</span>
          </h1>
          
          <p className="font-retro text-xl sm:text-2xl text-[hsl(var(--retro-red))] mb-6">
            ⬇️ Explore. Descubra. Aproveite.
          </p>
          
          {/* Platform icons with retro style */}
          <div className="flex justify-center gap-4 mt-6">
            <div className="p-3 border-2 border-[hsl(var(--retro-cyan))]/50 bg-card/50 hover:border-[hsl(var(--retro-cyan))] hover:bg-[hsl(var(--retro-cyan))]/10 transition-all">
              <Music className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(var(--retro-cyan))]" />
            </div>
            <div className="p-3 border-2 border-[hsl(var(--retro-magenta))]/50 bg-card/50 hover:border-[hsl(var(--retro-magenta))] hover:bg-[hsl(var(--retro-magenta))]/10 transition-all">
              <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(var(--retro-magenta))]" />
            </div>
            <div className="p-3 border-2 border-[hsl(var(--retro-yellow))]/50 bg-card/50 hover:border-[hsl(var(--retro-yellow))] hover:bg-[hsl(var(--retro-yellow))]/10 transition-all">
              <Book className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(var(--retro-yellow))]" />
            </div>
            <div className="p-3 border-2 border-[hsl(var(--retro-green))]/50 bg-card/50 hover:border-[hsl(var(--retro-green))] hover:bg-[hsl(var(--retro-green))]/10 transition-all">
              <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-[hsl(var(--retro-green))]" />
            </div>
          </div>
        </div>
        
        {/* Quote */}
        <ScrollReveal direction="up" delay={500}>
          <p className="font-retro text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 px-4">
            "Confia ao Senhor as tuas obras, e teus planos se realizarão"
            <span className="block text-primary/60 text-sm mt-1">Provérbios 16:3</span>
          </p>
        </ScrollReveal>

        {/* TikTok Download Section */}
        <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-2">
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8">
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <img src={tiktokIcon} alt="TikTok" className="w-5 h-5 rounded-md" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-primary">LINK DO TIKTOK</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Cole o link e baixe sem marca d'água</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('tiktok')} />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do TikTok aqui..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    const platform = detectPlatform(e.target.value);
                    setDetectedPlatform(platform);
                  }}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 border-primary/30 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:border-primary focus:shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handlePaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-cyan))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>
                
                <Button
                  onClick={handleSearch}
                  disabled={loading || !isActive('tiktok')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm bg-primary hover:bg-primary/90 border-2 border-[hsl(var(--retro-yellow))] font-pixel text-[10px] shadow-[4px_4px_0_hsl(var(--retro-yellow))] hover:shadow-[2px_2px_0_hsl(var(--retro-yellow))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-yellow))]" : ""
                  } ${loading ? "animate-pulse" : ""}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      {detectedPlatform && getPlatformIcon(detectedPlatform)}
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* TikTok Maintenance Warning */}
            {!isActive('tiktok') && <MaintenanceWarning />}

            {/* Loading Section - Pixel Style */}
            {loading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 border-primary/50 bg-background/80 p-4 sm:p-6">
                  {/* Scanlines */}
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm text-primary animate-pulse">
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-yellow))]">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Pixel progress bar */}
                  <div className="relative h-6 bg-background border-2 border-primary/30">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-[hsl(var(--retro-yellow))] to-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2 font-retro text-sm text-muted-foreground">
                    <span>▶ START</span>
                    <span>COMPLETE ◀</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Preview Section */}
          {videoData && (
            <div className="w-full max-w-2xl mx-auto mt-6 animate-fade-in">
              <div className="pixel-card rounded-sm p-4 sm:p-6">
                {/* Corner badge */}
                <div className="flex justify-center mb-4">
                  <span className="font-pixel text-[10px] px-3 py-1 bg-[hsl(var(--accent))] text-background">
                    VIDEO FOUND!
                  </span>
                </div>
                
                {/* Video preview */}
                  <div
                    className="relative w-full mb-4 border-2 border-primary/30 bg-background/50 overflow-hidden min-h-[320px] bg-center bg-no-repeat bg-contain"
                    style={{ backgroundImage: `url(${videoData.proxy_thumbnail_url || videoData.thumbnail})` }}
                    aria-label={`Capa do vídeo ${videoData.title}`}
                  >
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                    <img
                      src={videoData.proxy_thumbnail_url || videoData.thumbnail}
                      alt={`Capa do vídeo ${videoData.title}`}
                      className="w-full h-[320px] object-contain opacity-0 pointer-events-none"
                    />
                    <MediaPreviewOverlay
                      title={videoData.title}
                      author={videoData.author}
                      duration={videoData.duration}
                      mediaUrl={videoData.proxy_video_url || videoData.video_urls?.hd}
                    />
                  </div>

                {/* Download type selector */}
                <div className="mb-4">
                  <h3 className="font-pixel text-[10px] text-center mb-3 text-muted-foreground">SELECT TYPE:</h3>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant={downloadType === "video" ? "default" : "outline"}
                      onClick={() => setDownloadType("video")}
                      className={`font-pixel text-[10px] rounded-sm ${downloadType === "video" ? "bg-primary border-2 border-[hsl(var(--retro-yellow))]" : "border-2 border-primary/50"}`}
                    >
                      VIDEO HD
                    </Button>
                    <Button
                      variant={downloadType === "audio" ? "default" : "outline"}
                      onClick={() => setDownloadType("audio")}
                      className={`font-pixel text-[10px] rounded-sm ${downloadType === "audio" ? "bg-primary border-2 border-[hsl(var(--retro-yellow))]" : "border-2 border-primary/50"}`}
                    >
                      AUDIO MP3
                    </Button>
                  </div>
                </div>

                {/* Download button */}
                <Button
                  onClick={handleDownload}
                  className={`w-full h-12 font-pixel text-xs bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-background border-2 border-[hsl(var(--retro-yellow))] shadow-[4px_4px_0_hsl(var(--retro-yellow))] hover:shadow-[2px_2px_0_hsl(var(--retro-yellow))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                    clickedButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-yellow))]" : ""
                  }`}
                >
                  {downloadType === "video" ? (
                    <>
                      <Download className="mr-2 w-4 h-4" />
                      BAIXAR VIDEO
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 w-4 h-4" />
                      BAIXAR AUDIO
                    </>
                  )}
                </Button>

                <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                  OBRIGADO POR USAR sos01!
                </p>
              </div>
            </div>
          )}

          {/* Instagram Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(var(--retro-magenta) / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <img src={instagramIcon} alt="Instagram" className="w-5 h-5 rounded-md" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-magenta))]">LINK DO INSTAGRAM</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Reels, fotos e stories em alta qualidade</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('instagram')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do Instagram aqui..."
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 border-[hsl(var(--retro-magenta))]/30 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:border-[hsl(var(--retro-magenta))] focus:shadow-[0_0_20px_hsl(var(--retro-magenta)/0.3)]"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleInstagramPaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-magenta))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedInstagramButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>
                
                <Button
                  onClick={handleInstagramSearch}
                  disabled={instagramLoading || !isActive('instagram')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm bg-[hsl(var(--retro-magenta))] hover:bg-[hsl(var(--retro-magenta))]/90 border-2 border-[hsl(var(--retro-cyan))] font-pixel text-[10px] text-background shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedInstagramButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                  } ${instagramLoading ? "animate-pulse" : ""}`}
                >
                  {instagramLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instagram Maintenance Warning */}
            {!isActive('instagram') && <MaintenanceWarning />}

            {/* Loading Section Instagram */}
            {instagramLoading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 border-[hsl(var(--retro-magenta))]/50 bg-background/80 p-4 sm:p-6">
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-magenta))] animate-pulse">
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-cyan))]">
                        {Math.round(instagramProgress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-6 bg-background border-2 border-[hsl(var(--retro-magenta))]/30">
                    <div 
                      className="h-full bg-gradient-to-r from-[hsl(var(--retro-magenta))] via-[hsl(var(--retro-cyan))] to-[hsl(var(--retro-magenta))] transition-all duration-300"
                      style={{ width: `${instagramProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instagram Preview */}
            {instagramData && (
              <div className="mt-6 animate-fade-in">
                <div className="border-2 border-[hsl(var(--retro-magenta))]/30 bg-background/50 p-4 sm:p-6">
                  <div className="flex justify-center mb-4">
                    <span className="font-pixel text-[10px] px-3 py-1 bg-[hsl(var(--retro-magenta))] text-background">
                      {instagramData.is_carousel 
                        ? `CAROUSEL - ${instagramData.carousel_items?.length} ITEMS` 
                        : (instagramData.media_type === 'video' ? 'VIDEO FOUND!' : 'PHOTO FOUND!')}
                    </span>
                  </div>

                  {/* Carousel Item Selector */}
                  {instagramData.is_carousel && instagramData.carousel_items && instagramData.carousel_items.length > 1 && (
                    <div className="mb-4">
                      <h3 className="font-pixel text-[10px] text-center mb-3 text-muted-foreground">SELECT ITEM:</h3>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {instagramData.carousel_items.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedCarouselIndex(idx)}
                            className={`relative w-16 h-16 border-2 transition-all overflow-hidden ${
                              selectedCarouselIndex === idx 
                                ? 'border-[hsl(var(--retro-cyan))] shadow-[0_0_10px_hsl(var(--retro-cyan)/0.5)]' 
                                : 'border-[hsl(var(--retro-magenta))]/30 hover:border-[hsl(var(--retro-magenta))]'
                            }`}
                          >
                            <img 
                              src={item.thumbnail} 
                              alt={`Item ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {item.media_type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span className="font-pixel text-[8px] text-white">▶</span>
                              </div>
                            )}
                            <div className="absolute bottom-0 right-0 bg-[hsl(var(--retro-magenta))] px-1">
                              <span className="font-pixel text-[8px] text-background">{idx + 1}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Media Preview */}
                  <div className="w-full mb-4 border-2 border-[hsl(var(--retro-magenta))]/30 bg-background/50">
                    {(() => {
                      const currentItem: {
                        media_url: string;
                        media_type: 'video' | 'image';
                        thumbnail: string;
                        proxy_url?: string;
                        proxy_thumbnail_url?: string;
                      } = instagramData.is_carousel && instagramData.carousel_items
                        ? instagramData.carousel_items[selectedCarouselIndex]
                        : {
                            media_url: instagramData.media_url,
                            media_type: instagramData.media_type,
                            thumbnail: instagramData.thumbnail,
                            proxy_url: instagramData.proxy_url,
                            proxy_thumbnail_url: instagramData.proxy_thumbnail_url,
                          };
                      
                      return currentItem.media_type === 'video' ? (
                        <div
                          key={selectedCarouselIndex}
                          className="relative w-full min-h-[320px] bg-center bg-no-repeat bg-contain"
                          style={{ backgroundImage: `url(${currentItem.proxy_thumbnail_url || currentItem.thumbnail})` }}
                          aria-label="Preview do vídeo do Instagram"
                        >
                          <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                          <img
                            src={currentItem.proxy_thumbnail_url || currentItem.thumbnail}
                            alt="Preview do vídeo do Instagram"
                            className="w-full h-[320px] object-contain opacity-0 pointer-events-none"
                          />
                          <MediaPreviewOverlay
                            title={instagramData.title}
                            author={instagramData.author}
                            duration={instagramData.duration}
                            mediaUrl={currentItem.proxy_url || currentItem.media_url}
                          />
                        </div>
                      ) : (
                        <img 
                          key={selectedCarouselIndex}
                          src={currentItem.proxy_url || currentItem.media_url}
                          alt="Preview da foto"
                          className="w-full max-h-[400px] object-contain"
                        />
                      );
                    })()}
                  </div>


                  <Button
                    onClick={() => handleInstagramDownload()}
                    className={`w-full h-12 font-pixel text-xs bg-[hsl(var(--retro-magenta))] hover:bg-[hsl(var(--retro-magenta))]/90 text-background border-2 border-[hsl(var(--retro-cyan))] shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedInstagramButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                    }`}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    BAIXAR
                  </Button>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR sos01!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Kwai Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(var(--retro-orange) / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <img src={kwaiIcon} alt="Kwai" className="w-5 h-5 rounded-md" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-orange))]">LINK DO KWAI</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Vídeos do Kwai em MP4</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('kwai')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do Kwai aqui..."
                  value={kwaiUrl}
                  onChange={(e) => setKwaiUrl(e.target.value)}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 border-[hsl(var(--retro-orange))]/30 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:border-[hsl(var(--retro-orange))] focus:shadow-[0_0_20px_hsl(var(--retro-orange)/0.3)]"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleKwaiPaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-cyan))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedKwaiButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>
                
                <Button
                  onClick={handleKwaiSearch}
                  disabled={kwaiLoading || !isActive('kwai')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm bg-[hsl(var(--retro-orange))] hover:bg-[hsl(var(--retro-orange))]/90 border-2 border-[hsl(var(--retro-yellow))] font-pixel text-[10px] text-background shadow-[4px_4px_0_hsl(var(--retro-yellow))] hover:shadow-[2px_2px_0_hsl(var(--retro-yellow))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedKwaiButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-yellow))]" : ""
                  } ${kwaiLoading ? "animate-pulse" : ""}`}
                >
                  {kwaiLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-background/30 border-t-background animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Kwai Maintenance Warning */}
            {!isActive('kwai') && <MaintenanceWarning />}

            {/* Loading Section Kwai */}
            {kwaiLoading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 border-[hsl(var(--retro-orange))]/50 bg-background/80 p-4 sm:p-6">
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-orange))] animate-pulse">
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-green))]">
                        {Math.round(kwaiProgress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-6 bg-background border-2 border-[hsl(var(--retro-orange))]/30">
                    <div 
                      className="h-full bg-gradient-to-r from-[hsl(var(--retro-orange))] via-[hsl(var(--retro-yellow))] to-[hsl(var(--retro-orange))] transition-all duration-300"
                      style={{ width: `${kwaiProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kwai Preview */}
            {kwaiData && (
              <div className="mt-6 animate-fade-in">
                <div className="border-2 border-[hsl(var(--retro-orange))]/30 bg-background/50 p-4 sm:p-6">
                  <div className="flex justify-center mb-4">
                    <span className="font-pixel text-[10px] px-3 py-1 bg-[hsl(var(--retro-orange))] text-background">
                      VIDEO FOUND!
                    </span>
                  </div>
                  
                  {/* Video Preview */}
                  <div
                    className="relative w-full mb-4 border-2 border-[hsl(var(--retro-orange))]/30 bg-background/50 overflow-hidden min-h-[320px] bg-center bg-no-repeat bg-contain"
                    style={{ backgroundImage: `url(${kwaiData.proxy_thumbnail_url || kwaiData.thumbnail})` }}
                    aria-label={`Capa do vídeo ${kwaiData.title}`}
                  >
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                    <img
                      src={kwaiData.proxy_thumbnail_url || kwaiData.thumbnail}
                      alt={`Capa do vídeo ${kwaiData.title}`}
                      className="w-full h-[320px] object-contain opacity-0 pointer-events-none"
                    />
                    <MediaPreviewOverlay
                      title={kwaiData.title}
                      author={kwaiData.author}
                      duration={kwaiData.duration}
                      mediaUrl={kwaiData.proxy_url || kwaiData.video_url}
                    />
                  </div>

                  <Button
                    onClick={handleKwaiDownload}
                    className={`w-full h-12 font-pixel text-xs bg-[hsl(var(--retro-orange))] hover:bg-[hsl(var(--retro-orange))]/90 text-background border-2 border-[hsl(var(--retro-yellow))] shadow-[4px_4px_0_hsl(var(--retro-yellow))] hover:shadow-[2px_2px_0_hsl(var(--retro-yellow))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedKwaiButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-yellow))]" : ""
                    }`}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    BAIXAR
                  </Button>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR sos01!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* YouTube Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(0 100% 50% / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <img src={youtubeIcon} alt="YouTube" className="w-5 h-5 rounded-md" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-[hsl(0,100%,50%)]">LINK DO YOUTUBE</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Escolha a resolução ou baixe só o áudio</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('youtube')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do YouTube aqui..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (text) {
                      e.preventDefault();
                      setYoutubeUrl(text);
                    }
                  }}
                  disabled={!isActive('youtube')}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 border-[hsl(0,100%,50%)]/30 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:border-[hsl(0,100%,50%)] focus:shadow-[0_0_20px_hsl(0,100%,50%,0.3)] disabled:opacity-50"
                />
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleYoutubePaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-cyan))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedYoutubeButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>
                
                <Button
                  onClick={handleYoutubeSearch}
                  disabled={youtubeLoading || !isActive('youtube')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm bg-[hsl(0,100%,50%)] hover:bg-[hsl(0,100%,45%)] border-2 border-[hsl(var(--retro-cyan))] font-pixel text-[10px] text-white shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedYoutubeButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                  } ${youtubeLoading ? "animate-pulse" : ""}`}
                >
                  {youtubeLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* YouTube Maintenance Warning */}
            {!isActive('youtube') && <MaintenanceWarning />}

            {/* Loading Section YouTube */}
            {youtubeLoading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 bg-background/80 p-4 sm:p-6" style={{ borderColor: 'hsl(0 100% 50% / 0.5)' }}>
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm animate-pulse" style={{ color: 'hsl(0, 100%, 50%)' }}>
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-cyan))]">
                        {Math.round(youtubeProgress)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-6 bg-background border-2" style={{ borderColor: 'hsl(0 100% 50% / 0.3)' }}>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${youtubeProgress}%`,
                        background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(var(--retro-cyan)), hsl(0, 100%, 50%))'
                      }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Preview */}
            {youtubeData && (
              <div className="mt-6 animate-fade-in">
                <div className="border-2 bg-background/50 p-4 sm:p-6" style={{ borderColor: 'hsl(0 100% 50% / 0.3)' }}>
                  <div className="flex justify-center mb-4">
                    <span className="font-pixel text-[10px] px-3 py-1 text-white" style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}>
                      VIDEO FOUND!
                    </span>
                  </div>
                  
                  {/* Video Preview */}
                  <div
                    className="relative w-full mb-4 border-2 border-[hsl(0,100%,50%)]/30 bg-background/50 overflow-hidden min-h-[220px] bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: `url(${youtubeData.thumbnail})` }}
                    aria-label={`Capa do vídeo ${youtubeData.title}`}
                  >
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                    <img
                      src={youtubeData.thumbnail}
                      alt={`Capa do vídeo ${youtubeData.title}`}
                      className="w-full h-[220px] object-contain opacity-0 pointer-events-none"
                    />
                    <MediaPreviewOverlay
                      title={youtubeData.title}
                      author={youtubeData.author}
                      duration={youtubeData.duration}
                      mediaUrl={apiUrl('/api/download-youtube-stream') + `?url=${encodeURIComponent(youtubeUrl.trim())}&type=video&quality=worst&preview=1`}
                    />
                  </div>


                  {/* Download type selector */}
                  <div className="mb-4">
                    <h3 className="font-pixel text-[10px] text-center mb-3 text-muted-foreground">SELECT TYPE:</h3>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant={youtubeDownloadType === "video" ? "default" : "outline"}
                        onClick={() => selectYoutubeType("video")}
                        disabled={!youtubeFormats.some(f => f.type === "video")}
                        className={`font-pixel text-[10px] rounded-sm ${youtubeDownloadType === "video" ? "border-2 border-[hsl(var(--retro-cyan))]" : "border-2 border-muted-foreground/50"}`}
                        style={youtubeDownloadType === "video" ? { backgroundColor: 'hsl(0, 100%, 50%)' } : {}}
                      >
                        VIDEO MP4
                      </Button>
                      <Button
                        variant={youtubeDownloadType === "audio" ? "default" : "outline"}
                        onClick={() => selectYoutubeType("audio")}
                        disabled={!youtubeFormats.some(f => f.type === "audio")}
                        className={`font-pixel text-[10px] rounded-sm ${youtubeDownloadType === "audio" ? "border-2 border-[hsl(var(--retro-cyan))]" : "border-2 border-muted-foreground/50"}`}
                        style={youtubeDownloadType === "audio" ? { backgroundColor: 'hsl(0, 100%, 50%)' } : {}}
                      >
                        AUDIO MP3
                      </Button>
                    </div>
                  </div>

                  {/* Seletor de qualidade/resolução */}
                  {youtubeFormats.some((f) => f.type === youtubeDownloadType) && (
                    <div className="mb-4">
                      <h3 className="font-pixel text-[10px] text-center mb-3 text-muted-foreground">
                        {youtubeDownloadType === "video" ? "SELECIONE A RESOLUÇÃO:" : "SELECIONE A QUALIDADE:"}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {youtubeFormats
                          .filter((f) => f.type === youtubeDownloadType)
                          .map((f) => {
                            const tooBig =
                              !!f.estimatedBytes && f.estimatedBytes > BROWSER_PROCESS_LIMIT;
                            const active = youtubeQuality === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setYoutubeQuality(f.id)}
                                aria-pressed={active}
                                className={`flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-sm border-2 transition-all ${
                                  active
                                    ? "border-[hsl(var(--retro-cyan))] bg-[hsl(0,100%,50%)]/20 shadow-[0_0_15px_hsl(var(--retro-cyan),0.3)]"
                                    : "border-muted-foreground/30 bg-background/40 hover:border-muted-foreground/60"
                                }`}
                              >
                                <span className="font-pixel text-[11px] text-foreground leading-tight">{f.label}</span>
                                <span className="font-orbitron text-[10px] text-muted-foreground">
                                  {formatBytes(f.estimatedBytes)}
                                </span>
                                {tooBig && (
                                  <span className="font-orbitron text-[9px] text-yellow-400 mt-0.5">
                                    acima de 500 MB
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                      <p className="font-orbitron text-[10px] text-center mt-2 text-muted-foreground">
                        Arquivos acima de 100 MB podem falhar no navegador — prefira uma resolução menor.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleYoutubeDownload(false)}
                    disabled={isYoutubeProcessing}
                    className={`w-full h-12 font-pixel text-xs text-white border-2 border-[hsl(var(--retro-cyan))] shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedYoutubeButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                    }`}
                    style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
                  >
                    {isYoutubeProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                        <span>PROCESSANDO...</span>
                      </div>
                    ) : (
                      <>
                        {youtubeDownloadType === "video" ? (
                          <Download className="mr-2 w-4 h-4" />
                        ) : (
                          <Headphones className="mr-2 w-4 h-4" />
                        )}
                        BAIXAR
                      </>
                    )}
                  </Button>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR sos01!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Facebook Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(217 89% 50% / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <img src={facebookIcon} alt="Facebook" className="w-5 h-5 rounded-md" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm" style={{ color: 'hsl(217, 89%, 61%)' }}>LINK DO FACEBOOK</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Vídeos e Reels do Facebook</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('facebook')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do Facebook aqui..."
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  disabled={!isActive('facebook')}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:shadow-[0_0_20px_hsl(217,89%,61%,0.3)] disabled:opacity-50"
                  style={{ borderColor: 'hsl(217 89% 61% / 0.3)' }}
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleFacebookPaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-cyan))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedFacebookButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>

                <Button
                  onClick={handleFacebookSearch}
                  disabled={facebookLoading || !isActive('facebook')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm border-2 border-[hsl(var(--retro-cyan))] font-pixel text-[10px] text-white shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedFacebookButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                  } ${facebookLoading ? "animate-pulse" : ""}`}
                  style={{ backgroundColor: 'hsl(217, 89%, 50%)' }}
                >
                  {facebookLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Facebook Maintenance Warning */}
            {!isActive('facebook') && <MaintenanceWarning />}

            {/* Loading Section Facebook */}
            {facebookLoading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 bg-background/80 p-4 sm:p-6" style={{ borderColor: 'hsl(217 89% 50% / 0.5)' }}>
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm animate-pulse" style={{ color: 'hsl(217, 89%, 61%)' }}>
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-cyan))]">
                        {Math.round(facebookProgress)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-background border-2" style={{ borderColor: 'hsl(217 89% 50% / 0.3)' }}>
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${facebookProgress}%`,
                        background: 'linear-gradient(to right, hsl(217, 89%, 50%), hsl(var(--retro-cyan)), hsl(217, 89%, 50%))',
                      }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Facebook Preview */}
            {facebookData && (
              <div className="mt-6 animate-fade-in">
                <div className="border-2 bg-background/50 p-4 sm:p-6" style={{ borderColor: 'hsl(217 89% 50% / 0.3)' }}>
                  <div className="flex justify-center mb-4">
                    <span className="font-pixel text-[10px] px-3 py-1 text-white" style={{ backgroundColor: 'hsl(217, 89%, 50%)' }}>
                      VIDEO FOUND!
                    </span>
                  </div>

                  <div
                    className="relative w-full mb-4 border-2 bg-background/50 overflow-hidden min-h-[320px] bg-center bg-no-repeat bg-contain"
                    style={{ borderColor: 'hsl(217 89% 50% / 0.3)', backgroundImage: `url(${facebookData.proxy_thumbnail_url || facebookData.thumbnail})` }}
                    aria-label={`Capa do vídeo ${facebookData.title}`}
                  >
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                    <img
                      src={facebookData.proxy_thumbnail_url || facebookData.thumbnail}
                      alt={`Capa do vídeo ${facebookData.title}`}
                      className="w-full h-[320px] object-contain opacity-0 pointer-events-none"
                    />
                    <MediaPreviewOverlay
                      title={facebookData.title}
                      author={facebookData.author}
                      duration={facebookData.duration}
                      mediaUrl={facebookData.proxy_url || facebookData.video_url}
                    />
                  </div>

                  <Button
                    onClick={handleFacebookDownload}
                    className={`w-full h-12 font-pixel text-xs text-white border-2 border-[hsl(var(--retro-cyan))] shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedFacebookButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                    }`}
                    style={{ backgroundColor: 'hsl(217, 89%, 50%)' }}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    BAIXAR
                  </Button>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR sos01!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Pinterest Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(351 83% 50% / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(351, 83%, 47%)' }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.09 2.45 7.6 5.97 9.14-.08-.78-.16-1.97.03-2.82.18-.79 1.17-5.02 1.17-5.02s-.3-.6-.3-1.49c0-1.4.81-2.44 1.82-2.44.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.34-.24 1 .5 1.81 1.49 1.81 1.79 0 3.16-1.89 3.16-4.61 0-2.41-1.73-4.1-4.21-4.1-2.87 0-4.55 2.15-4.55 4.37 0 .87.33 1.8.75 2.3.08.1.09.18.07.28-.07.31-.24 1-.27 1.13-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.49-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.14 6.12-5.11 6.12-1 0-1.94-.52-2.26-1.13l-.61 2.33c-.22.85-.82 1.92-1.22 2.57.92.28 1.89.44 2.91.44 5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                  </svg>
                </div>
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm" style={{ color: 'hsl(351, 83%, 60%)' }}>LINK DO PINTEREST</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Pins, imagens e vídeos do Pinterest</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('pinterest')} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="Cole o link do Pinterest (pin, vídeo, imagem)..."
                  value={pinterestUrl}
                  onChange={(e) => setPinterestUrl(e.target.value)}
                  disabled={!isActive('pinterest')}
                  className="h-12 sm:h-14 text-sm sm:text-base bg-background/80 border-2 rounded-sm text-foreground placeholder:text-muted-foreground font-orbitron transition-all duration-200 focus:shadow-[0_0_20px_hsl(351,83%,60%,0.3)] disabled:opacity-50"
                  style={{ borderColor: 'hsl(351 83% 60% / 0.3)' }}
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handlePinterestPaste}
                  variant="secondary"
                  className={`h-12 sm:h-14 px-4 sm:px-6 rounded-sm bg-secondary/80 hover:bg-secondary border-2 border-secondary/50 hover:border-[hsl(var(--retro-cyan))] font-pixel text-[10px] shadow-[3px_3px_0_hsl(var(--secondary))] hover:shadow-[1px_1px_0_hsl(var(--secondary))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                    clickedPinterestButton === "paste" ? "translate-x-[2px] translate-y-[2px] shadow-[1px_1px_0_hsl(var(--secondary))]" : ""
                  }`}
                >
                  <Clipboard className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">COLAR</span>
                </Button>

                <Button
                  onClick={handlePinterestSearch}
                  disabled={pinterestLoading || !isActive('pinterest')}
                  className={`h-12 sm:h-14 px-5 sm:px-8 rounded-sm border-2 border-[hsl(var(--retro-cyan))] font-pixel text-[10px] text-white shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                    clickedPinterestButton === "search" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                  } ${pinterestLoading ? "animate-pulse" : ""}`}
                  style={{ backgroundColor: 'hsl(351, 83%, 47%)' }}
                >
                  {pinterestLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                      <span className="hidden sm:inline">LOADING</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">BUSCAR</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {!isActive('pinterest') && <MaintenanceWarning />}

            {pinterestLoading && (
              <div className="mt-6 animate-fade-in">
                <div className="relative border-2 bg-background/80 p-4 sm:p-6" style={{ borderColor: 'hsl(351 83% 47% / 0.5)' }}>
                  <div className="absolute inset-0 scanlines pointer-events-none opacity-30"></div>
                  <div className="relative text-center mb-4">
                    <h3 className="font-pixel text-xs sm:text-sm animate-pulse" style={{ color: 'hsl(351, 83%, 60%)' }}>
                      PROCESSANDO...
                    </h3>
                    <div className="mt-2">
                      <span className="font-retro text-3xl sm:text-4xl text-[hsl(var(--retro-cyan))]">
                        {Math.round(pinterestProgress)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-background border-2" style={{ borderColor: 'hsl(351 83% 47% / 0.3)' }}>
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pinterestProgress}%`,
                        background: 'linear-gradient(to right, hsl(351, 83%, 47%), hsl(var(--retro-cyan)), hsl(351, 83%, 47%))',
                      }}
                    >
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,hsla(0,0%,0%,0.2)_8px,hsla(0,0%,0%,0.2)_16px)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {pinterestData && (
              <div className="mt-6 animate-fade-in">
                <div className="border-2 bg-background/50 p-4 sm:p-6" style={{ borderColor: 'hsl(351 83% 47% / 0.3)' }}>
                  <div className="flex justify-center mb-4">
                    <span className="font-pixel text-[10px] px-3 py-1 text-white" style={{ backgroundColor: 'hsl(351, 83%, 47%)' }}>
                      {pinterestData.media_type === 'video' ? 'VIDEO FOUND!' : pinterestData.media_type === 'gif' ? 'GIF FOUND!' : 'IMAGE FOUND!'}
                    </span>
                  </div>

                  <div
                    className="relative w-full mb-4 border-2 bg-background/50 overflow-hidden min-h-[320px] bg-center bg-no-repeat bg-contain"
                    style={{ borderColor: 'hsl(351 83% 47% / 0.3)', backgroundImage: `url(${pinterestData.proxy_thumbnail_url || pinterestData.thumbnail})` }}
                    aria-label={`Prévia do pin ${pinterestData.title}`}
                  >
                    <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />
                    <img
                      src={pinterestData.proxy_thumbnail_url || pinterestData.thumbnail}
                      alt={`Prévia do pin ${pinterestData.title}`}
                      className="w-full h-[320px] object-contain opacity-0 pointer-events-none"
                    />
                    <MediaPreviewOverlay
                      title={pinterestData.title}
                      author={pinterestData.author}
                      mediaUrl={pinterestData.media_type === 'video' ? (pinterestData.proxy_url || pinterestData.video_url) : undefined}
                    />
                  </div>

                  <a
                    href={apiUrl(`/api/public/pinterest-download?url=${encodeURIComponent(pinterestData.media_url)}`)}
                    onClick={handlePinterestDownloadClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center w-full h-12 font-pixel text-xs text-white border-2 border-[hsl(var(--retro-cyan))] shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedPinterestButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                    }`}
                    style={{ backgroundColor: 'hsl(351, 83%, 47%)' }}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    BAIXAR
                  </a>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR sos01!
                  </p>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Video Enhancer Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(260 100% 60% / 0.5)' }}>
            {/* Section header */}
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-foreground/10 pb-4">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-foreground/10">
                  <Video className="w-5 h-5 text-[hsl(260,100%,60%)]" />
                </span>
                <div>
                  <h2 className="font-pixel text-xs sm:text-sm text-[hsl(260,100%,60%)]">MELHORAR VÍDEO (IA)</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">Upscale, nitidez e melhoria de áudio</p>
                </div>
              </div>
              <StatusBadge isActive={isActive('video-enhancer')} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-foreground/5 rounded-sm p-4 border border-foreground/10">
                <p className="text-sm text-muted-foreground mb-4 text-center sm:text-left">
                  Esta ferramenta requer o upload direto do arquivo de vídeo para aplicar as melhorias de IA.
                </p>
                <div className="flex justify-center sm:justify-start">
                  <Button
                    asChild
                    className={`h-12 sm:h-14 px-8 sm:px-12 rounded-sm border-2 border-[hsl(var(--retro-cyan))] font-pixel text-[10px] text-white shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto`}
                    style={{ backgroundColor: 'hsl(260, 100%, 60%)' }}
                  >
                    <Link to="/ferramenta/melhorar-video">
                      <Sparkles className="w-4 h-4 mr-2" />
                      ENVIAR VÍDEO PARA MELHORAR
                    </Link>
                  </Button>
                </div>
              </div>
            </div>


            {!isActive('video-enhancer') && <MaintenanceWarning />}

          </div>

      </div>
    </section>
  );
};

export default HeroSection;
