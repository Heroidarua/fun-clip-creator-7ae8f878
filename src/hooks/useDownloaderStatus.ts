import { useState, useEffect } from "react";
import { fromTable } from "@/integrations/supabase/helpers";

interface DownloaderStatus {
  id: string;
  name: string;
  is_active: boolean;
  updated_at: string;
}

export const useDownloaderStatus = () => {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      const { data, error } = await fromTable("downloader_status").select("*");

      if (error) throw error;

      const statusMap: Record<string, boolean> = {};
      (data as DownloaderStatus[] || []).forEach((item) => {
        statusMap[item.id] = item.is_active;
      });
      setStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching downloader statuses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const isActive = (downloaderId: string): boolean => {
    return statuses[downloaderId] ?? true;
  };

  return { statuses, loading, isActive, refetch: fetchStatuses };
};
