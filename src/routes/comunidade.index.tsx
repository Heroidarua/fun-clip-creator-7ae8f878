import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import CommunityFeed from "@/components/community/CommunityFeed";
import { getCategories } from "@/lib/community/services";
import { Category } from "@/lib/community/types";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/comunidade/")({
  component: CommunityIndex,
});

function CommunityIndex() {
  const [categories, setCategories] = useState<Category[]>([]);
  const search = useSearch({ from: "/comunidade/" }) as any;
  const currentCategory = search.category;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* Sidebar Esquerda (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 space-y-6">
        <nav className="bg-card border border-border rounded-xl p-4 shadow-sm sticky top-24">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/comunidade" 
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors font-bold ${
                  !search.filter && !currentCategory ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">🏠</span> Início
              </Link>
            </li>
            <li>
              <Link 
                to="/comunidade" 
                search={{ filter: 'trending' }} 
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  search.filter === 'trending' ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">🔥</span> Em alta
              </Link>
            </li>
            <li>
              <Link 
                to="/comunidade" 
                search={{ filter: 'following' }} 
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  search.filter === 'following' ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">👥</span> Seguindo
              </Link>
            </li>
          </ul>

          <div className="mt-8">
            <h3 className="font-display text-[10px] uppercase tracking-widest mb-4 px-2 text-muted-foreground font-bold">Categorias</h3>
            <ul className="space-y-1">
              {categories.length > 0 ? (
                categories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to="/comunidade" 
                      search={{ category: cat.slug }}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                        currentCategory === cat.slug ? "bg-primary/5 text-primary font-bold" : "hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      <span>{cat.icon || "💬"}</span>
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">💬 Geral</li>
                  <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">🎮 Games</li>
                  <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">🤖 Tecnologia</li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Feed Principal */}
      <main className="col-span-1 lg:col-span-6 space-y-6">
        <CommunityFeed />
      </main>

      {/* Sidebar Direita (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 space-y-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm bg-gradient-to-br from-card to-primary/5 sticky top-24">
          <h3 className="font-display text-lg mb-2">Comunidade SOS01</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seu espaço para compartilhar ideias, tirar dúvidas e interagir com outros membros.
          </p>
          <div className="mt-4 space-y-2">
            <Link to="/comunidade/regras" className="w-full btn-3d py-2 rounded-lg text-xs font-bold flex items-center justify-center uppercase tracking-widest">
              Regras da Casa
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/50">
             <h3 className="font-display text-[10px] uppercase tracking-widest mb-4 text-muted-foreground font-bold">Trending Topics</h3>
             <div className="space-y-3">
                <div className="cursor-pointer group">
                   <p className="text-[10px] text-muted-foreground font-bold uppercase">Em alta em SOS01</p>
                   <p className="text-sm font-bold group-hover:text-primary transition-colors">#MelhoresFerramentas</p>
                   <p className="text-[10px] text-muted-foreground">1.2k publicações</p>
                </div>
                <div className="cursor-pointer group">
                   <p className="text-[10px] text-muted-foreground font-bold uppercase">Games</p>
                   <p className="text-sm font-bold group-hover:text-primary transition-colors">#JogosRetro</p>
                   <p className="text-[10px] text-muted-foreground">850 publicações</p>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
