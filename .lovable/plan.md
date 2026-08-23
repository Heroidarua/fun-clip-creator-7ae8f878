# Plano de Melhoria do Duelo de Super-Heróis

Melhorar a acessibilidade, navegação por teclado e adicionar opções de enquadramento para o Fun-Clip no modal de duelo.

## Acessibilidade e Navegação (Quote: "navegação completa por teclado e labels/ARIA corretos")
- Adicionar `role="dialog"`, `aria-modal="true"` e labels ARIA adequados ao modal de duelo.
- Implementar gerenciamento de foco (trap focus) para garantir que o usuário não saia do modal acidentalmente via teclado.
- Adicionar `aria-label` descritivos para os seletores de resolução, formato e botões de ação (Compartilhar, Baixar, etc.).
- Garantir que todos os botões e seletores sejam focáveis e acionáveis via `Enter` ou `Espaço`.

## Opções de Enquadramento do Fun-Clip (Quote: "opções de enquadramento/recorte (ex: manter proporção, centralizar ou zoom)")
- Criar um novo estado `clipFit` para controlar como o conteúdo é renderizado no Fun-Clip.
- Adicionar seletores visuais no modal para:
    - **Manter Proporção (Cover/Fill)**: Ocupar todo o espaço do clip.
    - **Centralizado (Contain)**: Mostrar todo o conteúdo com bordas se necessário.
    - **Zoom**: Aproximar nos personagens principais.
- Atualizar a lógica de captura CSS antes de gerar a imagem com `html-to-image` para aplicar essas transformações visualmente no elemento alvo.

## Detalhes Técnicos
- **Arquivo**: `src/components/ComicsSection.tsx`
- **Estados novos**: 
    - `clipFit`: 'contain' | 'cover' | 'fill'
- **Bibliotecas**: `lucide-react` para novos ícones de enquadramento.
- **CSS**: Uso de classes utilitárias do Tailwind para manipulação de `object-fit` e `transform` dinâmicos durante a captura.
