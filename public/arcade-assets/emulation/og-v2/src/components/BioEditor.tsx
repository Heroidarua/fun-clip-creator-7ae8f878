import { useState } from "react";
import { Pencil, Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BioEditorProps {
  bio: string | null;
  onSave: (bio: string) => Promise<boolean>;
  maxLength?: number;
  className?: string;
}

const BioEditor = ({ bio, onSave, maxLength = 200, className }: BioEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(bio || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEditing = () => {
    setNewBio(bio || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(newBio.trim());
    setIsSaving(false);
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewBio(bio || "");
  };

  const charCount = newBio.length;
  const isOverLimit = charCount > maxLength;

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-pixel text-sm text-foreground">Sobre Mim</h3>
        </div>
        
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleStartEditing}
            className="gap-2 h-8"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            placeholder="Escreva uma breve descrição sobre você..."
            className="min-h-[100px] resize-none"
            maxLength={maxLength + 50}
          />
          
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs",
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            )}>
              {charCount}/{maxLength} caracteres
            </span>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || isOverLimit}
              >
                <Check className="w-4 h-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {bio ? (
            <p className="whitespace-pre-wrap">{bio}</p>
          ) : (
            <p className="italic">Nenhuma bio adicionada. Clique em "Editar" para adicionar.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BioEditor;
