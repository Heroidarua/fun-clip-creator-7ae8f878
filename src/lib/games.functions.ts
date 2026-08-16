import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getGames = createServerFn({ method: "GET" })
  .inputValidator((data: any) => z.object({
    page: z.number().default(1),
    limit: z.number().max(100).default(24),
    search: z.string().optional(),
    category: z.string().default("Todos")
  }).parse(data))
  .handler(async ({ data }) => {
    const { fetchGames } = await import("./games.server");
    return fetchGames(data);
  });

export const getFeaturedGames = createServerFn({ method: "GET" })
  .handler(async () => {
    const { fetchFeaturedGames } = await import("./games.server");
    return fetchFeaturedGames();
  });

export const getRecentGames = createServerFn({ method: "POST" })
  .inputValidator((data: any) => z.object({
    ids: z.array(z.number())
  }).parse(data))
  .handler(async ({ data }) => {
    const { fetchRecentGames } = await import("./games.server");
    return fetchRecentGames(data.ids);
  });

export const getGameById = createServerFn({ method: "GET" })
  .inputValidator((id: any) => z.number().parse(id))
  .handler(async ({ data }) => {
    const { fetchGameById } = await import("./games.server");
    return fetchGameById(data);
  });
