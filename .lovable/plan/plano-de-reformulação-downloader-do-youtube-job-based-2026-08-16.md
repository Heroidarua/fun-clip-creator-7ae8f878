# Plano de Reformulação: Downloader do YouTube (Job-Based)

O objetivo é transformar o fluxo de download em um sistema baseado em tarefas (jobs) no banco de dados, permitindo maior estabilidade e suporte a arquivos maiores (até 500MB).

## Mudanças Técnicas

### 1. Frontend (`HeroSection.tsx` e `services/`)
- **Novo Serviço**: `src/services/youtubeJobs.ts` para consultar o status da tarefa.
- **Fluxo de UI**: 
  1. `Buscar` -> Mostra metadados e opções de qualidade.
  2. `Baixar` -> Inicia tarefa no servidor -> Recebe `jobId`.
  3. **Polling**: Consulta `/api/youtube/status` a cada 2s.
  4. **Conclusão**: Quando `status === 'COMPLETED'`, inicia o download real ou processo de muxagem.
- **Muxagem Inteligente**: Se o arquivo for menor que 300MB, faz muxing no navegador (ffmpeg). Se for maior, baixa o arquivo direto processado pelo servidor.

### 2. Backend (APIs)
- **`/api/youtube/info`**: Retorna resoluções disponíveis.
- **`/api/youtube/download`**: Cria entrada na tabela `youtube_download_jobs` e retorna o ID.
- **`/api/youtube/status`**: Endpoint de leitura do Supabase para o cliente acompanhar o progresso.
- **`/api/youtube/file`**: O proxy de streaming agora valida o `jobId` e atualiza o status para `PROCESSING`.

### 3. Segurança e Limites
- Aumento do limite máximo de **300MB** para **500MB** no servidor.
- Proteção por HMAC (tokens assinados) nos links de download.
- Rate limiting por IP no início do processo.

## Próximos Passos
1. Restaurar o componente `HeroSection.tsx` com a lógica de polling.
2. Atualizar o `youtube-resolver.server.ts` para extrair formatos de alta qualidade (4K/1080p).
3. Validar o fluxo ponta a ponta com o banco de dados.
