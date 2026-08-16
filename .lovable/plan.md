# Plano de Otimização Rígida - Módulo de Jogos

Este plano visa resolver gargalos de performance, memória e resiliência no carregamento de mais de 2.700 jogos, garantindo uma experiência instantânea tanto no desktop quanto no mobile.

## Ações Técnicas

### 1. Camada de Dados e Servidor
- **Virtualização de Dados**: Manter o uso de `import()` dinâmico em `games.server.ts` para evitar que o Node.js/Edge Runtime tente carregar todo o JSON de uma vez no escopo global.
- **Cache de Segundo Nível**: Refinar o cache em memória no servidor com TTL ajustado e chaves normalizadas para evitar buscas repetitivas em requisições simultâneas.
- **Filtragem Eficiente**: Mover a lógica de categorização e busca para uma estrutura indexada (Map) em vez de percorrer o array completo em cada requisição.

### 2. Performance do Frontend
- **Windowing / Virtual List**: Implementar virtualização no grid de jogos (`src/pages/Jogos.tsx`) para renderizar apenas os cards visíveis no viewport, reduzindo drasticamente o consumo de DOM e memória.
- **Image Optimization**: Adicionar suporte a `srcset` e carregamento prioritário para os primeiros cards (LCP), mantendo `lazy` para o restante.
- **Redução de Re-renders**: Utilizar `memo` no componente `GameCard` e otimizar os hooks de busca para evitar processamento desnecessário durante o scroll.

### 3. Resiliência e UX
- **Skeleton Screens Otimizados**: Melhorar os placeholders de carregamento para evitar saltos de layout (Layout Shift).
- **Error Boundaries**: Adicionar tratamento de erro específico para falhas de carregamento de iframe de jogos externos.
- **Pre-fetching Estratégico**: Carregar antecipadamente a próxima página de jogos quando o usuário estiver chegando ao fim do scroll atual.

## Detalhes Técnicos
- Framework: React 19 + TanStack Start.
- Data Loading: TanStack Query (Infinite Query).
- Estilização: Tailwind CSS v4.
- Infra: Supabase (para flags de status) + Memória local para catálogo.
