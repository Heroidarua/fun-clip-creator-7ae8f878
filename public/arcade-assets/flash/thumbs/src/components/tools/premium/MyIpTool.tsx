import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function MyIpTool() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("https://ipapi.co/json/");
      if (!r.ok) throw new Error("Falha ao consultar");
      setData(await r.json());
    } catch {
      toast.error("Não foi possível obter informações.");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!data) return null;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const browser = /Chrome/.test(ua) ? "Chrome" : /Firefox/.test(ua) ? "Firefox" : /Safari/.test(ua) ? "Safari" : "Outro";
  const os = /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /Linux/.test(ua) ? "Linux" : /iPhone|iPad/.test(ua) ? "iOS" : "Outro";

  const rows: [string, any][] = [
    ["IP público", data.ip],
    ["Cidade", data.city],
    ["Estado", data.region],
    ["País", `${data.country_name} (${data.country})`],
    ["Provedor", data.org],
    ["Fuso horário", data.timezone],
    ["Latitude / Longitude", `${data.latitude}, ${data.longitude}`],
    ["Navegador", browser],
    ["Sistema", os],
    ["Idioma", navigator.language],
    ["Resolução", `${window.screen.width}x${window.screen.height}`],
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-sm p-4">
        <div>
          <p className="text-xs text-muted-foreground">Seu IP público</p>
          <p className="font-pixel text-lg text-primary">{data.ip}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(data.ip); toast.success("IP copiado!"); }}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-border/30 py-2">
            <span className="text-muted-foreground">{k}</span>
            <span className="font-medium text-foreground text-right truncate ml-2">{v ?? "-"}</span>
          </div>
        ))}
      </div>
      {data.latitude && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=12/${data.latitude}/${data.longitude}`}
          target="_blank" rel="noreferrer"
          className="block text-center text-xs text-primary underline mt-2"
        >Ver no mapa (OpenStreetMap)</a>
      )}
    </div>
  );
}