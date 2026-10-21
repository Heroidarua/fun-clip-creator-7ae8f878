# Deploy na Cloudflare Workers

Este projeto está configurado para rodar em Cloudflare Workers (SSR + assets
estáticos), usando `@cloudflare/vite-plugin` e `@tanstack/react-start`.

## Pré-requisitos

- Conta Cloudflare e `wrangler` autenticado: `bunx wrangler login`
- Node 20+ (ver `.nvmrc`)

## Variáveis de ambiente (Secrets)

No painel **Workers & Pages → seu Worker → Settings → Variables**, defina:

| Nome | Onde usar |
|------|-----------|
| `SUPABASE_URL` | servidor (server fns) |
| `SUPABASE_PUBLISHABLE_KEY` | servidor (server fns) |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor (admin) |
| `LOVABLE_API_KEY` | servidor (AI Gateway) |
| `VITE_SUPABASE_URL` | build (cliente) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build (cliente) |
| `VITE_SUPABASE_PROJECT_ID` | build (cliente) |

Variáveis com prefixo `VITE_` são embutidas no bundle no momento do build —
exporte-as antes de rodar `bun run build`.

## Build & Deploy

```bash
bun install
bun run build       # gera dist/client + dist/server (Worker)
bunx wrangler deploy
```

Ou em um único comando: `bun run deploy`.

## Configuração

- `wrangler.jsonc` — runtime do Worker (compat date, nodejs_compat, observability).
- `vite.config.ts` — `@cloudflare/vite-plugin` é ativado apenas no `vite build`.
- O entry do Worker é resolvido automaticamente pelo plugin do TanStack Start.

## Domínio customizado

No Cloudflare Dashboard → Workers & Pages → seu Worker → Settings → Domains
& Routes, adicione um custom domain. O DNS é gerenciado automaticamente se o
domínio já estiver no Cloudflare.