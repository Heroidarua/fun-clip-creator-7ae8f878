import { createServerFn } from "@tanstack/react-start";

export const getPlayerCredentials = createServerFn({ method: "GET" }).handler(async () => {
  return {
    user: process.env["WPLAYER_USER"] ?? "",
    pass: process.env["WPLAYER_PASS"] ?? "",
  };
});