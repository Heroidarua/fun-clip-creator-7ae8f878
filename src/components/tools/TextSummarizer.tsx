import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Copy, Loader2 } from "lucide-react";
interface TextSummarizerProps {
  onSuccess?: () => void;
}

// Stopwords PT/EN para scoring
const STOPWORDS = new Set([
  "a","o","e","de","do","da","dos","das","em","no","na","nos","nas","um","uma","uns","umas",
  "para","por","com","sem","sobre","entre","que","se","ser","é","são","foi","era","ao","à","aos","às",
  "como","mais","mas","ou","já","também","muito","muita","muitos","muitas","seu","sua","seus","suas",
  "meu","minha","este","esta","esse","essa","isso","isto","aquele","aquela","aquilo","eles","elas","ele","ela",
  "the","a","an","of","and","to","in","is","are","was","were","be","been","being","on","for","with","as","by",
  "at","from","this","that","these","those","it","its","or","not","but","if","then","than","so","very","such",
]);

function summarize(text: string, maxSentences = 3): string {
  // Divide em sentenças preservando pontuação
  const sentences = text
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [text.trim()];

  if (sentences.length <= maxSentences) return sentences.join(" ");

  // Frequência de palavras (sem stopwords)
  const freq: Record<string, number> = {};
  for (const s of sentences) {
    for (const w of s.toLowerCase().match(/[a-záàâãéêíóôõúüç]+/gi) || []) {
      if (STOPWORDS.has(w) || w.length < 3) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  // Score de cada sentença
  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().match(/[a-záàâãéêíóôõúüç]+/gi) || [];
    const score = words.reduce((acc, w) => acc + (freq[w] || 0), 0) / Math.max(words.length, 1);
    // Pequeno boost para as primeiras sentenças (geralmente mais relevantes)
    const positionBoost = idx < 3 ? 1.15 : 1;
    return { s, idx, score: score * positionBoost };
  });

  // Pega as top N e reordena pela posição original
  const top = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.idx - b.idx)
    .map((x) => x.s);

  return top.join(" ");
}

const TextSummarizer = ({ onSuccess }: TextSummarizerProps) => {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) {
      toast.error("Digite o texto para resumir");
      return;
    }
    if (text.trim().length < 50) {
      toast.error("Texto muito curto. Mínimo 50 caracteres.");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const wordCount = text.trim().split(/\s+/).length;
      const sentences = wordCount > 300 ? 5 : wordCount > 150 ? 4 : 3;
      // 100% local, sem rede e sem serviços externos
      const summary = summarize(text.trim(), sentences);
      setResult(summary);
      onSuccess?.();
      toast.success("Texto resumido!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao resumir");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Resumo copiado!");
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Cole aqui o texto que deseja resumir..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        className="bg-background/50 border-border/50 text-sm"
      />

      <Button
        onClick={handleSummarize}
        disabled={isLoading || !text.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <FileText className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Resumindo..." : "Resumir Texto"}
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

export default TextSummarizer;
