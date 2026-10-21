import { createFileRoute } from "@tanstack/react-router";
import {
  clearRateLimit,
  hasValidAdminAuth,
  isCrossOrigin,
  isRateLimited,
} from "@/lib/admin-auth.server";

const BASE = "https://canboso.com/api/v2/telegram-buyer";
const IMG_BASE = "https://canboso.com";

type RawProduct = {
  productId: string;
  name: string;
  description?: string;
  image?: string;
  emoji?: string;
  productType?: string;
  price?: { amount: number; currency: string; text: string };
  availability?: { available: number | null; sold: number };
  purchaseRequirements?: Record<string, unknown>;
};

function apiKey(): string | null {
  return process.env["CANBOSO_API_KEY"] || null;
}

function categorize(name: string): string {
  const n = name.toLowerCase();
  if (/(chatgpt|gemini|claude|grok|perplexity|copilot|cursor|midjourney|\bai\b|\bia\b)/.test(n)) return "IA";
  if (/(netflix|spotify|youtube|disney|prime|hbo|max|crunchyroll|deezer|paramount|apple tv)/.test(n)) return "Streaming";
  if (/(canva|adobe|capcut|office|microsoft|windows|figma|notion|vpn|duolingo)/.test(n)) return "Softwares";
  return "Outros";
}

export const Route = createFileRoute("/api/canboso")({
  server: {
    handlers: {
      GET: async () => {
        const key = apiKey();
        if (!key) return Response.json({ error: "Loja temporariamente indisponível." }, { status: 503 });
        try {
          const res = await fetch(`${BASE}/products`, { headers: { "X-API-Key": key } });
          const data = (await res.json().catch(() => ({}))) as { success?: boolean; products?: RawProduct[]; message?: string };
          if (!res.ok || !data.success) {
            return Response.json(
              { error: res.status === 429 ? "Muitas consultas. Tente novamente em instantes." : "Não foi possível carregar o catálogo agora." },
              { status: 502 },
            );
          }
          const products = (data.products ?? []).map((p) => ({
            id: p.productId,
            name: p.name,
            description: p.description ?? "",
            image: p.image ? (p.image.startsWith("http") ? p.image : IMG_BASE + p.image) : null,
            type: p.productType ?? "normal",
            price: p.price ?? null,
            available: p.availability?.available ?? null,
            sold: p.availability?.sold ?? 0,
            requirements: p.purchaseRequirements ?? {},
            category: categorize(p.name),
          }));
          return Response.json({ products }, { headers: { "Cache-Control": "public, max-age=60" } });
        } catch {
          return Response.json({ error: "Falha de conexão com a loja." }, { status: 502 });
        }
      },
      POST: async ({ request }) => {
        if (isCrossOrigin(request)) return Response.json({ error: "Origem não permitida." }, { status: 403 });
        const key = apiKey();
        if (!key) return Response.json({ error: "Loja temporariamente indisponível." }, { status: 503 });
        const body = (await request.json().catch(() => null)) as
          | { password?: string; productId?: string; quantity?: number; customerEmail?: string; customerAccounts?: string[] }
          | null;
        if (!body) return Response.json({ error: "Pedido inválido." }, { status: 400 });

        // Compras debitam o saldo da loja: só o administrador pode confirmá-las.
        if (!hasValidAdminAuth(request, body.password)) {
          const limited = await isRateLimited(request);
          return Response.json(
            { error: limited ? "Muitas tentativas. Aguarde cinco minutos." : "Senha de administrador incorreta." },
            { status: limited ? 429 : 401 },
          );
        }
        await clearRateLimit(request);

        const productId = String(body.productId ?? "");
        const quantity = Math.floor(Number(body.quantity ?? 1));
        if (!/^[\w-]{3,64}$/.test(productId) || !(quantity >= 1 && quantity <= 50)) {
          return Response.json({ error: "Produto ou quantidade inválidos." }, { status: 400 });
        }
        const payload: Record<string, unknown> = { key, product_id: productId, quantity };
        if (body.customerEmail) {
          const email = String(body.customerEmail).trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "E-mail inválido." }, { status: 400 });
          payload.customer_email = email;
        }
        if (Array.isArray(body.customerAccounts)) {
          payload.customer_accounts = body.customerAccounts.map((a) => String(a).slice(0, 200)).slice(0, 50);
        }
        try {
          const res = await fetch(`${BASE}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Idempotency-Key": `sos01-${crypto.randomUUID()}` },
            body: JSON.stringify(payload),
          });
          const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
          if (!res.ok || data.success === false) {
            return Response.json(
              { error: typeof data.message === "string" ? data.message : "A compra não pôde ser concluída." },
              { status: res.status === 429 ? 429 : 502 },
            );
          }
          return Response.json({ ok: true, order: data });
        } catch {
          return Response.json({ error: "Falha de conexão com a loja." }, { status: 502 });
        }
      },
    },
  },
});
