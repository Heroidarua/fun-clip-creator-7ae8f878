## Plano: Integrar RapidAPI (instagram120) para downloads do Instagram

Você compartilhou uma chave RapidAPI funcional para o host `instagram120.p.rapidapi.com`. Vou usá-la para reativar o downloader do Instagram.

### Importante — segurança
A chave que você colou no chat fica exposta publicamente nesta conversa. **Recomendo fortemente** que você a rotacione no painel da RapidAPI depois (gerar nova key e revogar a antiga). Vou armazenar a chave como secret (`RAPIDAPI_KEY`) no backend — ela nunca aparecerá no código nem no bundle do cliente.

### O que vou fazer

1. **Solicitar o secret `RAPIDAPI_KEY`** via formulário seguro (você cola a chave lá, não no chat).
2. **Reescrever `src/routes/api.download-instagram.ts`** para:
   - Chamar `POST https://instagram120.p.rapidapi.com/api/instagram/posts` com headers `x-rapidapi-host` e `x-rapidapi-key`.
   - Extrair shortcode/username da URL do Instagram colada pelo usuário.
   - Normalizar a resposta para o formato `MediaData` já usado no front (campos `media_url`, `thumbnail`, `title`, `author`, carousel etc).
   - Manter o `handleProxy` existente para streaming/CORS.
   - Fallback: scrape direto se a API falhar.
3. **Reativar status do Instagram** no banco: `UPDATE downloader_status SET status='active' WHERE platform='instagram'`.
4. **Testar** o endpoint via `invoke-server-function` com uma URL real do Instagram e confirmar que retorna `media_url` válido.

### Fora de escopo (por enquanto)
- Kwai continua em `maintenance` — esta API é só do Instagram. Se quiser, depois procuramos endpoint equivalente na RapidAPI para Kwai.
- TikTok já funciona pelo fallback atual, não vou mexer.

### Perguntas
- Confirma que posso prosseguir e solicitar o secret `RAPIDAPI_KEY`?
- Você vai rotacionar a chave exposta no chat depois?
