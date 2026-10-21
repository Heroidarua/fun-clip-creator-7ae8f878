import { Clock, User } from "lucide-react";
import type { YoutubeInfo } from "@/services/youtubeDownloader";
import { formatDuration } from "@/services/youtubeDownloader";

export default function YoutubeVideoPreview({ info }: { info: YoutubeInfo }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-border bg-card/60 p-4 sm:flex-row">
      <img
        src={info.thumbnail}
        alt={`Miniatura do vídeo ${info.title}`}
        loading="lazy"
        className="w-full rounded-md object-cover sm:w-56"
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-foreground sm:text-lg break-words">{info.title}</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {info.author && (
            <li className="flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden="true" /> {info.author}
            </li>
          )}
          <li className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" /> Duração: {formatDuration(info.duration)}
          </li>
          <li className="break-all text-xs opacity-80">ID: {info.videoId}</li>
        </ul>
      </div>
    </div>
  );
}
