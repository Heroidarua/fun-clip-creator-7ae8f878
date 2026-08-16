# Plano de Correção Emergencial - Downloader do Instagram

O objetivo deste plano é restabelecer o funcionamento do downloader do Instagram no SOS01, revertendo para a implementação funcional anterior ou corrigindo o fluxo atual que está apresentando falhas no processamento de mídia.

## Problema Identificado
O downloader do Instagram parou de funcionar recentemente. A análise preliminar indica que a chamada para o endpoint `/api/download-instagram` está falhando ao processar URLs de reels/posts, possivelmente devido a mudanças na API de terceiros (Snapsave/RapidAPI) ou no tratamento de CORS/Proxy.

## Ações

### 1. Diagnóstico e Reversão
- Analisar o arquivo `src/routes/api.download-instagram.ts` para identificar por que a função `downloadInstagramMedia` está falhando.
- Verificar o histórico recente de commits para identificar a última versão estável da lógica de download.
- Se a implementação com RapidAPI estiver falhando, priorizar o fallback para Snapsave ou extração direta via `tryDirectScrape`.

### 2. Correção do Backend (API Route)
- Ajustar o handler de `POST` em `src/routes/api.download-instagram.ts` para garantir que as URLs sejam normalizadas corretamente antes do processamento.
- Validar se os cabeçalhos de CORS (`Access-Control-Allow-Origin: *`) estão sendo enviados corretamente.
- Garantir que o `handleProxy` não esteja bloqueando requisições legítimas dos CDNs do Instagram (verificar `isSafeProxyUrl`).

### 3. Ajuste no Frontend (HeroSection)
- Verificar a chamada `fetchJsonWithRetry` em `src/components/HeroSection.tsx`.
- Garantir que o payload enviado pelo frontend seja exatamente o que o backend espera.
- Melhorar o log de erro no frontend para exibir a mensagem real retornada pelo servidor em caso de falha.

### 4. Validação e Testes
- Testar o fluxo completo no ambiente de preview:
    1. Colar URL de Reel.
    2. Clicar em Buscar.
    3. Verificar se o preview (thumb/título) aparece.
    4. Clicar em Download e verificar se o arquivo é gerado.
- Testar com URLs de posts de imagem únicos e carrosséis.

## Detalhes Técnicos
- **Endpoint**: `/api/download-instagram`
- **Método**: POST
- **Payload**: `{ "url": "..." }`
- **Mecanismos de Fallback**: Snapsave -> RapidAPI -> Direct Scrape.

*Nota: Não serão feitas alterações visuais ou em outras ferramentas (YouTube, TikTok, etc.) conforme solicitado.*
