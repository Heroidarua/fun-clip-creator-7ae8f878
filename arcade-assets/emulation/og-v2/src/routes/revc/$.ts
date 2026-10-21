import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /revc/x -> https://wasmarcade.com/revc/x */
const GET = streamMirror("/revc");

export const Route = createFileRoute("/revc/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
