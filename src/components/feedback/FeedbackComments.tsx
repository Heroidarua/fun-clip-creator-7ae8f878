import { useState, useEffect } from "react";
import { Comment as CommentType } from "@/lib/community/types";
import { getComments, addComment } from "@/lib/community/services";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Send, Heart } from "lucide-react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadComments() {
      try {
        const data = await getComments(postId);
        setComments(data);
      } catch (error) {
        console.error("Erro ao carregar comentários", error);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const data = await addComment(postId, newComment);
      // Recarregar comentários para pegar os dados do perfil (ou otimizar inserindo localmente)
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch (error: any) {
      toast.error("Erro ao comentar: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Campo de Comentário */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 border border-border/50">
          <AvatarFallback className="text-[10px] font-bold">U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Textarea 
            placeholder="Escreva um comentário..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[38px] h-[38px] py-2 px-3 text-sm bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 resize-none"
          />
          <Button 
            size="icon" 
            className="h-[38px] w-[38px] shrink-0 btn-3d rounded-lg"
            disabled={submitting || !newComment.trim()}
            onClick={handleSubmit}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* Lista de Comentários */}
      <div className="space-y-4 pt-2">
        {loading ? (
          <p className="text-[10px] uppercase tracking-widest text-center text-muted-foreground animate-pulse">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-[10px] uppercase tracking-widest text-center text-muted-foreground">Nenhum comentário ainda.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="w-8 h-8 border border-border/50 shrink-0">
                <AvatarImage src={comment.profiles?.avatar_url || ""} />
                <AvatarFallback className="text-[10px] font-bold">
                  {(comment.profiles?.display_name || "U").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="bg-muted/30 rounded-2xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold">{comment.profiles?.display_name || "Usuário"}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/90">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 px-2">
                  <button className="text-[10px] font-bold uppercase tracking-tighter hover:text-primary transition-colors flex items-center gap-1">
                    <Heart size={12} /> Curtir
                  </button>
                  <button className="text-[10px] font-bold uppercase tracking-tighter hover:text-primary transition-colors">
                    Responder
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
