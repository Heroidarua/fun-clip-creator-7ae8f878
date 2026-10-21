# Plano de Recuperação do Downloader de YouTube

Corrigir a falha de download do YouTube na Home (HeroSection) restaurando a integração com os novos endpoints de API (`/api/youtube/*`) que foram implementados para maior estabilidade e suporte a arquivos grandes.

## Alterações

### Frontend

- **src/components/HeroSection.tsx**
    - Atualizar `handleYoutubeSearch` para usar o fluxo de tickets HMAC.
    - Sincronizar os estados de qualidade e formato com a nova API.
    - Garantir que o `downloadYoutubeMedia` seja chamado com os parâmetros corretos para acionar o muxing no navegador (para arquivos < 500MB) ou download direto (para > 500MB).

### Backend / API

- **src/services/youtubeDownloader.ts**
    - Verificar e garantir que `fetchYoutubeInfo` e `requestYoutubeDownload` estejam apontando para os endpoints corretos (`/api/youtube/info` e `/api/youtube/download`).

### Lógica de Download

- **src/lib/youtube-download-flow.ts**
    - Validar se a lógica de fallback para download direto (`window.location.href`) está funcionando quando o arquivo excede o limite do navegador.

## Detalhes Técnicos

- **Autenticação**: Uso de HMAC via `signTicket` e `verifyTicket` em `src/lib/youtube-tool.server.ts` para proteger os links de stream temporários.
- **Streaming**: Uso de `ReadableStream` com `Range` headers em `src/routes/api.youtube.file.ts` para suportar arquivos de até 1GB sem sobrecarregar a memória do servidor.
- **Muxing**: O `ffmpeg.wasm` multithreaded continuará sendo usado no cliente para unir vídeo e áudio de alta qualidade quando necessário.
