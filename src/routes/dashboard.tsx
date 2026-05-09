import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — SOS/01" },
      { name: "description", content: "Seu painel pessoal SOS/01: ferramentas, IA, downloads e jogos em um só lugar." },
    ],
  }),
});