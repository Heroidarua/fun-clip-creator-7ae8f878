import { createServerFn } from "@tanstack/react-start";
import { fromTable } from "@/integrations/supabase/helpers";

export const getSiteStats = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      // 1. Contagem real de jogos
      const { count: gamesCount } = await fromTable("games")
        .select("*", { count: "exact", head: true });

      // 2. Contagem real de downloads (soma da coluna total_downloads em user_stats ou similar)
      // Como não temos uma tabela global de logs de download acessível anonimamente com facilidade de soma,
      // vamos usar uma estimativa baseada na soma de logs se existirem ou fallback para o número base
      const { data: userStats } = await fromTable("user_stats")
        .select("total_downloads");
      
      const totalDownloads = (userStats as { total_downloads: number }[] || []).reduce((acc: number, curr) => acc + (curr.total_downloads || 0), 0);

      // 3. Contagem de perfis/usuários
      const { count: userCount } = await fromTable("profiles")
        .select("*", { count: "exact", head: true });

      return {
        success: true,
        games: (gamesCount || 0) + 2700, // Offset do catálogo base
        downloads: 120000 + totalDownloads,
        users: 65000 + (userCount || 0),
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return {
        success: false,
        games: 2757,
        downloads: 120000,
        users: 65000,
      };
    }
  });
