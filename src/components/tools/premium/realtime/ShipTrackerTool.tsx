import { Ship, ExternalLink } from "lucide-react";

export default function ShipTrackerTool() {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-sm p-4 text-center">
        <Ship className="w-10 h-10 mx-auto text-cyan-500 mb-2" />
        <h3 className="font-pixel text-sm text-foreground">Navios em Tempo Real</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Rastreamento global de navios cargueiros, petroleiros e cruzeiros.
        </p>
      </div>

      <div className="relative aspect-video w-full border-2 border-border overflow-hidden rounded-sm bg-muted">
        <iframe
          src="https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:-15/centerx:-47/maptype:4/shownames:false/mmsi:0/shipid:0/fleet:/fleet_id:/vessel:0/showmenu:false/remember:false"
          className="absolute inset-0 w-full h-full"
          title="MarineTraffic Live"
        />
      </div>

      <a
        href="https://www.marinetraffic.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-[10px] font-pixel text-primary hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ABRIR NO MARINETRAFFIC
      </a>
    </div>
  );
}
