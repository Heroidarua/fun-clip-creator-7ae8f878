import { createFileRoute, Link } from "@tanstack/react-router";
import CommunityFeed from "@/components/community/CommunityFeed";

export const Route = createFileRoute("/comunidade/")({
  component: CommunityIndex,
});

function CommunityIndex() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Esquerda (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 space-y-6">
        <nav className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <ul className="space-y-2">
            <li>
              <Link to="/comunidade" className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 text-primary font-bold">
                <span className="text-xl">🏠</span> Início
              </Link>
            </li>
            <li>
              <Link to="/comunidade" search={{ filter: 'trending' }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <span className="text-xl">🔥</span> Em alta
              </Link>
            </li>
            <li>
              <Link to="/comunidade" search={{ filter: 'following' }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                <span className="text-xl">👥</span> Seguindo
              </Link>
            </li>
          </ul>
        </nav>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="font-display text-sm uppercase tracking-wider mb-4 text-muted-foreground">Categorias</h3>
          <ul className="space-y-1">
            {/* Aqui virão as categorias dinâmicas */}
            <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">💬 Geral</li>
            <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">🎮 Games</li>
            <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">🤖 Tecnologia</li>
            <li className="p-2 text-sm hover:text-primary cursor-pointer transition-colors">🧠 IA</li>
          </ul>
        </div>
      </aside>

      {/* Feed Principal */}
      <main className="col-span-1 lg:col-span-6 space-y-6">
        <CommunityFeed />
      </main>

      {/* Sidebar Direita (Desktop) */}
      <aside className="hidden lg:block lg:col-span-3 space-y-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm bg-gradient-to-br from-card to-primary/5">
          <h3 className="font-display text-lg mb-2">Bem-vindo!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este é o espaço oficial para você interagir com outros membros da comunidade SOS01.
          </p>
          <Link to="/comunidade/regras" className="w-full mt-4 btn-3d py-2 rounded-lg text-sm font-bold flex items-center justify-center">
            CONHECER REGRAS
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <h3 className="font-display text-sm uppercase tracking-wider mb-4 text-muted-foreground">Usuários em destaque</h3>
          <div className="space-y-4">
             {/* Mock de usuários */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30" />
                   <span className="text-sm font-medium">@admin</span>
                </div>
                <button className="text-xs text-primary font-bold hover:underline">Seguir</button>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
