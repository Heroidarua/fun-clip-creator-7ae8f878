import { createServerFn } from "@tanstack/react-start";
import { seedGames } from "./seed-games.server";

export const runGamesSeed = createServerFn({ method: "POST" })
  .handler(async () => {
    await seedGames();
    return { success: true };
  });
