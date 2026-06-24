# Corrigir downloader do Kwai

## Diagnóstico

Testei a rota em produção (`/api/download-kwai?url=...`) e os 4 métodos atuais (`page scrape`, `mobile`, `GraphQL`, `savekwai`) falham todos. O retorno é sempre o erro genérico. Causas prováveis:

1. **Kwai bloqueia o Worker da Cloudflare** no scrape direto (`www.kwai.com` / `m.kwai.com` retornam HTML sem o `og:video` ou exigem JS).
2. **GraphQL `visionVideoDetail`** agora requer cookies de sessão / token CSRF — sem o cookie o endpoint devolve `null`.
3. **savekwai.com** trava (timeout > 30s na chamada `ajaxSearch`), então o último fallback nunca responde.

Ou seja: o pipeline atual está obsoleto. Preciso trocar os fallbacks por scrapers públicos que ainda funcionam.

## O que vou fazer

Reescrever **apenas** `src/routes/api.download-kwai.ts`, mantendo a mesma interface (request/response, proxy de mídia, validação) para não quebrar a UI.

### Novos métodos (ordem de tentativa)

1. **`tryKuaishouRedirect`** — força a URL para o domínio `m.kuaishou.com` (versão chinesa, sem bloqueio anti-bot agressivo) e extrai `photoUrl` do JSON inline `window.__APOLLO_STATE__` / `__INITIAL_STATE__`. Funciona para a maioria dos vídeos públicos.
2. **`tryOvoSnap`** — POST em `https://ovosnap.com/api/parse` (endpoint público, sem chave), passando `{ url, type: "kuaishou" }`. Retorna JSON com `videoUrl` + `cover`.
3. **`tryThedownvideo`** — POST em `https://thedownvideo.com/wp-json/aio-dl/video-data/` (WordPress plugin AIO-DL, mesmo padrão usado pelo snapsave). Retorna `{ medias: [...] }`.
4. **`tryPageScrape` aprimorado** — mantém o scrape atual como último recurso, mas com `User-Agent` rotativo + `Accept-Language: zh-CN` (engana o anti-bot do Kwai) e regex extra pra `playUrlV2`.

Todo fetch externo recebe `AbortSignal.timeout(8000)` pra nunca segurar o Worker mais de 8s por método (hoje o `savekwai` trava 30s+ e estoura o budget total).

### O que NÃO muda

- Endpoint, método, query params, formato da resposta (`MediaResponse`).
- Lógica de proxy (`?action=proxy`), allowlist em `proxy-url-guard.ts` (já cobre todos os hosts novos).
- Componente da UI que consome `proxy_url` / `video_url`.

### Validação

Depois do deploy:
1. `curl` na rota com link real do Kwai → esperar `success: true` e `media_url` apontando pra `.mp4` em CDN do Kwai/Kuaishou.
2. Testar o `proxy_url` retornado → status 200/206 com `Content-Type: video/mp4`.
3. Abrir `/ferramentas` na preview, colar o link, confirmar que o preview do vídeo aparece e o botão de download funciona.

## Detalhes técnicos

- Arquivo único editado: `src/routes/api.download-kwai.ts` (rewrite parcial — mantém `addProxyUrls`, `handleProxy`, `isValidKwaiUrl`, `corsHeaders`, exports `Route`).
- Adicionar `kuaishou.com` e `m.kuaishou.com` ao `ALLOWED_HOST_PATTERNS` em `src/lib/proxy-url-guard.ts` (CDN do Kuaishou serve em `*.kuaishouzt.com`, `*.gifshow.com` — já estão na lista).
- Sem novas dependências, sem variáveis de ambiente novas, sem migração de banco.
- Reportar resultado em `downloader-status.server` (já existe) pra UI mostrar status em tempo real.

## Risco / fallback

Se os 3 novos endpoints públicos saírem do ar no futuro, o método 4 (page scrape) ainda tenta. Se o usuário quiser confiabilidade máxima, posso depois integrar a Apify (`sian.agency/kwai-kuaishou-scraper`) como 5º fallback — mas exige `APIFY_TOKEN` pago, então deixei fora desta entrega.
