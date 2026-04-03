import { useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, Gift, Mail, Sparkles, Crown, Medal, Award, Target, Users, ArrowLeft, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ScrollReveal from "@/components/ScrollReveal";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import { fromTable } from "@/integrations/supabase/helpers";

interface ChallengeEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  achievements_unlocked: number;
  progress_percent: number;
  isCurrentUser?: boolean;
}

const Desafio = () => {
  const { unlockedCount, totalCount } = useAchievements();
  const { user, profile, isAuthenticated } = useUserStats();
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<ChallengeEntry | null>(null);

  const progressPercent = Math.round((unlockedCount / totalCount) * 100);
  const isComplete = unlockedCount >= totalCount;

  const fetchChallengeRanking = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users ordered by achievements_unlocked
      const { data: statsData, error: statsError } = await fromTable('user_stats')
        .select('user_id, achievements_unlocked')
        .order('achievements_unlocked', { ascending: false })
        .limit(50);

      if (statsError) {
        console.error('Error fetching challenge ranking:', statsError);
        return;
      }

      if (!statsData || statsData.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for these users
      const userIds = (statsData as any[]).map((s: any) => s.user_id);
      const { data: profilesData, error: profilesError } = await fromTable('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profilesMap = new Map(
        ((profilesData || []) as any[]).map((p: any) => [p.user_id, {
          display_name: p.display_name || 'Jogador Anônimo',
          avatar_url: p.avatar_url
        }])
      );

      const challengeEntries: ChallengeEntry[] = (statsData as any[]).map((stat: any, index: number) => {
        const profileInfo = profilesMap.get(stat.user_id) as any;
        return {
          rank: index + 1,
          user_id: stat.user_id,
          display_name: profileInfo?.display_name || 'Jogador Anônimo',
          avatar_url: profileInfo?.avatar_url || null,
          achievements_unlocked: stat.achievements_unlocked,
          progress_percent: Math.round((stat.achievements_unlocked / totalCount) * 100),
          isCurrentUser: user?.id === stat.user_id,
        };
      });

      setEntries(challengeEntries);

      // Find current user's rank
      if (user) {
        const currentUserEntry = challengeEntries.find(e => e.user_id === user.id);
        if (currentUserEntry) {
          setUserRank(currentUserEntry);
        }
      }
    } catch (error) {
      console.error('Error fetching challenge ranking:', error);
    } finally {
      setLoading(false);
    }
  }, [user, totalCount]);

  useEffect(() => {
    fetchChallengeRanking();
  }, [fetchChallengeRanking]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
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
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className="bg-background font-orbitron min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Link>

        {/* Hero Section */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-lg border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-6 md:p-10 mb-8">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-48 h-48 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
              <Sparkles className="absolute top-4 right-6 w-8 h-8 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute bottom-4 left-6 w-6 h-6 text-amber-400 animate-pulse delay-300" />
              <Sparkles className="absolute top-1/2 right-1/4 w-5 h-5 text-orange-400 animate-pulse delay-700" />
            </div>

            <div className="relative z-10 text-center">
              {/* Prize Icon */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/30 mx-auto mb-6 animate-bounce">
                <Gift className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>

              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h1 className="font-pixel text-2xl md:text-4xl text-yellow-400">
                  DESAFIO R$5.000
                </h1>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>

              <p className="text-foreground text-lg md:text-xl mb-4 max-w-2xl mx-auto">
                Complete <strong className="text-yellow-400">TODAS as {totalCount} conquistas</strong> e ganhe{" "}
                <span className="font-pixel text-3xl text-green-400">R$5.000</span> em dinheiro!
              </p>

              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-xl mx-auto">
                Seja o primeiro a completar 100% das conquistas do ClipSave e entre em contato pelo e-mail oficial para receber seu prêmio.
              </p>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <a href="mailto:contatoclipsave@gmail.com" className="hover:text-yellow-400 transition-colors underline">
                  contatoclipsave@gmail.com
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* User Progress Card */}
        {isAuthenticated && (
          <ScrollReveal delay={0.1}>
            <div className={`rounded-lg border-2 p-6 mb-8 ${isComplete ? 'border-green-500 bg-green-500/10' : 'border-primary/30 bg-primary/5'}`}>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-pixel">
                    {profile?.display_name?.charAt(0) || 'J'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-pixel text-lg text-foreground mb-1">
                    {profile?.display_name || 'Jogador'}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {userRank ? `Posição #${userRank.rank} no desafio` : 'Seu progresso'}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 max-w-md bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="font-pixel text-lg text-foreground">
                      {unlockedCount}/{totalCount}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-pixel text-3xl text-yellow-400">{progressPercent}%</div>
                  <div className="text-xs text-muted-foreground">completo</div>
                </div>
              </div>

              {isComplete && (
                <div className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-center">
                  <p className="text-green-400 font-medium flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Parabéns! Você completou o desafio! Entre em contato para receber seu prêmio.
                  </p>
                  <a href="mailto:contatoclipsave@gmail.com" className="inline-block mt-2">
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar E-mail
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Ranking Section */}
        <ScrollReveal delay={0.2}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-pixel text-xl text-primary flex items-center gap-2">
                <Award className="w-6 h-6" />
                RANKING DO DESAFIO
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="w-4 h-4" />
                {entries.length} participantes
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando ranking...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum participante ainda.</p>
                <p className="text-sm text-muted-foreground mt-2">Seja o primeiro a participar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getRankBg(entry.rank)} ${entry.isCurrentUser ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12 border-2 border-border">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground font-pixel">
                        {entry.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${entry.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.display_name}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Você</span>
                        )}
                        {entry.progress_percent >= 100 && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Completo!
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={entry.progress_percent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {entry.achievements_unlocked}/{totalCount}
                        </span>
                      </div>
                    </div>

                    {/* Progress percent */}
                    <div className="text-right">
                      <div className={`font-pixel text-xl ${entry.progress_percent >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {entry.progress_percent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* CTA */}
        {!isAuthenticated && (
          <ScrollReveal delay={0.3}>
            <div className="text-center py-8 bg-card rounded-lg border border-border">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-pixel text-lg text-foreground mb-2">Quer participar?</h3>
              <p className="text-muted-foreground mb-4">
                Faça login para acompanhar seu progresso e aparecer no ranking!
              </p>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Rules */}
        <ScrollReveal delay={0.4}>
          <div className="mt-8 p-6 bg-card rounded-lg border border-border">
            <h3 className="font-pixel text-lg text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              REGRAS DO DESAFIO
            </h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Complete todas as {totalCount} conquistas disponíveis no ClipSave
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                O primeiro usuário a completar 100% receberá o prêmio de R$5.000
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Entre em contato pelo e-mail oficial após completar para validação
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                Você precisa estar logado para seu progresso ser salvo
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">!</span>
                Conquistas são desbloqueadas usando as ferramentas, jogos e downloads do site
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">!</span>
                Algumas conquistas requerem indicar amigos (compartilhe seu link no perfil)
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-border">
              <Link 
                to="/termos" hash="regulamento-desafio" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Ver Regulamento Oficial Completo
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
};

export default Desafio;
