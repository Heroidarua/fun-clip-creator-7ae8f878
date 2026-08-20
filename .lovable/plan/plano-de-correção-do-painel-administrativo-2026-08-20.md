# Plano de Correção do Painel Administrativo

O painel administrativo está apresentando uma falha crítica devido à ausência do `QueryClientProvider` no nó raiz da aplicação, o que impede a execução de funções do React Query utilizadas no novo dashboard. Além disso, identifiquei inconsistências entre o endpoint de API legado (`/api/manage-announcements`) e a nova arquitetura baseada em `createServerFn`.

## Alterações Propostas

### Frontend e Arquitetura
- **Integrar React Query**: Adicionar o `QueryClientProvider` em `src/routes/__root.tsx` para permitir que o `DashboardSection` e futuros componentes modulares funcionem corretamente.
- **Correção de Hydration**: Envolver o componente `SplashScreen` em uma verificação de hidratação ou simplificar seu comportamento para evitar erros de incompatibilidade entre servidor e cliente observados nos logs.

### Backend e Segurança
- **Sincronização de Senha**: Garantir que tanto o endpoint legado quanto as novas `createServerFn` utilizem a mesma variável de ambiente `ADMIN_PASSWORD`.
- **Refinamento de Logs**: Garantir que as ações administrativas sejam registradas corretamente na tabela `admin_logs` do banco de dados.

## Detalhes Técnicos
- Configuração do `QueryClient` com `staleTime` padrão para otimizar performance.
- Ajuste no layout do Admin para tratar estados de erro de forma mais amigável.
- Validação do fluxo de autenticação persistente via `localStorage`.

O sistema voltará a ser totalmente funcional e pronto para a expansão modular planejada.