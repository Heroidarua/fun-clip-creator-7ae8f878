import { useState, useEffect, useCallback } from "react";
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

interface StatusState {
  statuses: Record<string, boolean>;
  items: DownloaderStatus[];
  loading: boolean;
}

// Shared store so multiple <FeatureGate /> instances trigger a single query
// instead of one request per mounted component.
let cache: StatusState = { statuses: {}, items: [], loading: true };
let inFlight: Promise<void> | null = null;
const listeners = new Set<(s: StatusState) => void>();

function emit(next: StatusState) {
  cache = next;
  listeners.forEach((l) => l(next));
}

async function loadStatuses(force = false): Promise<void> {
  if (inFlight) return inFlight;
  if (!force && !cache.loading) return;

  inFlight = (async () => {
    try {
      const { data, error } = await fromTable("downloader_status").select("*");
      if (error) throw error;

      const rows = (data as DownloaderStatus[]) || [];
      const statusMap: Record<string, boolean> = {};
      rows.forEach((item) => {
        statusMap[item.platform] = item.status === "active";
      });
      emit({ statuses: statusMap, items: rows, loading: false });
    } catch (error) {
      console.error("Error fetching downloader statuses:", error);
      emit({ ...cache, loading: false });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

export const useDownloaderStatus = () => {
  const [state, setState] = useState<StatusState>(cache);

  useEffect(() => {
    let mounted = true;
    const listener = (s: StatusState) => {
      if (mounted) setState(s);
    };
    listeners.add(listener);
    setState(cache);
    void loadStatuses();

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  const isActive = useCallback(
    (featureKey: string): boolean => state.statuses[featureKey] ?? true,
    [state.statuses],
  );

  const refetch = useCallback(() => loadStatuses(true), []);

  return {
    statuses: state.statuses,
    items: state.items,
    loading: state.loading,
    isActive,
    refetch,
  };
};
