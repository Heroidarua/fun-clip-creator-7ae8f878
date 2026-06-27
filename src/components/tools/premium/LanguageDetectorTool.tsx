import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const NAMES: Record<string, string> = {
  por: "Português", eng: "Inglês", spa: "Espanhol", fra: "Francês", deu: "Alemão",
  ita: "Italiano", jpn: "Japonês", kor: "Coreano", cmn: "Chinês (Mandarim)",
  rus: "Russo", arb: "Árabe", nld: "Holandês", pol: "Polonês", tur: "Turco",
  hin: "Híndi", ben: "Bengali", swe: "Sueco", und: "Indeterminado",
};

export default function LanguageDetectorTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ code: string; name: string } | null>(null);

  const detect = async () => {
    if (text.trim().length < 10) {
      setResult({ code: "und", name: "Texto muito curto (mín. 10 caracteres)" });
      return;
    }
    const { franc } = await import("franc-min");
    const code = franc(text);
    setResult({ code, name: NAMES[code] ?? code });
  };

  const translate = () => {
    window.open(`https://translate.google.com/?sl=auto&tl=pt&text=${encodeURIComponent(text)}&op=translate`, "_blank");
  };

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Cole um texto..."
        className="w-full bg-background/50 border border-border/50 rounded-sm p-3 text-sm"
      />
      <div className="flex gap-2 flex-wrap">
        <Button onClick={detect}><Languages className="w-4 h-4 mr-1" /> Detectar idioma</Button>
        {result && <Button variant="outline" onClick={translate}>Traduzir para PT</Button>}
      </div>
      <div className="text-xs text-muted-foreground">Caracteres: {text.length}</div>
      {result && (
        <div className="bg-primary/10 border border-primary/30 rounded-sm p-4">
          <p className="text-xs text-muted-foreground">Idioma detectado</p>
          <p className="font-pixel text-lg text-primary">{result.name}</p>
          <p className="text-xs text-muted-foreground">ISO 639-3: {result.code}</p>
        </div>
      )}
    </div>
  );
}