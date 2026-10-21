import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /covers/x -> https://wasmarcade.com/covers/x */
const GET = streamMirror("/covers");

export const Route = createFileRoute("/covers/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
