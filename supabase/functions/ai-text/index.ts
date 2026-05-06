import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, prompt, text, targetLanguage } = body as {
      action?: string;
      prompt?: string;
      text?: string;
      targetLanguage?: string;
    };

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Ação não especificada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt = "";
    let userContent = "";

    switch (action) {
      case "generate":
        if (!prompt || prompt.length < 1 || prompt.length > 5000) {
          return new Response(
            JSON.stringify({ error: "Prompt inválido (1-5000 caracteres)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        systemPrompt =
          "Você é um assistente criativo que gera textos em português brasileiro. Seja criativo, útil e engajante. Responda diretamente sem introduções desnecessárias.";
        userContent = prompt;
        break;

      case "summarize":
        if (!text || text.length < 10 || text.length > 10000) {
          return new Response(
            JSON.stringify({ error: "Texto inválido (10-10000 caracteres)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        systemPrompt =
          "Você é um assistente especializado em resumir textos. Crie resumos concisos e informativos em português brasileiro, mantendo os pontos principais.";
        userContent = `Resuma o seguinte texto:\n\n${text}`;
        break;

      case "translate": {
        if (!text || text.length < 1 || text.length > 10000) {
          return new Response(
            JSON.stringify({ error: "Texto inválido (1-10000 caracteres)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const lang = targetLanguage || "Inglês";
        systemPrompt = `Você é um tradutor profissional. Traduza o texto para ${lang}. Retorne APENAS a tradução, sem explicações.`;
        userContent = text;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Ação não reconhecida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos nas configurações." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(aiResp.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("AI text error:", error);
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});