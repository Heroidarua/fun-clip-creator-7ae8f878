import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AdminActionSchema } from "./admin.schemas";

const logAdminAction = async (supabaseAdmin: any, action: string, details: any, request?: Request) => {
  // Use a simplified way to get IP if request isn't easily accessible in server fn context
  const ip = "server-side"; 
  try {
    await supabaseAdmin.from("admin_logs").insert({
      action,
      details: JSON.stringify(details),
      ip_address: ip
    });
  } catch (e) {
    console.error("Failed to log admin action:", e);
  }
};

export const adminAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ 
    password: z.string(),
    payload: AdminActionSchema 
  }))
  .handler(async ({ data }) => {
    const adminPassword = process.env['ADMIN_PASSWORD'];
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = data.payload;
    const action = payload.action;

    // Log the attempt
    await logAdminAction(supabaseAdmin, action, payload);


    switch (action) {
      case "list-announcements": {
        const { data: announcements, error } = await supabaseAdmin
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { success: true, data: announcements };
      }

      case "create-announcement": {
        const { error } = await supabaseAdmin
          .from("announcements")
          .insert({
            title: (payload as any).data.title,
            message: (payload as any).data.message,
            active: true
          });
        if (error) throw error;
        return { success: true };
      }

      case "delete-announcement": {
        const { error } = await supabaseAdmin
          .from("announcements")
          .delete()
          .eq("id", (payload as any).id);
        if (error) throw error;
        return { success: true };
      }

      case "get-metrics": {
        const [
          totalToolsRes,
          activeAnnouncementsRes,
          pendingVideoJobsRes
        ] = await Promise.all([
          supabaseAdmin.from("downloader_status").select("*", { count: 'exact', head: true }),
          supabaseAdmin.from("announcements").select("*", { count: 'exact', head: true }).eq("active", true),
          supabaseAdmin.from("video_enhancement_jobs").select("*", { count: 'exact', head: true }).eq("status", "processing")
        ]);

        return { 
          success: true, 
          data: { 
            totalTools: totalToolsRes.count || 0,
            activeAnnouncements: activeAnnouncementsRes.count || 0,
            pendingVideoJobs: pendingVideoJobsRes.count || 0
          } 
        };
      }

      case "save-marquee": {
        const { error } = await supabaseAdmin
          .from("marquee_settings")
          .upsert({
            ...(payload as any).data,
            singleton: true
          }, { onConflict: 'singleton' });
        if (error) throw error;
        return { success: true };
      }

      case "get-button-settings": {
        const { data, error } = await supabaseAdmin
          .from("button_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return { success: true, data };
      }

      case "save-button-settings": {
        const { error } = await supabaseAdmin
          .from("button_settings")
          .upsert({
            ...(payload as any).data,
            singleton: true
          }, { onConflict: 'singleton' });
        if (error) throw error;
        return { success: true };
      }

      case "list-tools": {
        const { data, error } = await supabaseAdmin
          .from("downloader_status")
          .select("*")
          .order("feature_name", { ascending: true });
        if (error) throw error;
        return { success: true, data };
      }

      case "update-tool-status": {
        const { error } = await supabaseAdmin
          .from("downloader_status")
          .update({ 
            status: (payload as any).status,
            last_checked: new Date().toISOString()
          })
          .eq("id", (payload as any).id);
        if (error) throw error;
        return { success: true };
      }

      default:
        throw new Error("Ação não implementada");
    }
  });

export const listEnhancementJobs = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const adminPassword = process.env['ADMIN_PASSWORD'];
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Log access
    await logAdminAction(supabaseAdmin, "list-enhancement-jobs", { timestamp: new Date().toISOString() });

    const { data: jobs, error } = await supabaseAdmin
      .from("video_enhancement_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data: jobs };
  });

export const deleteEnhancementJob = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string(), jobId: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminPassword = process.env['ADMIN_PASSWORD'];

    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

    const { data: job } = await (supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .select("output_url")
      .eq("id", data.jobId)
      .single() as any);

    if (job?.output_url) {
      const path = job.output_url.split('/public/videos/')[1];
      if (path) {
        await supabaseAdmin.storage.from("videos").remove([path]);
      }
    }

    const { error } = await (supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .delete()
      .eq("id", data.jobId) as any);

    if (error) throw error;
    return { success: true };
  });
