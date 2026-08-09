import { createFileRoute } from "@tanstack/react-router";
import YoutubeDownloaderPage from "@/pages/YoutubeDownloader";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/ferramentas_/youtube-downloader")({
  component: YoutubeDownloaderPage,
  head: () =>
    buildSeo({
      path: "/ferramentas/youtube-downloader",
      title: "Downloader de Vídeos do YouTube | SOS01",
      description:
        "Baixe vídeos que você tem autorização para baixar usando a ferramenta do SOS01.",
      keywords: ["downloader youtube", "baixar video youtube", "sos01 youtube downloader"],
      breadcrumb: [
        { name: "Início", path: "/" },
        { name: "Ferramentas", path: "/ferramentas" },
        { name: "Downloader de Vídeos do YouTube", path: "/ferramentas/youtube-downloader" },
      ],
    }),
});
