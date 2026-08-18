# Plano de Melhoria da Visibilidade da Comunidade

O usuário relatou que a comunidade está "escondida" e os visitantes não sabem onde encontrá-la. Vamos tornar o acesso mais óbvio tanto na navegação quanto na página inicial.

## Alterações Propostas

### 1. Header (Navegação Superior)
- **O que mudar**: Tornar o botão "👥 Comunidade" visível em todas as páginas e também em dispositivos móveis.
- **Arquivos**: `src/components/Header.tsx`

### 2. Navegação Lateral (Sidebar)
- **O que mudar**: Remover o filtro que ocultava o link da comunidade para que ele apareça sempre no menu lateral (desktop e mobile).
- **Arquivos**: `src/components/Navigation.tsx`

### 3. Página Inicial (Acesso Rápido)
- **O que mudar**: Adicionar um botão de destaque para a comunidade logo abaixo do campo de busca principal.
- **Arquivos**: `src/components/HeroSection.tsx`
