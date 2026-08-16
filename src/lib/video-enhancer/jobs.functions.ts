import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const JobOptionsSchema = z.object({
  mode: z.enum(['light', 'standard', 'maximum']),
  targetResolution: z.enum(['auto', '720p', '1080p', '1440p', '4k']),
  audio: z.object({
    reduceNoise: z.boolean(),
    boostVoice: z.boolean(),
    normalize: z.boolean(),
  }),
});

export const createEnhancementJob = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    filename: z.string(),
    size: z.number(),
    options: JobOptionsSchema
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .insert({
        original_filename: data.filename,
        input_size: data.size,
        enhancement_mode: data.options.mode,
        audio_enhancement: data.options.audio,
        status: 'queued',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } as any)
      .select()
      .single();

    if (error) throw error;
    return job as any;
  });

export const getJobStatus = createServerFn({ method: "GET" })
  .inputValidator(z.object({ jobId: z.string() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .select("*")
      .eq("id", data.jobId)
      .single();

    if (error) throw error;
    return job as any;
  });
