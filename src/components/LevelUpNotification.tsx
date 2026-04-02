import { useEffect, useState } from 'react';
import { Sparkles, Star, ArrowUp } from 'lucide-react';
import { LEVEL_NAMES } from '@/hooks/useAchievements';

interface LevelUpNotificationProps {
  level: number | null;
  onDismiss: () => void;
}

const LevelUpNotification = ({ level, onDismiss }: LevelUpNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (level) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [level, onDismiss]);

  if (!level) return null;

  const levelName = LEVEL_NAMES[level - 1] || 'Novato';

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}
    >
      <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-lg p-1 shadow-2xl animate-pulse">
        <div className="bg-background rounded-md px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center animate-bounce">
                <ArrowUp className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-spin" />
              <Star className="absolute -bottom-1 -left-1 w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            
            {/* Content */}
            <div className="text-center">
              <p className="font-pixel text-yellow-500 text-[10px] mb-1 animate-pulse">
                LEVEL UP!
              </p>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-3xl text-foreground">{level}</span>
                <div className="text-left">
                  <p className="font-orbitron text-sm font-bold text-foreground">{levelName}</p>
                  <p className="text-[10px] text-muted-foreground">Novo nível alcançado!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LevelUpNotification;
