import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Gamepad2, Download, Wrench, Users, Star, Sparkles, Calendar, Target, Zap, Award, TrendingUp, BarChart3, Crown, LogIn, Pencil, X, Check, Share2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAchievements, XP_PER_LEVEL, LEVEL_NAMES, Achievement } from "@/hooks/useAchievements";
import { useUserStats } from "@/hooks/useUserStats";
import AvatarUpload from "@/components/AvatarUpload";
import BannerUpload from "@/components/BannerUpload";
import BioEditor from "@/components/BioEditor";
import ReferralCard from "@/components/ReferralCard";
import ScrollReveal from "@/components/ScrollReveal";
import ProfileThemeSelector, { PROFILE_THEMES, ProfileTheme } from "@/components/ProfileThemeSelector";
import { toast } from "sonner";

const categoryIcons = {
  download: Download,
  tools: Wrench,
  games: Gamepad2,
  social: Users,
  special: Star,
};

const categoryNames = {
  download: 'Downloads',
  tools: 'Ferramentas',
  games: 'Jogos',
  social: 'Social',
  special: 'Especiais',
};

const categoryColors = {
  download: 'from-red-500 to-orange-500',
  tools: 'from-purple-500 to-pink-500',
  games: 'from-green-500 to-emerald-500',
  social: 'from-blue-500 to-cyan-500',
  special: 'from-yellow-500 to-amber-500',
};

const Perfil = () => {
  const { stats, xpData, achievements, unlockedCount, totalCount, getXPProgress, levelName, markProfileCustomized, updateReferralCount } = useAchievements();
  const { isAuthenticated, profile, uploadAvatar, removeAvatar, uploadBanner, removeBanner, updateDisplayName, updateProfileTheme, updateBio, canChangeUsername, usernameChangesRemaining } = useUserStats();
  const xpProgress = getXPProgress();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  const currentTheme = (profile?.profile_theme || 'purple') as ProfileTheme;
  const themeStyles = PROFILE_THEMES[currentTheme];

  // Check if profile is fully customized
  useEffect(() => {
    if (isAuthenticated && profile && !stats.profileCustomized) {
      const hasAvatar = !!profile.avatar_url;
      const hasBanner = !!profile.banner_url;
      const hasBio = !!profile.bio && profile.bio.trim().length > 0;
      const hasCustomTheme = profile.profile_theme !== 'purple'; // Changed from default
      
      if (hasAvatar && hasBanner && hasBio && hasCustomTheme) {
        markProfileCustomized();
      }
    }
  }, [isAuthenticated, profile, stats.profileCustomized, markProfileCustomized]);

  // Sync referral count from profile to achievements
  useEffect(() => {
    if (isAuthenticated && profile && profile.referral_count !== stats.referralCount) {
      updateReferralCount(profile.referral_count);
    }
  }, [isAuthenticated, profile?.referral_count, stats.referralCount, updateReferralCount]);

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, (Achievement & { unlocked: boolean; progress: number })[]>);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleStartEditingName = () => {
    setNewDisplayName(profile?.display_name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }
    
    const result = await updateDisplayName(newDisplayName.trim());
    
    if (result.success) {
      toast.success("Nome atualizado com sucesso!");
      setIsEditingName(false);
    } else if (result.error === 'limit_reached') {
      toast.error("Você já atingiu o limite de 2 mudanças de nome");
    } else {
      toast.error("Erro ao atualizar nome");
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNewDisplayName("");
  };

  const handleThemeChange = async (theme: ProfileTheme) => {
    setIsUpdatingTheme(true);
    const success = await updateProfileTheme(theme);
    setIsUpdatingTheme(false);
    
    if (success) {
      toast.success("Tema do perfil atualizado!");
    } else {
      toast.error("Erro ao atualizar tema");
    }
  };

  const handleBioSave = async (bio: string) => {
    const success = await updateBio(bio);
    
    if (success) {
      toast.success("Bio atualizada com sucesso!");
    } else {
      toast.error("Erro ao atualizar bio");
    }
    
    return success;
  };

  const handleBannerUpload = async (file: File) => {
    try {
      const url = await uploadBanner(file);
      if (url) {
        toast.success("Banner atualizado com sucesso!");
      }
      return url;
    } catch (error) {
      toast.error("Erro ao fazer upload do banner");
      return null;
    }
  };

  const handleBannerRemove = async () => {
    const success = await removeBanner();
    if (success) {
      toast.success("Banner removido com sucesso!");
    } else {
      toast.error("Erro ao remover banner");
    }
    return success;
  };

  return (
    <div className="bg-background font-orbitron min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Banner Section - Only for authenticated users */}
        {isAuthenticated && (
          <ScrollReveal>
            <div className="mb-4">
              <BannerUpload
                currentBannerUrl={profile?.banner_url || null}
                onUpload={handleBannerUpload}
                onRemove={handleBannerRemove}
              />
            </div>
          </ScrollReveal>
        )}

        {/* Hero Profile Section */}
        <ScrollReveal>
          <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${themeStyles.gradient} border ${themeStyles.border} p-6 md:p-8 mb-8 transition-all duration-300`}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-0 right-0 w-64 h-64 ${themeStyles.bg}/10 rounded-full blur-3xl`} />
              <div className={`absolute bottom-0 left-0 w-64 h-64 ${themeStyles.bg}/10 rounded-full blur-3xl`} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              {/* Avatar Section */}
              <div className="relative">
                {isAuthenticated ? (
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    onUpload={uploadAvatar}
                    onRemove={removeAvatar}
                    size="lg"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center border-4 border-purple-400 shadow-2xl">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background flex items-center justify-center">
                      <span className="font-pixel text-4xl md:text-5xl text-purple-400">{xpData.level}</span>
                    </div>
                  </div>
                )}
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
                <Zap className="absolute -bottom-1 -left-1 w-6 h-6 text-cyan-400 animate-bounce" />
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm text-muted-foreground mb-1">Seu Nível</p>
                
                {/* Display Name with Edit */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          className="w-48 h-8 text-sm"
                          maxLength={20}
                          placeholder="Seu nome"
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}>
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEditName}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-pixel text-lg text-foreground">
                          {profile?.display_name || "Jogador Anônimo"}
                        </h2>
                        {canChangeUsername && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6" 
                            onClick={handleStartEditingName}
                            title={`${usernameChangesRemaining} mudança(s) restante(s)`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
                
                {isAuthenticated && !canChangeUsername && (
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Limite de mudanças de nome atingido
                  </p>
                )}
                
                <h1 className="font-pixel text-2xl md:text-3xl text-foreground mb-2">{levelName}</h1>
                <p className="text-muted-foreground text-sm mb-2">
                  Membro desde {formatDate(stats.firstVisit)}
                </p>
                
                {/* Login prompt for non-authenticated users */}
                {!isAuthenticated && (
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="mb-4 gap-2">
                      <LogIn className="w-4 h-4" />
                      Faça login para salvar progresso
                    </Button>
                  </Link>
                )}
                
                {/* XP Bar */}
                <div className="max-w-md">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>XP Total: {xpData.totalXP}</span>
                    {xpData.level < 25 ? (
                      <span>{xpProgress.current}/{xpProgress.needed} para Nível {xpData.level + 1}</span>
                    ) : (
                      <span className="text-yellow-400">Nível Máximo!</span>
                    )}
                  </div>
                  <Progress value={xpProgress.percentage} className="h-3" />
                </div>
                
                {/* Ranking Button */}
                <Link to="/ranking" className="inline-block mt-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Ver Ranking Global
                  </Button>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-background/50 rounded-lg p-3 border border-border">
                  <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="font-pixel text-lg text-foreground">{unlockedCount}</p>
                  <p className="text-[10px] text-muted-foreground">Conquistas</p>
                </div>
                <div className="bg-background/50 rounded-lg p-3 border border-border">
                  <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="font-pixel text-lg text-foreground">{stats.daysActive}</p>
                  <p className="text-[10px] text-muted-foreground">Dias Ativos</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Profile Customization - Only for authenticated users */}
        {isAuthenticated && (
          <ScrollReveal delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <ProfileThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                disabled={isUpdatingTheme}
              />
              <BioEditor
                bio={profile?.bio || null}
                onSave={handleBioSave}
                maxLength={200}
              />
              <ReferralCard
                referralCode={profile?.referral_code || null}
                referralCount={profile?.referral_count || 0}
              />
            </div>
          </ScrollReveal>
        )}

        {/* Stats Grid */}
        <ScrollReveal delay={0.1}>
          <div className="mb-8">
            <h2 className="font-pixel text-lg text-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              ESTATÍSTICAS DETALHADAS
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                icon={<Download className="w-5 h-5" />}
                label="Downloads"
                value={stats.totalDownloads}
                color="text-red-500"
                bgColor="bg-red-500/10"
              />
              <StatCard
                icon={<Wrench className="w-5 h-5" />}
                label="Ferramentas"
                value={stats.toolsUsed}
                color="text-purple-500"
                bgColor="bg-purple-500/10"
              />
              <StatCard
                icon={<Gamepad2 className="w-5 h-5" />}
                label="Jogos"
                value={stats.gamesPlayed}
                color="text-green-500"
                bgColor="bg-green-500/10"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Quadrinhos"
                value={stats.comicsRead}
                color="text-blue-500"
                bgColor="bg-blue-500/10"
              />
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Avatares"
                value={stats.avatarsGenerated}
                color="text-pink-500"
                bgColor="bg-pink-500/10"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="QR Codes"
                value={stats.qrCodesGenerated}
                color="text-cyan-500"
                bgColor="bg-cyan-500/10"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Platform Breakdown */}
        <ScrollReveal delay={0.15}>
          <div className="mb-8">
            <h2 className="font-pixel text-lg text-primary mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              DOWNLOADS POR PLATAFORMA
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PlatformCard
                name="TikTok"
                count={stats.tiktokDownloads}
                emoji="🎵"
                color="from-pink-500 to-red-500"
              />
              <PlatformCard
                name="Instagram"
                count={stats.instagramDownloads}
                emoji="📸"
                color="from-purple-500 to-pink-500"
              />
              <PlatformCard
                name="Kwai"
                count={stats.kwaiDownloads}
                emoji="🎭"
                color="from-orange-500 to-yellow-500"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Tools Breakdown */}
        <ScrollReveal delay={0.2}>
          <div className="mb-8">
            <h2 className="font-pixel text-lg text-primary mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              USO DE FERRAMENTAS
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MiniStatCard label="Avatares" value={stats.avatarsGenerated} emoji="👾" />
              <MiniStatCard label="Fundos Removidos" value={stats.backgroundsRemoved} emoji="✨" />
              <MiniStatCard label="QR Codes" value={stats.qrCodesGenerated} emoji="📱" />
              <MiniStatCard label="Senhas" value={stats.passwordsGenerated} emoji="🔐" />
              <MiniStatCard label="Thumbnails" value={stats.thumbnailsCreated} emoji="🖼️" />
              <MiniStatCard label="Marcas d'água" value={stats.watermarksAdded} emoji="💧" />
              <MiniStatCard label="URLs Encurtadas" value={stats.urlsShortened} emoji="🔗" />
              <MiniStatCard label="Áudios" value={stats.audiosConverted} emoji="🎧" />
            </div>
          </div>
        </ScrollReveal>

        {/* Achievements Section */}
        <ScrollReveal delay={0.25}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-pixel text-lg text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                CONQUISTAS ({unlockedCount}/{totalCount})
              </h2>
              <div className="text-sm text-muted-foreground">
                {Math.round((unlockedCount / totalCount) * 100)}% completo
              </div>
            </div>
            
            <Progress value={(unlockedCount / totalCount) * 100} className="h-2 mb-6" />
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6">
                <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                <TabsTrigger value="download" className="text-xs">Downloads</TabsTrigger>
                <TabsTrigger value="tools" className="text-xs">Ferramentas</TabsTrigger>
                <TabsTrigger value="games" className="text-xs">Jogos</TabsTrigger>
                <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                <TabsTrigger value="special" className="text-xs">Especiais</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <AchievementGrid achievements={achievements} />
              </TabsContent>
              
              {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                <TabsContent key={category} value={category}>
                  <AchievementGrid achievements={categoryAchievements} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </ScrollReveal>

        {/* Level Progress */}
        <ScrollReveal delay={0.3}>
          <div className="mb-8">
            <h2 className="font-pixel text-lg text-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              PROGRESSÃO DE NÍVEIS ({xpData.level}/25)
            </h2>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
              {LEVEL_NAMES.map((name, index) => {
                const level = index + 1;
                const isUnlocked = xpData.level >= level;
                const isCurrent = xpData.level === level;
                
                return (
                  <div
                    key={level}
                    className={`relative p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                      isCurrent
                        ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500/50'
                        : isUnlocked
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-border bg-muted/30 opacity-50'
                    }`}
                  >
                    {isCurrent && (
                      <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-purple-400 animate-pulse" />
                    )}
                    <div className={`font-pixel text-lg sm:text-xl mb-0.5 ${
                      isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {level}
                    </div>
                    <div className={`text-[8px] sm:text-[10px] truncate ${
                      isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {name}
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-0.5">
                      {XP_PER_LEVEL[index].toLocaleString()} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </main>
      
      <Footer />
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color, bgColor }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) => (
  <div className={`${bgColor} rounded-lg p-4 border border-border text-center`}>
    <div className={`${color} mx-auto mb-2`}>{icon}</div>
    <div className="font-pixel text-xl text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const PlatformCard = ({ name, count, emoji, color }: {
  name: string;
  count: number;
  emoji: string;
  color: string;
}) => (
  <div className={`bg-gradient-to-r ${color} p-[1px] rounded-lg`}>
    <div className="bg-background rounded-lg p-4 flex items-center gap-3">
      <span className="text-3xl">{emoji}</span>
      <div>
        <div className="font-pixel text-xl text-foreground">{count}</div>
        <div className="text-xs text-muted-foreground">{name}</div>
      </div>
    </div>
  </div>
);

const MiniStatCard = ({ label, value, emoji }: {
  label: string;
  value: number;
  emoji: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-2">
    <span className="text-xl">{emoji}</span>
    <div>
      <div className="font-bold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  </div>
);

const AchievementGrid = ({ achievements }: {
  achievements: (Achievement & { unlocked: boolean; progress: number })[];
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {achievements.map((achievement) => (
      <div
        key={achievement.id}
        className={`relative p-4 rounded-lg border-2 text-center transition-all ${
          achievement.unlocked
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-border bg-muted/30 opacity-60'
        }`}
      >
        <div className={`text-3xl mb-2 ${!achievement.unlocked && 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className={`font-medium text-sm mb-1 ${
          achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {achievement.name}
        </div>
        <div className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
          {achievement.description}
        </div>
        {!achievement.unlocked && (
          <div className="mt-2">
            <Progress value={achievement.progress * 100} className="h-1" />
            <div className="text-[10px] text-muted-foreground mt-1">
              {Math.round(achievement.progress * 100)}%
            </div>
          </div>
        )}
        {achievement.unlocked && (
          <div className="text-[10px] text-green-500 font-pixel">
            ✓ DESBLOQUEADO
          </div>
        )}
        <div className="text-[10px] text-cyan-400 mt-1">
          +{achievement.xpReward} XP
        </div>
      </div>
    ))}
  </div>
);

export default Perfil;
