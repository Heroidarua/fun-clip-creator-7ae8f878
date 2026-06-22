// Allowlist of trusted CDN hostnames the media-proxy handlers may fetch.
// Used to prevent SSRF via the `?action=proxy&media_url=...` endpoints.
const ALLOWED_HOST_PATTERNS: RegExp[] = [
  // TikTok
  /(^|\.)tiktok\.com$/i,
  /(^|\.)tiktokcdn\.com$/i,
  /(^|\.)tiktokcdn-us\.com$/i,
  /(^|\.)tikcdn\.io$/i,
  /(^|\.)tikwm\.com$/i,
  /(^|\.)muscdn\.com$/i,
  /(^|\.)bytedance\.com$/i,
  /(^|\.)byteoversea\.com$/i,
  // Instagram / Meta
  /(^|\.)cdninstagram\.com$/i,
  /(^|\.)fbcdn\.net$/i,
  /(^|\.)instagram\.com$/i,
  // Kwai
  /(^|\.)kwai\.com$/i,
  /(^|\.)kwimgs\.com$/i,
  /(^|\.)kuaishou\.com$/i,
  /(^|\.)kwaicdn\.com$/i,
  /(^|\.)kw\.ai$/i,
  // Facebook / Meta
  /(^|\.)facebook\.com$/i,
  /(^|\.)fb\.com$/i,
  /(^|\.)fb\.watch$/i,
  /(^|\.)fbcdn\.net$/i,
  /(^|\.)fbsbx\.com$/i,
];

export function isSafeProxyUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const host = u.hostname.toLowerCase();
  // Block private / link-local / loopback literals
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
    host === "::1" ||
    host.startsWith("[")
  ) {
    return false;
  }
  return ALLOWED_HOST_PATTERNS.some((re) => re.test(host));
}