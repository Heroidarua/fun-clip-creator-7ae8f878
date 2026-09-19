import { createMiddleware } from "@tanstack/react-start";
import { hasValidAdminBasicAuth } from "./admin-auth.server";

function createContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' blob: https://www.googletagmanager.com https://unpkg.com https://cdn.jsdelivr.net`,
    `style-src 'self' 'nonce-${nonce}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-CIxDM5jnsGiKqXs2v7NKCY5MzdR9gu6TtiMJrDw29AY=' https://fonts.googleapis.com`,
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' blob: https: wss:",
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://stellarium-web.org https://www.marinetraffic.com https://www.blitzortung.org https://www.volcanodiscovery.com https://globe.adsbexchange.com https://html5.gamedistribution.com https://play.famobi.com https://www.retrogames.cc https://archive.org https://gam.onl https://wplayer.link https://mais.sbt.com.br https://pluto.tv https://eyes.nasa.gov",
    "upgrade-insecure-requests",
  ].join("; ");
}

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
} as const;

function secureResponse(response: Response, nonce: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Content-Security-Policy", createContentSecurityPolicy(nonce));
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function unauthorizedAdminResponse(nonce: string): Response {
  return secureResponse(
    new Response("Autenticação necessária", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": 'Basic realm="SOS01 Administração", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }), nonce,
  );
}

export const securityMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, pathname, next }) => {
    const nonce = crypto.randomUUID().replaceAll("-", "");
    const isAdminPage = pathname === "/admin" || pathname === "/admin/";
    if (isAdminPage && !hasValidAdminBasicAuth(request)) {
      return unauthorizedAdminResponse(nonce);
    }

    const result = await next({ context: { cspNonce: nonce } });
    return {
      ...result,
      response: secureResponse(result.response, nonce),
    };
  },
);