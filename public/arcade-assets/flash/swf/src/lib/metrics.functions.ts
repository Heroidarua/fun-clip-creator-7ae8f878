import { createServerFn } from "@tanstack/react-start";
import { fromTable } from "@/integrations/supabase/helpers";

// In-memory cache for stats to reduce TTFB and Supabase calls
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export const getSiteStats = createServerFn({ method: "GET" })
  .handler(async () => {
    // Return cached data if valid
    if (statsCache && (Date.now() - statsCache.timestamp) < CACHE_TTL) {
      return statsCache.data;
    }

    try {
      // Parallelize Supabase requests
      const [gamesRes, userStatsRes, profilesRes] = await Promise.all([
        fromTable("games").select("*", { count: "exact", head: true }),
        fromTable("user_stats").select("total_downloads"),
        fromTable("profiles").select("*", { count: "exact", head: true })
      ]);

      const totalDownloads = (userStatsRes.data as { total_downloads: number }[] || []).reduce(
        (acc: number, curr) => acc + (curr.total_downloads || 0), 0
      );

      const stats = {
        success: true,
        games: (gamesRes.count || 0) + 2700,
        downloads: 120000 + totalDownloads,
        users: 65000 + (profilesRes.count || 0),
      };

      // Update cache
      statsCache = { data: stats, timestamp: Date.now() };

      return stats;
    } catch (error) {
      console.error("Error fetching stats:", error);
      const fallback = {
        success: false,
        games: 2757,
        downloads: 120000,
        users: 65000,
      };
      return fallback;
    }
  });
