import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const setupStorage = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      // 1. Criar bucket se não existir
      const { data, error } = await supabaseAdmin.storage.createBucket('videos', {
        public: true,
        fileSizeLimit: 524288000, // 500MB
        allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo']
      });

      if (error && error.message !== 'Bucket already exists') {
        console.error("Storage Setup Error (Create Bucket):", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Storage Setup Fatal Error:", err);
      return { success: false, error: err.message };
    }
  });
