import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/integrations/supabase/helpers';
import { User, Session } from '@supabase/supabase-js';
import { useAchievements } from './useAchievements';

export type ProfileTheme = 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'pink' | 'cyan';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  username_change_count: number;
  profile_theme: ProfileTheme;
  created_at: string;
  referral_code: string | null;
  referral_count: number;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  achievements_unlocked: number;
  total_downloads: number;
  tools_used: number;
  games_played: number;
  days_active: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  achievements_unlocked: number;
  isCurrentUser?: boolean;
}

export function useUserStats() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  const { stats, xpData, unlockedCount } = useAchievements();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await fromTable('profiles')
        .select('id, user_id, display_name, avatar_url, banner_url, bio, username_change_count, created_at, profile_theme, referral_code, referral_count')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const d = data as any;
        setProfile({
          ...d,
          username_change_count: d.username_change_count ?? 0,
          profile_theme: (d.profile_theme as ProfileTheme) || 'purple',
          banner_url: d.banner_url || null,
          bio: d.bio || null,
          referral_code: d.referral_code || null,
          referral_count: d.referral_count ?? 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const syncStats = useCallback(async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      const { error } = await fromTable('user_stats')
        .upsert({
          user_id: user.id,
          total_xp: xpData.totalXP,
          level: xpData.level,
          achievements_unlocked: unlockedCount,
          total_downloads: stats.totalDownloads,
          tools_used: stats.toolsUsed,
          games_played: stats.gamesPlayed,
          days_active: stats.daysActive,
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error syncing stats:', error);
      }
    } catch (error) {
      console.error('Error syncing stats:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, xpData, unlockedCount, stats]);

  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      syncStats();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [xpData.totalXP, unlockedCount, stats.totalDownloads, user]);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!user || !profile) return { success: false, error: 'not_authenticated' };

    if (profile.username_change_count >= 2) {
      return { success: false, error: 'limit_reached' };
    }

    try {
      const { error } = await fromTable('profiles')
        .update({ 
          display_name: displayName,
          username_change_count: profile.username_change_count + 1
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating display name:', error);
        return { success: false, error: 'database_error' };
      }

      setProfile(prev => prev ? { 
        ...prev, 
        display_name: displayName,
        username_change_count: prev.username_change_count + 1
      } : null);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating display name:', error);
      return { success: false, error: 'unknown_error' };
    }
  }, [user, profile]);

  const removeAvatar = useCallback(async () => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.jpeg`]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
      }

      const { error: updateError } = await fromTable('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return false;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: null } : null);
      return true;
    } catch (error) {
      console.error('Error removing avatar:', error);
      return false;
    }
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return null;

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be less than 2MB');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl + '?t=' + Date.now();

      const { error: updateError } = await fromTable('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }, [user]);

  const updateProfileTheme = useCallback(async (theme: ProfileTheme) => {
    if (!user) return false;

    try {
      const { error } = await fromTable('profiles')
        .update({ profile_theme: theme })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile theme:', error);
        return false;
      }

      setProfile(prev => prev ? { ...prev, profile_theme: theme } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile theme:', error);
      return false;
    }
  }, [user]);

  const updateBio = useCallback(async (bio: string) => {
    if (!user) return false;

    try {
      const { error } = await fromTable('profiles')
        .update({ bio: bio || null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating bio:', error);
        return false;
      }

      setProfile(prev => prev ? { ...prev, bio: bio || null } : null);
      return true;
    } catch (error) {
      console.error('Error updating bio:', error);
      return false;
    }
  }, [user]);

  const uploadBanner = useCallback(async (file: File) => {
    if (!user) return null;

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/banner.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const bannerUrl = urlData.publicUrl + '?t=' + Date.now();

      const { error: updateError } = await fromTable('profiles')
        .update({ banner_url: bannerUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      setProfile(prev => prev ? { ...prev, banner_url: bannerUrl } : null);
      return bannerUrl;
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw error;
    }
  }, [user]);

  const removeBanner = useCallback(async () => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([`${user.id}/banner.jpg`, `${user.id}/banner.png`, `${user.id}/banner.webp`, `${user.id}/banner.jpeg`]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
      }

      const { error: updateError } = await fromTable('profiles')
        .update({ banner_url: null })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return false;
      }

      setProfile(prev => prev ? { ...prev, banner_url: null } : null);
      return true;
    } catch (error) {
      console.error('Error removing banner:', error);
      return false;
    }
  }, [user]);

  return {
    user,
    session,
    profile,
    loading,
    syncing,
    syncStats,
    updateDisplayName,
    updateProfileTheme,
    updateBio,
    uploadAvatar,
    removeAvatar,
    uploadBanner,
    removeBanner,
    isAuthenticated: !!user,
    canChangeUsername: profile ? profile.username_change_count < 2 : true,
    usernameChangesRemaining: profile ? 2 - profile.username_change_count : 2,
  };
}

export function useLeaderboard(limit: number = 50) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const { user } = useUserStats();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: statsData, error: statsError } = await fromTable('user_stats')
        .select('user_id, total_xp, level, achievements_unlocked')
        .order('total_xp', { ascending: false })
        .limit(limit);

      if (statsError) {
        console.error('Error fetching leaderboard:', statsError);
        return;
      }

      if (!statsData || statsData.length === 0) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const sdAny = statsData as any[];
      const userIds = sdAny.map((s: any) => s.user_id);
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

      const leaderboardEntries: LeaderboardEntry[] = sdAny.map((stat: any, index: number) => {
        const profileInfo = profilesMap.get(stat.user_id);
        return {
          rank: index + 1,
          user_id: stat.user_id,
          display_name: profileInfo?.display_name || 'Jogador Anônimo',
          avatar_url: profileInfo?.avatar_url || null,
          total_xp: stat.total_xp,
          level: stat.level,
          achievements_unlocked: stat.achievements_unlocked,
          isCurrentUser: user?.id === stat.user_id,
        };
      });

      setEntries(leaderboardEntries);

      if (user) {
        const currentUserEntry = leaderboardEntries.find(e => e.user_id === user.id);
        if (currentUserEntry) {
          setUserRank(currentUserEntry);
        } else {
          const { data: userStats } = await fromTable('user_stats')
            .select('total_xp, level, achievements_unlocked')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userStats) {
            const us = userStats as any;
            const { count } = await fromTable('user_stats')
              .select('*', { count: 'exact', head: true })
              .gt('total_xp', us.total_xp);

            const { data: profileData } = await fromTable('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', user.id)
              .maybeSingle();

            const pd = profileData as any;
            setUserRank({
              rank: (count || 0) + 1,
              user_id: user.id,
              display_name: pd?.display_name || 'Você',
              avatar_url: pd?.avatar_url || null,
              total_xp: us.total_xp,
              level: us.level,
              achievements_unlocked: us.achievements_unlocked,
              isCurrentUser: true,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [limit, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    entries,
    loading,
    userRank,
    refresh: fetchLeaderboard,
  };
}
