import { Stars, ExternalLink } from "lucide-react";

export default function SkyTrackerTool() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-sm p-4 text-center">
        <Stars className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground">Céu em Tempo Real</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Explore as estrelas, planetas e constelações visíveis agora.
        </p>
      </div>

      <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-slate-950">
        <iframe
          src="https://stellarium-web.org/"
          className="absolute inset-0 w-full h-full"
          title="Stellarium Web"
        />
      </div>

      <a
        href="https://stellarium-web.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[10px] font-pixel text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ABRIR NO STELLARIUM WEB
      </a>
    </div>
  );
}
