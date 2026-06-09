import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
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
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Erro ao gerar avatar com IA" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await aiResp.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "IA não retornou uma imagem. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Avatar generation error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao gerar avatar" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});