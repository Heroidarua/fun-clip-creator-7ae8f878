# Deploy no Netlify

Este projeto usa TanStack Start com SSR. Em produção no Netlify, as rotas de
servidor (`src/routes/api.*.ts`) rodam dentro de uma Netlify Function.

## Passos

1. Faça push do repositório para o GitHub/GitLab.
2. No Netlify, **Add new site → Import from Git** e selecione o repo.
3. As configurações de build são lidas automaticamente do `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist/client`
   - Functions directory: `netlify/functions`
   - Variável de ambiente: `TARGET=netlify`
4. Em **Site settings → Environment variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
   - `LOVABLE_API_KEY` (para as ferramentas de IA)
   - `INSTAGRAM_SESSION_ID`, `INSTAGRAM_CSRF_TOKEN`, `INSTAGRAM_DS_USER_ID`
     (somente se quiser stories/reels privados)
5. Clique em **Deploy site**.

## Como funciona

- `npm run build` é executado com `TARGET=netlify`.
- O `vite.config.ts` desativa o plugin Cloudflare nesse modo.
- O TanStack Start gera `dist/client` (estático) e `dist/server/server.js`
  (handler SSR com export default `{ fetch }`).
- `netlify/functions/server.mjs` importa esse handler e responde a todas as
  requests via o redirect `/* → /.netlify/functions/server`.