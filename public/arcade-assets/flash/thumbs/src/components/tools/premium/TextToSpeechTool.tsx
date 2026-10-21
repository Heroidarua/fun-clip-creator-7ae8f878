import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";

export default function TextToSpeechTool() {
  const [text, setText] = useState("Olá! Esta é a ferramenta de texto para voz do SOS01.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (!voice && list.length) {
        const pt = list.find((v) => v.lang.startsWith("pt"));
        setVoice((pt ?? list[0]).name);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [voice]);

  const speak = () => {
    if (!text.trim()) return toast.error("Digite um texto.");
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((x) => x.name === voice);
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  const stop = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full bg-background/50 border border-border/50 rounded-sm p-3 text-sm"
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Voz</label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger><SelectValue placeholder="Voz" /></SelectTrigger>
            <SelectContent className="max-h-64">
              {voices.map((v) => (
                <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Velocidade: {rate.toFixed(1)}x</label>
          <Slider value={[rate]} min={0.5} max={2} step={0.1} onValueChange={(v) => setRate(v[0])} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Tom: {pitch.toFixed(1)}</label>
          <Slider value={[pitch]} min={0} max={2} step={0.1} onValueChange={(v) => setPitch(v[0])} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={speak} disabled={speaking}><Play className="w-4 h-4 mr-1" /> Reproduzir</Button>
        <Button variant="outline" onClick={stop} disabled={!speaking}><Square className="w-4 h-4 mr-1" /> Parar</Button>
      </div>

      <p className="text-xs text-muted-foreground">
        ⓘ Usa a síntese de voz nativa do navegador. O download em MP3 exige API externa e não está disponível no momento.
      </p>
    </div>
  );
}