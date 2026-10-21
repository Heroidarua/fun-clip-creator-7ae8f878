import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gauge, Loader2 } from "lucide-react";

export default function SpeedTestTool() {
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [download, setDownload] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("");

  const run = async () => {
    setRunning(true); setPing(null); setJitter(null); setDownload(null);
    setPhase("Ping...");
    try {
      const pings: number[] = [];
      for (let i = 0; i < 5; i++) {
        const t = performance.now();
        await fetch("https://speed.cloudflare.com/__down?bytes=0&_=" + Math.random(), { cache: "no-store" });
        pings.push(performance.now() - t);
      }
      const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
      const jit = Math.sqrt(pings.reduce((a, b) => a + (b - avg) ** 2, 0) / pings.length);
      setPing(Math.round(avg));
      setJitter(Math.round(jit));

      setPhase("Download...");
      const size = 25 * 1024 * 1024;
      const t0 = performance.now();
      const r = await fetch(`https://speed.cloudflare.com/__down?bytes=${size}&_=` + Math.random(), { cache: "no-store" });
      const blob = await r.blob();
      const sec = (performance.now() - t0) / 1000;
      const mbps = (blob.size * 8) / (sec * 1024 * 1024);
      setDownload(Math.round(mbps * 10) / 10);

      setPhase("Concluído");
    } catch {
      setPhase("Erro — verifique sua conexão");
    } finally { setRunning(false); }
  };

  const Stat = ({ label, value, unit }: { label: string; value: number | null; unit: string }) => (
    <div className="text-center bg-background/40 border border-border/40 rounded-sm p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-pixel text-2xl text-primary">{value ?? "-"}</p>
      <p className="text-[10px] text-muted-foreground">{unit}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Ping" value={ping} unit="ms" />
        <Stat label="Jitter" value={jitter} unit="ms" />
        <Stat label="Download" value={download} unit="Mbps" />
      </div>
      <Button onClick={run} disabled={running} className="w-full">
        {running ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Gauge className="w-4 h-4 mr-1" />}
        {running ? phase : "Iniciar teste"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        ⓘ Teste de upload omitido por limitação CORS de provedores públicos.
      </p>
    </div>
  );
}