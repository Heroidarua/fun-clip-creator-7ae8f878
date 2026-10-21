# Otimização de Performance SOS01

Este plano visa corrigir os gargalos de performance identificados (CLS, Peso de Imagens e TTFB) sem alterar as funcionalidades existentes.

## 1. Redução de CLS (Cumulative Layout Shift)

### GamesCarousel
- O carrossel de jogos é um dos principais responsáveis pelo CLS no Desktop.
- **Ação:** Adicionar um container com `min-height` e `aspect-ratio` fixo para os cards de jogos antes mesmo do carregamento dos dados.
- **Ação:** Definir `width` e `height` explícitos nas tags `img` dentro de `GameCard`.

### UtilityToolsSection
- **Ação:** Definir altura mínima para a grade de ferramentas para evitar saltos durante a filtragem de categorias.

## 2. Otimização de Imagens

### Conversão para WebP
- O payload de imagens é de ~2.1MB.
- **Ação:** Identificar imagens críticas no `HeroSection` e `GamesCarousel` e convertê-las/servi-las em formato WebP.
- **Ação:** Implementar `loading="lazy"` em todas as imagens abaixo da dobra (catálogo, rodapé).
- **Ação:** Garantir que a imagem do Hero (LCP) use `fetchpriority="high"` e **NÃO** tenha lazy loading.

### Dimensionamento
- **Ação:** Ajustar o `srcset` para thumbnails de jogos para não carregar imagens 4K em telas mobile.

## 3. Otimização de TTFB (Time to First Byte)

### Cache no Edge (Cloudflare/Netlify)
- **Ação:** Configurar `Cache-Control` headers em rotas públicas estáticas (como a home e ferramentas premium).
- **Ação:** Verificar se há chamadas pesadas ao Supabase no `loader` da rota raiz ou index e mover para carregamento no cliente quando possível (ou usar cache de 60s).

## Detalhes Técnicos
- Utilização de `aspect-ratio` do CSS nativo para manter a proporção dos cards.
- Implementação de `next-gen` formats via scripts de build ou servindo via CDN.
- Headers `s-maxage` para cache compartilhado no Edge.
