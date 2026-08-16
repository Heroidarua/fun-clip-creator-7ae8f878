import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { analyzeVideo } from "@/lib/video-enhancer/analyzer.server";
import { processVideo } from "@/lib/video-enhancer/engine.server";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "fs";
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

          // Iniciar processamento assíncrono para não travar o request de upload
          // Mas como o TanStack Start espera uma resposta, vamos pelo menos atualizar para 'processing'
          await supabaseAdmin
            .from("video_enhancement_jobs")
            .update({ status: "processing", progress: 5 })
            .eq("id", jobId);

          // Execução do processamento (idealmente isto seria um background task, mas no sandbox executamos aqui)
          (async () => {
            try {
              const analysis = await analyzeVideo(inputPath);
              
              await supabaseAdmin
                .from("video_enhancement_jobs")
                .update({ 
                  progress: 20,
                  input_metadata: analysis as any
                })
                .eq("id", jobId);

              await processVideo(inputPath, outputPath, options, async (progress) => {
                await supabaseAdmin
                  .from("video_enhancement_jobs")
                  .update({ progress: 20 + Math.floor(progress * 0.7) })
                  .eq("id", jobId);
              });

              // Upload para Supabase Storage
              const outputBuffer = Buffer.from(require("fs").readFileSync(outputPath));
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

              await supabaseAdmin
                .from("video_enhancement_jobs")
                .update({ 
                  status: "completed", 
                  progress: 100, 
                  output_url: publicUrl 
                })
                .eq("id", jobId);

            } catch (err: any) {
              console.error("Processing error for job", jobId, err);
              await supabaseAdmin
                .from("video_enhancement_jobs")
                .update({ 
                  status: "failed", 
                  error_message: err.message 
                })
                .eq("id", jobId);
            } finally {
              // Limpeza
              if (existsSync(inputPath)) unlinkSync(inputPath);
              if (existsSync(outputPath)) unlinkSync(outputPath);
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
