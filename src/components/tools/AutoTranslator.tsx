import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Languages, Copy, Loader2 } from "lucide-react";
import { puterGenerateText } from "@/lib/puter-ai";

interface AutoTranslatorProps {
  onSuccess?: () => void;
}

const LANGUAGES = [
  { value: "en", label: "🇺🇸 Inglês" },
  { value: "es", label: "🇪🇸 Espanhol" },
  { value: "fr", label: "🇫🇷 Francês" },
  { value: "de", label: "🇩🇪 Alemão" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "ja", label: "🇯🇵 Japonês" },
  { value: "ko", label: "🇰🇷 Coreano" },
  { value: "zh-CN", label: "🇨🇳 Chinês" },
  { value: "pt", label: "🇧🇷 Português" },
  { value: "ru", label: "🇷🇺 Russo" },
  { value: "ar", label: "🇸🇦 Árabe" },
];

const LANGUAGE_NAMES: Record<string, string> = {
  en: "inglês", es: "espanhol", fr: "francês", de: "alemão", it: "italiano",
  ja: "japonês", ko: "coreano", "zh-CN": "chinês simplificado",
  pt: "português do Brasil", ru: "russo", ar: "árabe",
};

async function translateWithGoogle(text: string, targetLanguage: string) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Falha ao conectar com o serviço de tradução");
  const data = await resp.json();
  const translated = (data?.[0] || []).map((seg: any[]) => seg?.[0] || "").join("");
  if (!translated) throw new Error("Tradução vazia");
  return translated as string;
}

const AutoTranslator = ({ onSuccess }: AutoTranslatorProps) => {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
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
      const target = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;
      let translated: string;
      try {
        // IA gratuita (Puter) — tradução com mais contexto
        translated = await puterGenerateText(text.trim(), {
          system: `Você é um tradutor profissional. Traduza o texto do usuário para ${target}. Retorne APENAS a tradução, sem explicações, sem aspas e sem comentários.`,
        });
      } catch {
        translated = await translateWithGoogle(text.trim(), targetLanguage);
      }
      setResult(translated);
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
