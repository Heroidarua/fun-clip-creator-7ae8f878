import { useEffect, useState } from "react";
import { fromTable } from "@/integrations/supabase/helpers";
import { Megaphone } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border border-primary/30 rounded-xl p-4 mb-4 backdrop-blur-sm animate-fade-in"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-primary/20 rounded-full p-2">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {announcement.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {announcement.content}
              </p>
              <span className="text-xs text-muted-foreground/60 mt-2 block">
                {new Date(announcement.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
