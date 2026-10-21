import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /pc/x -> https://wasmarcade.com/pc/x */
const GET = streamMirror("/pc");

export const Route = createFileRoute("/pc/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
