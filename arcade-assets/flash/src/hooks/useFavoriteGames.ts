import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sos01-favorite-games';

export function useFavoriteGames() {
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      console.warn('Failed to save favorites to localStorage');
    }
  }, [favorites]);

  const toggleFavorite = useCallback((gameId: number) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  }, []);

  const isFavorite = useCallback((gameId: number) => {
    return favorites.includes(gameId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
