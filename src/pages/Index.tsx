import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
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
import AnnouncementBanner from "@/components/AnnouncementBanner";
import AchievementsBadge from "@/components/AchievementsBadge";
import AchievementNotification from "@/components/AchievementNotification";
import LevelUpNotification from "@/components/LevelUpNotification";
import AchievementPrizeBanner from "@/components/AchievementPrizeBanner";
import ClipyAssistant from "@/components/ClipyAssistant";
import { useAchievements } from "@/hooks/useAchievements";

const Index = () => {
  const { newAchievement, dismissNewAchievement, levelUp, dismissLevelUp } = useAchievements();

  return (
    <div className="bg-background font-orbitron w-full overflow-x-hidden">
      <Header />
      <AnnouncementBanner />
      <div className="container mx-auto px-4">
        <AchievementPrizeBanner />
      </div>
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
      
      {/* Achievement System */}
      <AchievementsBadge />
      <AchievementNotification 
        achievement={newAchievement} 
        onDismiss={dismissNewAchievement} 
      />
      <LevelUpNotification
        level={levelUp}
        onDismiss={dismissLevelUp}
      />
      <ClipyAssistant />
    </div>
  );
};

export default Index;
