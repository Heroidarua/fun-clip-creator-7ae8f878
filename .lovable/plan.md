# Otimização da Área de Jogos (2.900+ Jogos)

Esta tarefa visa resolver a lentidão crítica causada pelo carregamento de milhares de jogos simultâneos no frontend. A nova arquitetura utilizará o Supabase para persistência e busca, com paginação real no servidor e carregamento sob demanda.

## Mudanças Técnicas

### 1. Banco de Dados (Supabase)
- Criar tabela `public.games` para armazenar os 2.757+ jogos.
- Migrar os dados do arquivo estático `src/data/games.ts` para o banco.
- Adicionar índices para busca rápida (trgm) e filtragem por categoria.

### 2. Backend (Server Functions)
- Implementar `getPagedGames` em `src/lib/games.functions.ts`.
- Suporte a paginação (`page`), busca (`search`) e categorias (`category`).
- Retornar contagem total para controles de UI.

### 3. Frontend (UI de Jogos)
- Substituir a lista estática por `useSuspenseQuery` do TanStack Query.
- Implementar controles de paginação (Anterior/Próximo) e carregamento infinito "Ver Mais".
- **Lazy Loading**: As imagens dos cards usarão `loading="lazy"`.
- **Iframe sob demanda**: O iframe do jogo só será montado quando o usuário clicar em "Jogar".
- **Code Splitting**: O player de jogos será carregado dinamicamente.

### 4. Otimização da Home
- Limitar a exibição de jogos na Home para apenas 8-12 itens.
- Carregar o catálogo completo apenas na rota `/jogos`.

## Passo a Passo da Implementação

1. **Database**: Executar a migração da tabela `games`.
2. **Seeding**: Rodar o script de migração de dados via console admin.
3. **API**: Validar a `serverFn` de busca.
4. **Refactor**: Atualizar `src/pages/Jogos.tsx` para usar os novos dados dinâmicos.
5. **Clean up**: Reduzir o bundle removendo (ou movendo) o arquivo `games.ts` gigante.

## Considerações de Performance
- `staleTime` de 5 minutos para resultados de busca.
- `prefetchQuery` para a próxima página.
- Virtualização opcional se a lista crescer muito no DOM.
