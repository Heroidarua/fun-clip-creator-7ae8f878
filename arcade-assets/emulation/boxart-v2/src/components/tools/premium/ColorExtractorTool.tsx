import { useRef, useState } from "react";
import { Upload, Copy } from "lucide-react";
import { toast } from "sonner";

type Color = { hex: string; rgb: string; hsl: string };

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export default function ColorExtractorTool() {
  const [colors, setColors] = useState<Color[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new Image();
    img.onload = () => {
      const max = 200;
      const ratio = Math.min(max / img.width, max / img.height, 1);
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);
      const buckets: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] & 0xf0, g = data[i + 1] & 0xf0, b = data[i + 2] & 0xf0;
        const key = `${r},${g},${b}`;
        buckets[key] = (buckets[key] ?? 0) + 1;
      }
      const top = Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 8);
      setColors(top.map(([k]) => {
        const [r, g, b] = k.split(",").map(Number);
        return { hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) };
      }));
    };
    img.src = url;
  };

  return (
    <div className="space-y-4">
      <div onClick={() => ref.current?.click()} className="border-2 border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary/60">
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Envie uma imagem</p>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>
      {preview && <img src={preview} className="max-h-40 mx-auto rounded-sm" alt="" />}
      {colors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => { navigator.clipboard.writeText(c.hex); toast.success("Copiado " + c.hex); }}
              className="group border border-border rounded-sm overflow-hidden hover:scale-105 transition-transform"
            >
              <div className="h-16" style={{ background: c.hex }} />
              <div className="p-2 bg-background text-left">
                <p className="font-mono text-xs font-bold">{c.hex}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{c.rgb}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{c.hsl}</p>
                <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}