import { useState, useRef } from 'react';
import { Camera, User, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove?: () => Promise<boolean>;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const AvatarUpload = ({ currentAvatarUrl, onUpload, onRemove, size = 'lg' }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      await onUpload(file);
      toast.success('Foto de perfil atualizada!');
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    
    setUploading(true);
    try {
      const success = await onRemove();
      if (success) {
        setPreviewUrl(null);
        toast.success('Foto de perfil removida!');
      } else {
        toast.error('Erro ao remover foto');
      }
    } catch (error) {
      toast.error('Erro ao remover foto');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={uploading}>
          <button
            className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-4 border-primary/50 hover:border-primary transition-all bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center cursor-pointer group-hover:scale-105`}
          >
            {uploading ? (
              <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
            ) : displayUrl ? (
              <img
                src={displayUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className={`${iconSizes[size]} text-white`} />
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center">
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Camera className="w-4 h-4 mr-2" />
            {displayUrl ? 'Alterar foto' : 'Adicionar foto'}
          </DropdownMenuItem>
          {displayUrl && onRemove && (
            <DropdownMenuItem onClick={handleRemove} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remover foto
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1.5 border-2 border-background">
        <Camera className="w-3 h-3 text-primary-foreground" />
      </div>
    </div>
  );
};

export default AvatarUpload;
