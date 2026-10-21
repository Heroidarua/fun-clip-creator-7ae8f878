import { useState, useRef } from "react";
import { Camera, X, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BannerUploadProps {
  currentBannerUrl: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove: () => Promise<boolean>;
  className?: string;
}

const BannerUpload = ({ currentBannerUrl, onUpload, onRemove, className }: BannerUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      await onRemove();
    } catch (error) {
      console.error('Remove failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full h-32 md:h-48 rounded-lg overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 border border-border",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {currentBannerUrl ? (
        <>
          <img
            src={currentBannerUrl}
            alt="Banner do perfil"
            className="w-full h-full object-cover"
          />
          {/* Overlay on hover */}
          <div 
            className={cn(
              "absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity duration-200",
              isHovering ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Alterar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isUploading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Remover
            </Button>
          </div>
        </>
      ) : (
        <div 
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Clique para adicionar um banner</p>
          <p className="text-xs text-muted-foreground mt-1">Máximo 5MB • JPG, PNG, WebP</p>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default BannerUpload;
