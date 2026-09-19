import { createMiddleware } from "@tanstack/react-start";
import { hasValidAdminBasicAuth } from "./admin-auth.server";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://unpkg.com https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "connect-src 'self' blob: https: wss:",
  "worker-src 'self' blob:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://stellarium-web.org https://www.marinetraffic.com https://www.blitzortung.org https://www.volcanodiscovery.com https://globe.adsbexchange.com https://html5.gamedistribution.com https://play.famobi.com https://www.retrogames.cc https://archive.org https://gam.onl https://wplayer.link https://mais.sbt.com.br https://pluto.tv https://eyes.nasa.gov",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(self)",
} as const;

function secureResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function unauthorizedAdminResponse(): Response {
  return secureResponse(
    new Response("Autenticação necessária", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": 'Basic realm="SOS01 Administração", charset="UTF-8"',
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }),
  );
}

export const securityMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, pathname, next }) => {
    const isAdminPage = pathname === "/admin" || pathname === "/admin/";
    if (isAdminPage && !hasValidAdminBasicAuth(request)) {
      return unauthorizedAdminResponse();
    }

    const result = await next();
    return {
      ...result,
      response: secureResponse(result.response),
    };
  },
);