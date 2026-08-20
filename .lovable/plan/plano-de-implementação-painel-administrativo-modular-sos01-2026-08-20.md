# Plano de Implementação: Painel Administrativo Modular SOS01

O objetivo é transformar o componente de admin atual em uma arquitetura modular, escalável e segura, permitindo o gerenciamento de todas as facetas da plataforma (ferramentas, anúncios, SEO, métricas e usuários).

## Alterações Propostas

### 1. Reestruturação de Rotas e Componentes
- Mover `src/pages/Admin.tsx` para uma estrutura de pastas modular: `src/components/admin/`.
- Criar submódulos para cada funcionalidade (Status das Ferramentas, Gerenciamento de Anúncios, Configurações de Aparência, SEO, Logs de Erro).
- Refatorar a rota `/admin` para suportar sub-abas via URL se necessário, mas inicialmente manter o estado local para simplicidade.

### 2. Backend e Segurança (Supabase)
- **Tabela `admin_logs`**: Para registrar todas as ações realizadas no painel.
- **Tabela `site_config`**: Para centralizar configurações globais (SEO, tags, flags de manutenção global).
- **Políticas RLS**: Garantir que as tabelas administrativas não sejam acessíveis via anon/authenticated (apenas via `service_role` através de Server Functions).

### 3. Novas Funcionalidades do Painel
- **Dashboard de Métricas**: Visualização real dos logs de uso (`ai_usage_log`, `donations`, jobs do YouTube).
- **Gerenciador de SEO**: Interface para editar `src/config/seo.ts` via banco de dados (o componente lerá do banco com fallback para o arquivo estático).
- **Controle de Cache**: Botão para limpar caches de métricas no servidor.

### 4. Interface (UI/UX)
- Design inspirado em dashboards modernos com Sidebar lateral.
- Gráficos simples para métricas de uso diário.
- Feedback visual imediato (Toasts) para todas as operações.

## Detalhes Técnicos
- **Server Functions**: Utilizar `createServerFn` em `src/lib/admin.functions.ts` para todas as operações sensíveis, validando a senha de admin no servidor.
- **Zod**: Validação rigorosa de todos os inputs no frontend e backend.
- **TanStack Query**: Migrar o estado local para `useQuery`/`useMutation` para melhor gerenciamento de cache e estados de carregamento.

---

Este plano visa consolidar as "instruções extensas" mencionadas no histórico e criar uma base sólida para a evolução do SOS01.
