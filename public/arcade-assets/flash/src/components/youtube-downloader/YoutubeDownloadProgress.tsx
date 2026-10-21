import { Loader2 } from "lucide-react";

export default function YoutubeDownloadProgress({
  label,
  progress,
}: {
  label: string;
  progress?: number | null;
}) {
  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> {label}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full bg-primary transition-all ${
            progress == null ? "w-1/3 animate-pulse" : ""
          }`}
          style={progress == null ? undefined : { width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
