import { createFileRoute } from "@tanstack/react-router";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const Route = createFileRoute("/api/public/generate-avatar")({
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
          const {
            style,
            color,
            accessories,
            expression,
            background,
            width,
            height,
            artStyle,
            pose,
            outfit,
            hairStyle,
            customPrompt,
          } = body as Record<string, any>;

          // Build the prompt for avatar generation
          let prompt = "";

          if (customPrompt) {
            prompt = `Create a ${artStyle || "pixel"} art avatar: ${customPrompt}. `;
          } else {
            prompt = `Create a ${artStyle || "pixel"} art avatar of a ${style || "human"} character. `;
            if (color) prompt += `Main color: ${color}. `;
            if (expression) prompt += `Expression: ${expression}. `;
            if (pose) prompt += `Pose: ${pose}. `;
            if (outfit) prompt += `Outfit: ${outfit}. `;
            if (hairStyle) prompt += `Hair style: ${hairStyle}. `;
            if (accessories && Array.isArray(accessories) && accessories.length > 0) {
              prompt += `Accessories: ${accessories.join(", ")}. `;
            }
          }

          if (background === "transparent") {
            prompt += "On a clean solid white background for easy background removal. ";
          }

          prompt += `The image should be ${width || 256}x${height || 256} pixels, high quality, centered character portrait.`;

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
                  content: prompt,
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
                { error: "Limite de requisições excedido. Tente novamente em alguns segundos." },
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
              { error: "Erro ao gerar avatar com IA" },
              { status: 502, headers: corsHeaders() }
            );
          }

          const data = await aiResp.json();
          const imageUrl =
            data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!imageUrl) {
            return Response.json(
              { error: "IA não retornou uma imagem. Tente novamente." },
              { status: 500, headers: corsHeaders() }
            );
          }

          return Response.json(
            { imageUrl },
            { status: 200, headers: corsHeaders() }
          );
        } catch (error: any) {
          console.error("Avatar generation error:", error);
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
