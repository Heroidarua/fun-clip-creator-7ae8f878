import { Feedback } from "@/lib/feedback/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toggleLike } from "@/lib/feedback/services";
import FeedbackComments from "./FeedbackComments";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

interface FeedbackCardProps { feedback: Feedback; 
  feedback: Feedback;
}

const FeedbackCard = ({ feedback }: FeedbackCardProps) => {
  const [likes, setLikes] = useState(feedback.likes_count);
  const [isLiked, setIsLiked] = useState(feedback.user_has_liked || false);
  const [showComments, setShowComments] = useState(false);
  
  const authorName = feedback.profiles?.display_name || "Usuário";
  const avatarUrl = feedback.profiles?.avatar_url || "";
  const timeAgo = formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR });

  const handleLike = async () => {
    try {
      await toggleLike(feedback.id, isLiked);
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error: any) {
      toast.error("Erro ao curtir: " + error.message);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/feedback/feedback/${feedback.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header do Feedback */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/feedback/@$username" params={{ username: authorName }} className="shrink-0">
              <Avatar className="w-10 h-10 border border-border/50">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {authorName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link to="/feedback/@$username" params={{ username: authorName }} className="font-bold text-sm hover:underline">
                  {authorName}
                </Link>
                {feedback.community_categories && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                    {feedback.community_categories.icon} {feedback.community_categories.name}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{timeAgo}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal size={18} />
          </Button>
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {feedback.content}
          </p>
          
          {feedback.image_url && (
            <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/10">
              <img 
                src={feedback.image_url} 
                alt="Feedback content" 
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${isLiked ? "text-red-500" : "hover:text-red-500"}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isLiked ? "bg-red-500/10" : "group-hover:bg-red-500/10"}`}>
                <Heart size={20} className={isLiked ? "fill-red-500" : ""} />
              </div>
              <span className="text-xs font-bold">{likes}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 group transition-colors ${showComments ? "text-primary" : "hover:text-primary"}`}
            >
              <div className={`p-2 rounded-full transition-colors ${showComments ? "bg-primary/10" : "group-hover:bg-primary/10"}`}>
                <MessageCircle size={20} />
              </div>
              <span className="text-xs font-bold">{feedback.comments_count}</span>
            </button>
          </div>

          <button 
            onClick={handleCopyLink}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title="Compartilhar"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Seção de Comentários Condicional */}
        {showComments && <FeedbackComments feedbackId={feedback.id} />}
      </div>
    </article>
  );
};

export default FeedbackCard;
