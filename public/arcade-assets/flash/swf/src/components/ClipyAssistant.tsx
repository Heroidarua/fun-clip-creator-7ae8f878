import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import clipyMascot from "@/assets/clipy-mascot.png";
import { toast } from "sonner";

type Message = { role: "user" | "clipy"; text: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clipy-chat`;

const ClipyAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const greetingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    greetingTimeout.current = setTimeout(() => {
      if (!isOpen) setShowGreeting(true);
    }, 5000);
    return () => clearTimeout(greetingTimeout.current);
  }, []);

  useEffect(() => {
    if (isOpen) setShowGreeting(false);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickReplies = [
    "Como baixar vídeos?",
    "Quais ferramentas têm?",
    "O site é gratuito?",
    "Como usar o AI Hub?",
  ];

  const streamResponse = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true);
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
        toast.error(err.error || "Erro ao conectar com o ClipY");
        setIsLoading(false);
        return;
      }

      if (!resp.body) {
        toast.error("Sem resposta do servidor");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantText = "";
      let streamDone = false;

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "clipy", text: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              const finalText = assistantText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "clipy", text: finalText };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              const finalText = assistantText;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "clipy", text: finalText };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("ClipY stream error:", e);
      toast.error("Erro ao se comunicar com o ClipY 😢");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSend = useCallback((text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { role: "user", text: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamResponse(newMessages);
  }, [input, isLoading, messages, streamResponse]);

  return (
    <>
      {/* Greeting bubble */}
      {showGreeting && !isOpen && (
        <div
          className="fixed bottom-28 right-4 sm:right-6 z-[9998] animate-fade-in cursor-pointer"
          onClick={() => {
            setShowGreeting(false);
            setIsOpen(true);
          }}
        >
          <div className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl rounded-br-sm px-4 py-3 shadow-lg shadow-primary/10 max-w-[220px]">
            <p className="text-xs text-foreground font-medium">
              Oi! 👋 Eu sou o <span className="text-primary font-bold">ClipY</span>! Precisa de ajuda?
            </p>
          </div>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-28 right-4 sm:right-6 z-[9999] w-[340px] sm:w-[380px] max-h-[500px] flex flex-col bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
            <img src={clipyMascot} alt="ClipY" className="h-9 w-9 object-contain" />
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground flex items-center gap-1">
                ClipY <Sparkles className="h-3 w-3 text-primary" />
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isLoading ? "Digitando..." : "Assistente IA do sos01"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px] max-h-[320px]">
            {messages.length === 0 && (
              <div className="text-center space-y-3">
                <img src={clipyMascot} alt="ClipY" className="h-16 w-16 mx-auto object-contain" />
                <p className="text-xs text-muted-foreground">
                  Olá! Sou o <span className="text-primary font-bold">ClipY</span> com IA! Pergunte-me qualquer coisa sobre o sos01! 🚀
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {quickReplies.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "clipy" && (
                  <img src={clipyMascot} alt="ClipY" className="h-6 w-6 object-contain mr-1.5 mt-1 flex-shrink-0" />
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/60 text-foreground rounded-bl-sm border border-border/30"
                  }`}
                >
                  {msg.text || (isLoading && i === messages.length - 1 ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : null)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                disabled={isLoading}
                className="flex-1 bg-muted/40 border border-border/30 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating mascot button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-4 right-4 sm:right-6 z-[9999] group"
        aria-label="Abrir assistente ClipY"
      >
        <div className={`relative transition-transform duration-300 ${isHovered ? "scale-110" : "scale-100"} ${isOpen ? "scale-90" : ""}`}>
          <div className="absolute -inset-2 rounded-full bg-primary/20 blur-lg animate-pulse" />
          <div className="absolute -inset-1 rounded-full border-2 border-primary/40 animate-spin" style={{ animationDuration: "8s" }} />
          <div className="relative h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-card/90 backdrop-blur-sm border-2 border-primary/50 flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20">
            {isOpen ? (
              <MessageCircle className="h-7 w-7 text-primary" />
            ) : (
              <img src={clipyMascot} alt="ClipY" className="h-14 w-14 sm:h-16 sm:w-16 object-contain" />
            )}
          </div>
          <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card shadow-sm" />
        </div>
      </button>
    </>
  );
};

export default ClipyAssistant;
