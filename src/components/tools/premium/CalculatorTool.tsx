import { useState } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CalculatorTool() {
  const [val, setVal] = useState("");
  const [res, setRes] = useState<string | null>(null);

  const calc = () => {
    try {
      // Basic math sanitizer
      const sanitized = val.replace(/[^-+*/%0-9.()]/g, "");
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      setRes(Number(result).toLocaleString("pt-BR", { maximumFractionDigits: 4 }));
    } catch {
      setRes("Erro");
    }
  };

  const add = (c: string) => setVal(v => v + c);
  const clear = () => { setVal(""); setRes(null); };

  return (
    <div className="space-y-4 p-2 bg-card/50 rounded-sm border border-border/50">
      <div className="bg-background border-2 border-foreground/10 rounded-sm p-3 text-right">
        <div className="text-[10px] text-muted-foreground h-4 font-mono">{val || "0"}</div>
        <div className="text-xl font-pixel text-primary truncate">{res ?? "0"}</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["7", "8", "9", "/"].map(c => (
          <Button key={c} variant="outline" onClick={() => add(c)} className="font-pixel">{c}</Button>
        ))}
        {["4", "5", "6", "*"].map(c => (
          <Button key={c} variant="outline" onClick={() => add(c)} className="font-pixel">{c}</Button>
        ))}
        {["1", "2", "3", "-"].map(c => (
          <Button key={c} variant="outline" onClick={() => add(c)} className="font-pixel">{c}</Button>
        ))}
        {["0", ".", "=", "+"].map(c => (
          <Button 
            key={c} 
            variant={c === "=" ? "default" : "outline"} 
            onClick={c === "=" ? calc : () => add(c)} 
            className="font-pixel"
          >
            {c}
          </Button>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={clear} className="w-full text-[10px] font-pixel">
        <RotateCcw className="w-3 h-3 mr-1" /> LIMPAR
      </Button>

      <div className="space-y-4 mt-6 border-t border-border/50 pt-4">
        <h4 className="font-pixel text-[10px] text-muted-foreground uppercase">Cálculo de Juros Compostos</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] font-pixel">Capital (R$)</Label>
            <Input type="number" placeholder="1000" className="h-8 text-xs" id="cap" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-pixel">Taxa (% AM)</Label>
            <Input type="number" placeholder="1" className="h-8 text-xs" id="tax" />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] font-pixel">Tempo (Meses)</Label>
            <Input type="number" placeholder="12" className="h-8 text-xs" id="tem" />
          </div>
          <div className="flex items-end">
            <Button className="w-full h-8 text-[9px] font-pixel" onClick={() => {
              const c = parseFloat((document.getElementById('cap') as HTMLInputElement).value);
              const i = parseFloat((document.getElementById('tax') as HTMLInputElement).value) / 100;
              const t = parseFloat((document.getElementById('tem') as HTMLInputElement).value);
              if (!isNaN(c) && !isNaN(i) && !isNaN(t)) {
                const m = c * Math.pow(1 + i, t);
                setRes(m.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
              }
            }}>CALCULAR JUROS</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
