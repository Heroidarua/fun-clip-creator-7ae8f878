// HubInputBar component
import { useState, useRef } from "react";
import { Send, Paperclip, X, Loader2 } from "lucide-react";

interface Props {
  onSend: (text: string, file?: File) => void;
  isLoading: boolean;
  placeholder?: string;
}

const HubInputBar = ({ onSend, isLoading, placeholder }: Props) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !file) || isLoading) return;
    onSend(text.trim(), file || undefined);
    setText("");
    setFile(null);
    setPreview(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {file && (
        <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-card/60 rounded-xl border border-border/30">
          {preview && <img src={preview} alt="" className="h-10 w-10 rounded-md object-cover" />}
          <span className="text-xs text-muted-foreground truncate flex-1">{file.name}</span>
          <button type="button" onClick={clearFile} className="p-1 hover:bg-muted/50 rounded-lg">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 bg-card/60 backdrop-blur-xl border border-border/40 rounded-2xl px-3 py-2 shadow-[0_0_20px_hsl(var(--primary)/0.1)] focus-within:border-primary/50 transition-colors">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-xl hover:bg-muted/40 transition-colors text-muted-foreground hover:text-primary"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,.pdf,.txt"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || "Digite algo, cole um link ou envie um arquivo..."}
          disabled={isLoading}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={(!text.trim() && !file) || isLoading}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
};

export default HubInputBar;
