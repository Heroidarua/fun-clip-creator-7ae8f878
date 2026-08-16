import { createFileRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/jogos/$layout")({
  component: () => (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pt-20 pb-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});