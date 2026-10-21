import { createFileRoute, redirect } from "@tanstack/react-router";

/** Endereço antigo da marca anterior: 301 permanente para a URL sos01. */
export const Route = createFileRoute("/blog/como-nasceu-clipsave")({
  beforeLoad: () => {
    throw redirect({ to: "/blog/como-nasceu-sos01", statusCode: 301 });
  },
});
