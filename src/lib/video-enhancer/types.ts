import { z } from "zod";

export const VideoAnalysisSchema = z.object({
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  duration: z.number(),
  codec: z.string().optional(),
  bitrate: z.number().optional(),
  audioCodec: z.string().optional(),
  audioBitrate: z.number().optional(),
  size: z.number(),
});

export type VideoAnalysis = z.infer<typeof VideoAnalysisSchema>;

export type EnhancementMode = 'light' | 'standard' | 'maximum';
export type ResolutionTier = 'auto' | '720p' | '1080p' | '1440p' | '4k';

export interface EnhancementOptions {
  mode: EnhancementMode;
  targetResolution: ResolutionTier;
  audio: {
    reduceNoise: boolean;
    boostVoice: boolean;
    normalize: boolean;
  };
}
