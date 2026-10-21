import { createStart } from "@tanstack/react-start";
import { securityMiddleware } from "@/lib/security-middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware],
}));