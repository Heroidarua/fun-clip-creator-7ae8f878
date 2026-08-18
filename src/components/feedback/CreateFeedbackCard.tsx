import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createFeedback } from "@/lib/feedback/services";
import { toast } from "sonner";
import { useUserStats } from "@/hooks/useUserStats";

interface CreateFeedbackCardProps {
  onFeedbackCreated?: (feedback: any) => void;
}

const CreateFeedbackCard = ({ onFeedbackCreated }: CreateFeedbackCardProps) => {
  const { profile } = useUserStats();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande! Limite de 5MB.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsExpanded(true);
    }
  };

  const handlePublish = async () => {
    if (!content.trim() && !selectedImage) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para publicar!");
        setLoading(false);
        return;
      }

      let imageUrl = "";
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `feedbacks/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('community')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('community')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      const newFeedback = await createFeedback(content, imageUrl);
      
      toast.success("Publicado com sucesso!");
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      
      if (onFeedbackCreated) {
        // Recarregar o feedback com os dados do perfil
        const { data: enrichedFeedback } = await supabase
          .from('community_feedbacks')
          .select(`
            *,
            profiles:user_id (avatar_url, display_name, id),
            community_categories:category_id (name, slug, icon)
          `)
          .eq('id', (newFeedback as any).id)
          .single();
          
        onFeedbackCreated(enrichedFeedback);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao publicar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-card border border-border rounded-xl shadow-sm transition-all duration-300 ${isExpanded ? 'p-4' : 'p-3'}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 border border-border/50 shrink-0">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {(profile?.display_name || "U").substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea 
            placeholder="Dê sua sugestão ou feedback sobre o site..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="min-h-[44px] bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none py-2 px-3 text-sm"
          />

          {imagePreview && (
            <div className="relative rounded-lg overflow-hidden border border-border max-w-xs group">
              <img src={imagePreview} alt="Preview" className="w-full h-auto" />
              <button 
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:bg-background transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {isExpanded && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  id="image-upload" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageSelect}
                />
                <label 
                  htmlFor="image-upload"
                  className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                >
                  <Image size={20} />
                </label>
              </div>

              <div className="flex gap-2">
                 {content || imagePreview ? (
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => { setIsExpanded(false); setContent(""); setSelectedImage(null); setImagePreview(null); }}
                     className="text-xs uppercase tracking-widest font-bold"
                   >
                     Cancelar
                   </Button>
                 ) : null}
                 <Button 
                   size="sm" 
                   onClick={handlePublish}
                   disabled={loading || (!content.trim() && !selectedImage)}
                   className="gap-2 btn-3d rounded-lg"
                 >
                   {loading ? "Publicando..." : "Publicar"}
                   <Send size={16} />
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateFeedbackCard;
