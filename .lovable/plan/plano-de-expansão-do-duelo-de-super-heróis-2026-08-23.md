# Plano de Expansão do Duelo de Super-Heróis

Adicionar temas visuais e ferramentas de prévia profissional para a geração de Fun-Clips.

## Temas Visuais (Quote: "templates de estilo para eu escolher rapidamente temas visuais")
- Implementar 4 temas básicos:
    - **Retro (Padrão)**: Estilo atual neon/8-bit.
    - **Modern**: Minimalista, bordas arredondadas suaves, gradientes escuros.
    - **Comic**: Inspirado em HQs clássicas, com texturas de pontos (halftone) e bordas grossas.
    - **Cyberpunk**: Alto contraste, sombras coloridas, tipografia futurista.
- Adicionar seletor de temas nas configurações do Fun-Clip.

## Prévia e Linhas-guia (Quote: "prévia em tempo real do enquadramento, com grade/linhas-guia")
- Adicionar um botão de alternância para "Mostrar Guias".
- Quando ativo, exibir uma grade de terços (Rule of Thirds) sobreposta ao elemento de captura.
- Exibir dinamicamente as dimensões finais em pixels (ex: `1920 x 1080 px`) calculadas com base na escala selecionada.

## Detalhes Técnicos
- **Arquivo**: `src/components/ComicsSection.tsx`
- **Novos Estados**:
    - `clipTheme`: 'retro' | 'modern' | 'comic' | 'cyberpunk'
    - `showGuides`: boolean
- **Estilos**: Adicionar classes CSS específicas para cada tema no modal de resultado.
- **Cálculo de Tamanho**: Usar `getBoundingClientRect()` do elemento alvo multiplicado por `clipScale`.
