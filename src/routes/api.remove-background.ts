import { createFileRoute } from "@tanstack/react-router";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const Route = createFileRoute("/api/remove-background")({
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
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json(
              { error: "AI service not configured" },
              { status: 500, headers: corsHeaders() }
            );
          }

          const body = await request.json();
          const { action, image } = body as {
            action?: string;
            image?: string;
          };

          // Handle credits check - just return unlimited since we use AI
          if (action === "check-credits") {
            return Response.json(
              { success: true, credits: 999 },
              { status: 200, headers: corsHeaders() }
            );
          }

          if (!image) {
            return Response.json(
              { error: "Imagem não fornecida" },
              { status: 400, headers: corsHeaders() }
            );
          }

          const imageDataUrl = `data:image/png;base64,${image}`;

          const aiResp = await fetch(LOVABLE_AI_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Remove the background from this image completely. Make the background fully transparent. Keep only the main subject/person/object with clean edges. Return the result as a PNG image with transparent background.",
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: imageDataUrl,
                      },
                    },
                  ],
                },
              ],
              modalities: ["image", "text"],
            }),
          });

          if (!aiResp.ok) {
            const errText = await aiResp.text().catch(() => "Unknown error");
            console.error("AI Gateway error:", aiResp.status, errText);
            if (aiResp.status === 429) {
              return Response.json(
                { error: "Limite de requisições excedido. Tente novamente." },
                { status: 429, headers: corsHeaders() }
              );
            }
            if (aiResp.status === 402) {
              return Response.json(
                { error: "Créditos de IA esgotados." },
                { status: 402, headers: corsHeaders() }
              );
            }
            return Response.json(
              { error: "Erro ao processar imagem com IA" },
              { status: 502, headers: corsHeaders() }
            );
          }

          const data = await aiResp.json();
          const resultImageUrl =
            data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!resultImageUrl) {
            return Response.json(
              { error: "IA não retornou a imagem processada. Tente novamente." },
              { status: 500, headers: corsHeaders() }
            );
          }

          return Response.json(
            {
              success: true,
              result: resultImageUrl,
              method: "ai",
              creditsRemaining: 999,
            },
            { status: 200, headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("Background removal error:", error);
          return Response.json(
            { error: error.message || "Erro interno" },
            { status: 500, headers: corsHeaders() }
          );
        }
      },
    },
  },
});

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
