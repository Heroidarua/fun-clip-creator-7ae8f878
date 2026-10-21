import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed right-4 z-40 w-11 h-11 rounded-lg bg-primary text-primary-foreground border-2 border-secondary flex items-center justify-center shadow-cartridge hover:shadow-neon-blue active:translate-y-1 active:shadow-none transition-all"
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}