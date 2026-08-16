# Plano de Correção: Preview de Stories do Instagram

O usuário reportou que a prévia (preview) de Stories do Instagram não está carregando no downloader. A análise indica que a extração via Snapsave (nosso provedor principal) pode estar falhando especificamente para Stories devido à necessidade de cookies de sessão ou parâmetros adicionais que não estão sendo capturados.

## Alterações

### Backend (Processamento)

- **`src/lib/instagram-resolver.server.ts`**
  - Adicionar suporte explícito para URLs de Stories no normalizador.
  - Implementar uma lógica de "tentativa e erro" mais robusta no provedor Snapsave para lidar com as variações de resposta de Stories (que frequentemente retornam múltiplos itens ou formatos diferentes).
  - Garantir que a URL da mídia e a thumbnail sejam extraídas corretamente mesmo quando o Snapsave muda a estrutura do HTML para Stories.

- **`src/lib/snapsave.server.ts`**
  - Melhorar o regex de extração de links para capturar URLs de CDN do Instagram que são específicas de Stories (`.cdninstagram.com`).
  - Ajustar a lógica de detecção de "thumbnail" para priorizar imagens que acompanham vídeos de Stories.

### Frontend (UI/UX)

- **`src/components/HeroSection.tsx`**
  - Ajustar o componente `MediaPreviewOverlay` para lidar melhor com o aspecto ratio vertical (9:16) típico de Stories, evitando cortes excessivos na prévia.
  - Corrigir o mapeamento de metadados no bloco de Instagram para garantir que, se um Story for um vídeo, o `media_type` seja "video" e a `media_url` seja passada corretamente para o mini-player.

## Detalhes Técnicos

- Stories muitas vezes exigem que o cabeçalho `Referer` e `Origin` na requisição de proxy (`/api/instagram/file`) sejam consistentes.
- Verificarei se o proxy está permitindo todos os subdomínios necessários da Meta/Instagram para Stories.

## Verificação

- Testar com URLs de Stories públicos (ex: perfis verificados ou marcas).
- Validar se a thumbnail aparece no grid de seleção.
- Validar se o player de vídeo funciona na prévia ao clicar no ícone de play.
