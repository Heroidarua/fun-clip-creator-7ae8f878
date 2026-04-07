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
          videoId = longMatch?.[1] || shortMatch?.[1] || "";

          if (!videoId) {
            throw new Error("ID do vídeo não encontrado na URL");
          }

          // Try cobalt.tools API (free, no key needed)
          const cobaltResp = await fetch("https://api.cobalt.tools/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              url: `https://www.youtube.com/watch?v=${videoId}`,
              videoQuality: "720",
              filenameStyle: "basic",
            }),
          });

          if (cobaltResp.ok) {
            const cobaltData = await cobaltResp.json();
            if (cobaltData.url || cobaltData.status === "redirect" || cobaltData.status === "stream") {
              const dlUrl = cobaltData.url || cobaltData.stream?.url;
              if (dlUrl) {
                // Get video info from oEmbed
                const info = await getYouTubeInfo(videoId);

                return Response.json(
                  {
                    success: true,
                    data: {
                      video_url: dlUrl,
                      audio_url: "",
                      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                      title: info.title || "YouTube Video",
                      author: info.author || "YouTube",
                      duration: 0,
                    },
                  },
                  { headers: corsHeaders() }
                );
              }
            }
          }

          // Fallback: try y2mate-style API
          const fallbackResp = await fetch(
            `https://yt-api.p.rapidapi.com/dl?id=${videoId}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
            }
          );

          // If all APIs fail, return video info with thumbnail so user at least sees the video
          const info = await getYouTubeInfo(videoId);

          if (fallbackResp.ok) {
            const fbData = await fallbackResp.json();
            if (fbData.formats?.length > 0) {
              const videoFormat =
                fbData.formats.find(
                  (f: any) => f.qualityLabel?.includes("720")
                ) || fbData.formats[0];

              return Response.json(
                {
                  success: true,
                  data: {
                    video_url: videoFormat.url,
                    audio_url: "",
                    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                    title: fbData.title || info.title || "YouTube Video",
                    author: fbData.channelTitle || info.author || "YouTube",
                    duration: 0,
                  },
                },
                { headers: corsHeaders() }
              );
            }
          }

          // Return info-only response
          return Response.json(
            {
              success: true,
              data: {
                video_url: "",
                audio_url: "",
                thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                title: info.title || "YouTube Video",
                author: info.author || "YouTube",
                duration: 0,
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

async function getYouTubeInfo(
  videoId: string
): Promise<{ title: string; author: string }> {
  try {
    const resp = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (resp.ok) {
      const data = await resp.json();
      return {
        title: data.title || "",
        author: data.author_name || "",
      };
    }
  } catch {}
  return { title: "", author: "" };
}

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
