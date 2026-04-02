import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Lock, CheckCircle, ChevronDown, ChevronUp, Gamepad2, Download, Wrench, Users, Star, Sparkles, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Achievement, UsageStats, XPData, XP_PER_LEVEL, LEVEL_NAMES } from '@/hooks/useAchievements';

interface AchievementsPanelProps {
  achievements: (Achievement & { unlocked: boolean; progress: number })[];
  stats: UsageStats;
  xpData: XPData;
  unlockedCount: number;
  totalCount: number;
  getXPProgress: () => { current: number; needed: number; percentage: number };
}

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
  download: 'text-red-500',
  tools: 'text-purple-500',
  games: 'text-green-500',
  social: 'text-blue-500',
  special: 'text-yellow-500',
};

const AchievementsPanel = ({ achievements, stats, xpData, unlockedCount, totalCount, getXPProgress }: AchievementsPanelProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>(['download']);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof achievements>);

  const overallProgress = (unlockedCount / totalCount) * 100;
  const xpProgress = getXPProgress();
  const levelName = LEVEL_NAMES[xpData.level - 1] || 'Novato';

  return (
    <div className="space-y-6">
      {/* Level & XP Section */}
      <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center border-2 border-purple-400 shadow-lg">
                <span className="font-pixel text-xl text-white">{xpData.level}</span>
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="font-pixel text-sm text-purple-400">{levelName}</p>
              <p className="text-xs text-muted-foreground">Nível {xpData.level}/25</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-pixel text-lg text-cyan-400">{xpData.totalXP.toLocaleString()} XP</p>
            <p className="text-[10px] text-muted-foreground">Total acumulado</p>
          </div>
        </div>
        
        {xpData.level < 25 && (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Próximo nível: {LEVEL_NAMES[xpData.level] || 'MAX'}</span>
              <span>{xpProgress.current}/{xpProgress.needed} XP</span>
            </div>
            <Progress value={xpProgress.percentage} className="h-2" />
          </div>
        )}
        
        {xpData.level >= 25 && (
          <div className="text-center">
            <p className="font-pixel text-xs text-yellow-400 animate-pulse">✨ NÍVEL MÁXIMO ALCANÇADO! ✨</p>
          </div>
        )}
      </div>

      {/* Achievement Stats */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="font-pixel text-sm text-yellow-500">CONQUISTAS</span>
          </div>
          <span className="font-pixel text-lg text-yellow-500">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round(overallProgress)}% completo
        </p>
        <Link to="/ranking" className="block mt-3">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            Ver Ranking Global
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalDownloads}</div>
          <div className="text-xs text-muted-foreground">Downloads</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-500">{stats.toolsUsed}</div>
          <div className="text-xs text-muted-foreground">Ferramentas</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.gamesPlayed}</div>
          <div className="text-xs text-muted-foreground">Jogos</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.daysActive}</div>
          <div className="text-xs text-muted-foreground">Dias Ativos</div>
        </div>
      </div>

      {/* Achievement Categories */}
      <div className="space-y-3">
        {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
          const isOpen = openCategories.includes(category);

          return (
            <Collapsible
              key={category}
              open={isOpen}
              onOpenChange={() => toggleCategory(category)}
            >
              <div className="border border-border rounded-lg overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${categoryColors[category as keyof typeof categoryColors]}`} />
                      <span className="font-medium">{categoryNames[category as keyof typeof categoryNames]}</span>
                      <span className="text-xs text-muted-foreground">
                        ({unlockedInCategory}/{categoryAchievements.length})
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t border-border p-3 space-y-3">
                    {categoryAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          achievement.unlocked
                            ? 'bg-green-500/10 border border-green-500/30'
                            : 'bg-muted/30 opacity-60'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                          achievement.unlocked ? 'bg-green-500/20' : 'bg-muted'
                        }`}>
                          {achievement.unlocked ? achievement.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                              {achievement.name}
                            </span>
                            {achievement.unlocked && (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            )}
                            <span className="text-[10px] text-cyan-400 font-pixel ml-auto">
                              +{achievement.xpReward} XP
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                          {!achievement.unlocked && (
                            <div className="mt-1">
                              <Progress value={achievement.progress * 100} className="h-1" />
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round(achievement.progress * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
