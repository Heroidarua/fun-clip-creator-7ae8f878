import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Zap, LogIn, Pencil, X, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStats } from "@/hooks/useUserStats";
import AvatarUpload from "@/components/AvatarUpload";
import BannerUpload from "@/components/BannerUpload";
import BioEditor from "@/components/BioEditor";
import ReferralCard from "@/components/ReferralCard";
import ScrollReveal from "@/components/ScrollReveal";
import ProfileThemeSelector, { PROFILE_THEMES, ProfileTheme } from "@/components/ProfileThemeSelector";
import { toast } from "sonner";

const Perfil = () => {
  const {
    isAuthenticated,
    profile,
    uploadAvatar,
    removeAvatar,
    uploadBanner,
    removeBanner,
    updateDisplayName,
    updateProfileTheme,
    updateBio,
    canChangeUsername,
    usernameChangesRemaining,
  } = useUserStats();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  const currentTheme = (profile?.profile_theme || "purple") as ProfileTheme;
  const themeStyles = PROFILE_THEMES[currentTheme];

  const handleStartEditingName = () => {
    setNewDisplayName(profile?.display_name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newDisplayName.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }
    const result = await updateDisplayName(newDisplayName.trim());
    if (result.success) {
      toast.success("Nome atualizado com sucesso!");
      setIsEditingName(false);
    } else if (result.error === "limit_reached") {
      toast.error("Você já atingiu o limite de 2 mudanças de nome");
    } else {
      toast.error("Erro ao atualizar nome");
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setNewDisplayName("");
  };

  const handleThemeChange = async (theme: ProfileTheme) => {
    setIsUpdatingTheme(true);
    const success = await updateProfileTheme(theme);
    setIsUpdatingTheme(false);
    if (success) toast.success("Tema do perfil atualizado!");
    else toast.error("Erro ao atualizar tema");
  };

  const handleBioSave = async (bio: string) => {
    const success = await updateBio(bio);
    if (success) toast.success("Bio atualizada com sucesso!");
    else toast.error("Erro ao atualizar bio");
    return success;
  };

  const handleBannerUpload = async (file: File) => {
    try {
      const url = await uploadBanner(file);
      if (url) toast.success("Banner atualizado com sucesso!");
      return url;
    } catch {
      toast.error("Erro ao fazer upload do banner");
      return null;
    }
  };

  const handleBannerRemove = async () => {
    const success = await removeBanner();
    if (success) toast.success("Banner removido com sucesso!");
    else toast.error("Erro ao remover banner");
    return success;
  };

  return (
    <div className="bg-background font-orbitron min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {isAuthenticated && (
          <ScrollReveal>
            <div className="mb-4">
              <BannerUpload
                currentBannerUrl={profile?.banner_url || null}
                onUpload={handleBannerUpload}
                onRemove={handleBannerRemove}
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <div
            className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${themeStyles.gradient} border ${themeStyles.border} p-6 md:p-8 mb-8 transition-all duration-300`}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className={`absolute top-0 right-0 w-64 h-64 ${themeStyles.bg}/10 rounded-full blur-3xl`} />
              <div className={`absolute bottom-0 left-0 w-64 h-64 ${themeStyles.bg}/10 rounded-full blur-3xl`} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {isAuthenticated ? (
                  <AvatarUpload
                    currentAvatarUrl={profile?.avatar_url || null}
                    onUpload={uploadAvatar}
                    onRemove={removeAvatar}
                    size="lg"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center border-4 border-purple-400 shadow-2xl">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-background flex items-center justify-center">
                      <span className="font-pixel text-4xl md:text-5xl text-purple-400">?</span>
                    </div>
                  </div>
                )}
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
                <Zap className="absolute -bottom-1 -left-1 w-6 h-6 text-cyan-400 animate-bounce" />
              </div>

              <div className="flex-1 text-center md:text-left">
                {isAuthenticated && (
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          className="w-48 h-8 text-sm"
                          maxLength={20}
                          placeholder="Seu nome"
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveName}>
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEditName}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-pixel text-lg text-foreground">
                          {profile?.display_name || "Jogador Anônimo"}
                        </h2>
                        {canChangeUsername && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={handleStartEditingName}
                            title={`${usernameChangesRemaining} mudança(s) restante(s)`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {isAuthenticated && !canChangeUsername && (
                  <p className="text-[10px] text-muted-foreground mb-1">
                    Limite de mudanças de nome atingido
                  </p>
                )}

                <h1 className="font-pixel text-2xl md:text-3xl text-foreground mb-2">Seu Perfil</h1>

                {!isAuthenticated && (
                  <Link to="/auth">
                    <Button size="sm" variant="outline" className="mb-4 gap-2">
                      <LogIn className="w-4 h-4" />
                      Faça login para personalizar
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {isAuthenticated && (
          <ScrollReveal delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <ProfileThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                disabled={isUpdatingTheme}
              />
              <BioEditor
                bio={profile?.bio || null}
                onSave={handleBioSave}
                maxLength={200}
              />
              <ReferralCard
                referralCode={profile?.referral_code || null}
                referralCount={profile?.referral_count || 0}
              />
            </div>
          </ScrollReveal>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Perfil;
