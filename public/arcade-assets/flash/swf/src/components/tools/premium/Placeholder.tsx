import { Construction } from "lucide-react";

export default function Placeholder() {
  return (
    <div className="text-center py-12 space-y-3">
      <Construction className="w-12 h-12 mx-auto text-amber-500" />
      <h3 className="font-pixel text-base text-foreground">EM BREVE</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Esta ferramenta depende de uma API externa e está sendo integrada.
        Volte em breve!
      </p>
    </div>
  );
}