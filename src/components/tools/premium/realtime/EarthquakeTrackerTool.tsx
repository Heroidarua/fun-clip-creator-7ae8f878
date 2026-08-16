import { Activity, ExternalLink } from "lucide-react";

export default function EarthquakeTrackerTool() {
  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-sm p-4 text-center">
        <Activity className="w-10 h-10 mx-auto text-orange-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground uppercase">Terremotos em Tempo Real</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Monitoramento de atividades sísmicas e tremores recentes no mundo.
        </p>
      </div>

      <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-muted shadow-cartridge">
        <iframe
          src="https://earthquake.usgs.gov/earthquakes/map/?extent=-77.91507,-158.55469&extent=79.94825,-16.17188"
          className="absolute inset-0 w-full h-full grayscale-[0.2]"
          title="USGS Earthquake Map"
        />
      </div>

      <a
        href="https://earthquake.usgs.gov"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[10px] font-pixel text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ABRIR NO USGS
      </a>
    </div>
  );
}
