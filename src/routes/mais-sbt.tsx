import { createFileRoute } from "@tanstack/react-router";
import MaisSbt from "@/pages/MaisSbt";

export const Route = createFileRoute("/mais-sbt")({
  component: MaisSbt,
  head: () => ({
    meta: [
      { title: "+SBT 📺 — Assista grátis | SOS01" },
      { name: "description", content: "Acesse o +SBT em tela cheia direto pelo SOS01. Novelas, programas e conteúdo do SBT 100% grátis." },
    ],
  }),
});
