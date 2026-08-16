import { ytRateLimit, ytCors } from "@/lib/youtube-tool.server";

export const IG_LINK_TTL_SECONDS = 600;
export const IG_PROCESS_TIMEOUT_MS = 25000;

export function igRateLimit(ip: string, limit = 8, windowMs = 60_000): boolean {
  return ytRateLimit(ip, limit, windowMs);
}

export function igCors(extra: Record<string, string> = {}): Record<string, string> {
  return ytCors(extra);
}

export { ytClientIp as igClientIp, signTicket, verifyTicket } from "@/lib/youtube-tool.server";
