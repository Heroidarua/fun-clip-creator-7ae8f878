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
        {/* 1. Hero — primeira impressão */}
        <HeroSection />

        {/* 2. Por que usar — gera confiança rapidamente */}
        <SectionDivider />
        <AdvantagesSection />

        {/* 3. Ferramentas — o coração do produto */}
        <SectionDivider />
        <UtilityToolsSection />

        {/* 4. Entretenimento — mantém o usuário navegando */}
        <SectionDivider />
        <GamesCarousel />
        <ComicsSection />

        {/* 5. Prova social — reforça a decisão */}
        <SectionDivider />
        <SocialProof />

        {/* 6. Como usar e sobre — educa */}
        <SectionDivider />
        <HowToUse />
        <AboutSection />

        {/* 7. Suporte / informações finais */}
        <SectionDivider />
        <FAQ />
        <TechnicalInfoSection />
      </main>
      <Footer />
      <ClipyAssistant />
    </div>
  );
};

export default Index;
