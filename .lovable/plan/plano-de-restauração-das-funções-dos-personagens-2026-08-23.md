# Plano de Restauração das Funções dos Personagens

O componente `ComicsSection.tsx` sofreu uma perda acidental de código em sua interface (JSX), o que resultou no desaparecimento da barra de busca, filtros, modo duelo e visualização detalhada dos personagens.

## Alterações Técnicas

### 1. Restaurar Barra de Busca e Filtros
- Adicionar o contêiner de filtros acima da grade de heróis.
- Incluir campo de `Search` (busca por nome/editora).
- Incluir seletores `PUBLISHERS` e `ALIGNMENTS`.
- Incluir botão de alternância para o `Modo Duelo` (ícone `Swords`).

### 2. Restaurar Modal de Detalhes do Personagem
- Substituir o modal simplificado por uma visualização completa.
- Exibir imagem ampliada, biografia (nome completo, local de nascimento, primeira aparição).
- Exibir estatísticas de poder (Power Stats) com barras de progresso animadas e traduções.
- Exibir informações de trabalho e conexões.
- Adicionar botão "LUTAR" (se não estiver em modo duelo) para selecionar o herói para o combate.

### 3. Ajustar Lógica de Duelo
- Garantir que o botão "LUTAR!" (flutuante) apareça apenas quando o `duelMode` estiver ativo.
- Verificar se as animações de barras de poder no modal de duelo estão funcionando corretamente.

### 4. Verificação de Acessibilidade e Tradução
- Garantir que todos os textos traduzidos (biografia, ocupação) continuem usando as funções `t()` e `translateText()`.
- Validar navegação por teclado nos modais.

## Arquivos Afetados
- `src/components/ComicsSection.tsx`
