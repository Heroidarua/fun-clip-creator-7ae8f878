# Plano de Reestruturação da Área Administrativa

Reestruturar a área administrativa para incluir o gerenciamento de novos módulos (especialmente o Melhorar Vídeo) e melhorar a navegação do painel com uma interface em abas.

## Alterações

### 1. Backend (Funções de Servidor)
- Criar `src/lib/admin.functions.ts` para centralizar ações privilegiadas:
    - `listEnhancementJobs`: Lista os últimos 50 trabalhos de vídeo.
    - `deleteEnhancementJob`: Remove um trabalho do banco de dados e limpa o arquivo do Supabase Storage.

### 2. Frontend (Painel Admin)
- Modificar `src/pages/Admin.tsx`:
    - Adicionar sistema de abas (**Geral** e **Melhorar Vídeo**).
    - Criar interface para monitorar a fila de vídeos: Data, Nome do Arquivo, Status (colorido), Progresso e links de visualização/exclusão.
    - Integrar carregamento automático de dados ao logar.

### 3. Navegação do Site
- Adicionar atalho para o **Admin** na `src/components/Navigation.tsx` (barra lateral) para facilitar o acesso rápido durante o desenvolvimento/uso.

## Detalhes Técnicos
- Uso de `createServerFn` para garantir que apenas o `ADMIN_PASSWORD` (variável de ambiente) tenha acesso aos dados.
- Integração direta com a tabela `video_enhancement_jobs` e o bucket `videos` do Supabase.
- Estilização seguindo o padrão atual do site com Tailwind CSS e Lucide Icons.
