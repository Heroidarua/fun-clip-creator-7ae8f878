import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, isCrossOrigin, isRateLimited } from "@/lib/admin-auth.server";

const MAX_BYTES = 5 * 1024 * 1024;

export const Route = createFileRoute("/api/remove-bg")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }) => {
        const headers = corsHeaders(request);
        try {
          if (isCrossOrigin(request)) {
            return Response.json({ error: "Origem não permitida" }, { status: 403, headers });
          }
          if (isRateLimited(request)) {
            return Response.json(
              { error: "Muitas tentativas. Aguarde um minuto." },
              { status: 429, headers }
            );
          }

          const apiKey = process.env.REMOVE_BG_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "Serviço indisponível no momento." },
              { status: 503, headers }
            );
          }

          const incoming = await request.formData();
          const image = incoming.get("image");
          if (!(image instanceof File)) {
            return Response.json({ error: "Imagem não enviada" }, { status: 400, headers });
          }
          if (!image.type.startsWith("image/")) {
            return Response.json({ error: "Formato inválido" }, { status: 400, headers });
          }
          if (image.size > MAX_BYTES) {
            return Response.json({ error: "Imagem maior que 5MB" }, { status: 413, headers });
          }

          const payload = new FormData();
          payload.append("image_file", image, image.name || "image.png");
          payload.append("size", "auto");
          payload.append("format", "png");

          const response = await fetch("https://api.remove.bg/v1.0/removebg", {
            method: "POST",
            headers: { "X-Api-Key": apiKey },
            body: payload,
          });

          if (!response.ok) {
            const detail = await response.text();
            console.error("remove.bg error", response.status, detail.slice(0, 300));
            const message =
              response.status === 402
                ? "Créditos do remove.bg esgotados."
                : response.status === 403
                  ? "Chave do remove.bg inválida."
                  : "Falha ao remover o fundo pela API.";
            return Response.json({ error: message }, { status: 502, headers });
          }

          const png = await response.arrayBuffer();
          return new Response(png, {
            status: 200,
            headers: { ...headers, "Content-Type": "image/png", "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("remove-bg handler error", error);
          return Response.json({ error: "Erro inesperado" }, { status: 500, headers });
        }
      },
    },
  },
});