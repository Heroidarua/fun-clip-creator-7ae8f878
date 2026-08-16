import { games } from '../data/games';

export type Game = {
  id: number;
  title: string;
  platform?: string;
  src: string;
  img?: string;
};

// Simple in-memory cache for the server
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function getFromCache(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}

function setToCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

function getTypedGames(): Game[] {
  return (games as Game[]) || [];
}

export async function fetchGames({ page = 1, limit = 24, search = '', category = 'Todos' }) {
  const cacheKey = `games-${page}-${limit}-${search}-${category}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const typedGames = getTypedGames();
  let filtered = [...typedGames];

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((g: Game) => 
      g.title.toLowerCase().includes(q) || 
      (g.platform && g.platform.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category !== 'Todos') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((g: Game) => {
      const t = g.title.toLowerCase();
      if (catLower === 'luta' && /(kombat|fighter|tekken|smash|vs\.|vs |kof|jojo|chaos)/.test(t)) return true;
      if (catLower === 'plataforma' && /(mario|sonic|kong|bomberman|kidd|mickey|donald|dizzy|picapau|monica|pocahontas|luigi|yoshi|rockman)/.test(t)) return true;
      if (catLower === 'corrida' && /(kart|top gear|gp rider|rider)/.test(t)) return true;
      if (catLower === 'tiro' && /(1941|asteroids|duck hunt|battle city|popeye)/.test(t)) return true;
      if (catLower === 'ação' && /(metal slug|spider|mask|power rangers|x-men|simpsons|alien|justice|dragonball|flintstones|saga|gta|theft)/.test(t)) return true;
      if (catLower === 'arcade' && !/(kombat|fighter|tekken|smash|vs\.|vs |kof|jojo|chaos|mario|sonic|kong|bomberman|kidd|mickey|donald|dizzy|picapau|monica|pocahontas|luigi|yoshi|rockman|kart|top gear|gp rider|rider|1941|asteroids|duck hunt|battle city|popeye|metal slug|spider|mask|power rangers|x-men|simpsons|alien|justice|dragonball|flintstones|saga|gta|theft)/.test(t)) return true;
      return false;
    });
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  const result = {
    items,
    total,
    page,
    limit,
    hasMore: start + limit < total
  };

  setToCache(cacheKey, result);
  return result;
}

export async function fetchGameById(id: number) {
  const cacheKey = `game-${id}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const typedGames = getTypedGames();
  const game = typedGames.find((g: Game) => g.id === id);
  if (game) {
    setToCache(cacheKey, game);
  }
  return game;
}

export async function fetchFeaturedGames() {
  const cacheKey = 'featured-games';
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const featuredIds = [1, 2, 6, 20, 7, 23, 22, 17, 14, 33, 50, 4];
  const typedGames = getTypedGames();
  const items = typedGames.filter((g: Game) => featuredIds.includes(g.id));
  
  setToCache(cacheKey, items);
  return items;
}

export async function fetchRecentGames(ids: number[]) {
  const typedGames = getTypedGames();
  return typedGames.filter((g: Game) => ids.includes(g.id)).slice(0, 12);
}
