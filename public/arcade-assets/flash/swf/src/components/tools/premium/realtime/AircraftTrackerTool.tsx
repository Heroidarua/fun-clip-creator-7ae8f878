import { Plane, ExternalLink } from "lucide-react";

export default function AircraftTrackerTool() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-sm p-4 text-center">
        <Plane className="w-10 h-10 mx-auto text-blue-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground uppercase">Rastreador de Aviões</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Acompanhe voos comerciais e privados em tempo real no mapa global.
        </p>
      </div>

      <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-muted shadow-cartridge">
        <iframe
          src="https://globe.adsbexchange.com/?cacheBust=2603311544"
          className="absolute inset-0 w-full h-full grayscale-[0.2] brightness-[0.9]"
          title="ADSBExchange Live"
          allow="geolocation"
        />
      </div>

      <a
        href="https://adsbexchange.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[10px] font-pixel text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ABRIR NO ADSBEXCHANGE
      </a>
    </div>
  );
}
