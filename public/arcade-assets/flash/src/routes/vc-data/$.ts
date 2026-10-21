import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /vc-data/x -> https://wasmarcade.com/vc-data/x */
const GET = streamMirror("/vc-data");

export const Route = createFileRoute("/vc-data/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
