import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /games/x -> https://wasmarcade.com/games/x */
const GET = streamMirror("/games");

export const Route = createFileRoute("/games/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
