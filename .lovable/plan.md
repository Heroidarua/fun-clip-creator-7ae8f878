# Arquitetura de Backend para Jogos SOS01

Implementação de uma camada de API paginada e com cache para otimizar o carregamento dos mais de 2.900 jogos, sem migrar o banco de dados e mantendo a compatibilidade atual.

## Análise Atual
- **Armazenamento**: `src/data/games.ts` (arquivo estático gigante importado no cliente).
- **Consulta**: Filtros feitos em tempo de execução no cliente usando `useMemo` e `.filter()`.
- **Capas**: Carregadas via tag `<img>` no `GameCard` com URL externa.
- **Iframes**: O componente `Jogos.tsx` possui um estado `fullscreenGame` que renderiza o iframe ao ser definido.
- **Lentidão**: Causada pelo parsing do JS gigante de 2.900+ objetos no carregamento inicial e renderização de listas não paginadas.

## Etapas de Implementação

### 1. Backend & API (TanStack Server Functions)
- Criar `src/lib/games.server.ts` para lidar com a lógica de busca no "banco" (atualmente o arquivo estático, simulando um DB).
- Implementar `src/lib/games.functions.ts` usando `createServerFn` para expor os endpoints:
  - `getGames`: Lista com paginação (`page`, `limit`).
  - `searchGames`: Busca textual com paginação.
  - `getGamesByCategory`: Filtro por categoria com paginação.
  - `getFeaturedGames`: Retorna lista reduzida de destaques.
  - `getRecentGames`: Retorna lista baseada em IDs.
- Adicionar camada de cache em memória no servidor para os resultados mais frequentes.

### 2. Otimização do Frontend
- Refatorar `src/pages/Jogos.tsx` para usar `useSuspenseInfiniteQuery` ou `useQuery` chamando as novas funções de servidor.
- Implementar "Infinite Scroll" ou botão "Carregar Mais" para paginação real.
- Modificar o `GameCard` para carregar dados sob demanda se necessário, embora os metadados básicos venham na listagem.

### 3. Execução de Jogos (Iframe sob demanda)
- Garantir que o iframe só seja instanciado quando o usuário clicar em "Jogar".
- Implementar limpeza de memória ao fechar o jogo (desmontagem do componente de iframe).

### 4. Otimização de Imagens
- Implementar lazy loading nativo (`loading="lazy"`) e decodificação assíncrona para thumbnails.
- Manter o fallback para imagens quebradas.

## Detalhes Técnicos
- **Paginação**: Default 24 itens (Desktop) / 12 itens (Mobile).
- **Segurança**: Rate limiting nas funções de servidor e validação de `limit` máximo (100 itens).
- **Performance**: Redução do bundle inicial removendo o import direto de `games.ts` no frontend (exceto tipos).

```text
ESTRUTURA:
[Browser] <-> [Server Function (API)] <-> [Cache] <-> [games.ts (Data Source)]
```

Nenhuma mudança será feita nas URLs, visual ou na persistência de dados (não migrar para Supabase conforme solicitado).