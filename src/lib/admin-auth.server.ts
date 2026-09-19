/**
 * Shared helpers for the internal admin HTTP endpoints.
 * - Constant-time password comparison (avoids timing oracles)
 * - Same-origin CORS (blocks cross-site brute force from other pages)
 * - Database-backed rate limiting per IP (Cloudflare Worker compatible)
 */

const WINDOW_MS = 60_000 * 5; // 5 minutos de janela
const MAX_ATTEMPTS = 5; // Máximo de 5 tentativas por janela

export function clientIp(request: Request | { headers: Headers }): string {
  const headers = request instanceof Request ? request.headers : request.headers;
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function isRateLimited(request: Request | { headers: Headers }): Promise<boolean> {
  const ip = clientIp(request);
  if (ip === "unknown") return false;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date();

  // Buscar registro de rate limit para o IP
  const { data: entry, error } = await supabaseAdmin
    .from("admin_rate_limit")
    .select("*")
    .eq("ip", ip)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Rate limit query error:", error);
    return false; // Falha segura: permite em caso de erro no banco
  }

  // Se bloqueado, verificar se o tempo expirou
  if (entry?.blocked_until) {
    const blockedUntil = new Date(entry.blocked_until);
    if (now < blockedUntil) {
      return true;
    }
  }

  // Se não existe ou janela expirou, criar/resetar
  const lastAttempt = entry?.last_attempt ? new Date(entry.last_attempt) : null;
  const resetAt = lastAttempt ? new Date(lastAttempt.getTime() + WINDOW_MS) : null;
  
  if (!entry || (resetAt && now > resetAt)) {
    const { error: upsertError } = await (supabaseAdmin
      .from("admin_rate_limit")
      .upsert({ 
        ip, 
        attempts: 1, 
        last_attempt: now.toISOString(),
        blocked_until: null 
      } as any) as any);
    
    if (upsertError) console.error("Rate limit upsert error:", upsertError);
    return false;
  }

  // Incrementar contador
  const newAttempts = (entry.attempts || 0) + 1;
  const isLimited = newAttempts > MAX_ATTEMPTS;
  const blockedUntil = isLimited ? new Date(now.getTime() + WINDOW_MS).toISOString() : null;

  const { error: updateError } = await (supabaseAdmin
    .from("admin_rate_limit")
    .update({ 
      attempts: newAttempts, 
      last_attempt: now.toISOString(),
      blocked_until: blockedUntil 
    } as any)
    .eq("ip", ip) as any);

  if (updateError) console.error("Rate limit update error:", updateError);
  return isLimited;
}

export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  return diff === 0;
}

function decodeBasicCredentials(value: string): { username: string; password: string } | null {
  if (!value.startsWith("Basic ")) return null;

  try {
    const encoded = value.slice(6).trim();
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

/** Validate the browser-level HTTP Basic challenge used to conceal /admin. */
export function hasValidAdminBasicAuth(request: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const credentials = decodeBasicCredentials(request.headers.get("authorization") ?? "");
  return Boolean(
    credentials?.username === "admin" &&
      timingSafeEqual(credentials.password, adminPassword),
  );
}

/** Restrict admin endpoints to same-origin requests only. */
export function corsHeaders(request?: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  const origin = request?.headers.get("origin");
  if (origin && request) {
    try {
      if (new URL(origin).host === new URL(request.url).host) {
        headers["Access-Control-Allow-Origin"] = origin;
      }
    } catch {
      /* ignore malformed origin */
    }
  }
  return headers;
}

export function isCrossOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host !== new URL(request.url).host;
  } catch {
    return true;
  }
}