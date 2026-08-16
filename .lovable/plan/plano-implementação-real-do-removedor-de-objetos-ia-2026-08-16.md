# Plano: Implementação Real do Removedor de Objetos IA

O usuário relatou que a ferramenta "Removedor de Objetos" não está funcionando (atualmente é apenas uma simulação). Implementarei uma solução real baseada em cliente utilizando a biblioteca `fabric.js` para permitir que o usuário pinte a área a ser removida e uma API de IA (via Lovable AI Gateway) para realizar o inpainting (reconstrução da imagem).

## Alterações

### Frontend (`src/components/tools/premium/ObjectRemoverTool.tsx`)
- Instalar `fabric` para criar um canvas interativo.
- Adicionar modo de "pintura" (brush) sobre a imagem carregada para definir a máscara.
- Implementar controles de tamanho do pincel e desfazer.
- Atualizar a função `process` para:
    1. Gerar uma máscara em preto e branco a partir do canvas.
    2. Enviar a imagem original e a máscara para uma Server Function.
    3. Exibir o resultado final com opção de download.

### Backend (`src/lib/tools/object-remover.functions.ts`)
- Criar nova Server Function que utiliza o Lovable AI Gateway (ou modelo compatível como Stable Diffusion Inpainting) para processar a remoção.
- Como o projeto usa TanStack Start, a lógica de IA ficará isolada no servidor.

### Dependências
- `fabric`: Para a interface de pintura da máscara.

## Detalhes Técnicos
- **Fluxo**: Imagem -> Canvas (Pintura da Máscara) -> Export (Original + Mask) -> Server Function (AI Inpainting) -> Resultado.
- **UI**: Manter o estilo retrô/pixel do SOS01, adicionando botões de ferramenta de pintura.
