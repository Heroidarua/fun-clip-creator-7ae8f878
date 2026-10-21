import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sos01-avatar-gallery';
const MAX_AVATARS = 20;

export interface SavedAvatar {
  id: string;
  imageData: string;
  style: string;
  createdAt: number;
  size: string;
}

export function useAvatarGallery() {
  const [avatars, setAvatars] = useState<SavedAvatar[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
    } catch {
      console.warn('Failed to save avatars to localStorage');
    }
  }, [avatars]);

  const saveAvatar = useCallback((imageData: string, style: string, size: string) => {
    const newAvatar: SavedAvatar = {
      id: `avatar-${Date.now()}`,
      imageData,
      style,
      size,
      createdAt: Date.now(),
    };

    setAvatars(prev => {
      const updated = [newAvatar, ...prev];
      // Limit to MAX_AVATARS to prevent localStorage overflow
      return updated.slice(0, MAX_AVATARS);
    });

    return newAvatar.id;
  }, []);

  const deleteAvatar = useCallback((id: string) => {
    setAvatars(prev => prev.filter(avatar => avatar.id !== id));
  }, []);

  const clearGallery = useCallback(() => {
    setAvatars([]);
  }, []);

  return { avatars, saveAvatar, deleteAvatar, clearGallery };
}
