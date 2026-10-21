import { useState, useRef } from "react";
import { FileImage, Download, X, Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageToPdfConverterProps {
  onSuccess?: () => void;
}

const ImageToPdfConverter = ({ onSuccess }: ImageToPdfConverterProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith("image/"));
    
    if (validFiles.length === 0) {
      toast({ title: "Selecione apenas arquivos de imagem", variant: "destructive" });
      return;
    }

    const newImages: ImageFile[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);
    if (e.target) e.target.value = "";
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast({ title: "Adicione pelo menos uma imagem", variant: "destructive" });
      return;
    }

    setIsConverting(true);

    try {
      // Load images into canvas and build PDF manually using jsPDF-like approach with canvas
      const loadImage = (file: File): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      };

      // We'll create a simple PDF using canvas-based approach
      // Each image becomes a page at A4 size (595.28 x 841.89 points)
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;
      const SCALE = 2; // For quality

      const canvasPages: string[] = [];

      for (const imageFile of images) {
        const img = await loadImage(imageFile.file);
        
        const canvas = document.createElement("canvas");
        canvas.width = A4_WIDTH * SCALE;
        canvas.height = A4_HEIGHT * SCALE;
        const ctx = canvas.getContext("2d")!;
        
        // White background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fit image within page with margins
        const margin = 20 * SCALE;
        const maxW = canvas.width - margin * 2;
        const maxH = canvas.height - margin * 2;
        
        let drawW = img.width;
        let drawH = img.height;
        
        const ratio = Math.min(maxW / drawW, maxH / drawH);
        drawW *= ratio;
        drawH *= ratio;
        
        const x = (canvas.width - drawW) / 2;
        const y = (canvas.height - drawH) / 2;
        
        ctx.drawImage(img, x, y, drawW, drawH);
        URL.revokeObjectURL(img.src);
        
        canvasPages.push(canvas.toDataURL("image/jpeg", 0.92));
      }

      // Build PDF binary manually (minimal PDF spec)
      const pdfBytes = buildPdf(canvasPages, A4_WIDTH, A4_HEIGHT);
      
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `imagens_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: "PDF criado com sucesso! 🎉" });
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao converter imagens", variant: "destructive" });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop zone / Add button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
      >
        <Plus className="w-8 h-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground font-medium">
          Clique para adicionar imagens
        </span>
        <span className="text-xs text-muted-foreground/60">
          JPG, PNG, WEBP — múltiplas imagens permitidas
        </span>
      </button>

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {images.length} {images.length === 1 ? "imagem" : "imagens"} — arraste para reordenar
            </span>
            <button onClick={clearAll} className="text-xs text-destructive hover:underline">
              Limpar tudo
            </button>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center gap-2 bg-card/50 border border-border/50 rounded-md p-2"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                  >
                    <GripVertical className="w-3 h-3 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                  >
                    <GripVertical className="w-3 h-3" />
                  </button>
                </div>
                <img
                  src={img.preview}
                  alt=""
                  className="w-10 h-10 object-cover rounded border border-border"
                />
                <span className="text-xs text-foreground truncate flex-1">
                  {img.file.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(img.file.size / 1024).toFixed(0)}KB
                </span>
                <button
                  onClick={() => removeImage(img.id)}
                  className="text-muted-foreground hover:text-destructive p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Convert button */}
      {images.length > 0 && (
        <Button
          onClick={convertToPdf}
          disabled={isConverting}
          className="w-full gap-2"
        >
          {isConverting ? (
            <>Convertendo...</>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Converter para PDF
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// Minimal PDF builder from JPEG data URLs
function buildPdf(pages: string[], pageW: number, pageH: number): Uint8Array {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;

  const write = (s: string) => {
    const bytes = encoder.encode(s);
    parts.push(bytes);
    pos += bytes.length;
  };

  const writeBin = (b: Uint8Array) => {
    parts.push(b);
    pos += b.length;
  };

  const markObj = () => { offsets.push(pos); };

  // Decode base64 JPEG data
  const decodeDataUrl = (dataUrl: string): Uint8Array => {
    const base64 = dataUrl.split(",")[1];
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  };

  // Get JPEG dimensions
  const getJpegDimensions = (data: Uint8Array): { w: number; h: number } => {
    let i = 0;
    while (i < data.length - 1) {
      if (data[i] === 0xFF) {
        const marker = data[i + 1];
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          const h = (data[i + 5] << 8) | data[i + 6];
          const w = (data[i + 7] << 8) | data[i + 8];
          return { w, h };
        }
        if (marker === 0xD8 || marker === 0xD9) {
          i += 2;
        } else {
          const len = (data[i + 2] << 8) | data[i + 3];
          i += 2 + len;
        }
      } else {
        i++;
      }
    }
    return { w: 595, h: 842 };
  };

  const imageData = pages.map(p => decodeDataUrl(p));
  const imageDims = imageData.map(d => getJpegDimensions(d));

  // Object numbering: 
  // 1: Catalog, 2: Pages, then for each page: pageObj, imageObj (stream)
  const numPages = pages.length;
  const totalObjects = 2 + numPages * 2;

  write("%PDF-1.4\n");

  // Obj 1: Catalog
  markObj();
  write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages
  markObj();
  const kids = Array.from({ length: numPages }, (_, i) => `${3 + i * 2} 0 R`).join(" ");
  write(`2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${numPages} >>\nendobj\n`);

  // Pages and images
  for (let i = 0; i < numPages; i++) {
    const pageObjNum = 3 + i * 2;
    const imgObjNum = 4 + i * 2;
    const data = imageData[i];
    const dims = imageDims[i];

    // Fit image to page
    const ratio = Math.min(pageW / dims.w, pageH / dims.h);
    const drawW = dims.w * ratio;
    const drawH = dims.h * ratio;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    const contentStr = `q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Img0 Do Q`;
    const contentBytes = encoder.encode(contentStr);

    // We need a content stream object too — let's inline it
    // Actually we need 3 objs per page: page, content stream, image
    // Let me restructure...
    
    // For simplicity, embed content as inline stream in page resources
    // Actually let's just use a simpler approach with additional objects
  }

  // Reset and rebuild with correct object count
  parts.length = 0;
  offsets.length = 0;
  pos = 0;

  // Each page needs: page obj, content stream obj, image XObject
  // Total: 2 + numPages * 3
  write("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  // Obj 1: Catalog
  markObj();
  write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  // Obj 2: Pages
  markObj();
  const pageRefs = Array.from({ length: numPages }, (_, i) => `${3 + i * 3} 0 R`).join(" ");
  write(`2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${numPages} >>\nendobj\n`);

  for (let i = 0; i < numPages; i++) {
    const pageObj = 3 + i * 3;
    const contentObj = 4 + i * 3;
    const imgObj = 5 + i * 3;
    const data = imageData[i];
    const dims = imageDims[i];

    const ratio = Math.min(pageW / dims.w, pageH / dims.h);
    const drawW = dims.w * ratio;
    const drawH = dims.h * ratio;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    const contentStr = `q ${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Img0 Do Q`;
    const contentBytes = encoder.encode(contentStr);

    // Page object
    markObj();
    write(`${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${contentObj} 0 R /Resources << /XObject << /Img0 ${imgObj} 0 R >> >> >>\nendobj\n`);

    // Content stream
    markObj();
    write(`${contentObj} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
    writeBin(contentBytes);
    write("\nendstream\nendobj\n");

    // Image XObject
    markObj();
    write(`${imgObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${dims.w} /Height ${dims.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`);
    writeBin(data);
    write("\nendstream\nendobj\n");
  }

  // XRef
  const xrefPos = pos;
  const totalObjs = 2 + numPages * 3;
  write(`xref\n0 ${totalObjs + 1}\n`);
  write("0000000000 65535 f \n");
  for (const off of offsets) {
    write(String(off).padStart(10, "0") + " 00000 n \n");
  }

  write(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\n`);
  write(`startxref\n${xrefPos}\n%%EOF\n`);

  // Combine
  const totalLen = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

export default ImageToPdfConverter;
