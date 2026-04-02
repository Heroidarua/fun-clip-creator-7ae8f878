import { useState } from "react";
import { Trophy, Medal, Crown, Star, TrendingUp, RefreshCw, User, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeaderboard, useUserStats } from "@/hooks/useUserStats";
import { LEVEL_NAMES } from "@/hooks/useAchievements";
import ScrollReveal from "@/components/ScrollReveal";
import { toast } from "sonner";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="font-pixel text-lg text-muted-foreground">#{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-600/50';
    default:
      return 'bg-card border-border';
  }
};

const Leaderboard = () => {
  const { entries, loading, userRank, refresh } = useLeaderboard(50);
  const { user, profile, isAuthenticated, updateDisplayName, syncing, syncStats } = useUserStats();
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(profile?.display_name || '');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await syncStats();
    await refresh();
    setRefreshing(false);
    toast.success("Ranking atualizado!");
  };

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      toast.error("Nome não pode ser vazio");
      return;
    }
    if (newDisplayName.length > 20) {
      toast.error("Nome muito longo (máx. 20 caracteres)");
      return;
    }
    const success = await updateDisplayName(newDisplayName.trim());
    if (success) {
      toast.success("Nome atualizado!");
      setEditingName(false);
      refresh();
    } else {
      toast.error("Erro ao atualizar nome");
    }
  };

  return (
    <div className="bg-background font-orbitron min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <h1 className="font-pixel text-2xl md:text-3xl text-primary neon-text">
                🏆 RANKING GLOBAL
              </h1>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-muted-foreground">
              Os jogadores mais dedicados do ClipSave
            </p>
          </div>
        </ScrollReveal>

        {/* User Card */}
        <ScrollReveal delay={0.1}>
          {isAuthenticated ? (
            <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center overflow-hidden border-2 border-primary/50">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          placeholder="Seu nome"
                          className="w-40"
                          maxLength={20}
                        />
                        <Button size="sm" onClick={handleSaveName}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancelar</Button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-pixel text-lg text-foreground">
                          {profile?.display_name || 'Jogador'}
                        </h3>
                        <button
                          onClick={() => {
                            setNewDisplayName(profile?.display_name || '');
                            setEditingName(true);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Editar nome
                        </button>
                      </>
                    )}
                    {userRank && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Posição: <span className="text-primary font-bold">#{userRank.rank}</span>
                        {' • '}
                        Nível {userRank.level} ({LEVEL_NAMES[userRank.level - 1]})
                        {' • '}
                        {userRank.total_xp.toLocaleString()} XP
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing || syncing}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing || syncing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/30 text-center">
              <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-pixel text-lg text-foreground mb-2">
                Entre para aparecer no ranking!
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Faça login para sincronizar suas estatísticas e competir
              </p>
              <Link to="/auth">
                <Button className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Fazer Login
                </Button>
              </Link>
            </div>
          )}
        </ScrollReveal>

        {/* Leaderboard Table */}
        <ScrollReveal delay={0.2}>
          <div className="rounded-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-primary/10 p-4 border-b border-border">
              <div className="grid grid-cols-12 gap-2 text-xs font-pixel text-muted-foreground">
                <div className="col-span-2 text-center">RANK</div>
                <div className="col-span-4">JOGADOR</div>
                <div className="col-span-2 text-center">NÍVEL</div>
                <div className="col-span-2 text-center hidden sm:block">🏆</div>
                <div className="col-span-2 sm:col-span-2 text-right">XP</div>
              </div>
            </div>

            {/* Body */}
            <div className="divide-y divide-border">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Carregando ranking...
                </div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-pixel">Nenhum jogador ainda</p>
                  <p className="text-sm mt-2">Seja o primeiro a entrar no ranking!</p>
                </div>
              ) : (
                entries.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`p-4 transition-all ${getRankBg(entry.rank)} ${
                      entry.isCurrentUser ? 'ring-2 ring-primary ring-inset' : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-2 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {entry.avatar_url ? (
                              <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className={`font-medium truncate ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                            {entry.display_name}
                          </span>
                          {entry.isCurrentUser && (
                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                              VOCÊ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <div className="font-pixel text-sm text-foreground">
                          {entry.level}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          {LEVEL_NAMES[entry.level - 1]}
                        </div>
                      </div>
                      <div className="col-span-2 text-center hidden sm:block">
                        <span className="text-sm text-foreground">{entry.achievements_unlocked}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="font-pixel text-sm text-foreground">
                            {entry.total_xp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Legend */}
        <ScrollReveal delay={0.3}>
          <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="font-pixel text-sm text-primary mb-3">COMO GANHAR XP</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Desbloquear conquistas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                <span>Usar ferramentas</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-500" />
                <span>Baixar vídeos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500" />
                <span>Jogar jogos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-pink-500" />
                <span>Ler quadrinhos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span>Visitar diariamente</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
      
      <Footer />
    </div>
  );
};

export default Leaderboard;
