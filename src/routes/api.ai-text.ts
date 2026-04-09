import { createFileRoute } from "@tanstack/react-router";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const Route = createFileRoute("/api/ai-text")({
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
          const { action, prompt, text, targetLanguage } = body as {
            action?: string;
            prompt?: string;
            text?: string;
            targetLanguage?: string;
          };

          if (!action) {
            return Response.json(
              { error: "Ação não especificada" },
              { status: 400, headers: corsHeaders() }
            );
          }

          let systemPrompt = "";
          let userContent = "";

          switch (action) {
            case "generate":
              if (!prompt || prompt.length < 1 || prompt.length > 5000) {
                return Response.json(
                  { error: "Prompt inválido (1-5000 caracteres)" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              systemPrompt =
                "Você é um assistente criativo que gera textos em português brasileiro. Seja criativo, útil e engajante. Responda diretamente sem introduções desnecessárias.";
              userContent = prompt;
              break;

            case "summarize":
              if (!text || text.length < 10 || text.length > 10000) {
                return Response.json(
                  { error: "Texto inválido (10-10000 caracteres)" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              systemPrompt =
                "Você é um assistente especializado em resumir textos. Crie resumos concisos e informativos em português brasileiro, mantendo os pontos principais.";
              userContent = `Resuma o seguinte texto:\n\n${text}`;
              break;

            case "translate":
              if (!text || text.length < 1 || text.length > 10000) {
                return Response.json(
                  { error: "Texto inválido (1-10000 caracteres)" },
                  { status: 400, headers: corsHeaders() }
                );
              }
              const lang = targetLanguage || "Inglês";
              systemPrompt = `Você é um tradutor profissional. Traduza o texto para ${lang}. Retorne APENAS a tradução, sem explicações.`;
              userContent = text;
              break;

            default:
              return Response.json(
                { error: "Ação não reconhecida" },
                { status: 400, headers: corsHeaders() }
              );
          }

          const aiResp = await fetch(LOVABLE_AI_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent },
              ],
              stream: true,
              max_tokens: 2048,
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
                { error: "Créditos de IA esgotados. Adicione créditos nas configurações." },
                { status: 402, headers: corsHeaders() }
              );
            }
            return Response.json(
              { error: "Erro ao processar com IA" },
              { status: 502, headers: corsHeaders() }
            );
          }

          // Stream the response back
          return new Response(aiResp.body, {
            status: 200,
            headers: {
              ...corsHeaders(),
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (error: any) {
          console.error("AI text error:", error);
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
