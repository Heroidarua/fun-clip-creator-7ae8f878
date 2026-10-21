import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Copy, FileDown } from "lucide-react";
import { toast } from "sonner";

type AnyRec = any;

export default function SpeechToTextTool() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const recRef = useRef<AnyRec>(null);

  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let s = "";
      for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
      setText(s);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e: any) => { toast.error("Erro: " + e.error); setListening(false); };
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  const start = () => { try { recRef.current?.start(); setListening(true); } catch (e: any) { toast.error(e.message); } };
  const stop = () => { try { recRef.current?.stop(); } catch {} setListening(false); };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transcricao.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  if (!supported) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Seu navegador não suporta reconhecimento de fala. Use Chrome ou Edge.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!listening ? (
          <Button onClick={start}><Mic className="w-4 h-4 mr-1" /> Gravar</Button>
        ) : (
          <Button variant="destructive" onClick={stop}><Square className="w-4 h-4 mr-1" /> Parar</Button>
        )}
        {listening && <span className="text-xs text-red-500 flex items-center gap-1 animate-pulse">● Ouvindo...</span>}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="A transcrição aparecerá aqui..."
        className="w-full bg-background/50 border border-border/50 rounded-sm p-3 text-sm"
      />

      {text && (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copiado!"); }}>
            <Copy className="w-4 h-4 mr-1" /> Copiar
          </Button>
          <Button size="sm" variant="outline" onClick={download}>
            <FileDown className="w-4 h-4 mr-1" /> Baixar TXT
          </Button>
        </div>
      )}
    </div>
  );
}