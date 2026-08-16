import { createFileRoute } from "@tanstack/react-router";
import { 
  igCors, 
  igRateLimit, 
  signTicket, 
  IG_LINK_TTL_SECONDS 
} from "@/lib/instagram-tool.server";
import { ytClientIp } from "@/lib/youtube-tool.server";

const JSON_HEADERS = igCors({ "Content-Type": "application/json" });

export const Route = createFileRoute("/api/instagram/download")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: igCors() }),

      POST: async ({ request }) => {
        try {
          const ip = ytClientIp(request);
          if (!igRateLimit(ip, 12)) {
            return Response.json(
              { success: false, error: "Muitas requisições. Aguarde um instante." },
              { status: 429, headers: JSON_HEADERS },
            );
          }

          const body = await request.json().catch(() => null);
          const mediaUrl = typeof body?.mediaUrl === "string" ? body.mediaUrl.trim() : "";
          const mediaType = body?.mediaType === "video" ? "video" : "image";
          const title = typeof body?.title === "string" ? body.title : "instagram";

          if (!mediaUrl) {
            return Response.json(
              { success: false, error: "URL da mídia é obrigatória." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          // Usamos a lógica de ticket assinada do YouTube para segurança
          // O ticket contém o ID (neste caso a URL encriptada ou o shortcode)
          const token = await signTicket({
            videoId: mediaUrl, // Para o IG, passamos a URL direta no campo videoId do ticket
            type: mediaType === "video" ? "video" : "audio", // Reutilizando o tipo do YouTube (audio para fotos no IG proxy)
            quality: "best",
            title: title,
          });

          return Response.json(
            {
              success: true,
              expiresIn: IG_LINK_TTL_SECONDS,
              downloadUrl: `/api/instagram/file?token=${encodeURIComponent(token)}`,
            },
            { headers: JSON_HEADERS },
          );
        } catch (error) {
          console.error("instagram/download error:", error);
          return Response.json(
            { success: false, error: "Erro ao gerar link de download." },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
