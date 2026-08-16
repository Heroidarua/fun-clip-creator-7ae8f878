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

type CreateJobInput = {
  filename: string;
  size: number;
  options: {
    mode: 'light' | 'standard' | 'maximum';
    targetResolution: 'auto' | '720p' | '1080p' | '1440p' | '4k';
    audio: {
      reduceNoise: boolean;
      boostVoice: boolean;
      normalize: boolean;
    };
  };
};

export const createEnhancementJob = createServerFn({ method: "POST" })
  .validator((data: CreateJobInput) => JobOptionsSchema.parse(data.options) && data)
  .handler(async ({ data }: { data: CreateJobInput }) => {
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
    return job;
  });

export const getJobStatus = createServerFn({ method: "GET" })
  .validator((data: { jobId: string }) => data)
  .handler(async ({ data }: { data: { jobId: string } }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: job, error } = await supabaseAdmin
      .from("video_enhancement_jobs" as any)
      .select("*")
      .eq("id", data.jobId)
      .single();

    if (error) throw error;
    return job;
  });
