import { createFileRoute } from "@tanstack/react-router";
import { getProfileByUsername, getPosts } from "@/lib/community/services";
import { useState, useEffect } from "react";
import { Profile, Post } from "@/lib/community/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/community/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Link as LinkIcon, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/feedback/@$username")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // No contexto atual, usamos display_name como username (@nome)
        const p = await getProfileByUsername(username);
        if (p) {
          setProfile(p);
          const userPosts = await getPosts({ userId: p.user_id });
          setPosts(userPosts);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-4xl font-display mb-4">Usuário não encontrado</h1>
        <p className="text-muted-foreground">O perfil @{username} não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header do Perfil */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mb-6">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-6 gap-4">
            <Avatar className="w-24 h-24 border-4 border-card shadow-xl shrink-0">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                {(profile.display_name || "U").substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
               <Button className="btn-3d rounded-lg font-bold gap-2">
                 Seguir
               </Button>
               <Button variant="outline" className="rounded-lg font-bold gap-2">
                 <Edit3 size={16} /> Editar Perfil
               </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-display">{profile.display_name}</h1>
              <p className="text-sm text-muted-foreground">@{username}</p>
            </div>

            {profile.bio && (
              <p className="text-sm leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-muted-foreground uppercase tracking-widest font-bold">
               <div className="flex items-center gap-1.5">
                 <Calendar size={14} /> Entrou em {new Date(profile.created_at).toLocaleDateString('pt-BR')}
               </div>
               <div className="flex items-center gap-1.5">
                 <MapPin size={14} /> Brasil
               </div>
            </div>

            <div className="flex gap-6 pt-2">
               <div className="flex gap-1.5 items-baseline">
                 <span className="font-display text-lg">0</span>
                 <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Seguidores</span>
               </div>
               <div className="flex gap-1.5 items-baseline">
                 <span className="font-display text-lg">0</span>
                 <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Seguindo</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed do Usuário */}
      <div className="space-y-6">
        <h2 className="font-display text-xl border-b border-border pb-2">Publicações</h2>
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Este usuário ainda não fez nenhuma publicação.</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
