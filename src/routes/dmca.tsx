import { createFileRoute } from "@tanstack/react-router";
import DMCA from "@/pages/DMCA";

export const Route = createFileRoute("/dmca")({
  component: DMCA,
  head: () => ({
    meta: [
      { title: "Política DMCA — SOS/01" },
      { name: "description", content: "Como o SOS/01 trata notificações de direitos autorais sob a DMCA e como enviar uma reivindicação formal." },
      { property: "og:title", content: "Política DMCA — SOS/01" },
      { property: "og:description", content: "Notificações de direitos autorais no SOS/01." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/dmca" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/dmca" }],
  }),
});
