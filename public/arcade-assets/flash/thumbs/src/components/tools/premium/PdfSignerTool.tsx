import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Eraser, Upload } from "lucide-react";
import { toast } from "sonner";

export default function PdfSignerTool() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedSig, setTypedSig] = useState("Sua Assinatura");
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (mode !== "draw" || !sigCanvasRef.current) return;
    let active = true;
    (async () => {
      const { default: SignaturePad } = await import("signature_pad");
      if (!active || !sigCanvasRef.current) return;
      const c = sigCanvasRef.current;
      c.width = c.offsetWidth; c.height = 160;
      padRef.current = new SignaturePad(c, { penColor: "#000" });
    })();
    return () => { active = false; try { padRef.current?.off?.(); } catch {} };
  }, [mode]);

  const clear = () => padRef.current?.clear();

  const sign = async () => {
    if (!pdfFile) return toast.error("Envie um PDF.");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const target = pdf.getPage(Math.min(page, pdf.getPageCount()) - 1);

      let pngBytes: ArrayBuffer;
      if (mode === "draw") {
        if (!padRef.current || padRef.current.isEmpty()) return toast.error("Desenhe a assinatura.");
        const data = padRef.current.toDataURL("image/png");
        pngBytes = await fetch(data).then((r) => r.arrayBuffer());
      } else {
        const c = document.createElement("canvas");
        c.width = 600; c.height = 160;
        const ctx = c.getContext("2d")!;
        ctx.font = "italic 60px 'Brush Script MT', cursive";
        ctx.fillStyle = "#000";
        ctx.fillText(typedSig, 20, 100);
        pngBytes = await fetch(c.toDataURL("image/png")).then((r) => r.arrayBuffer());
      }
      const img = await pdf.embedPng(pngBytes);
      const { width } = target.getSize();
      const w = 220, h = (img.height / img.width) * w;
      target.drawImage(img, { x: width - w - 40, y: 40, width: w, height: h });

      const out = await pdf.save();
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "assinado.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF assinado!");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <label className="border-2 border-dashed border-border rounded-sm p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-primary/60">
        <Upload className="w-4 h-4" />
        <span className="text-sm">{pdfFile?.name ?? "Selecionar PDF"}</span>
        <input type="file" accept="application/pdf" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return; setPdfFile(f);
          try {
            const { PDFDocument } = await import("pdf-lib");
            const d = await PDFDocument.load(await f.arrayBuffer());
            setTotalPages(d.getPageCount());
          } catch {}
        }} />
      </label>

      <div className="flex gap-2">
        <Button size="sm" variant={mode === "draw" ? "default" : "outline"} onClick={() => setMode("draw")}>Desenhar</Button>
        <Button size="sm" variant={mode === "type" ? "default" : "outline"} onClick={() => setMode("type")}>Digitar</Button>
      </div>

      {mode === "draw" ? (
        <div className="space-y-2">
          <canvas ref={sigCanvasRef} className="w-full bg-white border border-border rounded-sm touch-none" />
          <Button size="sm" variant="outline" onClick={clear}><Eraser className="w-3 h-3 mr-1" /> Limpar</Button>
        </div>
      ) : (
        <input
          value={typedSig}
          onChange={(e) => setTypedSig(e.target.value)}
          className="w-full bg-background border border-border rounded-sm p-3"
          style={{ fontFamily: "'Brush Script MT', cursive", fontStyle: "italic", fontSize: 28 }}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <label>Página:</label>
          <input
            type="number" min={1} max={totalPages}
            value={page} onChange={(e) => setPage(Math.max(1, Math.min(totalPages, +e.target.value)))}
            className="w-20 bg-background border border-border rounded-sm p-1"
          />
          <span className="text-muted-foreground">de {totalPages}</span>
        </div>
      )}

      <Button onClick={sign} className="w-full" disabled={!pdfFile}>
        <FileDown className="w-4 h-4 mr-1" /> Assinar e baixar PDF
      </Button>
      <p className="text-xs text-muted-foreground">ⓘ A assinatura é posicionada no canto inferior direito.</p>
    </div>
  );
}