import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import UtilityToolsSection from "@/components/UtilityToolsSection";
import GamesCarousel from "@/components/GamesCarousel";
import AdvantagesSection from "@/components/AdvantagesSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ClipyAssistant from "@/components/ClipyAssistant";

const SectionDivider = () => (
  <div aria-hidden className="relative h-px w-full max-w-6xl mx-auto my-2 sm:my-4">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </div>
);

const Index = () => {
  return (
    <div className="bg-background font-inter w-full overflow-x-hidden">
      <Header />
      <AnnouncementBanner />
      <main>
        <HeroSection />
        <SectionDivider />
        <UtilityToolsSection />
        <SectionDivider />
        <GamesCarousel />
        <SectionDivider />
        <AdvantagesSection />
        <SectionDivider />
        <FAQ />
      </main>
      <Footer />
      <ClipyAssistant />
    </div>
  );
};

export default Index;
