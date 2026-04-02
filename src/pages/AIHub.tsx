import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Zap, Trash2 } from "lucide-react";
import clipyMascot from "@/assets/clipy-mascot.png";
import HubMessage, { type HubMessageType } from "@/components/hub/HubMessage";
import HubQuickActions, { type ToolId } from "@/components/hub/HubQuickActions";
import HubInputBar from "@/components/hub/HubInputBar";
import { detectInput } from "@/components/hub/HubSmartDetector";
import { runTool } from "@/components/hub/HubToolRunner";
import { toast } from "sonner";

// AI Hub - ClipSave Central
let msgCounter = 0;
const uid = () => `msg-${++msgCounter}-${Date.now()}`;

const WELCOME_MESSAGES: string[] = [
  "Olá! 👋 Eu sou o ClipY, seu assistente digital!\n\nEnvie um texto, link, imagem ou vídeo e eu vou sugerir a melhor ferramenta automaticamente! 🚀",
];

const AIHub = () => {
  const [messages, setMessages] = useState<HubMessageType[]>([
    { id: uid(), role: "assistant", text: WELCOME_MESSAGES[0] },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingInput, setPendingInput] = useState<{ text: string; file?: File } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: HubMessageType) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const updateLastAssistant = useCallback((text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant") {
        updated[updated.length - 1] = { ...last, text };
      }
      return updated;
    });
  }, []);

  const handleToolExec = useCallback(async (toolId: ToolId, input: string, file?: File) => {
    setIsLoading(true);
    const assistantId = uid();
    addMessage({ id: assistantId, role: "assistant", text: "", isLoading: true });

    try {
      const result = await runTool(toolId, input, file, (delta) => {
        updateLastAssistant(delta);
      });

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          id: assistantId,
          role: "assistant",
          text: result.text,
          resultUrl: result.resultUrl,
          resultType: result.resultType,
        };
        return updated;
      });
    } catch (e: any) {
      updateLastAssistant(`❌ ${e.message || "Erro ao processar"}`);
      toast.error(e.message);
    } finally {
      setIsLoading(false);
      setPendingInput(null);
    }
  }, [addMessage, updateLastAssistant]);

  const handleSend = useCallback((text: string, file?: File) => {
    // Add user message
    const userMsg: HubMessageType = {
      id: uid(),
      role: "user",
      text: text || (file ? `📎 ${file.name}` : ""),
      attachment: file ? {
        type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "file",
        name: file.name,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      } : undefined,
    };
    addMessage(userMsg);

    // Detect and suggest
    const detection = detectInput(text, file);
    setPendingInput({ text, file });

    if (detection.suggestions.length > 0) {
      const sugMsg: HubMessageType = {
        id: uid(),
        role: "assistant",
        text: detection.mascotMessage,
      };
      addMessage(sugMsg);
    } else {
      // If no suggestions, try to use AI text generation
      handleToolExec("generate_text", text, file);
    }
  }, [addMessage, handleToolExec]);

  const handleQuickAction = useCallback((toolId: ToolId) => {
    if (pendingInput) {
      handleToolExec(toolId, pendingInput.text, pendingInput.file);
    } else {
      // Prompt user
      const promptMap: Record<string, string> = {
        summarize: "Cole o texto que deseja resumir no campo abaixo! 📝",
        translate: "Cole o texto que deseja traduzir! 🌍",
        generate_text: "Me diga o que deseja gerar! ✨",
        password: "Gerando uma senha segura para você... 🔑",
        qr_code: "Digite o texto ou URL para gerar o QR Code! 📱",
        shorten_url: "Cole a URL que deseja encurtar! 🔗",
        mp4_to_mp3: "Envie um arquivo de vídeo MP4 usando o botão 📎",
        remove_bg: "Envie uma imagem usando o botão 📎",
        thumbnail: "Envie uma imagem para criar a thumbnail! 🖼️",
        image_to_pdf: "Envie as imagens para converter em PDF! 📄",
        watermark: "Envie uma imagem para adicionar marca d'água! 💧",
        pixel_avatar: "Vou gerar um avatar pixel pra você! 🎮",
      };

      if (toolId === "password") {
        handleToolExec("password", "", undefined);
      } else {
        addMessage({ id: uid(), role: "assistant", text: promptMap[toolId] || "Me diga o que precisa!" });
      }
    }
  }, [pendingInput, handleToolExec, addMessage]);

  const handleSuggestionClick = useCallback((toolId: ToolId) => {
    if (pendingInput) {
      handleToolExec(toolId, pendingInput.text, pendingInput.file);
    }
  }, [pendingInput, handleToolExec]);

  const clearHistory = () => {
    setMessages([{ id: uid(), role: "assistant", text: WELCOME_MESSAGES[0] }]);
    setPendingInput(null);
  };

  // Extract pending suggestions from the last assistant message detection
  const lastDetection = pendingInput ? detectInput(pendingInput.text, pendingInput.file) : null;
  const showSuggestions = lastDetection && lastDetection.suggestions.length > 0 && !isLoading;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/40 shadow-[0_4px_30px_hsl(var(--primary)/0.1)]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative">
                <img src={clipyMascot} alt="ClipY" className="h-10 w-10 object-contain drop-shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  ClipSave AI Hub
                  <Sparkles className="w-4 h-4 text-primary" />
                </h1>
                <p className="text-[10px] text-muted-foreground">
                  {isLoading ? "⚡ Processando..." : "Todas as ferramentas em um só lugar"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-destructive"
              title="Limpar histórico"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary">IA ATIVA</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <HubMessage key={msg.id} msg={msg} />
          ))}

          {/* Smart suggestions */}
          {showSuggestions && (
            <div className="flex gap-2 flex-wrap pl-11 animate-fade-in">
              {lastDetection!.suggestions.map((s) => (
                <button
                  key={s.toolId}
                  onClick={() => handleSuggestionClick(s.toolId)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-xs font-medium text-primary hover:bg-primary/20 hover:scale-105 transition-all"
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Bottom area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/30">
        <div className="container mx-auto max-w-3xl px-4 py-3 space-y-3">
          {/* Quick actions (when empty) */}
          {messages.length <= 1 && (
            <div className="animate-fade-in">
              <p className="text-[10px] text-center text-muted-foreground mb-2">⚡ Ações rápidas</p>
              <HubQuickActions onSelect={handleQuickAction} />
            </div>
          )}
          <HubInputBar onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AIHub;
