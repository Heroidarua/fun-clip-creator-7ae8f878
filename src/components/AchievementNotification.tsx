import { useEffect, useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Achievement } from '@/hooks/useAchievements';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

const AchievementNotification = ({ achievement, onDismiss }: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50 rounded-lg p-4 shadow-lg backdrop-blur-sm max-w-sm">
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center text-2xl animate-bounce">
            {achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-pixel text-xs text-yellow-500">CONQUISTA DESBLOQUEADA!</span>
            </div>
            <h4 className="font-bold text-foreground">{achievement.name}</h4>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
