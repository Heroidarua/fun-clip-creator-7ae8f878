import { CloudLightning, ExternalLink } from "lucide-react";

export default function LightningTrackerTool() {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-sm p-4 text-center">
        <CloudLightning className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground">Raios em Tempo Real</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Mapa mundial de descargas elétricas e tempestades ao vivo.
        </p>
      </div>

      <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-muted">
        <iframe
          src="https://www.blitzortung.org/en/live_lightning_maps.php"
          className="absolute inset-0 w-full h-full invert-[0.85] hue-rotate-[180deg]"
          title="Blitzortung Live"
        />
      </div>

      <a
        href="https://www.blitzortung.org"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[10px] font-pixel text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ABRIR NO BLITZORTUNG
      </a>
    </div>
  );
}
