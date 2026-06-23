import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import MobileBottomNav from "@/components/MobileBottomNav";
import BackToTop from "@/components/BackToTop";
import { registerSW } from "@/lib/registerSW";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "SOS/01 - Baixe vídeos sem marca d'água" },
      { name: "description", content: "Baixe vídeos do TikTok, YouTube, Kwai e mais sem marca d'água. Ferramentas gratuitas, jogos retrô e muito mais!" },
      { name: "author", content: "SOS/01" },
      { property: "og:title", content: "SOS/01 - Baixe vídeos sem marca d'água" },
      { property: "og:description", content: "Baixe vídeos do TikTok, YouTube, Kwai e mais sem marca d'água. Ferramentas gratuitas, jogos retrô e muito mais!" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "SOS/01 - Baixe vídeos sem marca d'água" },
      { name: "twitter:description", content: "Baixe vídeos do TikTok, YouTube, Kwai e mais sem marca d'água. Ferramentas gratuitas, jogos retrô e muito mais!" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e1aa244a-b439-4f7d-91af-a263dcba24f8/id-preview-6c3e2208--d6700be4-d0f2-493a-8e6b-6a05da855195.lovable.app-1775700491383.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e1aa244a-b439-4f7d-91af-a263dcba24f8/id-preview-6c3e2208--d6700be4-d0f2-493a-8e6b-6a05da855195.lovable.app-1775700491383.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0E4A7B" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "SOS/01" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://sofewnyrrevybnbhhsuh.supabase.co" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Hind:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Orbitron:wght@500;600;700;800&family=Press+Start+2P&family=Silkscreen:wght@400;700&family=VT323&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SOS/01",
          url: "https://fun-clip-creator.lovable.app",
          logo: "https://fun-clip-creator.lovable.app/favicon.ico",
          description: "Plataforma 100% gratuita de utilidades digitais: downloaders, ferramentas com IA, jogos retrô e biblioteca de quadrinhos.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SOS/01",
          url: "https://fun-clip-creator.lovable.app",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    registerSW();
  }, []);
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
        <MobileBottomNav />
        <BackToTop />
      </TooltipProvider>
    </ThemeProvider>
  );
}
