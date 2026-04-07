import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/download-instagram")({
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

          if (!url || !url.includes("instagram.com")) {
            return Response.json(
              { success: false, error: "URL do Instagram inválida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          // Use saveig/snapinsta-style API
          const apiResp = await fetch(
            "https://v3.saveig.app/api/ajaxSearch",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Origin: "https://saveig.app",
                Referer: "https://saveig.app/",
              },
              body: `q=${encodeURIComponent(url)}&t=media&lang=en`,
            }
          );

          if (!apiResp.ok) {
            throw new Error(`API returned ${apiResp.status}`);
          }

          const json = await apiResp.json();

          if (json.status !== "ok" || !json.data) {
            throw new Error("Não foi possível processar a mídia do Instagram");
          }

          // Parse the HTML response to extract download links
          const html = json.data;
          const downloadLinks = extractLinksFromHtml(html);

          if (downloadLinks.length === 0) {
            throw new Error("Nenhum link de download encontrado");
          }

          if (downloadLinks.length === 1) {
            const item = downloadLinks[0];
            return Response.json(
              {
                success: true,
                data: {
                  media_url: item.url,
                  media_type: item.type,
                  thumbnail: item.thumb || "",
                  title: "Instagram Media",
                  author: "Instagram",
                  proxy_url: item.url,
                  is_carousel: false,
                },
              },
              { headers: corsHeaders() }
            );
          }

          // Carousel
          return Response.json(
            {
              success: true,
              data: {
                media_url: downloadLinks[0].url,
                media_type: downloadLinks[0].type,
                thumbnail: downloadLinks[0].thumb || "",
                title: "Instagram Carrossel",
                author: "Instagram",
                proxy_url: downloadLinks[0].url,
                is_carousel: true,
                carousel_items: downloadLinks.map((item, i) => ({
                  index: i,
                  media_url: item.url,
                  media_type: item.type,
                  thumbnail: item.thumb || "",
                  proxy_url: item.url,
                })),
              },
            },
            { headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("Instagram download error:", error);
          return Response.json(
            {
              success: false,
              error: error.message || "Erro ao processar mídia do Instagram",
            },
            { status: 500, headers: corsHeaders() }
          );
        }
      },
    },
  },
});

interface DownloadLink {
  url: string;
  type: "video" | "image";
  thumb?: string;
}

function extractLinksFromHtml(html: string): DownloadLink[] {
  const links: DownloadLink[] = [];

  // Match download-image links with href
  const downloadRegex =
    /href="([^"]+)"[^>]*class="[^"]*download-image[^"]*"/g;
  let match;

  while ((match = downloadRegex.exec(html)) !== null) {
    const href = match[1];
    const isVideo = href.includes(".mp4") || html.includes("video");
    links.push({
      url: href,
      type: isVideo ? "video" : "image",
    });
  }

  // Also try reverse pattern: class before href
  const reverseRegex =
    /class="[^"]*download-image[^"]*"[^>]*href="([^"]+)"/g;
  while ((match = reverseRegex.exec(html)) !== null) {
    const href = match[1];
    if (!links.some((l) => l.url === href)) {
      links.push({
        url: href,
        type: href.includes(".mp4") ? "video" : "image",
      });
    }
  }

  // Fallback: try to find any download links
  if (links.length === 0) {
    const anyLinkRegex = /href="(https?:\/\/[^"]+\.(mp4|jpg|jpeg|png)[^"]*)"/g;
    while ((match = anyLinkRegex.exec(html)) !== null) {
      links.push({
        url: match[1],
        type: match[2] === "mp4" ? "video" : "image",
      });
    }
  }

  return links;
}

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
