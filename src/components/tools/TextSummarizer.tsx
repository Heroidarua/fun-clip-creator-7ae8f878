import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Copy, Loader2 } from "lucide-react";

interface TextSummarizerProps {
  onSuccess?: () => void;
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

    setIsLoading(true);
    setResult("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-text-tools`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: "summarize", text: text.trim() }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Erro ao resumir");
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
