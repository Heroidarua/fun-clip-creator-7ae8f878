// HubQuickActions component
import { 
  FileText, Languages, Sparkles, Music, ImageOff, 
  Image, QrCode, KeyRound, Link, FileImage 
} from "lucide-react";

export type ToolId = 
  | "summarize" | "translate" | "generate_text" 
  | "mp4_to_mp3" | "remove_bg" | "thumbnail" 
  | "qr_code" | "password" | "shorten_url" 
  | "image_to_pdf" | "watermark" | "pixel_avatar";

type QuickAction = {
  id: ToolId;
  label: string;
  icon: React.ReactNode;
  color: string;
  needsFile?: "image" | "video" | "any";
};

const actions: QuickAction[] = [
  { id: "summarize", label: "Resumir", icon: <FileText className="w-4 h-4" />, color: "text-[hsl(var(--retro-cyan))]" },
  { id: "translate", label: "Traduzir", icon: <Languages className="w-4 h-4" />, color: "text-[hsl(var(--retro-blue))]" },
  { id: "generate_text", label: "Gerar Texto", icon: <Sparkles className="w-4 h-4" />, color: "text-[hsl(var(--retro-magenta))]" },
  { id: "mp4_to_mp3", label: "MP4→MP3", icon: <Music className="w-4 h-4" />, color: "text-[hsl(var(--retro-orange))]", needsFile: "video" },
  { id: "remove_bg", label: "Remover Fundo", icon: <ImageOff className="w-4 h-4" />, color: "text-[hsl(var(--accent))]", needsFile: "image" },
  { id: "thumbnail", label: "Thumbnail", icon: <Image className="w-4 h-4" />, color: "text-[hsl(var(--retro-yellow))]", needsFile: "image" },
  { id: "qr_code", label: "QR Code", icon: <QrCode className="w-4 h-4" />, color: "text-primary" },
  { id: "password", label: "Senha", icon: <KeyRound className="w-4 h-4" />, color: "text-[hsl(var(--retro-cyan))]" },
  { id: "shorten_url", label: "Encurtar URL", icon: <Link className="w-4 h-4" />, color: "text-[hsl(var(--retro-blue))]" },
  { id: "image_to_pdf", label: "IMG→PDF", icon: <FileImage className="w-4 h-4" />, color: "text-[hsl(var(--retro-magenta))]" },
];

interface Props {
  onSelect: (toolId: ToolId) => void;
}

const HubQuickActions = ({ onSelect }: Props) => (
  <div className="flex flex-wrap gap-2 justify-center">
    {actions.map((a) => (
      <button
        key={a.id}
        onClick={() => onSelect(a.id)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/60 border border-border/30 text-xs font-medium transition-all hover:scale-105 hover:border-primary/50 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)] ${a.color}`}
      >
        {a.icon}
        {a.label}
      </button>
    ))}
  </div>
);

export default HubQuickActions;
