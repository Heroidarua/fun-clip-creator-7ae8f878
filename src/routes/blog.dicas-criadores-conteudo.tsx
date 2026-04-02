import { createFileRoute } from "@tanstack/react-router";
import DicasCriadoresConteudo from "@/pages/blog/DicasCriadoresConteudo";

export const Route = createFileRoute("/blog/dicas-criadores-conteudo")({
  component: DicasCriadoresConteudo,
});
