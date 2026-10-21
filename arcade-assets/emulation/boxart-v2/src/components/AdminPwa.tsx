import { useEffect } from "react";
import InstallAppButton from "@/components/InstallAppButton";

const ADMIN_MANIFEST = "/admin.webmanifest";

/**
 * Faz a página /admin se comportar como um app instalável separado:
 * troca o manifest do site pelo manifest do painel enquanto a rota está ativa.
 */
const AdminPwa = () => {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) return;
    const previous = link.getAttribute("href");
    link.setAttribute("href", ADMIN_MANIFEST);

    const appleTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    const previousTitle = appleTitle?.getAttribute("content") ?? null;
    appleTitle?.setAttribute("content", "SOS Admin");

    const appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const previousIcon = appleIcon?.getAttribute("href") ?? null;
    appleIcon?.setAttribute("href", "/admin-icon.png");

    return () => {
      if (previous) link.setAttribute("href", previous);
      if (previousTitle) appleTitle?.setAttribute("content", previousTitle);
      if (previousIcon) appleIcon?.setAttribute("href", previousIcon);
    };
  }, []);

  return <InstallAppButton variant="mobile" />;
};

export default AdminPwa;