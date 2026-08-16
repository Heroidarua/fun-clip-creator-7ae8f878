# Plano de Otimização: Ferramenta de Melhorar Vídeo (IA)

O usuário relatou que o processo de melhoria de vídeo está travando em 5% (fase de análise de metadados). O objetivo é otimizar o processamento para evitar gargalos no sandbox, melhorar a precisão da barra de progresso e garantir que vídeos grandes não causem timeout ou interrupções.

## Alterações propostas

### Backend (Server-Side)

1.  **Otimização da Análise (`analyzer.server.ts`)**:
    *   Substituir a execução completa do `ffprobe` por uma leitura rápida de metadados.
    *   Adicionar timeout ao comando `ffprobe` para evitar processos zumbis.
2.  **Aprimoramento do Motor de Processamento (`engine.server.ts`)**:
    *   Ajustar os filtros FFmpeg para serem menos intensivos em CPU durante o upscale.
    *   Melhorar a detecção de progresso via `stderr` capturando logs de forma mais robusta.
    *   Aumentar a granularidade do progresso no início do processamento.
3.  **Ajuste no Fluxo de Execução (`api.video-enhancer.process.ts`)**:
    *   Garantir que o status do banco de dados seja atualizado imediatamente para `processing` com progresso gradual.
    *   Melhorar o tratamento de erros em cada etapa (análise, filtros, upload).

### Frontend (Componente)

1.  **Feedback Visual (`VideoEnhancer.tsx`)**:
    *   Ajustar as mensagens de status para serem mais descritivas enquanto o progresso está baixo.
    *   Reduzir o intervalo de polling para 3 segundos para uma sensação de "tempo real".
    *   Adicionar tratamento para casos onde o progresso parece estagnado.

## Detalhes técnicos

*   **Filtros FFmpeg**: Reduzir a complexidade de `hqdn3d` e `unsharp` para processar frames mais rapidamente no ambiente compartilhado.
*   **Storage**: Verificar se o upload para o bucket `videos` está ocorrendo via stream ou se o buffer está sendo totalmente carregado em memória, otimizando para stream se necessário.
*   **Logs**: Adicionar logs de servidor mais detalhados para depuração futura via `stack_modern--server-function-logs`.
