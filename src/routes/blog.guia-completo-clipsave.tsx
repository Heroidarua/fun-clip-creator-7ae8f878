import { createFileRoute, redirect } from "@tanstack/react-router";

/** Endereço antigo da marca anterior: 301 permanente para a URL sos01. */
export const Route = createFileRoute("/blog/guia-completo-clipsave")({
  beforeLoad: () => {
    throw redirect({ to: "/blog/guia-completo-sos01", statusCode: 301 });
  },
});
