import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import Navigation from "@/components/Navigation";
import BackToTop from "@/components/BackToTop";
import ProtectionLayer from "@/components/ProtectionLayer";
import SplashScreen from "@/components/SplashScreen";
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
      { title: "SOS01 — Ferramentas digitais 100% gratuitas" },
      { name: "description", content: "Baixe vídeos sem marca d'água, use utilitários com IA e jogue clássicos retrô no SOS01. Tudo grátis e sem cadastro." },
      { name: "author", content: "SOS01" },
      { property: "og:site_name", content: "SOS01" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "application-name", content: "SOS01" },
      { name: "format-detection", content: "telephone=no" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "theme-color", content: "#0E4A7B" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "SOS01" },
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
      { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
      { rel: "sitemap", type: "application/xml", href: "/sitemap.xml" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Hind:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Orbitron:wght@500;600;700;800&family=Press+Start+2P&family=Silkscreen:wght@400;700&family=VT323&display=swap",
      },
    ],
    scripts: [
      {
        children:
          "(function(){try{var t=localStorage.getItem('sos01-theme');var l=['dark','light','sepia','ocean','forest'];if(t&&l.indexOf(t)>-1){var e=document.documentElement;e.classList.remove.apply(e.classList,l);e.classList.add(t);}}catch(e){}})();",
      },
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-JD2L3ZPP4T",
      },
      {
        children: "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-JD2L3ZPP4T');",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "SOS01",
          url: "https://sos01.com.br",
          logo: "https://sos01.com.br/favicon.png",
          description: "Plataforma 100% gratuita de utilidades digitais: downloaders, ferramentas com IA, jogos retrô e biblioteca de quadrinhos.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SOS01",
          url: "https://sos01.com.br",
          inLanguage: "pt-BR",
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
        <ProtectionLayer />
        <SplashScreen />
        <Outlet />
        <Navigation />
        <BackToTop />
      </TooltipProvider>
    </ThemeProvider>
  );
}
