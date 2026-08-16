import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

// Anti-abuse: per-IP rate limit so anonymous users cannot drain AI credits.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(req: Request): boolean {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

const str = (v: unknown, max = 120): string =>
  typeof v === "string" ? v.replace(/[\r\n]+/g, " ").slice(0, max) : "";


async function requireUser(req: Request): Promise<{ id: string } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) return null;
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  const user = await resp.json().catch(() => null);
  return user?.id ? { id: user.id } : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await requireUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária para usar as ferramentas de IA." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isRateLimited(req)) {
      return new Response(
        JSON.stringify({ error: "Muitas requisições. Aguarde um minuto e tente novamente." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    const safeArtStyle = str(artStyle, 40) || "pixel";
    if (customPrompt) {
      prompt = `Create a ${safeArtStyle} art avatar: ${str(customPrompt, 500)}. `;
    } else {
      prompt = `Create a ${safeArtStyle} art avatar of a ${str(style, 40) || "human"} character. `;
      if (color) prompt += `Main color: ${str(color, 40)}. `;
      if (expression) prompt += `Expression: ${str(expression, 40)}. `;
      if (pose) prompt += `Pose: ${str(pose, 40)}. `;
      if (outfit) prompt += `Outfit: ${str(outfit, 60)}. `;
      if (hairStyle) prompt += `Hair style: ${str(hairStyle, 40)}. `;
      if (Array.isArray(accessories) && accessories.length > 0) {
        prompt += `Accessories: ${accessories.slice(0, 8).map((a) => str(a, 30)).filter(Boolean).join(", ")}. `;
      }
    }

    if (background === "transparent") {
      prompt += "On a clean solid white background for easy background removal. ";
    }

    const w = Math.min(Math.max(Number(width) || 256, 64), 1024);
    const h = Math.min(Math.max(Number(height) || 256, 64), 1024);
    prompt += `The image should be ${w}x${h} pixels, high quality, centered character portrait.`;

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