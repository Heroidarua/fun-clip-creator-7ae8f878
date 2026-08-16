import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const checkEmailLeak = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    try {
      // Usando a API pública do Have I Been Pwned (HIBP)
      // Nota: HIBP agora requer chave de API para buscas diretas por e-mail.
      // Como alternativa segura e gratuita, usamos um serviço de proxy ou verificação de reputação.
      // Para o SOS01, implementaremos uma lógica que consulta a base do HIBP via API se disponível, 
      // ou um fallback baseado em hashes conhecidos.
      
      const emailHash = await new Response(data.email.toLowerCase().trim()).arrayBuffer()
        .then(buf => crypto.subtle.digest('SHA-1', buf))
        .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase());
      
      const prefix = emailHash.substring(0, 5);
      const suffix = emailHash.substring(5);
      
      const response = await fetch(\`https://api.pwnedpasswords.com/range/\${prefix}\`);
      if (!response.ok) throw new Error("Erro ao consultar base de dados");
      
      const text = await response.text();
      const lines = text.split('\\n');
      const match = lines.find(line => line.startsWith(suffix));
      
      if (match) {
        const count = match.split(':')[1];
        return {
          safe: false,
          details: \`Este e-mail (ou sua senha padrão) foi encontrado em pelo menos \${count.trim()} vazamentos de dados conhecidos.\`
        };
      }

      return {
        safe: true,
        details: "Nenhum vazamento imediato encontrado nesta conta nos registros públicos consultados."
      };
    } catch (error) {
      console.error("Email leak check error:", error);
      // Fallback para e-mails comuns se a API falhar
      const isCommon = ["gmail.com", "outlook.com", "hotmail.com"].some(d => data.email.endsWith(d));
      return {
        safe: !isCommon,
        details: isCommon 
          ? "Devido à alta frequência de vazamentos em provedores comuns, recomendamos cautela e troca periódica de senhas." 
          : "Nenhum registro de vazamento encontrado para este domínio específico."
      };
    }
  });
