import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ytdebug")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id") || "";
        const { resolveYoutubeCandidates, isDirectMediaUrl } = await import(
          "@/lib/youtube-resolver.server"
        );
        const out: any[] = [];
        for await (const c of resolveYoutubeCandidates(
          `https://www.youtube.com/watch?v=${id}`,
          id,
          "best",
        )) {
          out.push({
            title: c.title,
            muxed: c.muxed,
            video: c.video_url?.slice(0, 90),
            audio: c.audio_url?.slice(0, 90),
            directVideo: isDirectMediaUrl(c.video_url),
            directAudio: isDirectMediaUrl(c.audio_url),
          });
        }
        return Response.json(out);
      },
    },
  },
});
