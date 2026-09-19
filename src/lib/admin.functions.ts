import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { clearRateLimit, isRateLimited, timingSafeEqual } from "./admin-auth.server";

export const listEnhancementJobs = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminPassword = process.env['ADMIN_PASSWORD'];

    const request = getRequest();
    if (!adminPassword || !timingSafeEqual(data.password, adminPassword)) {
      if (await isRateLimited(request)) {
        throw new Error("Muitas tentativas. Aguarde cinco minutos.");
      }
      throw new Error("Não autorizado");
    }
    await clearRateLimit(request);

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

    const request = getRequest();
    if (!adminPassword || !timingSafeEqual(data.password, adminPassword)) {
      if (await isRateLimited(request)) {
        throw new Error("Muitas tentativas. Aguarde cinco minutos.");
      }
      throw new Error("Não autorizado");
    }
    await clearRateLimit(request);

    // First get the job to find the file to delete from storage if it exists
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