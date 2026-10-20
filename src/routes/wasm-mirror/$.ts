import { createFileRoute } from "@tanstack/react-router";
import { streamMirror } from "../../lib/arcade-mirror";

/**
 * Espelho em caminho real do parceiro WASM Arcade.
 * /wasm-mirror/assets/index.js -> https://wasmarcade.com/assets/index.js
 */
const GET = streamMirror("/wasm-mirror");

export const Route = createFileRoute("/wasm-mirror/$")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } }),
      GET,
    },
  },
});
