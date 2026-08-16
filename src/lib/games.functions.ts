import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PAGE_SIZE = 24;

export const getPagedGames = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        page: z.number().default(0),
        category: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { page, category, search } = data;
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabaseAdmin
      .from("games")
      .select("id, external_id, title, platform, src, img, category", { count: "exact" });

    if (category && category !== "Todos") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: games, count, error } = await query
      .order("id", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      games: games || [],
      totalCount: count || 0,
      pageSize: PAGE_SIZE,
      hasMore: (count || 0) > to + 1,
    };
  });
