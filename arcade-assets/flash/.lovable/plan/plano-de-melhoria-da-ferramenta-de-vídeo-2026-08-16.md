# Plano de Melhoria da Ferramenta de Vídeo

O objetivo é adicionar controles de gerenciamento para o processo de melhoria de vídeo (parar, recomeçar, remover) e melhorar a experiência de download após a conclusão.

## Alterações Propostas

### Backend (`src/lib/video-enhancer/`)
- Adicionar uma nova função de servidor `cancelEnhancementJob` em `jobs.functions.ts` para atualizar o status do job para 'failed' (cancelado pelo usuário) ou deletar o registro.
- Nota: Como o processamento FFmpeg roda em uma thread separada/background via spawn em um worker, parar o processo físico é complexo sem rastreamento de PID. O cancelamento focará no estado da UI e do banco de dados inicialmente.

### Frontend (`src/components/tools/video-enhancer/`)
- **VideoEnhancer.tsx**:
    - **Botão Parar**: Visível durante o processamento. Ao clicar, interrompe o polling, remove o job do `localStorage` e volta ao estado inicial.
    - **Botão Recomeçar**: Visível quando um job falha ou termina, permitindo limpar o estado e selecionar um novo arquivo (ou o mesmo).
    - **Botão Remover**: No estado de seleção de arquivo, permite trocar o vídeo antes de iniciar.
    - **Melhoria no Download**: Garantir que o botão de download seja proeminente e use o nome original do arquivo com sufixo "_melhorado".

## Detalhes Técnicos
- Implementar `cancelJob` chamando a função de servidor.
- Adicionar estados de transição para evitar cliques duplos.
- Utilizar ícones da `lucide-react` para os novos botões (XCircle, RefreshCcw, Trash2).
- Manter o estilo "pixel-card" e "btn-3d" consistente com o resto do site SOS01.
