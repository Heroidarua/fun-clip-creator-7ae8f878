import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/jogos/")({
  loader: () => {
    throw redirect({
      to: "/jogos/$category",
      params: { category: "todos" },
    });
  },
});