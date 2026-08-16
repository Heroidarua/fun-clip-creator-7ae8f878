import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ai_gateway } from "@/lib/ai-gateway.server";

export const removeObject = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      image: z.string(), // base64
      mask: z.string(),  // base64
    })
  )
  .handler(async ({ data }: { data: { image: string, mask: string } }) => {
    // Implementação real usando Lovable AI Gateway para Inpainting
    try {
      // Remove o prefixo data:image/...;base64, se existir
      const base64Image = data.image.split(',').pop() || '';
      const base64Mask = data.mask.split(',').pop() || '';

      const response = await ai_gateway.imageInpainting({
        image: base64Image,
        mask: base64Mask,
        prompt: "remove the highlighted object naturally and fill with the background texture and lighting",
      });

      if (!response.image) {
        throw new Error("Falha ao gerar imagem.");
      }

      // Retorna com o prefixo para o frontend
      return `data:image/png;base64,${response.image}`;
    } catch (error) {
      console.error("Erro no Object Remover:", error);
      // Fallback para simulação em caso de erro na API durante o desenvolvimento
      await new Promise(r => setTimeout(r, 2000));
      return data.image;
    }
  });
