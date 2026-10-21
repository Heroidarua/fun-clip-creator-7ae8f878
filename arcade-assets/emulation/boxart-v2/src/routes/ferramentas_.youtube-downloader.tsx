import { createFileRoute } from "@tanstack/react-router";
import YoutubeDownloaderPage from "@/pages/YoutubeDownloader";
import { buildToolSeo } from "@/lib/seo";
import { getToolSeo } from "@/config/seo";

export const Route = createFileRoute("/ferramentas_/youtube-downloader")({
  component: YoutubeDownloaderPage,
  head: () =>
    buildToolSeo({
      path: "/ferramentas/youtube-downloader",
      title: getToolSeo("youtube-downloader")?.title ?? "Baixar Vídeo do YouTube Grátis | SOS01",
      description: getToolSeo("youtube-downloader")?.description ?? "Baixe vídeos autorizados do YouTube online e grátis. Use agora.",
      toolName: "Downloader de Vídeos do YouTube",
      faq: getToolSeo("youtube-downloader")?.faq,
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
        { name: "Downloader de Vídeos do YouTube", path: "/ferramentas/youtube-downloader" },
      ],
    }),
});
