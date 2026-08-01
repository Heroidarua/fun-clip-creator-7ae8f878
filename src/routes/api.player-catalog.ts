import { createFileRoute } from "@tanstack/react-router";

const ARCHIVE_SEARCH = "https://archive.org/advancedsearch.php";

interface CatalogItem {
  id: string;
  title: string;
  year?: number;
  thumb: string;
}

interface ArchiveDoc {
  identifier?: string;
  title?: string;
  year?: number;
}

function sanitizeQuery(raw: string | null): string {
  if (!raw) return "";
  return raw.replace(/[^\p{L}\p{N}\s\-:'.]/gu, "").trim().slice(0, 80);
}

export const Route = createFileRoute("/api/player-catalog")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const term = sanitizeQuery(url.searchParams.get("q"));
        const page = Math.min(20, Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1));

        const query = [
          "mediatype:movies",
          "collection:(feature_films OR classic_cartoons OR moviesandfilms)",
          term ? `title:(${term})` : "",
        ]
          .filter(Boolean)
          .join(" AND ");

        const search = new URL(ARCHIVE_SEARCH);
        search.searchParams.set("q", query);
        for (const field of ["identifier", "title", "year"]) {
          search.searchParams.append("fl[]", field);
        }
        search.searchParams.append("sort[]", term ? "downloads desc" : "downloads desc");
        search.searchParams.set("rows", "24");
        search.searchParams.set("page", String(page));
        search.searchParams.set("output", "json");

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 9000);
          const res = await fetch(search.toString(), {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          clearTimeout(timeout);

          if (!res.ok) {
            return Response.json({ success: false, items: [] as CatalogItem[] }, { status: 502 });
          }

          const json = (await res.json()) as { response?: { docs?: ArchiveDoc[] } };
          const items: CatalogItem[] = (json.response?.docs ?? [])
            .filter((doc): doc is ArchiveDoc & { identifier: string } => Boolean(doc.identifier))
            .map((doc) => ({
              id: doc.identifier,
              title: doc.title ?? doc.identifier,
              year: typeof doc.year === "number" ? doc.year : undefined,
              thumb: `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,
            }));

          return Response.json(
            { success: true, items },
            { headers: { "Cache-Control": "public, max-age=1800" } },
          );
        } catch {
          return Response.json({ success: false, items: [] as CatalogItem[] }, { status: 504 });
        }
      },
    },
  },
});
