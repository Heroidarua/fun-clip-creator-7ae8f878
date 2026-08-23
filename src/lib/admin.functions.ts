import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { isRateLimited } from "./admin-auth.server";

export const listEnhancementJobs = createServerFn({ method: "POST" })
  .inputValidator(z.object({ password: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const adminPassword = process.env['ADMIN_PASSWORD'];

    // Rate limiting check
    if (await isRateLimited({ headers: new Headers() } as any)) {
      throw new Error("Muitas tentativas. Aguarde alguns minutos.");
    }

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

    // Rate limiting check
    if (await isRateLimited({ headers: new Headers() } as any)) {
      throw new Error("Muitas tentativas. Aguarde alguns minutos.");
    }

    if (!adminPassword || data.password !== adminPassword) {
      throw new Error("Não autorizado");
    }

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