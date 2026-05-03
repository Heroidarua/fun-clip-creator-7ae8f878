import { useState } from 'react';
import { Share2, Copy, Check, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ReferralCardProps {
  referralCode: string | null;
  referralCount: number;
}

const REFERRAL_MILESTONES = [
  { count: 1, reward: 'Embaixador', icon: '🤝' },
  { count: 3, reward: 'Influenciador', icon: '📢' },
  { count: 5, reward: 'Compartilhador Supremo', icon: '🌟' },
  { count: 10, reward: 'Lenda do Compartilhamento', icon: '👑' },
];

const ReferralCard = ({ referralCode, referralCount }: ReferralCardProps) => {
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : null;

  const handleCopyLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar o link');
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'sos01 - Baixe vídeos de TikTok, Instagram e mais!',
          text: 'Confira o sos01, o melhor site para baixar vídeos e usar ferramentas gratuitas!',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Find next milestone
  const nextMilestone = REFERRAL_MILESTONES.find(m => m.count > referralCount) || REFERRAL_MILESTONES[REFERRAL_MILESTONES.length - 1];
  const progressPercent = Math.min((referralCount / nextMilestone.count) * 100, 100);

  if (!referralCode) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-pixel text-sm text-foreground">INDIQUE AMIGOS</h3>
          <p className="text-xs text-muted-foreground">Ganhe conquistas compartilhando!</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card/50 rounded-lg p-3 text-center border border-border">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-pixel text-lg text-foreground">{referralCount}</span>
          </div>
          <span className="text-xs text-muted-foreground">Indicados</span>
        </div>
        <div className="bg-card/50 rounded-lg p-3 text-center border border-border">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Gift className="w-4 h-4 text-yellow-500" />
            <span className="font-pixel text-lg text-foreground">{nextMilestone.icon}</span>
          </div>
          <span className="text-xs text-muted-foreground">Próxima conquista</span>
        </div>
      </div>

      {/* Progress to next milestone */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Progresso para "{nextMilestone.reward}"</span>
          <span>{referralCount}/{nextMilestone.count}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Referral Link */}
      <div className="bg-muted/50 rounded-lg p-3 mb-4">
        <label className="font-pixel text-[10px] text-muted-foreground block mb-2">SEU LINK DE INDICAÇÃO</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralLink || ''}
            readOnly
            className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs text-foreground truncate"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button
        onClick={handleShare}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartilhar Link
      </Button>

      {/* Milestones */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="font-pixel text-[10px] text-muted-foreground mb-3">CONQUISTAS DE INDICAÇÃO</h4>
        <div className="space-y-2">
          {REFERRAL_MILESTONES.map((milestone) => {
            const isUnlocked = referralCount >= milestone.count;
            return (
              <div
                key={milestone.count}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isUnlocked ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/30'
                }`}
              >
                <span className="text-lg">{milestone.icon}</span>
                <div className="flex-1">
                  <span className={`text-xs font-medium ${isUnlocked ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {milestone.reward}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({milestone.count} {milestone.count === 1 ? 'indicação' : 'indicações'})
                  </span>
                </div>
                {isUnlocked && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReferralCard;
