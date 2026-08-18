import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getCachedProfilesCount = createServerFn({ method: "GET" })
  .handler(async () => {
    // Cache de 1 hora para dados estatísticos não críticos
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
      
    if (error) throw error;
    return count || 0;
  });

export const getCachedGamesCount = createServerFn({ method: "GET" })
  .handler(async () => {
    const { count, error } = await supabase
      .from("games_catalog")
      .select("*", { count: "exact", head: true });
      
    if (error) throw error;
    return count || 0;
  });
