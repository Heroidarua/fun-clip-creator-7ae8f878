import { useState } from "react";
import { Clipboard, Search, Download, Headphones, Gamepad2, Book, Music, Camera, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";
import { useAchievements } from "@/hooks/useAchievements";

import ScrollReveal from "./ScrollReveal";
import tiktokIcon from "@/assets/tiktok-icon.png";
import instagramIcon from "@/assets/instagram-icon.png";
import kwaiIcon from "@/assets/kwai-icon.png";
import youtubeIcon from "@/assets/youtube-icon.png";

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
}

interface CarouselItem {
  index: number;
  media_url: string;
  media_type: 'video' | 'image';
  thumbnail: string;
  proxy_url?: string;
}

interface InstagramData {
  media_url: string;
  media_type: 'video' | 'image';
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
  proxy_url?: string;
  is_carousel?: boolean;
  carousel_items?: CarouselItem[];
}

interface KwaiData {
  video_url: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
}

interface YouTubeData {
  video_url: string;
  audio_url?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: number;
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
  const { trackDownload } = useAchievements();

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


  const detectPlatform = (url: string) => {
    if (url.includes('tiktok.com')) return 'tiktok';
    return null;
  };

  const getPlatformIcon = (platform: string | null) => {
    if (platform === 'tiktok') return <img src={tiktokIcon} alt="TikTok" className="w-5 h-5" />;
    return null;
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
    setVideoData(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API TikTok com URL:", url.trim());
      
      const resp = await fetch('/api/download-tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await resp.json();

      setProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setVideoData(data.data);
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
      ? videoData.video_urls?.hd 
      : videoData.audio_url;
    
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
    setInstagramData(null);
    setSelectedCarouselIndex(0);

    const progressInterval = setInterval(() => {
      setInstagramProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API Instagram com URL:", instagramUrl.trim());
      
      const resp = await fetch('/api/download-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: instagramUrl.trim() }),
      });
      const data = await resp.json();

      setInstagramProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setInstagramData(data.data);
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
    setKwaiData(null);

    const progressInterval = setInterval(() => {
      setKwaiProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      console.log("Chamando API Kwai com URL:", kwaiUrl.trim());
      
      const resp = await fetch('/api/download-kwai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: kwaiUrl.trim() }),
      });
      const data = await resp.json();

      setKwaiProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setKwaiData(data.data);
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
      const response = await fetch(kwaiData.video_url);
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

  const handleYoutubeSearch = async () => {
    setClickedYoutubeButton("search");
    setTimeout(() => setClickedYoutubeButton(null), 300);
    
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira um URL válido do YouTube.",
        variant: "destructive",
      });
      return;
    }

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
      console.log("Chamando API YouTube com URL:", youtubeUrl.trim());
      
      const resp = await fetch('/api/download-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      });
      const data = await resp.json();

      setYoutubeProgress(100);
      clearInterval(progressInterval);

      if (data && data.success) {
        setYoutubeData(data.data);
        toast({
          title: "Vídeo encontrado!",
          description: "Pronto para download.",
        });
      } else {
        toast({
          title: "Erro ao processar",
          description: data.error || "Não foi possível processar o vídeo do YouTube.",
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
        setYoutubeLoading(false);
        setYoutubeProgress(0);
      }, 500);
    }
  };

  const handleYoutubeDownload = async () => {
    setClickedYoutubeButton("download");
    setTimeout(() => setClickedYoutubeButton(null), 300);
    
    if (!youtubeData) return;

    const extension = youtubeDownloadType === "video" ? "mp4" : "mp3";
    const filename = youtubeData.title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'youtube_video';

    try {
      toast({
        title: "⏳ Preparando download...",
        description: "Baixando o vídeo diretamente do servidor. Isso pode levar alguns segundos...",
      });

      // Request the Edge Function to download the file directly (handles tunnel URLs)
      const freshResp = await fetch('/api/download-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl.trim(), download: true }),
      });
      const freshData = await freshResp.json();

      if (!freshData?.success) {
        throw new Error(freshData?.error || "Não foi possível obter o vídeo");
      }

      const videoUrl = freshData.data.video_url;
      
      if (!videoUrl) {
        throw new Error("URL de vídeo não encontrada.");
      }

      // Check if it's a base64 data URL (downloaded by edge function)
      if (videoUrl.startsWith('data:')) {
        toast({
          title: "📦 Processando arquivo...",
          description: "Preparando o download do arquivo...",
        });
        
        // Convert base64 to blob
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('Arquivo vazio recebido');
        }

        // Create download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${filename}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup after a short delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

        // YouTube tracking removed - service in maintenance
        toast({
          title: "✅ Download concluído!",
          description: `O ${youtubeDownloadType === "video" ? "vídeo" : "áudio"} foi baixado com sucesso.`,
        });
      } else {
        // Direct URL - try to open it
        window.open(videoUrl, '_blank');
        
        // YouTube tracking removed - service in maintenance
        toast({
          title: "✅ Download iniciado!",
          description: "O download foi iniciado em uma nova aba.",
        });
      }

    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "❌ Erro no download",
        description: error instanceof Error ? error.message : "Não foi possível processar o download. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="relative bg-background text-foreground flex flex-col w-full min-h-[100dvh]">
      {/* Simple Black Background */}
      <div className="absolute inset-0 bg-background"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col justify-center py-6 sm:py-8 lg:py-12 max-w-full">
        {/* Retro Title */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          {/* Pixel badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border-2 border-primary mb-6 font-pixel text-[10px] text-primary">
            <Gamepad2 className="w-4 h-4" />
            Bem-vindo a família ♥️
          </div>
          
          <h1 className="font-pixel text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 tracking-wider leading-relaxed">
            <span className="block text-primary neon-text mb-2">BAIXE VÍDEOS, LEIA QUADRINHOS</span>
            <span className="block text-[hsl(var(--accent))]">E JOGUE CLÁSSICOS</span>
          </h1>
          
          <p className="font-retro text-xl sm:text-2xl text-[hsl(var(--retro-yellow))] mb-6">
            TUDO EM UM SÓ LUGAR!
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
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <img src={tiktokIcon} alt="TikTok" className="w-6 h-6 rounded-lg" />
                <h2 className="font-pixel text-xs sm:text-sm text-primary">TIKTOK DOWNLOADER</h2>
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
                <div className="w-full mb-4 border-2 border-primary/30 bg-background/50">
                  <video 
                    src={videoData.video_urls.hd || videoData.video_urls.sd}
                    poster={videoData.thumbnail}
                    controls
                    className="w-full max-h-[400px] object-contain"
                    preload="metadata"
                  >
                    Seu navegador não suporta a tag de vídeo.
                  </video>
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
                      DOWNLOAD VIDEO
                    </>
                  ) : (
                    <>
                      <Headphones className="mr-2 w-4 h-4" />
                      DOWNLOAD AUDIO
                    </>
                  )}
                </Button>

                <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                  OBRIGADO POR USAR CLIPSAVE!
                </p>
              </div>
            </div>
          )}

          {/* Instagram Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(var(--retro-magenta) / 0.5)' }}>
            {/* Section header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <img src={instagramIcon} alt="Instagram" className="w-6 h-6 rounded-lg" />
                <h2 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-magenta))]">INSTAGRAM DOWNLOADER</h2>
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
                      const currentItem = instagramData.is_carousel && instagramData.carousel_items 
                        ? instagramData.carousel_items[selectedCarouselIndex]
                        : { media_url: instagramData.media_url, media_type: instagramData.media_type, thumbnail: instagramData.thumbnail };
                      
                      return currentItem.media_type === 'video' ? (
                        <video 
                          key={selectedCarouselIndex}
                          src={currentItem.media_url}
                          poster={currentItem.thumbnail}
                          controls
                          className="w-full max-h-[400px] object-contain"
                          preload="metadata"
                        >
                          Seu navegador não suporta a tag de vídeo.
                        </video>
                      ) : (
                        <img 
                          key={selectedCarouselIndex}
                          src={currentItem.media_url}
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
                    OBRIGADO POR USAR CLIPSAVE!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Kwai Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(var(--retro-orange) / 0.5)' }}>
            {/* Section header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <img src={kwaiIcon} alt="Kwai" className="w-6 h-6 rounded-lg" />
                <h2 className="font-pixel text-xs sm:text-sm text-[hsl(var(--retro-orange))]">KWAI DOWNLOADER</h2>
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
                  <div className="w-full mb-4 border-2 border-[hsl(var(--retro-orange))]/30 bg-background/50">
                    <video 
                      src={kwaiData.video_url}
                      poster={kwaiData.thumbnail}
                      controls
                      className="w-full max-h-[400px] object-contain"
                      preload="metadata"
                    >
                      Seu navegador não suporta a tag de vídeo.
                    </video>
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
                    OBRIGADO POR USAR CLIPSAVE!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* YouTube Section */}
          <div className="pixel-card rounded-sm p-5 sm:p-6 lg:p-8 mt-6" style={{ borderColor: 'hsl(0 100% 50% / 0.5)' }}>
            {/* Section header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <img src={youtubeIcon} alt="YouTube" className="w-6 h-6 rounded-lg" />
                <h2 className="font-pixel text-xs sm:text-sm text-[hsl(0,100%,50%)]">YOUTUBE DOWNLOADER</h2>
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
                  <div className="w-full mb-4 border-2 bg-background/50" style={{ borderColor: 'hsl(0 100% 50% / 0.3)' }}>
                    <img 
                      src={youtubeData.thumbnail}
                      alt="YouTube Video Thumbnail"
                      className="w-full max-h-[400px] object-contain"
                    />
                  </div>

                  {/* Video Info */}
                  <div className="mb-4 text-center">
                    <h3 className="font-retro text-lg text-foreground mb-1 line-clamp-2">{youtubeData.title}</h3>
                    <p className="font-retro text-sm text-muted-foreground">{youtubeData.author}</p>
                  </div>

                  {/* Download type selector */}
                  <div className="mb-4">
                    <h3 className="font-pixel text-[10px] text-center mb-3 text-muted-foreground">SELECT TYPE:</h3>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant={youtubeDownloadType === "video" ? "default" : "outline"}
                        onClick={() => setYoutubeDownloadType("video")}
                        className={`font-pixel text-[10px] rounded-sm ${youtubeDownloadType === "video" ? "border-2 border-[hsl(var(--retro-cyan))]" : "border-2 border-muted-foreground/50"}`}
                        style={youtubeDownloadType === "video" ? { backgroundColor: 'hsl(0, 100%, 50%)' } : {}}
                      >
                        VIDEO MP4
                      </Button>
                      <Button
                        variant={youtubeDownloadType === "audio" ? "default" : "outline"}
                        onClick={() => setYoutubeDownloadType("audio")}
                        disabled={!youtubeData.audio_url}
                        className={`font-pixel text-[10px] rounded-sm ${youtubeDownloadType === "audio" ? "border-2 border-[hsl(var(--retro-cyan))]" : "border-2 border-muted-foreground/50"}`}
                        style={youtubeDownloadType === "audio" ? { backgroundColor: 'hsl(0, 100%, 50%)' } : {}}
                      >
                        AUDIO MP3
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleYoutubeDownload}
                    className={`w-full h-12 font-pixel text-xs text-white border-2 border-[hsl(var(--retro-cyan))] shadow-[4px_4px_0_hsl(var(--retro-cyan))] hover:shadow-[2px_2px_0_hsl(var(--retro-cyan))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded-sm ${
                      clickedYoutubeButton === "download" ? "translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0_hsl(var(--retro-cyan))]" : ""
                    }`}
                    style={{ backgroundColor: 'hsl(0, 100%, 50%)' }}
                  >
                    {youtubeDownloadType === "video" ? (
                      <>
                        <Download className="mr-2 w-4 h-4" />
                        BAIXAR
                      </>
                    ) : (
                      <>
                        <Headphones className="mr-2 w-4 h-4" />
                        BAIXAR
                      </>
                    )}
                  </Button>

                  <p className="font-retro text-lg text-center mt-4 text-muted-foreground">
                    OBRIGADO POR USAR CLIPSAVE!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
