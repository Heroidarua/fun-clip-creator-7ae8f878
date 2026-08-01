/**
 * Shared helpers for the internal admin HTTP endpoints.
 * - Constant-time password comparison (avoids timing oracles)
 * - Same-origin CORS (blocks cross-site brute force from other pages)
 * - In-memory rate limiting per IP
 */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function isRateLimited(request: Request): boolean {
  const ip = clientIp(request);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) diff |= bufA[i]! ^ bufB[i]!;
  return diff === 0;
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
