import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download-tiktok")({
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

          if (!url || !url.includes("tiktok.com")) {
            return Response.json(
              { success: false, error: "URL do TikTok inválida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          // Try tikwm.com API
          const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
          const resp = await fetch(apiUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Accept: "application/json",
            },
          });

          if (!resp.ok) {
            throw new Error(`API returned ${resp.status}`);
          }

          const json = await resp.json();

          if (json.code !== 0 || !json.data) {
            throw new Error(json.msg || "Falha ao processar vídeo");
          }

          const d = json.data;
          const baseUrl = "https://www.tikwm.com";

          return Response.json(
            {
              success: true,
              data: {
                video_urls: {
                  hd: d.hdplay ? `${baseUrl}${d.hdplay}` : `${baseUrl}${d.play}`,
                  sd: `${baseUrl}${d.play}`,
                  watermark: d.wmplay ? `${baseUrl}${d.wmplay}` : "",
                },
                audio_url: d.music ? `${baseUrl}${d.music}` : "",
                title: d.title || "TikTok Video",
                author: d.author?.nickname || d.author?.unique_id || "Unknown",
                duration: d.duration || 0,
                thumbnail: d.cover ? `${baseUrl}${d.cover}` : d.origin_cover || "",
              },
            },
            { headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("TikTok download error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "Erro ao processar vídeo do TikTok",
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
