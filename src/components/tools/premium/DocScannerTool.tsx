import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function DocScannerTool() {
  const [src, setSrc] = useState<string | null>(null);
  const [contrast, setContrast] = useState(120);
  const [bw, setBw] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const render = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    const c = canvasRef.current;
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.filter = `contrast(${contrast}%) ${bw ? "grayscale(1) brightness(110%)" : ""}`;
    ctx.drawImage(img, 0, 0);
  };

  const reload = () => {
    if (!src) return;
    const i = new Image();
    i.onload = () => render(i);
    i.src = src;
  };

  const load = (file: File) => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => render(img);
    img.src = url;
  };

  const exportPdf = async () => {
    if (!canvasRef.current) return;
    try {
      const { PDFDocument } = await import("pdf-lib");
      const png = canvasRef.current.toDataURL("image/png");
      const bytes = await fetch(png).then((r) => r.arrayBuffer());
      const pdf = await PDFDocument.create();
      const image = await pdf.embedPng(bytes);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      const out = await pdf.save();
      const blob = new Blob([out], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "documento.pdf"; a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary/60">
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Envie uma foto do documento</p>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
      </div>
      {src && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Contraste: {contrast}%</label>
            <Slider value={[contrast]} min={50} max={250} step={5} onValueChange={(v) => setContrast(v[0])} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={bw} onChange={(e) => setBw(e.target.checked)} />
              Preto e branco
            </label>
            <Button size="sm" onClick={reload}>Aplicar</Button>
          </div>
          <canvas ref={canvasRef} className="max-w-full border border-border rounded-sm" />
          <Button onClick={exportPdf} className="w-full"><FileDown className="w-4 h-4 mr-1" /> Exportar PDF</Button>
        </>
      )}
    </div>
  );
}