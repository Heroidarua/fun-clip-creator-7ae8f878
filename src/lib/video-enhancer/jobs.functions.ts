import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const createEnhancementJob = createServerFn({ method: "POST" })
  .input(z.object({
    filename: z.string(),
    size: z.number(),
    options: z.any()
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs")
      .insert({
        original_filename: data.filename,
        input_size: data.size,
        enhancement_mode: data.options.mode,
        audio_enhancement: data.options.audio,
        status: 'queued',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return job;
  });

export const getJobStatus = createServerFn({ method: "GET" })
  .input(z.object({ jobId: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs")
      .select("*")
      .eq("id", data.jobId)
      .single();

    if (error) throw error;
    return job;
  });
