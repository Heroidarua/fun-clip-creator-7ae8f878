// HubMessage component
import { Loader2 } from "lucide-react";
import clipyMascot from "@/assets/clipy-mascot.png";

export type HubMessageType = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachment?: { type: "image" | "video" | "file"; name: string; url: string };
  resultUrl?: string;
  resultType?: string;
  isLoading?: boolean;
};

const HubMessage = ({ msg }: { msg: HubMessageType }) => {
  return (
    <div className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
      {msg.role === "assistant" && (
        <img src={clipyMascot} alt="ClipY" className="h-8 w-8 object-contain flex-shrink-0 mt-1 drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          msg.role === "user"
            ? "bg-primary/90 text-primary-foreground rounded-br-sm border border-primary/50 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
            : "bg-card/80 text-foreground rounded-bl-sm border border-border/40 shadow-[0_0_10px_hsl(var(--primary)/0.1)]"
        }`}
      >
        {msg.attachment && (
          <div className="mb-2 p-2 bg-background/30 rounded-lg border border-border/30">
            {msg.attachment.type === "image" ? (
              <img src={msg.attachment.url} alt={msg.attachment.name} className="max-h-40 rounded-md object-contain" />
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>📎</span>
                <span className="truncate">{msg.attachment.name}</span>
              </div>
            )}
          </div>
        )}

        {msg.isLoading && !msg.text ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          msg.text
        )}

        {msg.resultUrl && (
          <div className="mt-3">
            {msg.resultType === "image" ? (
              <img src={msg.resultUrl} alt="Resultado" className="max-h-48 rounded-lg border border-primary/30" />
            ) : (
              <a
                href={msg.resultUrl}
                download
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/30 transition-colors border border-primary/30"
              >
                ⬇️ Baixar resultado
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubMessage;
