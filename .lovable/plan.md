# Plano de Reformulação: YouTube Downloader SOS01

Reformulação completa da arquitetura do downloader do YouTube para garantir estabilidade, suporte a altas resoluções (4K/MP4/MP3) e processamento assíncrono seguro com limite de 500 MB.

## Alterações

### Backend (Server Functions e API Routes)
- **Nova Tabela `youtube_download_jobs`**: Criar tabela no Supabase para gerenciar o estado das tarefas (PENDING, PROCESSING, COMPLETED, FAILED).
- **Refatoração `src/lib/youtube-resolver.server.ts`**: Melhorar a extração via InnerTube com suporte a múltiplos clientes e detecção precisa de formatos muxed/adaptive.
- **Nova Rota `/api/youtube/info`**: Validar URL e retornar metadados reais + qualidades disponíveis.
- **Nova Rota `/api/youtube/download`**: Iniciar tarefa de processamento, verificar limite de 500 MB e retornar um ID de job.
- **Nova Rota `/api/youtube/status`**: Endpoint para o frontend consultar o progresso do processamento.
- **Refatoração `/api/youtube/file`**: Transmitir o arquivo final via streaming com suporte a Range headers e expiração de tokens.

### Frontend (Componentes e Lógica)
- **Refatoração `HeroSection.tsx`**: Integrar o novo fluxo de tarefas (Busca -> Seleção -> Job -> Progresso -> Download).
- **Interface Dinâmica**: Mostrar apenas qualidades existentes no vídeo original.
- **Barra de Progresso Real**: Refletir o estado real do processamento no servidor ou do streaming no navegador.
- **Validação Robusta**: Implementar `extractYouTubeVideoId` centralizado para garantir normalização de URLs.

### Segurança e Performance
- **Rate Limiting**: Aplicar limites por IP para evitar abuso.
- **Streaming & Chunks**: Usar transferência em blocos para economizar memória no servidor.
- **Limpeza Automática**: Garantir que links temporários expirem e recursos sejam liberados.

## Detalhes Técnicos
- **Linguagem**: TypeScript.
- **Processamento**: Muxing no servidor para arquivos complexos ou no cliente (FFmpeg.wasm) para otimização, dependendo do cenário.
- **Banco de Dados**: Supabase (PostgreSQL) para persistência de jobs curtos.
- **Limite**: 500 MB hard limit no backend.
- **Compatibilidade**: MP4 (H.264) e MP3.

