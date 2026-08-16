import { useState, useEffect, useRef } from "react";
import { Clipboard, Search, Download, Headphones, Gamepad2, Book, Music, Camera, CheckCircle, AlertTriangle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";

import ScrollReveal from "./ScrollReveal";
import { apiUrl, rewriteProxy } from "@/lib/api-base";
import { parseYouTubeUrl, youtubeValidationError, getYouTubeVideoId } from "@/lib/youtube-url";
import {
  fetchYoutubeInfo,
  formatBytes,
  requestYoutubeDownload,
  absoluteDownloadUrl,
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
