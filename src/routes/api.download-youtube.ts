import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download-youtube")({
  server: {
    handlers: {
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const url = body?.url?.trim();
          const downloadMode = body?.download === true;

          if (
            !url ||
            (!url.includes("youtube.com") &&
              !url.includes("youtu.be"))
          ) {
            return Response.json(
              { success: false, error: "URL do YouTube inválida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          // Extract video ID
          let videoId = "";
          const longMatch = url.match(
            /[?&]v=([a-zA-Z0-9_-]{11})/
          );
          const shortMatch = url.match(
            /youtu\.be\/([a-zA-Z0-9_-]{11})/
          );
          const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
          const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
          videoId =
            longMatch?.[1] ||
            shortMatch?.[1] ||
            shortsMatch?.[1] ||
            embedMatch?.[1] ||
            "";

          if (!videoId) {
            throw new Error("ID do vídeo não encontrado na URL");
          }

          const rapidKey = process.env.RAPIDAPI_KEY;
          if (!rapidKey) {
            const { reportDownloaderResult } = await import(
              "@/lib/downloader-status.server"
            );
            reportDownloaderResult("youtube", false);
            return Response.json(
              { success: false, error: "RAPIDAPI_KEY não configurada no servidor" },
              { status: 500, headers: corsHeaders() }
            );
          }

          // youtube-media-downloader (RapidAPI) — returns direct googlevideo URLs
          const apiResp = await fetch(
            `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}`,
            {
              headers: {
                "x-rapidapi-host": "youtube-media-downloader.p.rapidapi.com",
                "x-rapidapi-key": rapidKey,
              },
            }
          );

          if (!apiResp.ok) {
            const txt = await apiResp.text().catch(() => "");
            console.error("RapidAPI error:", apiResp.status, txt);
            const { reportDownloaderResult } = await import(
              "@/lib/downloader-status.server"
            );
            reportDownloaderResult("youtube", false);
            return Response.json(
              {
                success: false,
                error: `Falha no provedor (HTTP ${apiResp.status})`,
              },
              { status: 502, headers: corsHeaders() }
            );
          }

          const data: any = await apiResp.json();

          if (data.errorId && data.errorId !== "Success") {
            const { reportDownloaderResult } = await import(
              "@/lib/downloader-status.server"
            );
            reportDownloaderResult("youtube", false);
            return Response.json(
              { success: false, error: data.reason || data.errorId },
              { status: 502, headers: corsHeaders() }
            );
          }

          // Pick best progressive mp4 (has both video+audio). itag 18 = 360p mp4 muxed.
          // RapidAPI returns separated streams; we prefer one with audio codec present.
          const videoItems: any[] = data.videos?.items || [];
          const audioItems: any[] = data.audios?.items || [];

          // Prefer a muxed mp4 (itag 18 / 22) — codecs string includes both avc1 and mp4a
          const muxed = videoItems.find(
            (v) => /mp4a/.test(v.mimeType || "") && v.extension === "mp4"
          );
          // Otherwise: highest quality mp4 video-only
          const bestVideo =
            muxed ||
            videoItems
              .filter((v) => v.extension === "mp4")
              .sort(
                (a, b) =>
                  (b.height || b.quality || 0) - (a.height || a.quality || 0)
              )[0] ||
            videoItems[0];

          // Best m4a/mp4 audio
          const bestAudio =
            audioItems
              .filter((a) => a.extension === "m4a" || a.extension === "mp4")
              .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0] ||
            audioItems[0];

          const videoUrl = bestVideo?.url || "";
          const audioUrl = bestAudio?.url || "";

          const thumbnail =
            (data.thumbnails && data.thumbnails[data.thumbnails.length - 1]?.url) ||
            `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

          const { reportDownloaderResult } = await import(
            "@/lib/downloader-status.server"
          );
          reportDownloaderResult("youtube", Boolean(videoUrl || audioUrl));

          return Response.json(
            {
              success: true,
              data: {
                video_url: videoUrl,
                audio_url: audioUrl,
                thumbnail,
                title: data.title || "YouTube Video",
                author: data.channel?.name || "YouTube",
                duration: data.lengthSeconds || 0,
              },
            },
            { headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("YouTube download error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "Erro ao processar vídeo do YouTube",
            },
            { status: 500, headers: corsHeaders() }
          );
        }
      },
    },
  },
});

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
