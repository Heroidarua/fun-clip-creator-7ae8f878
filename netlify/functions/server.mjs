// Netlify Function entry that delegates to the TanStack Start SSR handler.
// The SSR build (dist/server/server.js) exports a default `{ fetch }`.
import handler from "../../dist/server/server.js";

export default async (request, _context) => {
  return handler.fetch(request);
};

export const config = {
  path: "/*",
  preferStatic: true,
};