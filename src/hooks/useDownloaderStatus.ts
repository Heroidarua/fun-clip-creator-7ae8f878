import { useState, useEffect } from "react";
import { fromTable } from "@/integrations/supabase/helpers";

interface DownloaderStatus {
  id: string;
  platform: string;
  status: string;
  last_checked: string;
  created_at: string;
  category?: string | null;
  label?: string | null;
}

export const useDownloaderStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<DownloaderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await fromTable("downloader_status").select("*");

      if (error) throw error;

      const statusMap: Record<string, boolean> = {};
      const rows = (data as DownloaderStatus[]) || [];
      rows.forEach((item) => {
        statusMap[item.platform] = item.status === "active";
      });
      setStatuses(statusMap);
      setItems(rows);
    } catch (error) {
      console.error("Error fetching downloader statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const isActive = (featureKey: string): boolean => {
    return statuses[featureKey] ?? true;
  };

  return { statuses, items, loading, isActive, refetch: fetchStatuses };
};
