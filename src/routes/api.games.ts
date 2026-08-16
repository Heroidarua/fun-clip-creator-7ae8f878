import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/games")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const u = new URL(request.url);
          const page = parseInt(u.searchParams.get("page") || "1");
          const limit = Math.min(parseInt(u.searchParams.get("limit") || "24"), 100);
          const search = u.searchParams.get("search") || "";
          const category = u.searchParams.get("category") || "Todos";
          const ids = u.searchParams.get("ids");
          const featured = u.searchParams.get("featured") === "true";

          const { fetchGames, fetchFeaturedGames, fetchRecentGames } = await import("@/lib/games.server");

          let result;
          if (featured) {
            result = await fetchFeaturedGames();
          } else if (ids) {
            const idList = ids.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));
            result = await fetchRecentGames(idList);
          } else {
            result = await fetchGames({ page, limit, search, category });
          }

          return Response.json(result, {
            headers: {
              "Cache-Control": "public, max-age=600",
              "Access-Control-Allow-Origin": "*",
            }
          });
        } catch (error: any) {
          return Response.json({ error: error.message }, { status: 500 });
        }
      }
    }
  }
});
