import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, RefreshCw, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PasswordGeneratorProps {
  onSuccess?: () => void;
}

const PasswordGenerator = ({ onSuccess }: PasswordGeneratorProps) => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  const generatePassword = () => {
    let charset = "";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma opção de caracteres",
        variant: "destructive",
      });
      return;
    }

    let newPassword = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    onSuccess?.();
  };

  const calculateStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "Nenhuma", color: "bg-muted" };

    let score = 0;
    
    // Length scoring
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;
    if (pwd.length >= 20) score += 1;

    // Character variety
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 2;

    // Determine strength level
    if (score <= 2) return { score: 20, label: "Muito Fraca", color: "bg-red-500" };
    if (score <= 4) return { score: 40, label: "Fraca", color: "bg-orange-500" };
    if (score <= 6) return { score: 60, label: "Média", color: "bg-yellow-500" };
    if (score <= 8) return { score: 80, label: "Forte", color: "bg-lime-500" };
    return { score: 100, label: "Muito Forte", color: "bg-green-500" };
  };

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password]);

  useEffect(() => {
    generatePassword();
  }, []);

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: "Copiado!",
        description: "Senha copiada para a área de transferência",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a senha",
        variant: "destructive",
      });
    }
  };

  const getStrengthIcon = () => {
    if (strength.score <= 40) return <ShieldAlert className="w-5 h-5 text-red-500" />;
    if (strength.score <= 60) return <Shield className="w-5 h-5 text-yellow-500" />;
    return <ShieldCheck className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Security Message */}
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-sm border border-primary/30">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">Evite ser hackeado!</span> Utilize nossa ferramenta e fique seguro.
        </p>
      </div>

      {/* Password Display */}
      <div className="relative">
        <Input
          value={password}
          readOnly
          className="pr-20 font-mono text-sm bg-background/50 border-primary/30"
          placeholder="Sua senha aparecerá aqui"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={generatePassword}
            title="Gerar nova senha"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={copyToClipboard}
            title="Copiar senha"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            {getStrengthIcon()}
            Força da senha
          </span>
          <span className="font-medium">{strength.label}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* Length Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Comprimento</Label>
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{length}</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={(value) => setLength(value[0])}
          min={6}
          max={32}
          step={1}
          className="py-2"
        />
      </div>

      {/* Character Options */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox
            checked={includeUppercase}
            onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
          />
          <span>Maiúsculas (A-Z)</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox
            checked={includeLowercase}
            onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
          />
          <span>Minúsculas (a-z)</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox
            checked={includeNumbers}
            onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
          />
          <span>Números (0-9)</span>
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Checkbox
            checked={includeSymbols}
            onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
          />
          <span>Símbolos (!@#$)</span>
        </label>
      </div>

      {/* Generate Button */}
      <Button
        onClick={generatePassword}
        className="w-full"
        style={{ backgroundColor: 'hsl(140, 100%, 40%)', color: 'white' }}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Gerar Nova Senha
      </Button>
    </div>
  );
};

export default PasswordGenerator;
