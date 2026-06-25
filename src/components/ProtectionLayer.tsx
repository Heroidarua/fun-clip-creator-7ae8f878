import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Camada de proteção leve contra inspeção casual do código.
 * IMPORTANTE: não substitui segurança real — apenas dificulta a inspeção
 * por usuários comuns. Toda lógica sensível deve permanecer no backend.
 */
export default function ProtectionLayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (import.meta.env.DEV) return; // não atrapalhar desenvolvimento

    let lastWarn = 0;
    const warn = () => {
      const now = Date.now();
      if (now - lastWarn < 2000) return;
      lastWarn = now;
      try {
        toast("🔒 Esta área é protegida.", {
          description: "Inspeção e cópia do código estão desativadas.",
        });
      } catch {
        /* noop */
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      // permitir menu nativo em inputs/textarea para acessibilidade
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      e.preventDefault();
      warn();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        warn();
        return;
      }
      // Ctrl/Cmd + Shift + I/J/C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key)) {
        e.preventDefault();
        warn();
        return;
      }
      // Ctrl/Cmd + U (view source)
      if ((e.ctrlKey || e.metaKey) && key === "u") {
        e.preventDefault();
        warn();
        return;
      }
      // Ctrl/Cmd + S (salvar página)
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault();
        warn();
        return;
      }
    };

    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.tagName === "IMG" || t.closest("[data-protected]")) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}