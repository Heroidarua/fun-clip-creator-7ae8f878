import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/feedback")({
  component: CommunityLayout,
  head: () =>
    buildSeo({
      path: "/comunidade",
      title: "Comunidade SOS01 — O seu espaço social",
      description: "Conecte-se, compartilhe e interaja na comunidade oficial do SOS01.",
    }),
});

function CommunityLayout() {
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
