import { createFileRoute } from "@tanstack/react-router";
import SobreNos from "@/pages/SobreNos";

export const Route = createFileRoute("/sobre")({
  component: SobreNos,
});
