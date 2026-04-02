import { useState } from "react";
import { Clipboard, Link2, Copy, ExternalLink, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UrlShortenerProps {
  onSuccess?: () => void;
}

const UrlShortener = ({ onSuccess }: UrlShortenerProps) => {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [useCustomAlias, setUseCustomAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidAlias = (alias: string) => {
    // Alias must be alphanumeric with underscores/hyphens, 5-30 characters
    return /^[a-zA-Z0-9_-]{5,30}$/.test(alias);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast({
        title: "✅ Link colado!",
        description: "Clique em Encurtar para gerar o link curto.",
      });
    } catch {
      toast({
        title: "❌ Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const handleShorten = async () => {
    if (!url.trim()) {
      toast({
        title: "URL obrigatório",
        description: "Por favor, insira uma URL para encurtar.",
        variant: "destructive",
      });
      return;
    }

    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    if (!isValidUrl(processedUrl)) {
      toast({
        title: "❌ URL inválida",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    // Validate custom alias if enabled
    if (useCustomAlias && customAlias.trim()) {
      if (!isValidAlias(customAlias.trim())) {
        toast({
          title: "❌ Alias inválido",
          description: "O alias deve ter 5-30 caracteres (letras, números, _ ou -).",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    setShortenedUrl("");

    try {
      // Build is.gd API URL with optional custom shorturl
      let apiUrl = `https://is.gd/create.php?format=json&url=${encodeURIComponent(processedUrl)}`;
      
      if (useCustomAlias && customAlias.trim()) {
        apiUrl += `&shorturl=${encodeURIComponent(customAlias.trim())}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.shorturl) {
        setShortenedUrl(data.shorturl);
        onSuccess?.();
        toast({
          title: "✅ URL encurtada!",
          description: useCustomAlias ? "Seu link personalizado está pronto." : "Seu link curto está pronto.",
        });
      } else if (data.errorcode) {
        // Handle specific is.gd errors
        let errorMessage = "Não foi possível encurtar a URL.";
        
        if (data.errorcode === 2) {
          errorMessage = "Este alias já está em uso. Tente outro nome.";
        } else if (data.errorcode === 3) {
          errorMessage = "Alias inválido. Use apenas letras, números, _ ou -.";
        } else if (data.errorcode === 4) {
          errorMessage = "A URL de destino não é permitida.";
        }
        
        throw new Error(errorMessage);
      } else {
        throw new Error("Resposta inválida do serviço");
      }
    } catch (error: any) {
      console.error("URL shortening error:", error);
      
      // If custom alias failed, show specific error
      if (useCustomAlias && customAlias.trim()) {
        toast({
          title: "❌ Erro ao criar link",
          description: error.message || "O alias pode já estar em uso. Tente outro nome.",
          variant: "destructive",
        });
      } else {
        // Fallback: Try TinyURL for non-custom links
        try {
          const fallbackResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(processedUrl)}`);
          const fallbackUrl = await fallbackResponse.text();
          
          if (fallbackUrl && fallbackUrl.startsWith('http')) {
            setShortenedUrl(fallbackUrl);
            toast({
              title: "✅ URL encurtada!",
              description: "Seu link curto está pronto.",
            });
          } else {
            throw new Error("Serviço indisponível");
          }
        } catch {
          toast({
            title: "❌ Erro ao encurtar",
            description: "Não foi possível encurtar a URL. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      toast({
        title: "✅ Copiado!",
        description: "Link curto copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "❌ Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setUrl("");
    setCustomAlias("");
    setShortenedUrl("");
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Input
            type="url"
            placeholder="Cole ou digite a URL aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-10 bg-background/50 border-[hsl(200,100%,50%)]/30 focus:border-[hsl(200,100%,50%)]"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePaste}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <Clipboard className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={handleShorten}
          disabled={loading}
          className="font-pixel text-xs bg-[hsl(200,100%,50%)] hover:bg-[hsl(200,100%,40%)]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Link2 className="w-4 h-4 mr-2" />
              ENCURTAR
            </>
          )}
        </Button>
      </div>

      {/* Custom Alias Toggle & Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="custom-alias"
            checked={useCustomAlias}
            onCheckedChange={setUseCustomAlias}
          />
          <Label htmlFor="custom-alias" className="text-sm flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4 text-[hsl(200,100%,50%)]" />
            Link personalizado
          </Label>
        </div>

        {useCustomAlias && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-sm border border-[hsl(200,100%,50%)]/20">
              <span className="text-sm text-muted-foreground whitespace-nowrap">is.gd/</span>
              <Input
                type="text"
                placeholder="meu-link-personalizado"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                className="flex-1 bg-background/50 border-[hsl(200,100%,50%)]/30 focus:border-[hsl(200,100%,50%)] h-8 text-sm"
                maxLength={30}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              5-30 caracteres: letras, números, _ ou -
            </p>
          </div>
        )}
      </div>

      {/* Shortened URL Result */}
      {shortenedUrl && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 rounded-sm bg-[hsl(200,100%,50%)]/10 border-2 border-[hsl(200,100%,50%)]/30">
            <p className="text-xs text-muted-foreground mb-2">
              {useCustomAlias ? "Link personalizado:" : "Link encurtado:"}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono text-[hsl(200,100%,50%)] break-all">
                {shortenedUrl}
              </code>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              className="flex-1 font-pixel text-xs bg-[hsl(200,100%,50%)] hover:bg-[hsl(200,100%,40%)]"
            >
              <Copy className="w-4 h-4 mr-2" />
              COPIAR
            </Button>
            <Button
              onClick={() => window.open(shortenedUrl, '_blank')}
              variant="outline"
              className="font-pixel text-xs"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="font-pixel text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Helper text */}
      {!shortenedUrl && !loading && (
        <p className="text-xs text-muted-foreground text-center">
          {useCustomAlias 
            ? "Crie um link curto com o nome que você escolher"
            : "Cole uma URL longa para gerar um link curto e fácil de compartilhar"
          }
        </p>
      )}
    </div>
  );
};

export default UrlShortener;
