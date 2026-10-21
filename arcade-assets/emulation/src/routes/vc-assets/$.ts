import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /vc-assets/x -> https://wasmarcade.com/vc-assets/x */
const GET = streamMirror("/vc-assets");

export const Route = createFileRoute("/vc-assets/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
