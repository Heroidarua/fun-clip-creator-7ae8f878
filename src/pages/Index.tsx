import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import UtilityToolsSection from "@/components/UtilityToolsSection";
import ComicsSection from "@/components/ComicsSection";
import SocialProof from "@/components/SocialProof";
import GamesCarousel from "@/components/GamesCarousel";
import AdvantagesSection from "@/components/AdvantagesSection";
import HowToUse from "@/components/HowToUse";
import AboutSection from "@/components/AboutSection";
import TechnicalInfoSection from "@/components/TechnicalInfoSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ClipyAssistant from "@/components/ClipyAssistant";

const Index = () => {
  return (
    <div className="bg-background font-inter w-full overflow-x-hidden">
      <Header />
      <AnnouncementBanner />
      <HeroSection />
      <UtilityToolsSection />
      <ComicsSection />
      <SocialProof />
      <GamesCarousel />
      <HowToUse />
      <AboutSection />
      <AdvantagesSection />
      <TechnicalInfoSection />
      <FAQ />
      <Footer />
      <ClipyAssistant />
    </div>
  );
};

export default Index;
