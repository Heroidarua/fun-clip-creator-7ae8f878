import { AlertTriangle } from "lucide-react";

export default function LegalNotice({ kind = "download" }: { kind?: "download" | "video" }) {
  return (
    <p className="mb-3 flex items-start gap-2 text-left text-xs leading-relaxed text-muted-foreground" role="note">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        <strong className="text-foreground">Direitos autorais:</strong>{" "}
        {kind === "download"
          ? "Baixe apenas conteúdos próprios ou com autorização. Respeite os direitos dos criadores e os termos da plataforma."
          : "Acesse apenas conteúdos autorizados. A programação e os direitos de exibição são responsabilidade do serviço de destino."}
      </span>
    </p>
  );
}