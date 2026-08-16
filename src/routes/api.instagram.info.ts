import { createFileRoute } from "@tanstack/react-router";
import { igCors, igRateLimit } from "@/lib/instagram-tool.server";
import { ytClientIp } from "@/lib/youtube-tool.server";

const JSON_HEADERS = igCors({ "Content-Type": "application/json" });

export const Route = createFileRoute("/api/instagram/info")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: igCors() }),

      POST: async ({ request }) => {
        try {
          const ip = ytClientIp(request);
          if (!igRateLimit(ip)) {
            return Response.json(
              { success: false, error: "Muitas requisições. Aguarde um instante." },
              { status: 429, headers: JSON_HEADERS },
            );
          }

          const body = await request.json().catch(() => null);
          const url = typeof body?.url === "string" ? body.url.trim() : "";

          if (!url || !url.includes("instagram.com") && !url.includes("instagr.am")) {
            return Response.json(
              { success: false, error: "Informe uma URL válida do Instagram." },
              { status: 400, headers: JSON_HEADERS },
            );
          }

          const { resolveInstagram } = await import("@/lib/instagram-resolver.server");
          const rapidApiKey = process.env.RAPIDAPI_KEY || "";
          const result = await resolveInstagram(url, rapidApiKey);

          if (!result.success || !result.data) {
            return Response.json(
              { success: false, error: result.error || "Conteúdo não encontrado ou privado." },
              { status: 404, headers: JSON_HEADERS },
            );
          }

          return Response.json({ success: true, ...result.data }, { headers: JSON_HEADERS });
        } catch (error) {
          console.error("instagram/info error:", error);
          return Response.json(
            { success: false, error: "Erro interno ao processar o link." },
            { status: 500, headers: JSON_HEADERS },
          );
        }
      },
    },
  },
});
