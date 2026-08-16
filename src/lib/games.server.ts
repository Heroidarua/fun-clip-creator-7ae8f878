// Dynamic import to avoid module issues during build
// import { games } from '../data/games';

export type Game = {
  id: number;
  title: string;
  platform?: string;
  src: string;
  img?: string;
};

// Global index for faster filtering
let gamesIndex: Game[] | null = null;
const categoryCache = new Map<string, Game[]>();

// Simple in-memory cache for the server
const resultCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // Aumentado para 24 horas (otimização rígida)

function getFromCache(key: string) {
  const cached = resultCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}

function setToCache(key: string, data: any) {
  resultCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function getTypedGames(): Promise<Game[]> {
  if (gamesIndex) return gamesIndex;
  try {
    // @ts-ignore - dynamic import for large data file to avoid build-time OOM/Type recursion
    const dataModule = await import('../data/games');
    gamesIndex = (dataModule.games as Game[]) || [];
    return gamesIndex;
  } catch (error) {
    console.error('Error loading games data:', error);
    return [];
  }
}

const CATEGORY_REGEX = {
  luta: /(kombat|fighter|tekken|smash|vs\.|vs |kof|jojo|chaos)/i,
  plataforma: /(mario|sonic|kong|bomberman|kidd|mickey|donald|dizzy|picapau|monica|pocahontas|luigi|yoshi|rockman)/i,
  corrida: /(kart|top gear|gp rider|rider)/i,
  tiro: /(1941|asteroids|duck hunt|battle city|popeye)/i,
  acao: /(metal slug|spider|mask|power rangers|x-men|simpsons|alien|justice|dragonball|flintstones|saga|gta|theft)/i,
  // Arcade is everything else
};

function getCategoryGames(allGames: Game[], category: string): Game[] {
  const catLower = category.toLowerCase();
  // Normalize acao category
  const targetCat = catLower === 'ação' ? 'acao' : catLower;
  
  if (targetCat === 'todos') return allGames;
  
  if (categoryCache.has(targetCat)) {
    return categoryCache.get(targetCat)!;
  }

  let filtered: Game[] = [];
  if (targetCat === 'arcade') {
    const allRegex = new RegExp(
      Object.values(CATEGORY_REGEX).map(r => r.source).join('|'),
      'i'
    );
    filtered = allGames.filter(g => !allRegex.test(g.title));
  } else {
    const regex = CATEGORY_REGEX[targetCat as keyof typeof CATEGORY_REGEX];
    if (regex) {
      filtered = allGames.filter(g => regex.test(g.title));
    } else {
      filtered = allGames;
    }
  }

  categoryCache.set(targetCat, filtered);
  return filtered;
}

export async function fetchGames({ page = 1, limit = 24, search = '', category = 'Todos' }) {
  const cacheKey = `games-${page}-${limit}-${search}-${category}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const allGames = await getTypedGames();
  let filtered = getCategoryGames(allGames, category);

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((g: Game) => 
      g.title.toLowerCase().includes(q) || 
      (g.platform && g.platform.toLowerCase().includes(q))
    );
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

  const typedGames = await getTypedGames();
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
  const typedGames = await getTypedGames();
  const items = typedGames.filter((g: Game) => featuredIds.includes(g.id));
  
  setToCache(cacheKey, items);
  return items;
}

export async function fetchRecentGames(ids: number[]) {
  const typedGames = await getTypedGames();
  // Optimized filtering for IDs
  const idSet = new Set(ids);
  return typedGames.filter((g: Game) => idSet.has(g.id)).slice(0, 12);
}

export async function clearGamesCache() {
  categoryCache.clear();
  resultCache.clear();
}