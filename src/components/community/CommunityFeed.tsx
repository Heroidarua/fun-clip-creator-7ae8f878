import { useState, useEffect } from "react";
import { Post } from "@/lib/community/types";
import { getPosts } from "@/lib/community/services";
import PostCard from "./PostCard";
import CreatePostCard from "./CreatePostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@tanstack/react-router";

const CommunityFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const search = useSearch({ from: "/comunidade/" }) as any;
  const currentFilter = search.filter || "recent";

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        // No futuro, passar o filtro para o serviço
        const data = await getPosts();
        
        // Simulação básica de filtros no cliente por enquanto
        let filtered = [...data];
        if (currentFilter === "trending") {
          filtered.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));
        }
        
        setPosts(filtered);
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [currentFilter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePostCard onPostCreated={(newPost) => setPosts([newPost as unknown as Post, ...posts])} />
      
      <div className="flex items-center justify-between border-b border-border pb-2">
         <h2 className="font-display text-xl">Últimas Publicações</h2>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <button 
            className={`${currentFilter === "recent" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"} pb-1 transition-colors`}
          >
            Recentes
          </button>
          <button 
            className={`${currentFilter === "trending" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"} pb-1 transition-colors`}
          >
            Populares
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Nenhuma publicação encontrada. Seja o primeiro a postar!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
