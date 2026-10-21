---
name: Correção do Downloader e Preview do YouTube
description: Restaura a funcionalidade de download e prévia do YouTube corrigindo o seletor de formatos no InnerTube e o handshake de parâmetros entre frontend e backend.
type: feature
---

# Plano de Correção: YouTube Downloader & Preview

O sistema de download do YouTube parou de funcionar devido a mudanças na resposta da API interna (InnerTube) que agora exige `visitorData` e rotatividade de clientes para evitar bloqueios (`LOGIN_REQUIRED`). Além disso, o mini-preview falha quando o backend não encontra candidatos com áudio e vídeo combinados (muxed).

## Alterações Propostas

### 1. Backend: Otimização do `youtube-resolver.server.ts`
- Atualizar a lógica de `visitorData` para ser mais resiliente.
- Ajustar `pickInnertubeFormats` para aceitar vídeos mesmo que não sejam "Muxed" (sem áudio embutido) durante a fase de **preview**, já que o player de preview pode lidar com o vídeo mudo ou o sistema pode fazer o fallback para outros provedores (Piped/Y2Mate) mais rapidamente.
- Garantir que o `media_ua` seja preservado para evitar erros 403 no proxy de stream.

### 2. Rotas de API: Ajuste de Handshake
- **`api.download-youtube-stream.ts`**: Melhorar o tratamento de erro quando apenas formatos parciais são encontrados. Permitir que o parâmetro `preview=1` relaxe a exigência de áudio se for apenas para visualização rápida da imagem do vídeo.
- **`api.youtube.file.ts`**: Sincronizar com as mudanças de ticket para garantir que `quality` seja validado corretamente.

### 3. Frontend: `HeroSection.tsx`
- Corrigir a construção da URL do `MediaPreviewOverlay`.
- Garantir que a seleção de qualidade (`best`, `high`, `worst`) no frontend coincida exatamente com o que o `api.youtube.download` espera para gerar o ticket HMAC.

## Detalhes Técnicos
- O erro `422` (Unprocessable Entity) no preview indica que o backend encontrou o vídeo mas recusou por não ser "muxed". Vou suavizar essa regra para o modo `preview`.
- O `visitorData` será atualizado usando um endpoint mais estável.

## Verificação
- Testar download de vídeo 720p (HD).
- Testar download de áudio (M4A).
- Validar se o mini-player de preview carrega sem erros.
