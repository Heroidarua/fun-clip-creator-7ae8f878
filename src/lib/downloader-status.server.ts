// Server-only helper that auto-updates the `downloader_status` table
// based on real success/failure of each download attempt. Fire-and-forget
// from route handlers; failures are swallowed so they never break a response.

type Platform = "tiktok" | "instagram" | "kwai" | "youtube" | "facebook" | "pinterest";

// In-memory throttle: avoid hammering the DB on every request.
// Only write when the desired status changes OR the last write was >5 min ago.
const lastWrite = new Map<Platform, { status: string; at: number }>();
const THROTTLE_MS = 5 * 60 * 1000;

export function reportDownloaderResult(platform: Platform, success: boolean): void {
  const desired = success ? "active" : "maintenance";
  const prev = lastWrite.get(platform);
  const now = Date.now();
  if (prev && prev.status === desired && now - prev.at < THROTTLE_MS) return;
  lastWrite.set(platform, { status: desired, at: now });

  // fire-and-forget
  (async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      // Check if supabaseAdmin is available before using it
      if (!supabaseAdmin) {
        console.warn("[downloader-status] supabaseAdmin not available");
        return;
      }
      
      const { error } = await supabaseAdmin
        .from("downloader_status" as never)
        .update({ status: desired, last_checked: new Date().toISOString() } as never)
        .eq("platform", platform);
        
      if (error) {
        console.error("[downloader-status] update error:", platform, error);
      }
    } catch (e) {
      console.error("[downloader-status] critical failure:", platform, e);
    }
  })();
}