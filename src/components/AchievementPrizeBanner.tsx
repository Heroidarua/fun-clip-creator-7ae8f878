import { Trophy, Gift, Mail, Sparkles, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAchievements } from "@/hooks/useAchievements";

const AchievementPrizeBanner = () => {
  const { unlockedCount, totalCount } = useAchievements();
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);
  const isComplete = unlockedCount >= totalCount;

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-4 md:p-6 my-6">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        <Sparkles className="absolute top-2 right-4 w-6 h-6 text-yellow-400 animate-pulse" />
        <Sparkles className="absolute bottom-2 left-4 w-5 h-5 text-amber-400 animate-pulse delay-300" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        {/* Prize Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-bounce">
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-pixel text-lg md:text-xl text-yellow-400">
              DESAFIO R$5.000
            </h3>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          
          <p className="text-foreground text-sm md:text-base mb-2">
            Complete <strong className="text-yellow-400">TODAS as {totalCount} conquistas</strong> e ganhe{" "}
            <span className="font-pixel text-green-400 text-lg">R$5.000</span> em dinheiro!
          </p>
          
          <p className="text-muted-foreground text-xs md:text-sm mb-3">
            Ao completar 100% das conquistas, entre em contato pelo e-mail oficial para receber seu prêmio.
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-xs bg-muted rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-pixel text-foreground">
              {unlockedCount}/{totalCount}
            </span>
          </div>

          {isComplete ? (
            <div className="mt-3 flex items-center gap-2 justify-center md:justify-start">
              <Mail className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium text-sm">
                Parabéns! Entre em contato: <a href="mailto:contatoclipsave@gmail.com" className="underline hover:text-green-300">contatoclipsave@gmail.com</a>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start">
              <Link 
                to="/desafio" 
                className="inline-flex items-center gap-2 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Ver Ranking do Desafio
              </Link>
              <Link 
                to="/termos#regulamento-desafio" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Regulamento Oficial
              </Link>
              <Link 
                to="/perfil" 
                className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Minhas conquistas →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementPrizeBanner;
