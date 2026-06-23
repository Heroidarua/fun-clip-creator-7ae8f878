import { createFileRoute } from "@tanstack/react-router";
import Nasa from "@/pages/Nasa";

export const Route = createFileRoute("/nasa")({
  component: Nasa,
  head: () => ({
    meta: [
      { title: "🌎 NASA Earth Satellites — SOS/01" },
      { name: "description", content: "Explore a Terra em tempo real com satélites, dados científicos e visualização 3D oficial da NASA." },
      { property: "og:title", content: "NASA Earth Satellites — SOS/01" },
      { property: "og:description", content: "Visualização 3D da Terra em tempo real com dados oficiais da NASA." },
      { property: "og:url", content: "https://fun-clip-creator.lovable.app/nasa" },
    ],
    links: [{ rel: "canonical", href: "https://fun-clip-creator.lovable.app/nasa" }],
  }),
});