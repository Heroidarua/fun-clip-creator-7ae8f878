import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download-kwai")({
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
          let url = body?.url?.trim();

          if (!url || (!url.includes("kwai.com") && !url.includes("kw.ai"))) {
            return Response.json(
              { success: false, error: "URL do Kwai inválida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          // Expand short URLs
          if (url.includes("kw.ai") || url.includes("s.kwai.com")) {
            try {
              const expandResp = await fetch(url, {
                method: "HEAD",
                redirect: "follow",
                headers: {
                  "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
              });
              if (expandResp.url) {
                url = expandResp.url;
              }
            } catch {
              // Continue with original URL
            }
          }

          // Extract video ID from Kwai URL
          const videoIdMatch = url.match(
            /(?:video|p)\/([a-zA-Z0-9_-]+)/
          );

          // Try using Kwai's internal API
          const apiResp = await fetch(
            "https://www.kwai.com/rest/n/feed/hot?count=1",
            {
              method: "POST",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36",
                "Content-Type": "application/json",
                Referer: url,
              },
              body: JSON.stringify({ url }),
            }
          );

          // Fallback: try to scrape the page directly
          const pageResp = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
              Accept: "text/html,application/xhtml+xml",
            },
          });

          if (!pageResp.ok) {
            throw new Error("Não foi possível acessar o vídeo do Kwai");
          }

          const html = await pageResp.text();

          // Try to extract video URL from page HTML
          let videoUrl = "";
          let title = "";
          let author = "";
          let thumbnail = "";

          // Look for video URL in meta tags or script data
          const ogVideoMatch = html.match(
            /property="og:video(?::url)?"\s+content="([^"]+)"/
          );
          const ogTitleMatch = html.match(
            /property="og:title"\s+content="([^"]+)"/
          );
          const ogImageMatch = html.match(
            /property="og:image"\s+content="([^"]+)"/
          );
          const ogDescMatch = html.match(
            /property="og:description"\s+content="([^"]+)"/
          );

          if (ogVideoMatch) videoUrl = ogVideoMatch[1];
          if (ogTitleMatch) title = ogTitleMatch[1];
          if (ogImageMatch) thumbnail = ogImageMatch[1];

          // Also try finding video URL in JSON data embedded in page
          if (!videoUrl) {
            const jsonMatch = html.match(
              /"playUrl"\s*:\s*"([^"]+)"/
            );
            if (jsonMatch) {
              videoUrl = jsonMatch[1].replace(/\\u002F/g, "/");
            }
          }

          if (!videoUrl) {
            const srcMatch = html.match(
              /src="(https?:\/\/[^"]*\.mp4[^"]*)"/
            );
            if (srcMatch) videoUrl = srcMatch[1];
          }

          if (!videoUrl) {
            throw new Error(
              "Não foi possível extrair o vídeo do Kwai. Tente outro link."
            );
          }

          return Response.json(
            {
              success: true,
              data: {
                video_url: videoUrl,
                thumbnail: thumbnail,
                title: title || "Kwai Video",
                author: author || "Kwai",
                duration: 0,
              },
            },
            { headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("Kwai download error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "Erro ao processar vídeo do Kwai",
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
