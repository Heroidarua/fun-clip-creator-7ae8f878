import { createFileRoute } from "@tanstack/react-router";

interface ArchiveFile {
  name?: string;
  format?: string;
  size?: string;
  source?: string;
}

const PLAYABLE = /\.(mp4|m4v|webm|ogv)$/i;

export const Route = createFileRoute("/api/player-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = (url.searchParams.get("id") ?? "").replace(/[^A-Za-z0-9._-]/g, "").slice(0, 120);
        if (!id) {
          return Response.json({ success: false, error: "Identificador inválido." }, { status: 400 });
        }

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 9000);
          const res = await fetch(`https://archive.org/metadata/${encodeURIComponent(id)}`, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          clearTimeout(timeout);

          if (!res.ok) {
            return Response.json({ success: false, error: "Mídia indisponível." }, { status: 502 });
          }

          const json = (await res.json()) as { files?: ArchiveFile[]; metadata?: { title?: string } };
          const files = (json.files ?? []).filter((f) => f.name && PLAYABLE.test(f.name));

          // Prioriza MP4 (melhor compatibilidade) e o maior arquivo disponível.
          const best = files
            .sort((a, b) => {
              const mp4 = (f: ArchiveFile) => (/\.(mp4|m4v)$/i.test(f.name ?? "") ? 1 : 0);
              if (mp4(b) !== mp4(a)) return mp4(b) - mp4(a);
              return Number(b.size ?? 0) - Number(a.size ?? 0);
            })[0];

          if (!best?.name) {
            return Response.json({ success: false, error: "Nenhum vídeo compatível encontrado." }, { status: 404 });
          }

          return Response.json(
            {
              success: true,
              title: json.metadata?.title ?? id,
              src: `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(best.name)}`,
            },
            { headers: { "Cache-Control": "public, max-age=1800" } },
          );
        } catch {
          return Response.json({ success: false, error: "Tempo esgotado ao carregar a mídia." }, { status: 504 });
        }
      },
    },
  },
});
