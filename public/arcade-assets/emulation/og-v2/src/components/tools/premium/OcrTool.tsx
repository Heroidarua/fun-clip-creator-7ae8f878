import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Copy, FileDown, Loader2 } from "lucide-react";

export default function OcrTool() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type === "application/pdf") {
      toast.error("Para PDFs, exporte como imagem primeiro.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setProgress(0);
    setText("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(["por", "eng"], 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      setText(data.text.trim());
      await worker.terminate();
      toast.success("Texto extraído!");
    } catch (e: any) {
      toast.error("Erro: " + (e?.message ?? "falha no OCR"));
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const download = (ext: "txt" | "doc") => {
    const blob = new Blob([text], {
      type: ext === "txt" ? "text/plain" : "application/msword",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `texto-ocr.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-sm p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Clique ou arraste uma imagem (PNG, JPG, WEBP)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {preview && (
        <img src={preview} alt="" className="max-h-48 mx-auto rounded-sm border border-border" />
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Reconhecendo... {progress}%
        </div>
      )}

      {text && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full bg-background/50 border border-border/50 rounded-sm p-3 text-sm font-mono"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copiado!"); }}>
              <Copy className="w-4 h-4 mr-1" /> Copiar
            </Button>
            <Button size="sm" variant="outline" onClick={() => download("txt")}>
              <FileDown className="w-4 h-4 mr-1" /> Baixar TXT
            </Button>
            <Button size="sm" variant="outline" onClick={() => download("doc")}>
              <FileDown className="w-4 h-4 mr-1" /> Baixar DOC
            </Button>
          </div>
        </>
      )}
    </div>
  );
}