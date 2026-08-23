import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders, isCrossOrigin, isRateLimited } from "@/lib/admin-auth.server";

const MODELS = ["openai", "openai-fast"];
const FREE_TEXT_API = "https://text.pollinations.ai/openai";

function extractContent(payload: unknown): string {
  const choice = (payload as { choices?: Array<{ message?: { content?: unknown } }> })
    ?.choices?.[0];
  const content = choice?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : (part as { text?: string })?.text ?? ""))
      .join("")
      .trim();
  }
  return "";
}

export const Route = createFileRoute("/api/free-text")({
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
          if (await isRateLimited(request)) {
            return Response.json(
              { error: "Muitas tentativas. Aguarde um minuto." },
              { status: 429, headers }
            );
          }

          const body = (await request.json()) as { prompt?: string; system?: string };
          const prompt = (body.prompt ?? "").trim().slice(0, 4000);
          if (!prompt) {
            return Response.json({ error: "Prompt vazio" }, { status: 400, headers });
          }

          const messages = [
            {
              role: "system",
              content:
                body.system ??
                "Você é um assistente criativo. Responda sempre em português do Brasil, de forma clara e objetiva.",
            },
            { role: "user", content: prompt },
          ];

          const attempts: string[] = [...MODELS, ...MODELS];
          for (let i = 0; i < attempts.length; i++) {
            const model = attempts[i];
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 30000);
              const res = await fetch(FREE_TEXT_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, messages }),
                signal: controller.signal,
              });
              clearTimeout(timer);
              if (res.ok) {
                const payload = await res.json().catch(() => null);
                const text = extractContent(payload);
                if (text) return Response.json({ text }, { headers });
              }
            } catch {
              // tenta a próxima alternativa
            }
            if (i < attempts.length - 1) {
              // pequena espera para liberar a fila do provedor gratuito
              await new Promise((resolve) => setTimeout(resolve, 1200));
            }
          }

          // Último recurso: IA do próprio projeto, para a ferramenta nunca ficar fora do ar.
          const gatewayKey = process.env.LOVABLE_API_KEY;
          if (gatewayKey) {
            try {
              const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Lovable-API-Key": gatewayKey,
                },
                body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
              });
              if (res.ok) {
                const text = extractContent(await res.json().catch(() => null));
                if (text) return Response.json({ text }, { headers });
              }
            } catch {
              // continua para o erro padrão
            }
          }

          return Response.json(
            { error: "A IA gratuita está indisponível agora. Tente novamente." },
            { status: 502, headers }
          );
        } catch {
          return Response.json({ error: "Erro ao gerar o texto." }, { status: 500, headers });
        }
      },
    },
  },
});
