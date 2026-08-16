import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { analyzeVideo } from "@/lib/video-enhancer/analyzer.server";
import { processVideo } from "@/lib/video-enhancer/engine.server";
import { existsSync, mkdirSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export const Route = createFileRoute("/api/video-enhancer/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const file = formData.get("file") as File;
          const jobId = formData.get("jobId") as string;
          const optionsStr = formData.get("options") as string;

          if (!file || !jobId) {
            return Response.json({ error: "Missing file or jobId" }, { status: 400 });
          }

          const options = JSON.parse(optionsStr);
          const tempDir = join(tmpdir(), "video-enhancer");
          if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

          const inputPath = join(tempDir, `${jobId}_input`);
          const outputPath = join(tempDir, `${jobId}_output.mp4`);

          // Salvar buffer do arquivo em disco para processamento shell
          const buffer = Buffer.from(await file.arrayBuffer());
          writeFileSync(inputPath, buffer);

          // Iniciar processamento
          await (supabaseAdmin
            .from("video_enhancement_jobs" as any)
            .update({ status: "processing", progress: 5 } as any)
            .eq("id", jobId) as any);

          // Execução do processamento assíncrono
          (async () => {
            try {
              const analysis = await analyzeVideo(inputPath);
              
              await (supabaseAdmin
                .from("video_enhancement_jobs" as any)
                .update({ 
                  progress: 20,
                  input_metadata: analysis as any
                } as any)
                .eq("id", jobId) as any);

              await processVideo(inputPath, outputPath, options, async (progress) => {
                await (supabaseAdmin
                  .from("video_enhancement_jobs" as any)
                  .update({ progress: 20 + Math.floor(progress * 0.7) } as any)
                  .eq("id", jobId) as any);
              });

              // Upload para Supabase Storage
              const outputBuffer = readFileSync(outputPath);
              const storagePath = `enhanced/${jobId}.mp4`;
              
              const { error: uploadError } = await supabaseAdmin.storage
                .from("videos")
                .upload(storagePath, outputBuffer, {
                  contentType: "video/mp4",
                  upsert: true
                });

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabaseAdmin.storage
                .from("videos")
                .getPublicUrl(storagePath);

              await (supabaseAdmin
                .from("video_enhancement_jobs" as any)
                .update({ 
                  status: "completed", 
                  progress: 100, 
                  output_url: publicUrl 
                } as any)
                .eq("id", jobId) as any);

            } catch (err: any) {
              console.error("Processing error for job", jobId, err);
              await (supabaseAdmin
                .from("video_enhancement_jobs" as any)
                .update({ 
                  status: "failed", 
                  error_message: err.message 
                } as any)
                .eq("id", jobId) as any);
            } finally {
              // Limpeza
              try {
                if (existsSync(inputPath)) unlinkSync(inputPath);
                if (existsSync(outputPath)) unlinkSync(outputPath);
              } catch (e) {
                console.error("Cleanup error:", e);
              }
            }
          })();

          return Response.json({ success: true, jobId });
        } catch (error: any) {
          console.error("Upload handler error:", error);
          return Response.json({ error: error.message }, { status: 500 });
        }
      }
    }
  }
});
