import { YT_LINK_TTL_SECONDS, YT_PROCESS_TIMEOUT_MS } from "@/lib/youtube-tool.server";

export const IG_LINK_TTL_SECONDS = 600;
export const IG_PROCESS_TIMEOUT_MS = 25000;

export function igRateLimit(ip: string, limit = 8, windowMs = 60_000): boolean {
  // Reaproveitando a lógica de rate limit do YouTube para consistência
  const { ytRateLimit } = require("@/lib/youtube-tool.server");
  return ytRateLimit(ip, limit, windowMs);
}

export function igCors(extra: Record<string, string> = {}): Record<string, string> {
  const { ytCors } = require("@/lib/youtube-tool.server");
  return ytCors(extra);
}

export { signTicket, verifyTicket } from "@/lib/youtube-tool.server";
