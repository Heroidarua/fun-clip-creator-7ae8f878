import { createFileRoute } from "@tanstack/react-router";
import TermsOfService from "@/pages/TermsOfService";

export const Route = createFileRoute("/termos")({
  component: TermsOfService,
});
