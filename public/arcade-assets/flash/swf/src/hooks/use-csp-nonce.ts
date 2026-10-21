import { useRouter } from "@tanstack/react-router";

export function useCspNonce(): string | undefined {
  const router = useRouter();
  return router.options.ssr?.nonce;
}