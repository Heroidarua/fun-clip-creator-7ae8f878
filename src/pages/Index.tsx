import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";

// Lazy-load below-the-fold sections to speed up initial paint
const UtilityToolsSection = lazy(() => import("@/components/UtilityToolsSection"));
const ComicsSection = lazy(() => import("@/components/ComicsSection"));
const SocialProof = lazy(() => import("@/components/SocialProof"));
const GamesCarousel = lazy(() => import("@/components/GamesCarousel"));
const AdvantagesSection = lazy(() => import("@/components/AdvantagesSection"));
const HowToUse = lazy(() => import("@/components/HowToUse"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
const TechnicalInfoSection = lazy(() => import("@/components/TechnicalInfoSection"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Footer = lazy(() => import("@/components/Footer"));
const ClipyAssistant = lazy(() => import("@/components/ClipyAssistant"));

const SectionFallback = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="bg-background font-inter w-full overflow-x-hidden">
      <Header />
      <AnnouncementBanner />
      <HeroSection />
      <Suspense fallback={<SectionFallback />}>
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
      </Suspense>
    </div>
  );
};

export default Index;
