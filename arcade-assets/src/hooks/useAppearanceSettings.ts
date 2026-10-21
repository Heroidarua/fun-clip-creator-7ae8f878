import { useEffect, useState } from "react";
import { fromTable } from "@/integrations/supabase/helpers";
import {
  DEFAULT_SIDEBAR_MARQUEE_SETTINGS,
  type SidebarMarqueeSettings,
} from "@/lib/marquee-settings";
import { DEFAULT_BUTTON_SETTINGS, type ButtonSettings } from "@/lib/button-settings";

async function loadSingleton(table: string) {
  try {
    const { data } = await fromTable(table).select("*").limit(1).maybeSingle();
    return data ?? null;
  } catch {
    return null;
  }
}

export function useSidebarMarqueeSettings() {
  const [settings, setSettings] = useState<SidebarMarqueeSettings>(
    DEFAULT_SIDEBAR_MARQUEE_SETTINGS
  );

  useEffect(() => {
    let alive = true;
    loadSingleton("sidebar_marquee_settings").then((data) => {
      if (alive && data) {
        setSettings({ ...DEFAULT_SIDEBAR_MARQUEE_SETTINGS, ...(data as SidebarMarqueeSettings) });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}

export function useButtonSettings() {
  const [settings, setSettings] = useState<ButtonSettings>(DEFAULT_BUTTON_SETTINGS);

  useEffect(() => {
    let alive = true;
    loadSingleton("button_settings").then((data) => {
      if (alive && data) {
        setSettings({ ...DEFAULT_BUTTON_SETTINGS, ...(data as ButtonSettings) });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return settings;
}
