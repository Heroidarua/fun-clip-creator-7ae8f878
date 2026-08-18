# SOS01 — Plano de Reconstrução do Backend Isolado do YouTube

Reconstruir o backend do YouTube de forma isolada, resiliente e segura, garantindo que o processamento (muxing) ocorra no servidor sempre que possível, seguindo as novas diretrizes do SOS01.

## 1. Nova Estrutura de Tabelas (Supabase)

Criaremos uma tabela para gerenciar o sistema de jobs assíncronos, permitindo downloads grandes sem travar a requisição HTTP.

*   `public.youtube_jobs`:
    *   `id`: UUID (Primary Key)
    *   `status`: text ('pending', 'processing', 'completed', 'failed')
    *   `video_id`: text
    *   `title`: text
    *   `quality`: text
    *   `format`: text
    *   `progress`: integer (0-100)
    *   `file_path`: text (caminho no storage se necessário)
    *   `error_message`: text
    *   `created_at`: timestamp
    *   `expires_at`: timestamp (limpeza automática)

## 2. API / Backend Isolado (`src/routes/api/youtube/*`)

Refatorar os endpoints atuais para uma estrutura mais robusta e desacoplada.

*   `POST /api/youtube/info`: Validação rigorosa e extração de metadados via InnerTube (fallback Piped/RapidAPI).
*   `POST /api/youtube/download`: Inicia o job ou retorna stream direto para arquivos pequenos.
*   `GET /api/youtube/status/:id`: Polling para acompanhar o progresso de jobs longos.
*   `GET /api/youtube/file/:token`: Endpoint de streaming final com validação de ticket HMAC.

## 3. Processamento no Servidor

*   **Streaming Direto**: Para formatos que já possuem áudio e vídeo (muxed), utilizaremos o proxy de stream chunked para evitar carregar o arquivo na memória.
*   **Muxing no Backend**: Utilizar o `ffmpeg` disponível no ambiente (se suportado pelo worker) ou uma estratégia de processamento em chunks. *Nota: Cloudflare Workers possuem limitações de tempo e CPU; usaremos streaming direto como prioridade.*

## 4. Segurança e Limites

*   **HMAC Tickets**: Garantir que a chave `YT_TICKET_SECRET` seja estável.
*   **Rate Limiting**: Aplicar por IP em todos os novos endpoints.
*   **Limites Reais**: Informar no frontend que arquivos > 1GB podem ter limitações de infraestrutura.

## 5. Frontend

*   Atualizar o `HeroSection.tsx` para se conectar aos novos endpoints.
*   Implementar visualização de progresso real baseada no sistema de jobs.

## Detalhes Técnicos (para o desenvolvedor)

*   `src/lib/youtube-tool.server.ts`: Centralizar lógica de tickets e rate limit.
*   `src/lib/youtube-resolver.server.ts`: Isolar a lógica de extração (InnerTube).
*   Utilizar `Response` com `ReadableStream` para o download por stream.
*   NÃO usar ffmpeg.wasm no frontend para arquivos > 500MB.

---
**Regra de Ouro**: O download só é considerado fixado quando um arquivo real de 720p (com áudio) for baixado com sucesso.
