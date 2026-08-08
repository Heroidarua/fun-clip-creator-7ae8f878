import { useEffect, useState } from "react";
import { fromTable } from "@/integrations/supabase/helpers";
import { Megaphone } from "lucide-react";
import {
  DEFAULT_MARQUEE_SETTINGS,
  MARQUEE_COLOR_STYLES,
  type MarqueeSettings,
} from "@/lib/marquee-settings";

type Announcement = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [settings, setSettings] = useState<MarqueeSettings>(DEFAULT_MARQUEE_SETTINGS);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await fromTable("announcements")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnnouncements(data as unknown as Announcement[]);
      }
    };

    const fetchSettings = async () => {
      const { data } = await fromTable("marquee_settings").select("*").limit(1).maybeSingle();
      if (data) setSettings({ ...DEFAULT_MARQUEE_SETTINGS, ...(data as MarqueeSettings) });
    };

    fetchAnnouncements();
    fetchSettings();
  }, []);

  if (announcements.length === 0) return null;

  const palette = MARQUEE_COLOR_STYLES[settings.color] ?? MARQUEE_COLOR_STYLES.primary;

  const items = announcements.map((a) => (
    <span key={a.id} className="inline-flex items-center gap-2 px-6 shrink-0">
      <span className="font-semibold text-foreground">{a.title}</span>
      <span className="text-muted-foreground">—</span>
      <span className="text-muted-foreground">{a.message}</span>
      <span style={{ color: palette.soft }}>•</span>
    </span>
  ));

  return (
    <div
      className="w-full border-y backdrop-blur-sm animate-fade-in"
      style={{
        borderColor: palette.border,
        background: `linear-gradient(90deg, ${palette.bg}, transparent, ${palette.bg})`,
      }}
    >
      <div className="flex items-center gap-3 py-2.5">
        <div
          className="flex items-center gap-2 pl-4 pr-3 shrink-0 border-r"
          style={{ borderColor: palette.border }}
        >
          <Megaphone className="w-4 h-4" style={{ color: palette.solid }} />
          <span
            className="text-[11px] uppercase tracking-[0.15em] font-bold hidden sm:inline"
            style={{ color: palette.solid }}
          >
            Avisos
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div
            className={`flex w-max animate-marquee text-sm whitespace-nowrap ${
              settings.pause_on_hover ? "marquee-pausable" : ""
            }`}
            style={{
              animationDuration: `${settings.speed}s`,
              animationDirection: settings.direction === "ltr" ? "reverse" : "normal",
            }}
          >
            <div className="flex shrink-0">{items}</div>
            <div className="flex shrink-0" aria-hidden>
              {items}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
