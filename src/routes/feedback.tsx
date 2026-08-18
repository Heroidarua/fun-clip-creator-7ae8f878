import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/feedback")({
  component: FeedbackLayout,
  head: () =>
    buildSeo({
      path: "/feedback",
      title: "Central de Sugestões e Feedback — SOS01",
      description: "Envie suas sugestões, feedbacks e relate problemas para melhorarmos o SOS01.",
    }),
});

function FeedbackLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-4 pb-20 sm:pb-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
