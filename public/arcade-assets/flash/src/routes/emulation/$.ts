import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/** Espelho em caminho real: /emulation/x -> https://wasmarcade.com/emulation/x */
const GET = streamMirror("/emulation");

export const Route = createFileRoute("/emulation/$")({
  server: {
    handlers: {
      GET,
    },
  },
});
