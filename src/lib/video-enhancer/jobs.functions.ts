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
  .handler(async (ctx: any) => {
    // Input is at ctx.data in Start v1
    const data = ctx.data;
    
    const validated = z.object({
      filename: z.string(),
      size: z.number(),
      options: JobOptionsSchema
    }).parse(data);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .insert({
        original_filename: validated.filename,
        input_size: validated.size,
        enhancement_mode: validated.options.mode,
        audio_enhancement: validated.options.audio,
        status: 'queued',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } as any)
      .select()
      .single();

    if (error) throw error;
    return job as any;
  });

export const getJobStatus = createServerFn({ method: "GET" })
  .handler(async (ctx: any) => {
    const data = ctx.data;
    const { jobId } = z.object({ jobId: z.string() }).parse(data);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) throw error;
    return job as any;
  });
