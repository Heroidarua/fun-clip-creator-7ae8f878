/**
 * Utilitários isolados da ferramenta /ferramentas/youtube-downloader.
 * Não é usado por nenhum outro módulo do SOS01.
 */

export const YT_MAX_DURATION_SECONDS = 60 * 60; // 1 hora
export const YT_MAX_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB
export const YT_LINK_TTL_SECONDS = 600; // 10 minutos
export const YT_PROCESS_TIMEOUT_MS = 60000; // Aumentado para 60 segundos

/** Rate limiting simples por IP (janela deslizante em memória). */
const buckets = new Map<string, number[]>();

export function ytRateLimit(ip: string, limit = 12, windowMs = 60_000): boolean {
  const now = Date.now();
  const hits = (buckets.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(ip, hits);
    return false;
  }
  hits.push(now);
  buckets.set(ip, hits);
  if (buckets.size > 5000) buckets.clear();
  return true;
}

export function ytClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

/**
 * Chave estável entre instâncias: em produção cada requisição pode cair em um
 * worker diferente, então o segredo precisa ser determinístico para o link
 * assinado continuar válido. Os links seguem expirando pelo campo `exp`.
 */
let secretKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (secretKey) return secretKey;
  const material =
    process.env['YT_TICKET_SECRET'] ||
    process.env['SUPABASE_URL'] ||
    "sos01-youtube-ticket-fallback";
  secretKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(material),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return secretKey;
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): ArrayBuffer {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(pad + "=".repeat((4 - (pad.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

export interface YtTicket {
  videoId: string;
  type: "video" | "audio";
  quality: "best" | "high" | "worst" | string;
  title: string;
  exp: number;
}

export async function signTicket(payload: Omit<YtTicket, "exp">): Promise<string> {
  const ticket: YtTicket = { ...payload, exp: Date.now() + YT_LINK_TTL_SECONDS * 1000 };
  const body = b64url(new TextEncoder().encode(JSON.stringify(ticket)));
  const sig = await crypto.subtle.sign("HMAC", await getKey(), new TextEncoder().encode(body));
  return `${body}.${b64url(new Uint8Array(sig))}`;
}

export async function verifyTicket(token: string): Promise<YtTicket | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  let ok = false;
  try {
    ok = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromB64url(sig),
      new TextEncoder().encode(body),
    );
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const ticket = JSON.parse(new TextDecoder().decode(fromB64url(body))) as YtTicket;
    if (!ticket.exp || ticket.exp < Date.now()) return null;
    return ticket;
  } catch {
    return null;
  }
}

export function ytCors(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra,
  };
}
