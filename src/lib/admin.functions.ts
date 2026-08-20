import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { AdminActionSchema } from "./admin.schemas";

const logAdminAction = async (supabaseAdmin: any, action: string, details: any, request?: Request) => {
  const ip = request?.headers.get("cf-connecting-ip") || request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  await supabaseAdmin.from("admin_logs").insert({
    action,
    details,
    ip_address: ip
  });
};

export const adminAction = createServerFn({ method: "POST" })
  .inputValidator(z.object({ 
    password: z.string(),
    payload: AdminActionSchema 
  }))
  .handler(async ({ data, request }) => {
    const adminPassword = process.env['ADMIN_PASSWORD'];
    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { action } = data.payload;

    // Log the attempt
    await logAdminAction(supabaseAdmin, action, data.payload, request);

    switch (action) {
      case "list-announcements": {
        const { data: announcements, error } = await supabaseAdmin
          .from("announcements")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { success: true, data: announcements };
      }

      case "get-metrics": {
        // Fetch key metrics for the dashboard
        const [
          { count: totalTools },
          { count: activeAnnouncements },
          { count: pendingVideoJobs }
        ] = await Promise.all([
          supabaseAdmin.from("downloader_status").select("*", { count: 'exact', head: true }),
          supabaseAdmin.from("announcements").select("*", { count: 'exact', head: true }).eq("active", true),
          supabaseAdmin.from("video_enhancement_jobs").select("*", { count: 'exact', head: true }).eq("status", "processing")
        ]);

        return { 
          success: true, 
          data: { 
            totalTools: totalTools || 0,
            activeAnnouncements: activeAnnouncements || 0,
            pendingVideoJobs: pendingVideoJobs || 0
          } 
        };
      }

      case "get-marquee": {
        const { data: marquee, error } = await supabaseAdmin
          .from("marquee_settings")
          .select("*")
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        return { success: true, data: marquee };
      }

      // Add other cases as needed following the schema...
      default:
        throw new Error("Ação não implementada");
    }
  });

export const listEnhancementJobs = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminPassword = process.env['ADMIN_PASSWORD'];

    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

    const { data: jobs, error } = await (supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50) as any);

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
