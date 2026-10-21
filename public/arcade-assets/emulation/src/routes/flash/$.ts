import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /flash/x -> https://wasmarcade.com/flash/x */
const GET = streamMirror("/flash");

export const Route = createFileRoute("/flash/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
