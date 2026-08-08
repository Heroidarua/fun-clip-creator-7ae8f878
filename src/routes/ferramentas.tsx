import { createFileRoute } from "@tanstack/react-router";
import Ferramentas from "@/pages/Ferramentas";
import { buildToolSeo, absoluteUrl } from "@/lib/seo";
import { TOOLS_SEO, toolPath } from "@/config/seo";

export const Route = createFileRoute("/ferramentas")({
  component: Ferramentas,
  head: () =>
    buildToolSeo({
      path: "/ferramentas",
      title: "Ferramentas Online Gratuitas — QR Code, PDF, IA e mais | SOS01",
      description: "Catálogo de utilitários gratuitos online: gerador de QR Code, senhas, conversor MP4 para MP3, removedor de fundo, OCR, PDF e muito mais.",
      keywords: ["ferramentas online","gerador de qr code","conversor mp4 para mp3","removedor de fundo"],
      toolName: "Ferramentas SOS01",
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
      ],
      schema: [
        {
          "@type": "ItemList",
          name: "Ferramentas online gratuitas do SOS01",
          itemListElement: TOOLS_SEO.map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: tool.name,
            url: absoluteUrl(toolPath(tool.slug)),
          })),
        },
      ],
    }),
});
