/* Divide os jogos por página de gênero, assim o carregamento não vai ficar pesado por conta dos jogos e cada jogo vai ter sua aba */
import { lazy, Suspense } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import AdvantagesSection from "@/components/AdvantagesSection";
import UtilityToolsSection from "@/components/UtilityToolsSection";
import Footer from "@/components/Footer";
import { useDownloaderStatus } from "@/hooks/useDownloaderStatus";

// Below-the-fold sections — split into chunks loaded after the hero paints.
const ComicsSection         = lazy(() => import("@/components/ComicsSection"));
const SocialProof           = lazy(() => import("@/components/SocialProof"));
const GamesCarousel         = lazy(() => import("@/components/GamesCarousel"));
const RandomGamePicker      = lazy(() => import("@/components/RandomGamePicker"));
const HowToUse              = lazy(() => import("@/components/HowToUse"));
const AboutSection          = lazy(() => import("@/components/AboutSection"));
const TechnicalInfoSection  = lazy(() => import("@/components/TechnicalInfoSection"));
const FAQ                   = lazy(() => import("@/components/FAQ"));
const ToolsIndex            = lazy(() => import("@/components/ToolsIndex"));
const SectionDivider = () => (
  <div aria-hidden className="relative h-px w-full max-w-5xl mx-auto my-6 sm:my-10 px-4 sm:px-6">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  </div>
);

const Index = () => {
  const { isActive, loading } = useDownloaderStatus();
  const gamesOn = loading || isActive("games");
  const comicsOn = loading || isActive("comics");
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

        <Suspense fallback={null}>
          {/* 4. Entretenimento — mantém o usuário navegando */}
          <SectionDivider />
          <RandomGamePicker />
          {gamesOn && <GamesCarousel />}
          {comicsOn && <ComicsSection />}

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

          {/* 8. Índice de links internos — descoberta de todas as ferramentas */}
          <div className="container mx-auto max-w-6xl px-4 pb-12">
            <ToolsIndex />
          </div>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
