import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /assets/x -> https://wasmarcade.com/assets/x */
const GET = streamMirror("/assets");

export const Route = createFileRoute("/assets/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
