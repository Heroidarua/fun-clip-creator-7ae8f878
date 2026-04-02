import { Trophy, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AchievementsPanel from './AchievementsPanel';
import { useAchievements } from '@/hooks/useAchievements';

const AchievementsBadge = () => {
  const { achievements, stats, xpData, unlockedCount, totalCount, getXPProgress, levelName } = useAchievements();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed bottom-4 left-4 z-40 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform group">
          <Trophy className="w-5 h-5" />
          {/* Level Badge */}
          <span className="absolute -top-2 -right-2 bg-gradient-to-br from-purple-500 to-blue-600 text-white text-[10px] font-pixel rounded-full w-6 h-6 flex items-center justify-center border border-purple-400 shadow-lg">
            {xpData.level}
          </span>
          <span className="absolute left-full ml-2 bg-card border border-border px-3 py-2 rounded text-xs text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="font-pixel text-[10px] text-purple-400">{levelName}</span>
            </div>
            <div className="text-muted-foreground mt-1">{unlockedCount} conquistas</div>
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Suas Conquistas
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/perfil" className="flex items-center gap-1 text-xs">
                Ver Perfil
                <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
          </DialogTitle>
        </DialogHeader>
        <AchievementsPanel
          achievements={achievements}
          stats={stats}
          xpData={xpData}
          unlockedCount={unlockedCount}
          totalCount={totalCount}
          getXPProgress={getXPProgress}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsBadge;
