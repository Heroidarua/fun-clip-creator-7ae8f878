import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /og/x -> https://wasmarcade.com/og/x */
const GET = streamMirror("/og");

export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
