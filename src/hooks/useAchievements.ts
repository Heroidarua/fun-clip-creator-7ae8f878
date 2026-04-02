import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'clipsave-achievements';
const STATS_KEY = 'clipsave-usage-stats';
const XP_KEY = 'clipsave-xp';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'download' | 'tools' | 'games' | 'social' | 'special';
  requirement: number;
  xpReward: number;
  unlockedAt?: number;
}

export interface UsageStats {
  totalDownloads: number;
  tiktokDownloads: number;
  instagramDownloads: number;
  kwaiDownloads: number;
  toolsUsed: number;
  avatarsGenerated: number;
  backgroundsRemoved: number;
  qrCodesGenerated: number;
  passwordsGenerated: number;
  thumbnailsCreated: number;
  watermarksAdded: number;
  urlsShortened: number;
  audiosConverted: number;
  gamesPlayed: number;
  comicsRead: number;
  daysActive: number;
  firstVisit: number;
  lastVisit: number;
  profileCustomized: boolean; // avatar + banner + bio + theme
  referralCount: number; // number of successful referrals
}

export interface XPData {
  totalXP: number;
  level: number;
}

// XP required per level (progressive - 25 levels)
export const XP_PER_LEVEL = [
  0,       // Level 1 (starting)
  50,      // Level 2
  120,     // Level 3
  220,     // Level 4
  350,     // Level 5
  520,     // Level 6
  730,     // Level 7
  1000,    // Level 8
  1350,    // Level 9
  1800,    // Level 10
  2400,    // Level 11
  3100,    // Level 12
  4000,    // Level 13
  5100,    // Level 14
  6500,    // Level 15
  8200,    // Level 16
  10200,   // Level 17
  12600,   // Level 18
  15500,   // Level 19
  19000,   // Level 20
  23000,   // Level 21
  28000,   // Level 22
  34000,   // Level 23
  42000,   // Level 24
  50000,   // Level 25 (MAX)
];

export const LEVEL_NAMES = [
  'Novato',
  'Iniciante', 
  'Aprendiz',
  'Curioso',
  'Explorador',
  'Aventureiro',
  'Experiente',
  'Veterano',
  'Especialista',
  'Expert',
  'Mestre',
  'Grão-Mestre',
  'Campeão',
  'Elite',
  'Lenda',
  'Mítico',
  'Épico',
  'Imortal',
  'Divino',
  'Supremo',
  'Transcendente',
  'Ascendente',
  'Celestial',
  'Onisciente',
  'Infinito',
];

const DEFAULT_STATS: UsageStats = {
  totalDownloads: 0,
  tiktokDownloads: 0,
  instagramDownloads: 0,
  kwaiDownloads: 0,
  toolsUsed: 0,
  avatarsGenerated: 0,
  backgroundsRemoved: 0,
  qrCodesGenerated: 0,
  passwordsGenerated: 0,
  thumbnailsCreated: 0,
  watermarksAdded: 0,
  urlsShortened: 0,
  audiosConverted: 0,
  gamesPlayed: 0,
  comicsRead: 0,
  daysActive: 1,
  firstVisit: Date.now(),
  lastVisit: Date.now(),
  profileCustomized: false,
  referralCount: 0,
};

const DEFAULT_XP: XPData = {
  totalXP: 0,
  level: 1,
};

const ACHIEVEMENTS: Achievement[] = [
  // Download achievements - Expanded
  { id: 'first_download', name: 'Primeiro Download', description: 'Baixe seu primeiro vídeo', icon: '🎬', category: 'download', requirement: 1, xpReward: 10 },
  { id: 'download_10', name: 'Colecionador', description: 'Baixe 10 vídeos', icon: '📦', category: 'download', requirement: 10, xpReward: 25 },
  { id: 'download_25', name: 'Acumulador', description: 'Baixe 25 vídeos', icon: '📁', category: 'download', requirement: 25, xpReward: 50 },
  { id: 'download_50', name: 'Arquivista', description: 'Baixe 50 vídeos', icon: '🗄️', category: 'download', requirement: 50, xpReward: 100 },
  { id: 'download_100', name: 'Mestre dos Downloads', description: 'Baixe 100 vídeos', icon: '👑', category: 'download', requirement: 100, xpReward: 200 },
  { id: 'download_250', name: 'Colecionador Supremo', description: 'Baixe 250 vídeos', icon: '💎', category: 'download', requirement: 250, xpReward: 400 },
  { id: 'download_500', name: 'Arquivista Lendário', description: 'Baixe 500 vídeos', icon: '🏆', category: 'download', requirement: 500, xpReward: 800 },
  { id: 'download_1000', name: 'Deus dos Downloads', description: 'Baixe 1000 vídeos', icon: '⚡', category: 'download', requirement: 1000, xpReward: 1500 },
  
  // Platform-specific achievements - Expanded
  { id: 'tiktok_10', name: 'TikToker Novato', description: 'Baixe 10 vídeos do TikTok', icon: '🎵', category: 'download', requirement: 10, xpReward: 30 },
  { id: 'tiktok_50', name: 'TikToker Expert', description: 'Baixe 50 vídeos do TikTok', icon: '🎶', category: 'download', requirement: 50, xpReward: 100 },
  { id: 'tiktok_200', name: 'TikToker Supremo', description: 'Baixe 200 vídeos do TikTok', icon: '🌟', category: 'download', requirement: 200, xpReward: 300 },
  { id: 'instagram_10', name: 'Instagrammer Novato', description: 'Baixe 10 mídias do Instagram', icon: '📸', category: 'download', requirement: 10, xpReward: 30 },
  { id: 'instagram_50', name: 'Instagrammer Expert', description: 'Baixe 50 mídias do Instagram', icon: '📷', category: 'download', requirement: 50, xpReward: 100 },
  { id: 'instagram_200', name: 'Instagrammer Supremo', description: 'Baixe 200 mídias do Instagram', icon: '✨', category: 'download', requirement: 200, xpReward: 300 },
  { id: 'kwai_10', name: 'Kwaier Novato', description: 'Baixe 10 vídeos do Kwai', icon: '🎭', category: 'download', requirement: 10, xpReward: 30 },
  { id: 'kwai_50', name: 'Kwaier Expert', description: 'Baixe 50 vídeos do Kwai', icon: '🎪', category: 'download', requirement: 50, xpReward: 100 },
  { id: 'kwai_200', name: 'Kwaier Supremo', description: 'Baixe 200 vídeos do Kwai', icon: '🎠', category: 'download', requirement: 200, xpReward: 300 },
  
  // Tools achievements - Expanded
  { id: 'first_tool', name: 'Ferramenteiro', description: 'Use uma ferramenta pela primeira vez', icon: '🔧', category: 'tools', requirement: 1, xpReward: 10 },
  { id: 'tools_10', name: 'Artesão Digital', description: 'Use ferramentas 10 vezes', icon: '⚙️', category: 'tools', requirement: 10, xpReward: 30 },
  { id: 'tools_25', name: 'Mestre das Ferramentas', description: 'Use ferramentas 25 vezes', icon: '🛠️', category: 'tools', requirement: 25, xpReward: 75 },
  { id: 'tools_50', name: 'Ninja Digital', description: 'Use ferramentas 50 vezes', icon: '🥷', category: 'tools', requirement: 50, xpReward: 150 },
  { id: 'tools_100', name: 'Guru das Ferramentas', description: 'Use ferramentas 100 vezes', icon: '🧙', category: 'tools', requirement: 100, xpReward: 300 },
  { id: 'tools_250', name: 'Mago Digital', description: 'Use ferramentas 250 vezes', icon: '🪄', category: 'tools', requirement: 250, xpReward: 600 },
  { id: 'tools_500', name: 'Arquiteto Digital', description: 'Use ferramentas 500 vezes', icon: '🏛️', category: 'tools', requirement: 500, xpReward: 1000 },
  
  // Specific tool achievements - Expanded
  { id: 'avatar_5', name: 'Criador de Avatares', description: 'Gere 5 avatares pixelados', icon: '👾', category: 'tools', requirement: 5, xpReward: 40 },
  { id: 'avatar_25', name: 'Artista Pixel', description: 'Gere 25 avatares pixelados', icon: '🎨', category: 'tools', requirement: 25, xpReward: 100 },
  { id: 'avatar_100', name: 'Mestre Pixel Art', description: 'Gere 100 avatares pixelados', icon: '🖼️', category: 'tools', requirement: 100, xpReward: 300 },
  { id: 'bg_5', name: 'Mágico do Fundo', description: 'Remova 5 fundos de imagens', icon: '✨', category: 'tools', requirement: 5, xpReward: 40 },
  { id: 'bg_25', name: 'Especialista em Fundos', description: 'Remova 25 fundos de imagens', icon: '🌈', category: 'tools', requirement: 25, xpReward: 100 },
  { id: 'bg_100', name: 'Mestre do Recorte', description: 'Remova 100 fundos de imagens', icon: '💫', category: 'tools', requirement: 100, xpReward: 300 },
  { id: 'qr_5', name: 'Gerador QR', description: 'Gere 5 QR Codes', icon: '📱', category: 'tools', requirement: 5, xpReward: 30 },
  { id: 'qr_25', name: 'QR Expert', description: 'Gere 25 QR Codes', icon: '📲', category: 'tools', requirement: 25, xpReward: 80 },
  { id: 'qr_100', name: 'Mestre QR', description: 'Gere 100 QR Codes', icon: '🔳', category: 'tools', requirement: 100, xpReward: 250 },
  { id: 'password_10', name: 'Guru das Senhas', description: 'Gere 10 senhas seguras', icon: '🔐', category: 'tools', requirement: 10, xpReward: 40 },
  { id: 'password_50', name: 'Guardião da Segurança', description: 'Gere 50 senhas seguras', icon: '🛡️', category: 'tools', requirement: 50, xpReward: 120 },
  { id: 'password_200', name: 'Mestre da Criptografia', description: 'Gere 200 senhas seguras', icon: '🔒', category: 'tools', requirement: 200, xpReward: 350 },
  { id: 'thumbnail_5', name: 'Thumbnail Pro', description: 'Crie 5 thumbnails', icon: '🖼️', category: 'tools', requirement: 5, xpReward: 35 },
  { id: 'thumbnail_25', name: 'Designer de Capas', description: 'Crie 25 thumbnails', icon: '🎬', category: 'tools', requirement: 25, xpReward: 100 },
  { id: 'thumbnail_100', name: 'Mestre Visual', description: 'Crie 100 thumbnails', icon: '🎥', category: 'tools', requirement: 100, xpReward: 300 },
  { id: 'audio_5', name: 'DJ Digital', description: 'Converta 5 áudios', icon: '🎧', category: 'tools', requirement: 5, xpReward: 35 },
  { id: 'audio_25', name: 'Produtor Musical', description: 'Converta 25 áudios', icon: '🎹', category: 'tools', requirement: 25, xpReward: 100 },
  { id: 'audio_100', name: 'Mestre do Som', description: 'Converta 100 áudios', icon: '🎼', category: 'tools', requirement: 100, xpReward: 300 },
  { id: 'watermark_5', name: 'Marcador', description: 'Adicione 5 marcas d\'água', icon: '💧', category: 'tools', requirement: 5, xpReward: 35 },
  { id: 'watermark_25', name: 'Protetor de Conteúdo', description: 'Adicione 25 marcas d\'água', icon: '🔏', category: 'tools', requirement: 25, xpReward: 100 },
  { id: 'url_5', name: 'Encurtador', description: 'Encurte 5 URLs', icon: '🔗', category: 'tools', requirement: 5, xpReward: 30 },
  { id: 'url_25', name: 'Link Master', description: 'Encurte 25 URLs', icon: '⛓️', category: 'tools', requirement: 25, xpReward: 80 },
  { id: 'url_100', name: 'Mestre dos Links', description: 'Encurte 100 URLs', icon: '🌐', category: 'tools', requirement: 100, xpReward: 250 },
  
  // Games achievements - Adjusted for 60 games max
  { id: 'first_game', name: 'Gamer Retrô', description: 'Jogue um jogo pela primeira vez', icon: '🎮', category: 'games', requirement: 1, xpReward: 10 },
  { id: 'games_5', name: 'Explorador Arcade', description: 'Jogue 5 jogos diferentes', icon: '🕹️', category: 'games', requirement: 5, xpReward: 25 },
  { id: 'games_10', name: 'Jogador Veterano', description: 'Jogue 10 jogos diferentes', icon: '🏆', category: 'games', requirement: 10, xpReward: 50 },
  { id: 'games_20', name: 'Arcade Master', description: 'Jogue 20 jogos diferentes', icon: '🎯', category: 'games', requirement: 20, xpReward: 100 },
  { id: 'games_30', name: 'Lenda dos Jogos', description: 'Jogue 30 jogos diferentes', icon: '🌟', category: 'games', requirement: 30, xpReward: 200 },
  { id: 'games_40', name: 'Arcade Legend', description: 'Jogue 40 jogos diferentes', icon: '👾', category: 'games', requirement: 40, xpReward: 350 },
  { id: 'games_50', name: 'Mestre do Arcade', description: 'Jogue 50 jogos diferentes', icon: '🎰', category: 'games', requirement: 50, xpReward: 500 },
  { id: 'games_60', name: 'Completista Arcade', description: 'Jogue TODOS os 60 jogos!', icon: '⚡', category: 'games', requirement: 60, xpReward: 1000 },
  
  // Social/Comics achievements - Expanded
  { id: 'first_comic', name: 'Leitor de HQs', description: 'Leia seu primeiro quadrinho', icon: '📚', category: 'social', requirement: 1, xpReward: 10 },
  { id: 'comics_5', name: 'Entusiasta', description: 'Leia 5 quadrinhos', icon: '📖', category: 'social', requirement: 5, xpReward: 25 },
  { id: 'comics_10', name: 'Fã de Quadrinhos', description: 'Leia 10 quadrinhos', icon: '💥', category: 'social', requirement: 10, xpReward: 50 },
  { id: 'comics_25', name: 'Colecionador de HQs', description: 'Leia 25 quadrinhos', icon: '📕', category: 'social', requirement: 25, xpReward: 100 },
  { id: 'comics_50', name: 'Nerd Supremo', description: 'Leia 50 quadrinhos', icon: '🦸', category: 'social', requirement: 50, xpReward: 200 },
  { id: 'comics_100', name: 'Mestre das HQs', description: 'Leia 100 quadrinhos', icon: '🦹', category: 'social', requirement: 100, xpReward: 400 },
  { id: 'comics_250', name: 'Lenda dos Quadrinhos', description: 'Leia 250 quadrinhos', icon: '📜', category: 'social', requirement: 250, xpReward: 800 },
  
  // Special achievements - Expanded
  { id: 'early_bird', name: 'Madrugador', description: 'Visite o site por 3 dias', icon: '🌅', category: 'special', requirement: 3, xpReward: 20 },
  { id: 'explorer', name: 'Explorador', description: 'Visite o site por 7 dias', icon: '🧭', category: 'special', requirement: 7, xpReward: 50 },
  { id: 'regular', name: 'Frequentador', description: 'Visite o site por 14 dias', icon: '📅', category: 'special', requirement: 14, xpReward: 100 },
  { id: 'veteran', name: 'Veterano', description: 'Visite o site por 30 dias', icon: '🎖️', category: 'special', requirement: 30, xpReward: 200 },
  { id: 'dedicated', name: 'Dedicado', description: 'Visite o site por 60 dias', icon: '🏅', category: 'special', requirement: 60, xpReward: 400 },
  { id: 'loyal', name: 'Leal', description: 'Visite o site por 100 dias', icon: '👑', category: 'special', requirement: 100, xpReward: 700 },
  { id: 'immortal', name: 'Imortal', description: 'Visite o site por 180 dias', icon: '⚡', category: 'special', requirement: 180, xpReward: 1200 },
  { id: 'eternal', name: 'Eterno', description: 'Visite o site por 365 dias', icon: '♾️', category: 'special', requirement: 365, xpReward: 2500 },
  { id: 'all_platforms', name: 'Multiplataforma', description: 'Baixe de todas as 3 plataformas', icon: '🌐', category: 'special', requirement: 3, xpReward: 100 },
  { id: 'completionist_10', name: 'Colecionador', description: 'Desbloqueie 10 conquistas', icon: '🎯', category: 'special', requirement: 10, xpReward: 100 },
  { id: 'completionist_25', name: 'Completista', description: 'Desbloqueie 25 conquistas', icon: '🏅', category: 'special', requirement: 25, xpReward: 250 },
  { id: 'completionist_50', name: 'Badge Master', description: 'Desbloqueie 50 conquistas', icon: '💎', category: 'special', requirement: 50, xpReward: 500 },
  { id: 'completionist_75', name: 'Elite Badge', description: 'Desbloqueie 75 conquistas', icon: '🔮', category: 'special', requirement: 75, xpReward: 1000 },
  { id: 'completionist_100', name: 'Lenda Absoluta', description: 'Desbloqueie 100 conquistas', icon: '🌟', category: 'special', requirement: 100, xpReward: 2000 },
  { id: 'profile_complete', name: 'Perfil Perfeito', description: 'Personalize completamente seu perfil (avatar, banner, bio e tema)', icon: '🎨', category: 'special', requirement: 1, xpReward: 150 },
  { id: 'referral_1', name: 'Embaixador', description: 'Indique 1 amigo para o ClipSave', icon: '🤝', category: 'social', requirement: 1, xpReward: 50 },
  { id: 'referral_3', name: 'Influenciador', description: 'Indique 3 amigos para o ClipSave', icon: '📢', category: 'social', requirement: 3, xpReward: 150 },
  { id: 'referral_5', name: 'Compartilhador Supremo', description: 'Indique 5 amigos para o ClipSave', icon: '🌟', category: 'social', requirement: 5, xpReward: 300 },
  { id: 'referral_10', name: 'Lenda do Compartilhamento', description: 'Indique 10 amigos para o ClipSave', icon: '👑', category: 'social', requirement: 10, xpReward: 500 },
  { id: 'perfectionist', name: 'Perfeccionista', description: 'Desbloqueie TODAS as conquistas', icon: '🏆', category: 'special', requirement: 999, xpReward: 5000 },
];

export function useAchievements() {
  const [stats, setStats] = useState<UsageStats>(() => {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Update days active
        const lastVisit = new Date(parsed.lastVisit);
        const today = new Date();
        if (lastVisit.toDateString() !== today.toDateString()) {
          parsed.daysActive = (parsed.daysActive || 1) + 1;
          parsed.lastVisit = Date.now();
        }
        return { ...DEFAULT_STATS, ...parsed };
      }
      return DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [xpData, setXPData] = useState<XPData>(() => {
    try {
      const stored = localStorage.getItem(XP_KEY);
      return stored ? { ...DEFAULT_XP, ...JSON.parse(stored) } : DEFAULT_XP;
    } catch {
      return DEFAULT_XP;
    }
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number): number => {
    for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
      if (xp >= XP_PER_LEVEL[i]) {
        return i + 1;
      }
    }
    return 1;
  }, []);

  // Add XP and check for level up
  const addXP = useCallback((amount: number) => {
    setXPData(prev => {
      const newXP = prev.totalXP + amount;
      const newLevel = calculateLevel(newXP);
      
      if (newLevel > prev.level) {
        setLevelUp(newLevel);
      }
      
      return { totalXP: newXP, level: newLevel };
    });
  }, [calculateLevel]);

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      console.warn('Failed to save stats');
    }
  }, [stats]);

  // Persist XP
  useEffect(() => {
    try {
      localStorage.setItem(XP_KEY, JSON.stringify(xpData));
    } catch {
      console.warn('Failed to save XP');
    }
  }, [xpData]);

  // Persist achievements
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedAchievements));
    } catch {
      console.warn('Failed to save achievements');
    }
  }, [unlockedAchievements]);

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    const newlyUnlocked: Achievement[] = [];
    const totalAchievementsCount = ACHIEVEMENTS.length - 1; // Exclude perfectionist
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.includes(achievement.id)) return;
      
      let shouldUnlock = false;
      const id = achievement.id;
      
      // Downloads
      if (id.startsWith('first_download') || id.startsWith('download_')) {
        shouldUnlock = stats.totalDownloads >= achievement.requirement;
      }
      // Platform-specific downloads
      else if (id.startsWith('tiktok_')) {
        shouldUnlock = stats.tiktokDownloads >= achievement.requirement;
      }
      else if (id.startsWith('instagram_')) {
        shouldUnlock = stats.instagramDownloads >= achievement.requirement;
      }
      else if (id.startsWith('kwai_')) {
        shouldUnlock = stats.kwaiDownloads >= achievement.requirement;
      }
      // Tools general
      else if (id === 'first_tool' || id.startsWith('tools_')) {
        shouldUnlock = stats.toolsUsed >= achievement.requirement;
      }
      // Specific tools
      else if (id.startsWith('avatar_')) {
        shouldUnlock = stats.avatarsGenerated >= achievement.requirement;
      }
      else if (id.startsWith('bg_')) {
        shouldUnlock = stats.backgroundsRemoved >= achievement.requirement;
      }
      else if (id.startsWith('qr_')) {
        shouldUnlock = stats.qrCodesGenerated >= achievement.requirement;
      }
      else if (id.startsWith('password_')) {
        shouldUnlock = stats.passwordsGenerated >= achievement.requirement;
      }
      else if (id.startsWith('thumbnail_')) {
        shouldUnlock = stats.thumbnailsCreated >= achievement.requirement;
      }
      else if (id.startsWith('audio_')) {
        shouldUnlock = stats.audiosConverted >= achievement.requirement;
      }
      else if (id.startsWith('watermark_')) {
        shouldUnlock = stats.watermarksAdded >= achievement.requirement;
      }
      else if (id.startsWith('url_')) {
        shouldUnlock = stats.urlsShortened >= achievement.requirement;
      }
      // Games
      else if (id === 'first_game' || id.startsWith('games_')) {
        shouldUnlock = stats.gamesPlayed >= achievement.requirement;
      }
      // Comics
      else if (id === 'first_comic' || id.startsWith('comics_')) {
        shouldUnlock = stats.comicsRead >= achievement.requirement;
      }
      // Days active
      else if (['early_bird', 'explorer', 'regular', 'veteran', 'dedicated', 'loyal', 'immortal', 'eternal'].includes(id)) {
        shouldUnlock = stats.daysActive >= achievement.requirement;
      }
      // Special
      else if (id === 'all_platforms') {
        const platformsUsed = [
          stats.tiktokDownloads > 0,
          stats.instagramDownloads > 0,
          stats.kwaiDownloads > 0,
        ].filter(Boolean).length;
        shouldUnlock = platformsUsed >= achievement.requirement;
      }
      else if (id.startsWith('completionist_')) {
        shouldUnlock = unlockedAchievements.length >= achievement.requirement;
      }
      else if (id === 'profile_complete') {
        shouldUnlock = stats.profileCustomized === true;
      }
      else if (id.startsWith('referral_')) {
        shouldUnlock = stats.referralCount >= achievement.requirement;
      }
      else if (id === 'perfectionist') {
        shouldUnlock = unlockedAchievements.length >= totalAchievementsCount;
      }
      
      if (shouldUnlock) {
        newlyUnlocked.push({ ...achievement, unlockedAt: Date.now() });
      }
    });
    
    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked.map(a => a.id)]);
      setNewAchievement(newlyUnlocked[0]);
      // Add XP for the first unlocked achievement
      addXP(newlyUnlocked[0].xpReward);
    }
  }, [stats, unlockedAchievements, addXP]);

  useEffect(() => {
    checkAchievements();
  }, [stats]);

  const trackDownload = useCallback((platform: 'tiktok' | 'instagram' | 'kwai') => {
    setStats(prev => ({
      ...prev,
      totalDownloads: prev.totalDownloads + 1,
      [`${platform}Downloads`]: (prev[`${platform}Downloads` as keyof UsageStats] as number) + 1,
    }));
  }, []);

  const trackToolUsage = useCallback((tool: 'avatar' | 'background' | 'qr' | 'password' | 'thumbnail' | 'watermark' | 'url' | 'audio' | 'other') => {
    setStats(prev => {
      const updates: Partial<UsageStats> = { toolsUsed: prev.toolsUsed + 1 };
      
      switch (tool) {
        case 'avatar':
          updates.avatarsGenerated = prev.avatarsGenerated + 1;
          break;
        case 'background':
          updates.backgroundsRemoved = prev.backgroundsRemoved + 1;
          break;
        case 'qr':
          updates.qrCodesGenerated = prev.qrCodesGenerated + 1;
          break;
        case 'password':
          updates.passwordsGenerated = prev.passwordsGenerated + 1;
          break;
        case 'thumbnail':
          updates.thumbnailsCreated = prev.thumbnailsCreated + 1;
          break;
        case 'watermark':
          updates.watermarksAdded = prev.watermarksAdded + 1;
          break;
        case 'url':
          updates.urlsShortened = prev.urlsShortened + 1;
          break;
        case 'audio':
          updates.audiosConverted = prev.audiosConverted + 1;
          break;
      }
      
      return { ...prev, ...updates };
    });
  }, []);

  const trackGamePlayed = useCallback(() => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
    }));
  }, []);

  const trackComicRead = useCallback(() => {
    setStats(prev => ({
      ...prev,
      comicsRead: prev.comicsRead + 1,
    }));
  }, []);

  const markProfileCustomized = useCallback(() => {
    setStats(prev => ({
      ...prev,
      profileCustomized: true,
    }));
  }, []);

  const updateReferralCount = useCallback((count: number) => {
    setStats(prev => ({
      ...prev,
      referralCount: count,
    }));
  }, []);

  const dismissNewAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUp(null);
  }, []);

  const getAchievementProgress = useCallback((achievement: Achievement): number => {
    let current = 0;
    const id = achievement.id;
    
    // Downloads
    if (id.startsWith('first_download') || id.startsWith('download_')) {
      current = stats.totalDownloads;
    }
    // Platform-specific downloads
    else if (id.startsWith('tiktok_')) {
      current = stats.tiktokDownloads;
    }
    else if (id.startsWith('instagram_')) {
      current = stats.instagramDownloads;
    }
    else if (id.startsWith('kwai_')) {
      current = stats.kwaiDownloads;
    }
    // Tools general
    else if (id === 'first_tool' || id.startsWith('tools_')) {
      current = stats.toolsUsed;
    }
    // Specific tools
    else if (id.startsWith('avatar_')) {
      current = stats.avatarsGenerated;
    }
    else if (id.startsWith('bg_')) {
      current = stats.backgroundsRemoved;
    }
    else if (id.startsWith('qr_')) {
      current = stats.qrCodesGenerated;
    }
    else if (id.startsWith('password_')) {
      current = stats.passwordsGenerated;
    }
    else if (id.startsWith('thumbnail_')) {
      current = stats.thumbnailsCreated;
    }
    else if (id.startsWith('audio_')) {
      current = stats.audiosConverted;
    }
    else if (id.startsWith('watermark_')) {
      current = stats.watermarksAdded;
    }
    else if (id.startsWith('url_')) {
      current = stats.urlsShortened;
    }
    // Games
    else if (id === 'first_game' || id.startsWith('games_')) {
      current = stats.gamesPlayed;
    }
    // Comics
    else if (id === 'first_comic' || id.startsWith('comics_')) {
      current = stats.comicsRead;
    }
    // Days active
    else if (['early_bird', 'explorer', 'regular', 'veteran', 'dedicated', 'loyal', 'immortal', 'eternal'].includes(id)) {
      current = stats.daysActive;
    }
    // Special
    else if (id === 'all_platforms') {
      current = [
        stats.tiktokDownloads > 0,
        stats.instagramDownloads > 0,
        stats.kwaiDownloads > 0,
      ].filter(Boolean).length;
    }
    else if (id.startsWith('completionist_') || id === 'perfectionist') {
      current = unlockedAchievements.length;
    }
    else if (id === 'profile_complete') {
      current = stats.profileCustomized ? 1 : 0;
    }
    else if (id.startsWith('referral_')) {
      current = stats.referralCount;
    }
    
    return Math.min(current / achievement.requirement, 1);
  }, [stats, unlockedAchievements]);

  // XP progress to next level
  const getXPProgress = useCallback((): { current: number; needed: number; percentage: number } => {
    const currentLevelXP = XP_PER_LEVEL[xpData.level - 1] || 0;
    const nextLevelXP = XP_PER_LEVEL[xpData.level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
    
    const current = xpData.totalXP - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;
    const percentage = xpData.level >= 25 ? 100 : (current / needed) * 100;
    
    return { current, needed, percentage };
  }, [xpData]);

  const allAchievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: unlockedAchievements.includes(a.id),
    progress: getAchievementProgress(a),
  }));

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return {
    stats,
    xpData,
    achievements: allAchievements,
    unlockedCount,
    totalCount,
    newAchievement,
    levelUp,
    dismissNewAchievement,
    dismissLevelUp,
    trackDownload,
    trackToolUsage,
    trackGamePlayed,
    trackComicRead,
    markProfileCustomized,
    updateReferralCount,
    getXPProgress,
    levelName: LEVEL_NAMES[xpData.level - 1] || 'Novato',
  };
}
