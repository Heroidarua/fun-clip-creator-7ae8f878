import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { generateFreeText } from "@/lib/free-ai";
import { puterGenerateText } from "@/lib/puter-ai";

interface AITextGeneratorProps {
  onSuccess?: () => void;
}

const AITextGenerator = ({ onSuccess }: AITextGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Digite um prompt para gerar o texto");
      return;
    }

    setIsLoading(true);
    setResult("");
    abortRef.current = new AbortController();

    try {
      let text: string;
      try {
        // Streaming em tempo real com a IA gratuita do Puter
        text = await puterGenerateText(prompt, {
          onChunk: (partial) => setResult(partial),
        });
      } catch {
        text = await generateFreeText(prompt, { signal: abortRef.current.signal });
      }
      setResult(text);
      onSuccess?.();
      toast.success("Texto gerado com sucesso!");
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error(e.message || "Erro ao gerar texto");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success("Texto copiado!");
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Ex: Escreva uma descrição criativa para um canal de jogos retrô no YouTube..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        className="bg-background/50 border-border/50 text-sm"
      />

      <Button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Gerando..." : "Gerar Texto"}
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

export default AITextGenerator;
