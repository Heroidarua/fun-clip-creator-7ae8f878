import { useEffect, useState } from "react";
import { fromTable } from "@/integrations/supabase/helpers";
import { Megaphone } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

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

    fetchAnnouncements();
  }, []);

  if (announcements.length === 0) return null;

  const items = announcements.map((a) => (
    <span key={a.id} className="inline-flex items-center gap-2 px-6 shrink-0">
      <span className="font-semibold text-foreground">{a.title}</span>
      <span className="text-muted-foreground">—</span>
      <span className="text-muted-foreground">{a.message}</span>
      <span className="text-primary/50">•</span>
    </span>
  ));

  return (
    <div className="w-full border-y border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm animate-fade-in">
      <div className="flex items-center gap-3 py-2.5">
        <div className="flex items-center gap-2 pl-4 pr-3 shrink-0 border-r border-primary/25">
          <Megaphone className="w-4 h-4 text-primary" />
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary hidden sm:inline">
            Avisos
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee text-sm whitespace-nowrap">
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
