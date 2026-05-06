import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Languages, Copy, Loader2 } from "lucide-react";

interface AutoTranslatorProps {
  onSuccess?: () => void;
}

const LANGUAGES = [
  { value: "Inglês", label: "🇺🇸 Inglês" },
  { value: "Espanhol", label: "🇪🇸 Espanhol" },
  { value: "Francês", label: "🇫🇷 Francês" },
  { value: "Alemão", label: "🇩🇪 Alemão" },
  { value: "Italiano", label: "🇮🇹 Italiano" },
  { value: "Japonês", label: "🇯🇵 Japonês" },
  { value: "Coreano", label: "🇰🇷 Coreano" },
  { value: "Chinês", label: "🇨🇳 Chinês" },
  { value: "Português", label: "🇧🇷 Português" },
  { value: "Russo", label: "🇷🇺 Russo" },
  { value: "Árabe", label: "🇸🇦 Árabe" },
];

const AutoTranslator = ({ onSuccess }: AutoTranslatorProps) => {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Inglês");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Digite o texto para traduzir");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "translate", text: text.trim(), targetLanguage }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Erro ao traduzir");
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {}
        }
      }

      onSuccess?.();
      toast.success("Texto traduzido!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao traduzir");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Tradução copiada!");
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Digite ou cole o texto para traduzir..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="bg-background/50 border-border/50 text-sm"
      />

      <Select value={targetLanguage} onValueChange={setTargetLanguage}>
        <SelectTrigger className="bg-background/50 border-border/50">
          <SelectValue placeholder="Idioma de destino" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleTranslate}
        disabled={isLoading || !text.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Languages className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Traduzindo..." : "Traduzir"}
      </Button>

      {result && (
        <div className="relative">
          <div className="bg-background/50 border border-border/50 rounded-sm p-4 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
            {result}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AutoTranslator;
