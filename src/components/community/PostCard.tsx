import { Post } from "@/lib/community/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const authorName = post.profiles?.display_name || "Usuário";
  const avatarUrl = post.profiles?.avatar_url || "";
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR });

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header do Post */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border/50">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {authorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm hover:underline cursor-pointer">{authorName}</span>
                {post.community_categories && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                    {post.community_categories.icon} {post.community_categories.name}
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
            {post.content}
          </p>
          
          {post.image_url && (
            <div className="rounded-lg overflow-hidden border border-border/50">
              <img 
                src={post.image_url} 
                alt="Post content" 
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 group transition-colors hover:text-red-500">
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart size={20} className={post.user_has_liked ? "fill-red-500 text-red-500" : ""} />
              </div>
              <span className="text-xs font-bold">{post.likes_count}</span>
            </button>
            
            <button className="flex items-center gap-2 group transition-colors hover:text-primary">
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageCircle size={20} />
              </div>
              <span className="text-xs font-bold">{post.comments_count}</span>
            </button>
          </div>

          <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
