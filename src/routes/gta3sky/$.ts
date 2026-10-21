import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /gta3sky/x -> https://wasmarcade.com/gta3sky/x */
const GET = streamMirror("/gta3sky");

export const Route = createFileRoute("/gta3sky/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
